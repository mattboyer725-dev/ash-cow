import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { READY_COWS } from "./ready-cows";

const checkoutInput = z.object({
  kitId: z.string().min(1).max(80),
  name: z.string().min(1).max(80).optional(),
  price: z.number().min(9).max(99).optional(),
});

const operatorInput = z.object({
  key: z.string().max(200).optional(),
});

const railsInput = z.object({
  origin: z.string().max(300).optional(),
});

export const RAILS_ENV_KEYS = [
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "NANGO_API_KEY",
  "NANGO_WEBHOOK_SIGNING_KEY",
  "OPERATOR_SECRET",
] as const;

export const stripeStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { stripeSecrets } = await import("./stripe.server");
  const { nangoConfig } = await import("./nango.server");
  const { operatorLocked } = await import("./operator.server");
  const s = stripeSecrets();
  const n = nangoConfig();
  return {
    checkoutReady: s.checkoutReady,
    webhookReady: s.webhookReady,
    nangoReady: n.ready,
    nangoWebhookReady: n.webhookReady,
    operatorLocked: operatorLocked(),
    ledger: true,
  };
});

export const railsEndpoints = createServerFn({ method: "GET" })
  .validator((raw?: z.input<typeof railsInput>) => railsInput.parse(raw ?? {}))
  .handler(async ({ data }) => {
    const { publicOrigin, railsWebhookUrls } = await import("./stripe.server");
    try {
      return railsWebhookUrls(publicOrigin(data.origin));
    } catch {
      return { origin: "", stripeWebhook: "", nangoWebhook: "" };
    }
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
    const { paymentIntentOf, asSessionSlice, saleFromSession } = await import("./stripe-events");
    const { upsertPaidSale } = await import("./sales.server");
    const stripe = getStripe();
    if (!stripe) {
      return { ok: false as const, error: "Stripe is not configured." };
    }
    const session = await stripe.checkout.sessions.retrieve(data.sessionId);
    const sale = saleFromSession(asSessionSlice(session));
    if (!sale) {
      return { ok: false as const, error: "That session is not paid." };
    }
    const stored = await upsertPaidSale({
      id: sale.id,
      kitId: sale.kitId,
      amount: sale.amount,
      paymentIntent: paymentIntentOf(session),
    });
    if (stored.status === "refunded") {
      return { ok: false as const, error: "That payment was refunded." };
    }
    return {
      ok: true as const,
      sale,
      token: stored.token,
      name: session.metadata?.kitName ?? sale.kitId,
    };
  });

export const listLedger = createServerFn({ method: "GET" }).handler(async () => {
  const { listLedgerSales } = await import("./sales.server");
  const sales = await listLedgerSales();
  return { ok: true as const, sales };
});

export const fulfillByToken = createServerFn({ method: "POST" })
  .validator((raw: { token: string }) => z.object({ token: z.string().min(8).max(80) }).parse(raw))
  .handler(async ({ data }) => {
    const { saleByToken } = await import("./sales.server");
    const sale = await saleByToken(data.token);
    if (!sale) return { ok: false as const, error: "Unknown download." };
    if (sale.status === "refunded") return { ok: false as const, error: "That payment was refunded." };
    return { ok: true as const, sale: { id: sale.id, kitId: sale.kitId, amount: sale.amount, at: sale.at } };
  });

function gate(key?: string) {
  return import("./operator.server").then(({ operatorAllowed }) => {
    if (!operatorAllowed(key)) {
      return { ok: false as const, error: "Operator key required." };
    }
    return null;
  });
}

export const inspectNango = createServerFn({ method: "POST" })
  .validator((raw: z.input<typeof operatorInput>) => operatorInput.parse(raw ?? {}))
  .handler(async ({ data }) => {
    const blocked = await gate(data.key);
    if (blocked) return { ...blocked, expected: null, functions: [], syncs: [] };
    const { inspectNangoSyncs } = await import("./nango.server");
    return inspectNangoSyncs();
  });

export const kickNangoSync = createServerFn({ method: "POST" })
  .validator((raw: z.input<typeof operatorInput>) => operatorInput.parse(raw ?? {}))
  .handler(async ({ data }) => {
    const blocked = await gate(data.key);
    if (blocked) return blocked;
    const { kickNangoCheckoutSync } = await import("./nango.server");
    try {
      return await kickNangoCheckoutSync();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Nango sync failed to start.";
      return { ok: false as const, error: message };
    }
  });

export const ingestRemoteSales = createServerFn({ method: "POST" })
  .validator((raw: z.input<typeof operatorInput>) => operatorInput.parse(raw ?? {}))
  .handler(async ({ data }) => {
    const blocked = await gate(data.key);
    if (blocked) return { ...blocked, added: 0 };
    const { upsertPaidSale } = await import("./sales.server");
    const { nangoConfig, listNangoSales } = await import("./nango.server");
    let added = 0;
    if (nangoConfig().ready) {
      try {
        const sales = await listNangoSales();
        for (const sale of sales) {
          await upsertPaidSale({ id: sale.id, kitId: sale.kitId, amount: sale.amount });
          added += 1;
        }
      } catch {
        // Stripe fallback below.
      }
    }
    const { getStripe } = await import("./stripe.server");
    const { asSessionSlice, saleFromSession } = await import("./stripe-events");
    const stripe = getStripe();
    if (stripe) {
      const listed = await stripe.checkout.sessions.list({ limit: 40, status: "complete" });
      for (const session of listed.data) {
        const sale = saleFromSession(asSessionSlice(session));
        if (!sale) continue;
        await upsertPaidSale({ id: sale.id, kitId: sale.kitId, amount: sale.amount });
        added += 1;
      }
    }
    return { ok: true as const, added };
  });
