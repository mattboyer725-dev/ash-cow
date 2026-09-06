import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LaunchClock } from "@/components/clock";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { currentBeat, nextBeat } from "@/lib/live";
import { READY_COWS } from "@/lib/ready-cows";
import { inspectNango, stripeStatus } from "@/lib/stripe-checkout";
import { barnTotals, useBarn } from "@/lib/store";
import { useStripeSync } from "@/lib/use-stripe-sync";
import { outreachMailto, parseEmails, shopHref, tweetIntent, useTill } from "@/lib/till";
import { money } from "@/lib/utils";

export const Route = createFileRoute("/till")({ component: TillPage });

const DEFAULT_ID = "ready-ash-cow";

function TillPage() {
  useStripeSync();
  const emails = useTill((s) => s.emails);
  const setEmails = useTill((s) => s.setEmails);
  const operatorKey = useTill((s) => s.operatorKey);
  const setOperatorKey = useTill((s) => s.setOperatorKey);
  const launches = useBarn((s) => s.launches);
  const startLaunch = useBarn((s) => s.startLaunch);
  const sales = useBarn((s) => s.sales);
  const [stripe, setStripe] = useState<{
    checkoutReady: boolean;
    webhookReady: boolean;
    nangoReady: boolean;
    nangoWebhookReady: boolean;
    operatorLocked: boolean;
    ledger: boolean;
  } | null>(null);
  const [inspect, setInspect] = useState<Awaited<ReturnType<typeof inspectNango>> | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [mounted, setMounted] = useState(false);

  const cow = READY_COWS.find((c) => c.id === DEFAULT_ID)!;
  const startedAt = launches[cow.id];
  const stripeTotal = barnTotals(sales, cow.id);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    void stripeStatus().then(setStripe);
    void inspectNango({ data: { key: operatorKey } }).then(setInspect);
  }, [operatorKey]);
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
          Clock starts when you open this page. Stripe Checkout is the till. Nango syncs paid
          sessions into the barn.
        </p>

        <div className="mt-8 rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
          <LaunchClock startedAt={startedAt} />
          <p className="mt-4 font-mono text-sm tabular-nums text-muted">
            {money(stripeTotal.amount)} from Stripe
            {stripeTotal.count ? ` · ${stripeTotal.count} paid` : " · waiting"}
          </p>
          <p className="mt-1 font-mono text-xs text-subtle">
            {stripe?.checkoutReady ? "Checkout on" : "Set STRIPE_SECRET_KEY"}
            {" · "}
            {stripe?.nangoReady ? "Nango sync on" : "Set NANGO_API_KEY"}
            {" · "}
            {stripe?.operatorLocked ? "Operator locked" : "Operator open"}
          </p>
          {inspect?.expected ? (
            <dl className="mt-4 grid gap-2 font-mono text-xs text-subtle">
              <div className="flex justify-between gap-4">
                <dt>Sync</dt>
                <dd className="text-fg">
                  {inspect.expected.syncName} → {inspect.expected.model}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Cadence</dt>
                <dd className="text-fg">{inspect.expected.frequency}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Connection</dt>
                <dd className="text-fg">
                  {inspect.expected.integrationId}/{inspect.expected.connectionId}
                </dd>
              </div>
              {inspect.syncs
                .filter((row) => row.name === inspect.expected?.syncName)
                .map((row) => (
                  <div key={row.name} className="flex justify-between gap-4">
                    <dt>Status</dt>
                    <dd className="text-fg">
                      {row.status}
                      {row.records ? ` · ${row.records} records` : ""}
                    </dd>
                  </div>
                ))}
              {inspect.functions.length > 0 ? (
                <div className="flex justify-between gap-4">
                  <dt>Deployed</dt>
                  <dd className="text-right text-fg">{inspect.functions.join(", ")}</dd>
                </div>
              ) : null}
            </dl>
          ) : null}
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

        <section className="mt-6">
          <Label htmlFor="operator-key">Operator key</Label>
          <Input
            id="operator-key"
            className="mt-1.5"
            type="password"
            autoComplete="off"
            value={mounted ? operatorKey : ""}
            onChange={(e) => setOperatorKey(e.target.value)}
          />
          <p className="mt-2 text-sm text-subtle">
            Matches OPERATOR_SECRET on the server. Empty is fine in preview.
          </p>
        </section>
      </main>
    </Shell>
  );
}
