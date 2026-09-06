import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LaunchClock } from "@/components/clock";
import { CopyButton } from "@/components/copy-button";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { currentBeat, nextBeat } from "@/lib/live";
import { READY_COWS } from "@/lib/ready-cows";
import { inspectNango, RAILS_ENV_KEYS, railsEndpoints, stripeStatus } from "@/lib/stripe-checkout";
import { barnTotals, useBarn } from "@/lib/store";
import { useStripeSync } from "@/lib/use-stripe-sync";
import { outreachMailto, parseEmails, shopHref, tweetIntent, useTill } from "@/lib/till";
import { money } from "@/lib/utils";

export const Route = createFileRoute("/till")({ component: TillPage });

const DEFAULT_ID = "ready-ash-cow";

type StripeFlags = {
  checkoutReady: boolean;
  webhookReady: boolean;
  mode: "off" | "test" | "live" | "invalid";
  leakedToClient: boolean;
  secretKind: string;
  webhookKind: string;
  nangoReady: boolean;
  nangoWebhookReady: boolean;
  operatorLocked: boolean;
  ledger: boolean;
};

type RailsUrls = {
  origin: string;
  shop: string;
  stall: string;
  stripeWebhook: string;
  nangoWebhook: string;
};

function envFlag(name: (typeof RAILS_ENV_KEYS)[number], stripe: StripeFlags | null) {
  if (!stripe) return "…";
  if (name === "STRIPE_SECRET_KEY") {
    if (stripe.leakedToClient) return "leaked";
    if (stripe.mode === "invalid") return "invalid";
    return stripe.checkoutReady ? stripe.mode : "missing";
  }
  if (name === "STRIPE_WEBHOOK_SECRET") return stripe.webhookReady ? "set" : "missing";
  if (name === "NANGO_API_KEY") return stripe.nangoReady ? "set" : "missing";
  if (name === "NANGO_WEBHOOK_SIGNING_KEY") return stripe.nangoWebhookReady ? "set" : "missing";
  return stripe.operatorLocked ? "set" : "open";
}

function RailsUrlRow({ label, url }: { label: string; url: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="min-w-0 flex-1">
        <p className="font-mono text-xs tracking-[0.18em] text-subtle uppercase">{label}</p>
        {url ? (
          <a href={url} className="mt-1 block break-all font-mono text-xs text-fg hover:text-accent">
            {url}
          </a>
        ) : (
          <p className="mt-1 font-mono text-xs text-fg">resolving…</p>
        )}
      </div>
      {url ? <CopyButton text={url} className="shrink-0" /> : null}
    </div>
  );
}

function StatusChip({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="rounded-md bg-raised px-3 py-2 font-mono text-xs text-muted">
      <span className={ok ? "text-sage" : "text-subtle"}>{ok ? "on" : "off"}</span>
      <span className="mt-0.5 block text-fg">{label}</span>
    </li>
  );
}

