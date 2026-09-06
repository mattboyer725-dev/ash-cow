import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { barnTotals, useBarn } from "@/lib/store";
import { useStripeSync } from "@/lib/use-stripe-sync";
import { money } from "@/lib/utils";

export function BarnSales({ kitId, defaultAmount }: { kitId: string; defaultAmount: number }) {
  useStripeSync();
  const sales = useBarn((s) => s.sales);
  const addSale = useBarn((s) => s.addSale);
  const removeSale = useBarn((s) => s.removeSale);
  const [amount, setAmount] = useState(String(defaultAmount));
  const mine = sales.filter((row) => row.kitId === kitId);
  const totals = barnTotals(sales, kitId);

  function onLog(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) return;
    addSale(kitId, Math.round(n));
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-3xl tabular-nums tracking-tight">{money(totals.amount)}</p>
        <p className="mt-1 text-sm text-muted">
          {totals.count === 0
            ? "No sales yet. Stripe fills this when a session is paid."
            : `${totals.count} sale${totals.count === 1 ? "" : "s"} in this stall.`}
        </p>
      </div>
      <form onSubmit={onLog} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Label htmlFor="sale-amount">Amount</Label>
          <Input
            id="sale-amount"
            className="mt-1.5"
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <Button type="submit">Log a sale</Button>
      </form>
      <ul className="flex flex-col gap-2">
        {mine.map((row) => (
          <li
            key={row.id}
            className="flex items-center justify-between gap-3 rounded-md bg-raised px-3 py-3 shadow-[var(--shadow-border)]"
          >
            <span className="font-mono text-sm tabular-nums">{money(row.amount)}</span>
            <span className="text-xs text-subtle">
              {row.status === "refunded" ? "Refunded · " : row.source === "stripe" ? "Stripe · " : ""}
              {new Date(row.at).toLocaleString()}
            </span>
            <button
              type="button"
              className="text-xs text-muted hover:text-fg"
              onClick={() => removeSale(row.id)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
