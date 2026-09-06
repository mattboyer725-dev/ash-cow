import { createFileRoute } from "@tanstack/react-router";
import { READY_COWS } from "@/lib/ready-cows";

export const Route = createFileRoute("/api/stalls")({
  server: {
    handlers: {
      GET: () =>
        Response.json({
          stalls: READY_COWS.map((cow) => ({
            id: cow.id,
            name: cow.name,
            price: cow.price,
            oneLiner: cow.oneLiner,
            salesPage: cow.salesPage,
          })),
        }),
    },
  },
});
