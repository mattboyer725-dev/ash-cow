import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/sales")({
  server: {
    handlers: {
      GET: async () => {
        const { listLedgerSales } = await import("@/lib/sales.server");
        const sales = await listLedgerSales();
        return Response.json({ sales });
      },
    },
  },
});
