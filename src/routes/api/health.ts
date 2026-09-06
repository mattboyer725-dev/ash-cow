import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => {
        const { stripeSecrets } = await import("@/lib/stripe.server");
        const { nangoConfig } = await import("@/lib/nango.server");
        const stripe = stripeSecrets();
        const nango = nangoConfig();
        return Response.json({
          ok: true,
          app: "ash-cow",
          checkout: stripe.checkoutReady,
          stripeWebhook: stripe.webhookReady,
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
