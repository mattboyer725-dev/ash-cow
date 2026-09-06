import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BuyButton } from "@/components/buy-button";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { READY_COWS } from "@/lib/ready-cows";
import { useBarn } from "@/lib/store";
import { money } from "@/lib/utils";

export const Route = createFileRoute("/s/$id")({ component: StallPage });

function StallPage() {
  const { id } = Route.useParams();
  const cows = useBarn((s) => s.cows);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const cow = READY_COWS.find((c) => c.id === id) ?? (mounted ? cows.find((c) => c.id === id) : undefined);

  if (!cow) {
    return (
      <Shell>
        <main className="mx-auto w-full max-w-lg px-4 py-20 sm:px-6">
          <h1 className="font-display text-4xl tracking-tight">Empty stall</h1>
          <p className="mt-3 text-muted">That product is not listed.</p>
          <Button asChild className="mt-8">
            <Link to="/shop">Back to shop</Link>
          </Button>
        </main>
      </Shell>
    );
  }

  const page = cow.salesPage;

  return (
    <Shell>
      <main className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="font-mono text-xs tracking-[0.2em] text-subtle uppercase">For sale</p>
        <h1 className="mt-2 font-display text-4xl tracking-tight sm:text-5xl">{page.headline}</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">{page.subhead}</p>
        <p className="mt-6 font-mono text-3xl tabular-nums">{money(cow.price)}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {mounted ? <BuyButton cow={cow} /> : null}
        </div>
        <div className="mt-10 flex flex-col gap-5 text-base leading-relaxed">
          <p>{page.problem}</p>
          <p>{page.mechanism}</p>
          <div>
            <p className="text-sm font-medium text-muted">What you get</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {page.whatYouGet.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <p className="text-sm text-muted">For: {page.forWhom}</p>
          <p className="text-sm text-muted">Not for: {page.notFor}</p>
          <p>{page.guarantee}</p>
          <p className="font-medium">{page.cta}</p>
        </div>
      </main>
    </Shell>
  );
}
