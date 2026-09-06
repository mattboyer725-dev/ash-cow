import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { READY_COWS } from "./ready-cows";

const checkoutInput = z.object({
  kitId: z.string().min(1).max(80),
  name: z.string().min(1).max(80).optional(),
  price: z.number().min(9).max(99).optional(),
});

export const stripeStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { stripeSecrets } = await import("./stripe.server");
  const { nangoConfig } = await import("./nango.server");
  const s = stripeSecrets();
  const n = nangoConfig();
  return {
    checkoutReady: s.checkoutReady,
    webhookReady: s.webhookReady,
    nangoReady: n.ready,
    nangoWebhookReady: n.webhookReady,
  };
});

export const createCheckout = createServerFn({ method: "POST" })
  .validator((raw: z.input<typeof checkoutInput>) => checkoutInput.parse(raw))
  .handler(async ({ data }) => {
    const { getStripe, publicOrigin } = await import("./stripe.server");
    const stripe = getStripe();
    if (!stripe) {
      return { ok: false as const, error: "Stripe is not configured. Set STRIPE_SECRET_KEY." };
    }
    const ready = READY_COWS.find((c) => c.id === data.kitId);
    const name = ready?.name ?? data.name?.trim();
    const price = ready?.price ?? data.price;
    if (!name || !price) {
      return { ok: false as const, error: "Unknown stall." };
    }
    const origin = publicOrigin();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      submit_type: "pay",
      success_url: `${origin}/paid?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/s/${encodeURIComponent(data.kitId)}`,
      metadata: { kitId: data.kitId, kitName: name },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: price * 100,
            product_data: {
              name,
              description: "Digital download. Delivered on the paid page.",
            },
          },
        },
      ],
    });
    if (!session.url) {
      return { ok: false as const, error: "Stripe did not return a checkout URL." };
    }
    return { ok: true as const, url: session.url };
  });

export const readCheckout = createServerFn({ method: "POST" })
  .validator((raw: { sessionId: string }) =>
    z.object({ sessionId: z.string().min(2).max(200) }).parse(raw),
  )
  .handler(async ({ data }) => {
    const { getStripe } = await import("./stripe.server");
    const { saleFromSession } = await import("./stripe-events");
    const stripe = getStripe();
    if (!stripe) {
      return { ok: false as const, error: "Stripe is not configured." };
    }
    const session = await stripe.checkout.sessions.retrieve(data.sessionId);
    const sale = saleFromSession(session);
    if (!sale) {
      return { ok: false as const, error: "That session is not paid." };
    }
    return {
      ok: true as const,
      sale,
      email: session.customer_details?.email ?? null,
      name: session.metadata?.kitName ?? sale.kitId,
    };
  });

export const listStripeSales = createServerFn({ method: "GET" }).handler(async () => {
  const { recentNotices } = await import("./stripe-events");
  const { nangoConfig, listNangoSales } = await import("./nango.server");
  const nango = nangoConfig();
  if (nango.ready) {
    try {
      const sales = await listNangoSales();
      return { ok: true as const, sales, notices: recentNotices(), via: "nango" as const };
    } catch {
      // Fall through to Stripe list if Nango is unreachable.
    }
  }
  const { getStripe } = await import("./stripe.server");
  const { saleFromSession } = await import("./stripe-events");
  const stripe = getStripe();
  if (!stripe) {
    return { ok: false as const, error: "No Nango or Stripe sync configured.", sales: [], notices: [] };
  }
  const listed = await stripe.checkout.sessions.list({ limit: 40, status: "complete" });
  const sales = listed.data
    .map(saleFromSession)
    .filter((row): row is NonNullable<typeof row> => Boolean(row));
  return { ok: true as const, sales, notices: recentNotices(), via: "stripe" as const };
});

export const kickNangoSync = createServerFn({ method: "POST" }).handler(async () => {
  const { kickNangoCheckoutSync } = await import("./nango.server");
  try {
    return await kickNangoCheckoutSync();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Nango sync failed to start.";
    return { ok: false as const, error: message };
  }
});

