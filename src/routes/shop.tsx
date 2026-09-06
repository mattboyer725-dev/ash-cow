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
      <main>
        <section className="relative isolate min-h-[20rem] overflow-hidden sm:min-h-[24rem]">
          <img
            src="/portrait-cow.jpg"
            alt="Highland cow in a dark barn"
            className="absolute inset-0 size-full object-cover object-[center_20%] md:hidden"
          />
          <img
            src="/hero-cow.jpg"
            alt="Highland cow in a dark barn"
            className="absolute inset-0 hidden size-full object-cover object-center md:block"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg from-25% via-bg/80 to-bg/40" />
          <div className="relative mx-auto flex min-h-[20rem] w-full max-w-6xl flex-col justify-end px-4 py-12 sm:min-h-[24rem] sm:px-6 sm:py-16">
            <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase">Open stall</p>
            <h1 className="mt-2 font-display text-4xl tracking-tight sm:text-6xl">Shop</h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-fg/85">
              Three kits. Share a stall. Stripe Checkout takes the money. Nango fills the barn.
            </p>
          </div>
        </section>
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:pb-16">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {READY_COWS.map((cow) => (
              <article
                key={cow.id}
                className="flex flex-col overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-border)]"
              >
                <img
                  src="/portrait-cow.jpg"
                  alt=""
                  className="h-40 w-full object-cover object-[center_20%]"
                />
                <div className="flex flex-1 flex-col p-5">
                  <p className="font-mono text-xs tabular-nums text-subtle">{money(cow.price)}</p>
                  <h2 className="mt-2 font-display text-2xl tracking-tight">{cow.name}</h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{cow.oneLiner}</p>
                  <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <Button asChild variant="secondary" className="w-full sm:w-auto">
                      <Link to="/s/$id" params={{ id: cow.id }}>
                        Sales page
                      </Link>
                    </Button>
                    {mounted ? <BuyButton cow={cow} size="default" className="w-full sm:w-auto" /> : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
    </Shell>
  );
}
