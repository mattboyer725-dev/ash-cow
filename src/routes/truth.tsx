import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FICTION_CURVE } from "@/lib/fiction-curve";
import { usePlayLedger } from "@/lib/play-ledger";
import { barnTotals, useBarn } from "@/lib/store";
import { money } from "@/lib/utils";

export const Route = createFileRoute("/truth")({ component: TruthPage });

function TruthPage() {
  const sales = useBarn((s) => s.sales);
  const barn = barnTotals(sales);
  const balance = usePlayLedger((s) => s.balance);
  const txs = usePlayLedger((s) => s.txs);
  const deposit = usePlayLedger((s) => s.deposit);
  const withdraw = usePlayLedger((s) => s.withdraw);
  const reset = usePlayLedger((s) => s.reset);
  const [amount, setAmount] = useState("500");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  function onDeposit(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) return;
    deposit(n);
  }

  function onWithdraw() {
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) return;
    withdraw(n);
  }

  const chart = FICTION_CURVE.map((row) => ({
    generation: row.generation,
    fiction: row.valuation,
    cash: row.spend,
  }));

  return (
    <Shell
      trailer={
        mounted ? (
          <p className="font-mono text-xs tabular-nums tracking-wider">
            Barn {money(barn.amount)} · Play {money(balance)}
          </p>
        ) : undefined
      }
    >
      <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="font-mono text-xs tracking-[0.2em] text-subtle uppercase">Combined</p>
        <h1 className="mt-2 max-w-3xl font-display text-4xl tracking-tight sm:text-6xl">
          Three ledgers. One of them is money.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
          The barn logs sales of a file you actually listed. The play ledger adds and
          subtracts numbers in this browser. The 509-generation curve is a story that
          never leaves $500 of spend. None of them open a mystery box or buy a watch.
        </p>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          <Stat
            label="Barn (logged sales)"
            value={mounted ? money(barn.amount) : "—"}
            note={
              mounted
                ? `${barn.count} real entries you typed after a sale`
                : "Sales of a product you listed"
            }
          />
          <Stat
            label="Play ledger"
            value={mounted ? money(balance) : "—"}
            note="Toy deposit / withdraw. Not a card. Not a shop."
          />
          <Stat
            label="Fiction curve"
            value="$100,000"
            note="Printed valuation. Upfront spend stays $500 on every row."
          />
        </div>

        <section className="mt-14">
          <p className="font-mono text-xs tracking-[0.2em] text-subtle uppercase">
            The curve
          </p>
          <h2 className="mt-2 font-display text-3xl tracking-tight">
            $500 in, $500 in, $500 in.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            The rising line is a counter someone named “acquired valuation.” The flat
            line is the only cash that existed in the printout. At generation 264 the
            counter hits $100,000 and stops. Generation 509 copies the same number.
          </p>
          <div className="mt-6 h-72 min-w-0 w-full overflow-hidden rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chart} margin={{ top: 8, right: 12, left: 8, bottom: 8 }}>
                <CartesianGrid stroke="var(--color-border)" />
                <XAxis
                  dataKey="generation"
                  tick={{ fill: "var(--color-muted)", fontSize: 12 }}
                  stroke="var(--color-subtle)"
                />
                <YAxis
                  tick={{ fill: "var(--color-muted)", fontSize: 12 }}
                  stroke="var(--color-subtle)"
                  tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-raised)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    color: "var(--color-fg)",
                  }}
                  formatter={(value, name) => [
                    money(Number(value)),
                    name === "fiction" ? "Printed valuation" : "Upfront spend",
                  ]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="fiction"
                  name="Printed valuation"
                  stroke="var(--color-accent)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="cash"
                  name="Upfront spend"
                  stroke="var(--color-sage)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="mt-14 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
            <h2 className="font-display text-xl tracking-tight">Play ledger</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Same rules as the Python toy: deposit, withdraw, refuse overdraft. Money
              here is a number in local storage.
            </p>
            {mounted ? (
              <>
                <p className="mt-4 font-mono text-3xl tabular-nums">{money(balance)}</p>
                <form onSubmit={onDeposit} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="flex-1">
                    <Label htmlFor="play-amt">Amount</Label>
                    <Input
                      id="play-amt"
                      className="mt-1.5"
                      inputMode="numeric"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  <Button type="submit">Deposit</Button>
                  <Button type="button" variant="secondary" onClick={onWithdraw}>
                    Withdraw
                  </Button>
                </form>
                <button
                  type="button"
                  className="mt-3 text-sm text-subtle hover:text-fg"
                  onClick={() => reset()}
                >
                  Reset play money
                </button>
                <ul className="mt-4 flex flex-col gap-2">
                  {txs.slice(0, 6).map((tx) => (
                    <li
                      key={tx.id}
                      className="flex justify-between font-mono text-sm tabular-nums text-muted"
                    >
                      <span>{tx.amount > 0 ? "+" : ""}{money(tx.amount)}</span>
                      <span className="text-subtle">{new Date(tx.at).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="mt-4 text-sm text-muted">Opening ledger…</p>
            )}
          </div>

          <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
            <h2 className="font-display text-xl tracking-tight">Why the box does not pay</h2>
            <ul className="mt-4 flex flex-col gap-3 text-sm leading-relaxed text-muted">
              <li>
                A mystery-box shop sells a chance. The poster is a Rolex; the table is
                cheap watches. Expected value sits under the box price or the shop dies.
              </li>
              <li>
                Keep the pull and you pay freight, tax, insurance. Sell it back and they
                set the price, hide the formula, and do not warrant the sticker value.
              </li>
              <li>
                Purchase is final. A local JSON deposit of $500 does not open a box, and
                a 200× “efficiency ratio” is a field in a file.
              </li>
              <li>
                The honest $500 move in this barn: list a $29–$49 file tonight, send ten
                messages, log what actually clears.
              </li>
            </ul>
            <Separator className="my-5" />
            <Button asChild>
              <Link to="/forge">Forge a file instead</Link>
            </Button>
          </div>
        </section>
      </main>
    </Shell>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <article className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 font-mono text-2xl tabular-nums tracking-tight">{value}</p>
      <p className="mt-2 text-sm leading-relaxed text-subtle">{note}</p>
    </article>
  );
}
