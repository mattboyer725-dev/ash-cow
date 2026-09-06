import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { currentBeat, nextBeat } from "@/lib/live";
import { READY_COWS } from "@/lib/ready-cows";
import { listStripeSales, stripeStatus } from "@/lib/stripe-checkout";
import { useBarn } from "@/lib/store";
import { outreachMailto, parseEmails, shopHref, tweetIntent, useTill } from "@/lib/till";
import { money } from "@/lib/utils";

export const Route = createFileRoute("/till")({ component: TillPage });

function TillPage() {
  const payUrl = useTill((s) => s.payUrl);
  const payLabel = useTill((s) => s.payLabel);
  const contact = useTill((s) => s.contact);
  const emails = useTill((s) => s.emails);
  const setPayUrl = useTill((s) => s.setPayUrl);
  const setPayLabel = useTill((s) => s.setPayLabel);
  const setContact = useTill((s) => s.setContact);
  const setEmails = useTill((s) => s.setEmails);
  const launches = useBarn((s) => s.launches);
  const cows = useBarn((s) => s.cows);
  const startLaunch = useBarn((s) => s.startLaunch);
  const recordPaidSale = useBarn((s) => s.recordPaidSale);
  const [stripe, setStripe] = useState<{ checkoutReady: boolean; webhookReady: boolean } | null>(null);
  const [notices, setNotices] = useState<{ id: string; type: string; detail: string; ok: boolean }[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    void stripeStatus().then(setStripe);
  }, []);
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const live = mounted
    ? [
        ...READY_COWS.map((c) => ({ cow: c, startedAt: launches[c.id] })),
        ...cows.map((c) => ({ cow: c, startedAt: launches[c.id] })),
      ].filter((row, i, all) => all.findIndex((r) => r.cow.id === row.cow.id) === i)
    : [];

  const running = live.filter((row) => row.startedAt);

  return (
    <Shell>
      <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="font-mono text-xs tracking-[0.2em] text-subtle uppercase">Operator</p>
        <h1 className="mt-2 font-display text-4xl tracking-tight sm:text-5xl">Till</h1>
        <p className="mt-4 text-base leading-relaxed text-muted">
          Paste the URL where money already moves. The shop buy button goes there. Then start
          a 24-hour clock and do the hour that is due — this page keeps the current task on
          top. It will not post for you, charge a card, or invent a sale.
        </p>

        <section className="mt-10 rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
          <h2 className="font-display text-xl tracking-tight">Take payment</h2>
          <div className="mt-4 grid gap-4">
            <div>
              <Label htmlFor="pay-url">Gumroad / Lemon Squeezy / PayPal / Stripe link</Label>
              <Input
                id="pay-url"
                className="mt-1.5"
                placeholder="https://gumroad.com/l/…"
                value={mounted ? payUrl : ""}
                onChange={(e) => setPayUrl(e.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="pay-label">Label</Label>
                <Input
                  id="pay-label"
                  className="mt-1.5"
                  value={mounted ? payLabel : ""}
                  onChange={(e) => setPayLabel(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="contact">Inbox for “I want this”</Label>
                <Input
                  id="contact"
                  className="mt-1.5"
                  type="email"
                  placeholder="you@domain"
                  value={mounted ? contact : ""}
                  onChange={(e) => setContact(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="emails">Ten people who already trust you</Label>
              <Textarea
                id="emails"
                className="mt-1.5 min-h-28"
                placeholder="one@… two@…"
                value={mounted ? emails : ""}
                onChange={(e) => setEmails(e.target.value)}
              />
              <p className="mt-2 text-sm text-subtle">
                Stored in this browser. Used only to open a mailto — not sent automatically.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
          <h2 className="font-display text-xl tracking-tight">Stripe webhooks</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Endpoint: <span className="font-mono text-fg">/api/stripe/webhook</span>. Events:{" "}
            <span className="font-mono">checkout.session.completed</span>,{" "}
            <span className="font-mono">checkout.session.async_payment_succeeded</span>. Unsigned
            posts are rejected.
          </p>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted">Checkout</dt>
              <dd className="font-mono text-sm">
                {stripe?.checkoutReady ? "STRIPE_SECRET_KEY set" : "Missing STRIPE_SECRET_KEY"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Webhook</dt>
              <dd className="font-mono text-sm">
                {stripe?.webhookReady ? "STRIPE_WEBHOOK_SECRET set" : "Missing STRIPE_WEBHOOK_SECRET"}
              </dd>
            </div>
          </dl>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={syncing || !stripe?.checkoutReady}
              onClick={() => {
                setSyncing(true);
                void listStripeSales()
                  .then((res) => {
                    if (!res.ok) return;
                    let added = 0;
                    for (const sale of res.sales) {
                      if (recordPaidSale(sale)) added += 1;
                    }
                    setNotices(res.notices);
                    toast(
                      added === 0
                        ? "Stripe is current. No new paid sessions."
                        : `Logged ${added} Stripe sale${added === 1 ? "" : "s"} in the barn.`,
                    );
                  })
                  .finally(() => setSyncing(false));
              }}
            >
              {syncing ? "Syncing…" : "Sync paid sessions"}
            </Button>
          </div>
          {notices.length > 0 ? (
            <ul className="mt-4 flex flex-col gap-2">
              {notices.slice(0, 8).map((row) => (
                <li key={row.id} className="text-sm text-muted">
                  <span className="font-mono text-fg">{row.type}</span> — {row.detail}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-subtle">
              Local: <span className="font-mono">stripe listen --forward-to localhost:8080/api/stripe/webhook</span>
            </p>
          )}
        </section>

        <section className="mt-8 flex flex-col gap-4">
          <h2 className="font-display text-xl tracking-tight">24-hour operator</h2>
          {live.map(({ cow, startedAt }) => {
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
            return (
              <article
                key={cow.id}
                className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-display text-2xl tracking-tight">{cow.name}</h3>
                  <p className="font-mono text-sm tabular-nums">{money(cow.price)}</p>
                </div>
                {startedAt && beat ? (
                  <div className="mt-4">
                    <p className="font-mono text-xs tracking-[0.18em] text-subtle uppercase">
                      Hour {beat.hour} now
                    </p>
                    <p className="mt-1 font-medium">{beat.title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{beat.task}</p>
                    {upcoming ? (
                      <p className="mt-2 text-sm text-subtle">
                        Next: hour {upcoming.hour} — {upcoming.title}
                      </p>
                    ) : (
                      <p className="mt-2 text-sm text-subtle">No more beats. Count the barn.</p>
                    )}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-muted">Clock off. Start it to run the day.</p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  {startedAt ? null : (
                    <Button type="button" onClick={() => startLaunch(cow.id)}>
                      Go live
                    </Button>
                  )}
                  <Button asChild variant="secondary">
                    <Link to="/s/$id" params={{ id: cow.id }}>
                      Sales page
                    </Link>
                  </Button>
                  <Button asChild variant="secondary">
                    <a href={tweetIntent(`${post}\n${href}`)} target="_blank" rel="noreferrer">
                      Post on X
                    </a>
                  </Button>
                  {list.length > 0 ? (
                    <Button asChild variant="secondary">
                      <a href={mail}>Open {list.length} emails</a>
                    </Button>
                  ) : null}
                </div>
              </article>
            );
          })}
          {running.length === 0 ? (
            <p className="text-sm text-subtle">Start a clock. The due hour stays on this page.</p>
          ) : null}
        </section>
      </main>
    </Shell>
  );
}
