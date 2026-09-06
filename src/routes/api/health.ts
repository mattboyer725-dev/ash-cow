import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => {
        const { stripeSecrets } = await import("@/lib/stripe.server");
        const { nangoConfig } = await import("@/lib/nango.server");
        const { operatorLocked } = await import("@/lib/operator.server");
        const stripe = stripeSecrets();
        const nango = nangoConfig();
        return Response.json({
          ok: true,
          app: "ash-cow",
          ledger: true,
          operatorLocked: operatorLocked(),
          checkout: stripe.checkoutReady,
          stripeWebhook: stripe.webhookReady,
          stripeMode: stripe.mode,
          stripeLeakedToClient: stripe.leakedToClient,
          nango: nango.ready,
          nangoWebhook: nango.webhookReady,
          nangoSync: {
            integrationId: nango.integrationId,
            connectionId: nango.connectionId,
            syncName: nango.syncName,
            model: nango.model,
            frequency: nango.frequency,
          },
        });
      },
    },
  },
});
