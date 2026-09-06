import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/nango/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const {
          getNango,
          headersFromRequest,
          listNangoSales,
          nangoConfig,
        } = await import("@/lib/nango.server");
        const { rememberNotice } = await import("@/lib/stripe-events");
        const { upsertPaidSale } = await import("@/lib/sales.server");

        const cfg = nangoConfig();
        const nango = getNango();
        if (!cfg.webhookReady || !nango) {
          return Response.json({ error: "Nango webhook is not configured." }, { status: 503 });
        }

        const raw = await request.text();
        const ok = nango.verifyIncomingWebhookRequest(raw, headersFromRequest(request));
        if (!ok) {
          return Response.json({ error: "Invalid Nango signature." }, { status: 400 });
        }

        let body: {
          type?: string;
          success?: boolean;
          syncName?: string;
          modifiedAfter?: string;
        };
        try {
          body = JSON.parse(raw) as typeof body;
        } catch {
          return Response.json({ error: "Invalid JSON." }, { status: 400 });
        }

        if (body.type === "sync" && body.success) {
          const sales = await listNangoSales(body.modifiedAfter);
          for (const sale of sales) {
            await upsertPaidSale({ id: sale.id, kitId: sale.kitId, amount: sale.amount });
          }
          rememberNotice({
            id: `nango-${body.syncName ?? "sync"}-${body.modifiedAfter ?? Date.now()}`,
            type: `nango.${body.syncName ?? "sync"}`,
            at: new Date().toISOString(),
            ok: true,
            amount: sales.reduce((sum, row) => sum + row.amount, 0),
            detail: `${sales.length} paid session${sales.length === 1 ? "" : "s"} from Nango.`,
          });
        }

        return Response.json({ received: true });
      },
    },
  },
});