function TillPage() {
  useStripeSync();
  const emails = useTill((s) => s.emails);
  const setEmails = useTill((s) => s.setEmails);
  const payUrl = useTill((s) => s.payUrl);
  const setPayUrl = useTill((s) => s.setPayUrl);
  const contact = useTill((s) => s.contact);
  const setContact = useTill((s) => s.setContact);
  const operatorKey = useTill((s) => s.operatorKey);
  const setOperatorKey = useTill((s) => s.setOperatorKey);
  const launches = useBarn((s) => s.launches);
  const startLaunch = useBarn((s) => s.startLaunch);
  const sales = useBarn((s) => s.sales);
  const [stripe, setStripe] = useState<StripeFlags | null>(null);
  const [rails, setRails] = useState<RailsUrls | null>(null);
  const [inspect, setInspect] = useState<Awaited<ReturnType<typeof inspectNango>> | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [mounted, setMounted] = useState(false);

  const cow = READY_COWS.find((c) => c.id === DEFAULT_ID)!;
  const startedAt = launches[cow.id];
  const stripeTotal = barnTotals(sales, cow.id);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    void stripeStatus().then(setStripe);
    void railsEndpoints({ data: { origin: window.location.origin } }).then(setRails);
  }, []);
  useEffect(() => {
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
      <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
        <p className="font-mono text-xs tracking-[0.2em] text-subtle uppercase">Live</p>
        <h1 className="mt-2 font-display text-4xl tracking-tight sm:text-5xl">{cow.name}</h1>
        <p className="mt-3 text-base leading-relaxed text-muted">
          Clock starts when you open this page. Stripe Checkout is the till. Nango syncs paid
          sessions into the barn.
        </p>

        <div className="mt-8 rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
          <LaunchClock startedAt={startedAt} />
          <p className="mt-4 font-mono text-sm tabular-nums text-muted">
            {money(stripeTotal.amount)} from Stripe
            {stripeTotal.count ? ` · ${stripeTotal.count} paid` : " · waiting"}
          </p>
          {stripe?.leakedToClient ? (
            <p className="mt-2 text-sm text-muted">Stripe keys leaked into VITE_ — checkout off.</p>
          ) : null}
          <ul className="mt-4 grid grid-cols-2 gap-2">
            <StatusChip
              ok={Boolean(stripe?.checkoutReady)}
              label={stripe?.checkoutReady ? `Checkout ${stripe.mode}` : "Checkout"}
            />
            <StatusChip ok={Boolean(stripe?.webhookReady)} label="Stripe hook" />
            <StatusChip ok={Boolean(stripe?.nangoReady)} label="Nango sync" />
            <StatusChip ok={Boolean(stripe?.nangoWebhookReady)} label="Nango hook" />
          </ul>
          {inspect?.expected ? (
            <dl className="mt-4 grid gap-2 font-mono text-xs text-subtle">
              <div className="flex justify-between gap-4">
                <dt className="shrink-0">Sync</dt>
                <dd className="min-w-0 truncate text-right text-fg">
                  {inspect.expected.syncName} → {inspect.expected.model}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="shrink-0">Cadence</dt>
                <dd className="min-w-0 truncate text-right text-fg">{inspect.expected.frequency}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="shrink-0">Connection</dt>
                <dd className="min-w-0 truncate text-right text-fg">
                  {inspect.expected.integrationId}/{inspect.expected.connectionId}
                </dd>
              </div>
              {inspect.syncs
                .filter((row) => row.name === inspect.expected?.syncName)
                .map((row) => (
                  <div key={row.name} className="flex justify-between gap-4">
                    <dt className="shrink-0">Status</dt>
                    <dd className="min-w-0 truncate text-right text-fg">
                      {row.status}
                      {row.records ? ` · ${row.records} records` : ""}
                    </dd>
                  </div>
                ))}
              {inspect.functions.length > 0 ? (
                <div className="flex justify-between gap-4">
                  <dt className="shrink-0">Deployed</dt>
                  <dd className="min-w-0 text-right text-fg">{inspect.functions.join(", ")}</dd>
                </div>
              ) : null}
            </dl>
          ) : null}
        </div>

        <section className="mt-6 rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
          <p className="font-mono text-xs tracking-[0.18em] text-subtle uppercase">Rails</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Webhook URLs for this origin. Paste them into Stripe and Nango. Names only — values
            stay on the server.
          </p>
          <div className="mt-4 grid gap-4">
            <RailsUrlRow label="Shop" url={rails?.shop ?? ""} />
            <RailsUrlRow label="This stall" url={rails?.stall ?? ""} />
            <RailsUrlRow label="Stripe webhook" url={rails?.stripeWebhook ?? ""} />
            <RailsUrlRow label="Nango webhook" url={rails?.nangoWebhook ?? ""} />
          </div>
          <dl className="mt-5 grid gap-2 font-mono text-xs text-subtle">
            {RAILS_ENV_KEYS.map((name) => (
              <div key={name} className="flex items-baseline justify-between gap-3">
                <dt className="min-w-0 break-all">{name}</dt>
                <dd className="shrink-0 text-fg">{envFlag(name, stripe)}</dd>
              </div>
            ))}
          </dl>
        </section>

        {beat ? (
          <section className="mt-6 rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
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
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {primary.disabled ? (
                <Button type="button" disabled className="w-full sm:w-auto">
                  {primary.label}
                </Button>
              ) : (
                <Button asChild className="w-full sm:w-auto">
                  <a
                    href={primary.href}
                    target={primary.href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                  >
                    {primary.label}
                  </a>
                </Button>
              )}
              <Button asChild variant="secondary" className="w-full sm:w-auto">
                <Link to="/s/$id" params={{ id: cow.id }}>
                  Sales page
                </Link>
              </Button>
            </div>
          </section>
        ) : null}

        <section className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <Label htmlFor="pay-url">Fallback pay link</Label>
            <Input
              id="pay-url"
              className="mt-1.5"
              placeholder="https://…"
              value={mounted ? payUrl : ""}
              onChange={(e) => setPayUrl(e.target.value)}
            />
            <p className="mt-2 text-sm text-subtle">Used when Stripe is off. Gumroad or PayPal is fine.</p>
          </div>
          <div>
            <Label htmlFor="contact">Contact email</Label>
            <Input
              id="contact"
              className="mt-1.5"
              type="email"
              placeholder="you@…"
              value={mounted ? contact : ""}
              onChange={(e) => setContact(e.target.value)}
            />
            <p className="mt-2 text-sm text-subtle">Shop uses this for a mailto if there is no pay link.</p>
          </div>
        </section>

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
