import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { KitWorkspace } from "@/components/kit-workspace";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { READY_COWS } from "@/lib/ready-cows";
import { useBarn } from "@/lib/store";

export const Route = createFileRoute("/cow/$id")({ component: CowPage });

function CowPage() {
  const { id } = Route.useParams();
  const cows = useBarn((s) => s.cows);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const cow = cows.find((c) => c.id === id) ?? READY_COWS.find((c) => c.id === id);

  if (!mounted) {
    return (
      <Shell>
        <main className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <p className="text-sm text-muted">Opening stall…</p>
        </main>
      </Shell>
    );
  }

  if (!cow) {
    return (
      <Shell>
        <main className="mx-auto w-full max-w-lg px-4 py-20 sm:px-6">
          <h1 className="font-display text-4xl tracking-tight">Empty stall</h1>
          <p className="mt-3 text-base leading-relaxed text-muted">
            That cow is not in this barn. Forge a new one, or steal a ready stall.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/forge">Forge a cow</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/">Back to the barn</Link>
            </Button>
          </div>
        </main>
      </Shell>
    );
  }

  return (
    <Shell>
      <KitWorkspace cow={cow} />
    </Shell>
  );
}
