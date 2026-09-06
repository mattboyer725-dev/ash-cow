import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BuyButton } from "@/components/buy-button";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { READY_COWS } from "@/lib/ready-cows";
import { money } from "@/lib/utils";

export const Route = createFileRoute("/shop")({ component: ShopPage });

function ShopPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <Shell>
      <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="font-mono text-xs tracking-[0.2em] text-subtle uppercase">Open stall</p>
        <h1 className="mt-2 font-display text-4xl tracking-tight sm:text-6xl">Shop</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
          These three kits are live. Share a stall. Take payment on the link you set in Till.
          The barn logs what actually clears.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {READY_COWS.map((cow) => (
            <article
              key={cow.id}
              className="flex flex-col rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]"
            >
              <p className="font-mono text-xs tabular-nums text-subtle">{money(cow.price)}</p>
              <h2 className="mt-2 font-display text-2xl tracking-tight">{cow.name}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{cow.oneLiner}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button asChild variant="secondary">
                  <Link to="/s/$id" params={{ id: cow.id }}>
                    Sales page
                  </Link>
                </Button>
                {mounted ? <BuyButton cow={cow} size="default" /> : null}
              </div>
            </article>
          ))}
        </div>
      </main>
    </Shell>
  );
}
