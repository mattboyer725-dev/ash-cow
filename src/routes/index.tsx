import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { CowCard } from "@/components/cow-card";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { READY_COWS } from "@/lib/ready-cows";
import { barnTotals, useBarn } from "@/lib/store";
import { money } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const navigate = useNavigate();
  const cows = useBarn((s) => s.cows);
  const sales = useBarn((s) => s.sales);
  const adoptCow = useBarn((s) => s.adoptCow);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const totals = barnTotals(sales);

  function steal(id: string) {
    const ready = READY_COWS.find((c) => c.id === id);
    if (!ready) return;
    const clone = adoptCow(ready);
    void navigate({ to: "/cow/$id", params: { id: clone.id } });
  }

  return (
    <Shell
      trailer={
        mounted && totals.count > 0 ? (
          <p className="font-mono text-xs tabular-nums tracking-wider">
            {money(totals.amount)} in the barn
          </p>
        ) : undefined
      }
    >
      <section className="relative isolate min-h-[88dvh] overflow-hidden">
        <img
          src="/portrait-cow.jpg"
          alt=""
          className="absolute inset-0 size-full object-cover object-[center_30%] md:hidden"
        />
        <img
          src="/hero-cow.jpg"
          alt=""
          className="absolute inset-0 hidden size-full object-cover object-center md:block"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/55 to-bg/20" />
        <div className="relative mx-auto flex min-h-[88dvh] w-full max-w-6xl flex-col justify-end px-4 pb-14 pt-24 sm:px-6 sm:pb-20">
          <p className="stagger-in font-mono text-xs tracking-[0.22em] text-accent uppercase">
            The figurative cash cow
          </p>
          <h1 className="stagger-in mt-4 font-display text-6xl tracking-tight text-fg sm:text-8xl">
            Ash Cow
          </h1>
          <p className="stagger-in mt-5 max-w-xl text-base leading-relaxed text-fg/85 sm:text-lg">
            Build a named digital product. List it tonight. Sell it in twenty-four hours.
            The animal is a metaphor. The file is not.
          </p>
          <div className="stagger-in mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/forge">
                Forge a cow
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="paper">
              <Link to="/truth">See the three ledgers</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <p className="font-mono text-xs tracking-[0.2em] text-subtle uppercase">The day</p>
        <h2 className="mt-2 max-w-2xl font-display text-3xl tracking-tight sm:text-4xl">
          Four facts, a file, a listing, a clock.
        </h2>
        <ol className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            {
              n: "01",
              t: "Forge",
              d: "Skill, buyer, what they get, a price under $50. The barn names it and writes the kit.",
            },
            {
              n: "02",
              t: "List",
              d: "Paste the sales page. Upload the delivery file. Publish where money already moves.",
            },
            {
              n: "03",
              t: "Count",
              d: "Start the 24-hour clock. Ten honest messages. Log every sale in the barn.",
            },
          ].map((step) => (
            <li
              key={step.n}
              className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]"
            >
              <p className="font-mono text-xs tabular-nums text-subtle">{step.n}</p>
              <p className="mt-3 font-display text-2xl tracking-tight">{step.t}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step.d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="stalls" className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20">
        <p className="font-mono text-xs tracking-[0.2em] text-subtle uppercase">Ready stalls</p>
        <h2 className="mt-2 font-display text-3xl tracking-tight sm:text-4xl">
          Steal one and start the clock.
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
          Three products already written. Adopt a stall, print the file, list it, post.
          This is the fastest way to make the first dollar.
        </p>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {READY_COWS.map((cow) => (
            <CowCard
              key={cow.id}
              cow={cow}
              actionLabel="Steal this stall"
              onAction={() => steal(cow.id)}
            />
          ))}
        </div>
      </section>

      {mounted && cows.length > 0 ? (
        <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
          <p className="font-mono text-xs tracking-[0.2em] text-subtle uppercase">Your barn</p>
          <h2 className="mt-2 font-display text-3xl tracking-tight">Cows on the floor</h2>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {cows.map((cow) => (
              <CowCard
                key={cow.id}
                cow={cow}
                actionLabel="Open stall"
                onAction={() => void navigate({ to: "/cow/$id", params: { id: cow.id } })}
              />
            ))}
          </div>
        </section>
      ) : null}
    </Shell>
  );
}
