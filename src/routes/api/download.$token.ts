import { createFileRoute } from "@tanstack/react-router";
import { deliveryText } from "@/lib/kit-text";
import { READY_COWS } from "@/lib/ready-cows";

export const Route = createFileRoute("/api/download/$token")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { saleByToken } = await import("@/lib/sales.server");
        const sale = await saleByToken(params.token);
        if (!sale) {
          return Response.json({ error: "Unknown download." }, { status: 404 });
        }
        if (sale.status === "refunded") {
          return Response.json({ error: "That payment was refunded." }, { status: 410 });
        }
        const cow = READY_COWS.find((c) => c.id === sale.kitId);
        if (!cow) {
          return Response.json({ error: "File is not on this stall." }, { status: 404 });
        }
        const body = deliveryText(cow);
        const filename = `${cow.name.replace(/\s+/g, "-").toLowerCase()}.txt`;
        return new Response(body, {
          headers: {
            "content-type": "text/plain; charset=utf-8",
            "content-disposition": `attachment; filename="${filename}"`,
            "cache-control": "private, no-store",
          },
        });
      },
    },
  },
});
