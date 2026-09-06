import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/stripe/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { stripeSecrets, verifyWebhook } = await import("@/lib/stripe.server");
        const { handleStripeEvent, rememberNotice } = await import("@/lib/stripe-events");

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

        const notice = handleStripeEvent({
          id: event.id,
          type: event.type,
          created: event.created,
          data: { object: event.data.object as { id: string } },
        });
        rememberNotice(notice);
        return Response.json({ received: true, id: event.id, type: event.type });
      },
    },
  },
});
