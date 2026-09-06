import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LaunchClock } from "@/components/clock";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { currentBeat, nextBeat } from "@/lib/live";
import { READY_COWS } from "@/lib/ready-cows";
import { stripeStatus } from "@/lib/stripe-checkout";
import { useBarn } from "@/lib/store";
import { useStripeSync } from "@/lib/use-stripe-sync";
import { outreachMailto, parseEmails, shopHref, tweetIntent, useTill } from "@/lib/till";
import { money } from "@/lib/utils";

export const Route = createFileRoute("/till")({ component: TillPage });

const DEFAULT_ID = "ready-ash-cow";

function TillPage() {
  useStripeSync();
  const emails = useTill((s) => s.emails);
  const setEmails = useTill((s) => s.setEmails);
  const launches = useBarn((s) => s.launches);
  const startLaunch = useBarn((s) => s.startLaunch);
  const sales = useBarn((s) => s.sales);
  const [stripe, setStripe] = useState<{ checkoutReady: boolean; webhookReady: boolean } | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [mounted, setMounted] = useState(false);

  const cow = READY_COWS.find((c) => c.id === DEFAULT_ID)!;
  const startedAt = launches[cow.id];
  const stripeSales = sales.filter((s) => s.source === "stripe" && s.kitId === cow.id);
  const stripeTotal = stripeSales.reduce((sum, s) => sum + s.amount, 0);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    void stripeStatus().then(setStripe);
  }, []);
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  useEffect(() => {
    if (!mounted) return;
    if (!launches[DEFAULT_ID]) startLaunch(DEFAULT_ID);
  }, [mounted, launches, startLaunch]);

  const beat = currentBeat(cow, startedAt, now);
  const upcoming = nextBeat(cow, startedAt, now);
  const href = mounted ? shopHref(cow.id) : `/s/${cow.id}`;
  const post = cow.posts[0]?.copy ?? cow.oneLiner;
  const list = parseEmails(emails);
  const mail = outreachMailto(
    list,
    cow.name,
    `I made ${cow.name}. If it is useful: ${href}\nIf not, ignore.\n\n${cow.oneLiner}`,
  );
  const tweet = tweetIntent(`${post}\n${href}`);
  const primary =
    beat && beat.hour >= 8
      ? { href: mail, label: list.length ? `Email ${list.length} people` : "Add emails first", disabled: list.length === 0 }
      : { href: tweet, label: "Post this hour on X", disabled: false };

  return (
    <Shell>
      <main className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="font-mono text-xs tracking-[0.2em] text-subtle uppercase">Live</p>
        <h1 className="mt-2 font-display text-4xl tracking-tight sm:text-5xl">{cow.name}</h1>
        <p className="mt-3 text-base leading-relaxed text-muted">
          Clock starts when you open this page. Stripe Checkout is the till. Paid sessions
          land in the barn by themselves.
        </p>

        <div className="mt-8 rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
          <LaunchClock startedAt={startedAt} />
          <p className="mt-4 font-mono text-sm tabular-nums text-muted">
            {money(stripeTotal)} from Stripe
            {stripeSales.length ? ` · ${stripeSales.length} paid` : " · waiting"}
          </p>
          <p className="mt-1 font-mono text-xs text-subtle">
            {stripe?.checkoutReady ? "Checkout on" : "Set STRIPE_SECRET_KEY"}
            {" · "}
            {stripe?.webhookReady ? "Webhook on" : "Set STRIPE_WEBHOOK_SECRET"}
          </p>
        </div>

        {beat ? (
          <section className="mt-6 rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
            <p className="font-mono text-xs tracking-[0.18em] text-subtle uppercase">
              Hour {beat.hour} now
            </p>
            <h2 className="mt-2 font-display text-2xl tracking-tight">{beat.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{beat.task}</p>
            {upcoming ? (
              <p className="mt-2 text-sm text-subtle">
                Next: hour {upcoming.hour} — {upcoming.title}
              </p>
            ) : null}
            <div className="mt-5 flex flex-wrap gap-2">
              {primary.disabled ? (
                <Button type="button" disabled>
                  {primary.label}
                </Button>
              ) : (
                <Button asChild>
                  <a
                    href={primary.href}
                    target={primary.href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                  >
                    {primary.label}
                  </a>
                </Button>
              )}
              <Button asChild variant="secondary">
                <Link to="/s/$id" params={{ id: cow.id }}>
                  Sales page
                </Link>
              </Button>
            </div>
          </section>
        ) : null}

        <section className="mt-6">
          <Label htmlFor="emails">People who already trust you</Label>
          <Textarea
            id="emails"
            className="mt-1.5 min-h-28"
            placeholder="one@… two@…"
            value={mounted ? emails : ""}
            onChange={(e) => setEmails(e.target.value)}
          />
          <p className="mt-2 text-sm text-subtle">
            Hour 8 opens a mailto. Nothing is sent until you hit send.
          </p>
        </section>
      </main>
    </Shell>
  );
}
