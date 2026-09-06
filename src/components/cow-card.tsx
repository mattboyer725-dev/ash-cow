import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { money } from "@/lib/utils";
import type { CashCow } from "@/lib/types";

export function CowCard({
  cow,
  actionLabel,
  onAction,
}: {
  cow: CashCow;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <article className="rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-2xl tracking-tight text-fg">{cow.name}</p>
          <p className="mt-1 font-mono text-sm tabular-nums text-muted">{money(cow.price)}</p>
        </div>
        <Badge>{cow.source === "ready" ? "Ready stall" : "Forged"}</Badge>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-muted">{cow.oneLiner}</p>
      <p className="mt-3 text-xs tracking-wide text-subtle">For {cow.who}</p>
      <div className="mt-5">
        <Button type="button" className="w-full" onClick={onAction}>
          {actionLabel}
        </Button>
      </div>
    </article>
  );
}
