import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DeliveryPaper } from "@/components/delivery-paper";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { READY_COWS } from "@/lib/ready-cows";
import { readCheckout } from "@/lib/stripe-checkout";
import { useBarn } from "@/lib/store";
import { money } from "@/lib/utils";

type PaidSearch = { session_id?: string };

export const Route = createFileRoute("/paid")({
  validateSearch: (raw: Record<string, unknown>): PaidSearch => ({
    session_id: typeof raw.session_id === "string" ? raw.session_id : undefined,
  }),
  component: PaidPage,
});

function PaidPage() {
  const { session_id: sessionId } = Route.useSearch();
  const cows = useBarn((s) => s.cows);
  const [state, setState] = useState<"load" | "ok" | "fail">(sessionId ? "load" : "fail");
  const [error, setError] = useState(sessionId ? "" : "Missing session.");
  const [kitId, setKitId] = useState("");
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    void readCheckout({ data: { sessionId } }).then((res) => {
      if (cancelled) return;
      if (!res.ok) {
        setState("fail");
        setError(res.error);
        return;
      }
      setKitId(res.sale.kitId);
      setAmount(res.sale.amount);
      setState("ok");
    });
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const cow = READY_COWS.find((c) => c.id === kitId) ?? cows.find((c) => c.id === kitId);

  return (
    <Shell>
      <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        {state === "load" ? <p className="text-sm text-muted">Checking Stripe…</p> : null}
        {state === "fail" ? (
          <>
            <h1 className="font-display text-4xl tracking-tight">Not paid</h1>
            <p className="mt-3 text-muted">{error}</p>
            <Button asChild className="mt-8">
              <Link to="/shop">Back to shop</Link>
            </Button>
          </>
        ) : null}
        {state === "ok" ? (
          <>
            <p className="font-mono text-xs tracking-[0.2em] text-subtle uppercase">Paid</p>
            <h1 className="mt-2 font-display text-4xl tracking-tight">You bought the file.</h1>
            <p className="mt-3 text-base text-muted">
              {money(amount)} cleared. Print or copy the delivery below. Keep this tab.
            </p>
            {cow ? (
              <div className="mt-10">
                <DeliveryPaper cow={cow} />
              </div>
            ) : (
              <p className="mt-6 text-sm text-muted">
                Payment is good. The stall file is not in this browser — email the seller.
              </p>
            )}
          </>
        ) : null}
      </main>
    </Shell>
  );
}
