import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/stripe/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { stripeSecrets, verifyWebhook } = await import("@/lib/stripe.server");
        const {
          asSessionSlice,
          handleStripeEvent,
          PAID_TYPES,
          REFUND_TYPES,
          paymentIntentOf,
          refundRefOf,
          rememberNotice,
          saleFromSession,
        } = await import("@/lib/stripe-events");
        const { markSaleRefunded, upsertPaidSale } = await import("@/lib/sales.server");

        const { webhookReady, checkoutReady } = stripeSecrets();
        if (!webhookReady || !checkoutReady) {
          return Response.json(
            { error: "Stripe webhook is not configured." },
            { status: 503 },
          );
        }

        const signature = request.headers.get("stripe-signature");
        const raw = await request.text();

        let event;
        try {
          event = verifyWebhook(raw, signature);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Invalid signature.";
          return Response.json({ error: message }, { status: 400 });
        }

        const object = event.data.object as {
          id?: string;
          payment_intent?: string | null;
          payment_status?: string | null;
          status?: string | null;
          amount_total?: number | null;
          created?: number | null;
          metadata?: Record<string, string> | null;
        };

        const slice = asSessionSlice(object);
        const notice = handleStripeEvent({
          id: event.id,
          type: event.type,
          created: event.created,
          data: { object: slice },
        });
        rememberNotice(notice);

        if (PAID_TYPES.has(event.type)) {
          const sale = saleFromSession(slice);
          if (sale) {
            await upsertPaidSale({
              id: sale.id,
              kitId: sale.kitId,
              amount: sale.amount,
              paymentIntent: paymentIntentOf(object),
            });
          }
        } else if (REFUND_TYPES.has(event.type)) {
          const ref = refundRefOf(object);
          if (ref) await markSaleRefunded(ref);
        }

        return Response.json({ received: true, id: event.id, type: event.type });
      },
    },
  },
});
