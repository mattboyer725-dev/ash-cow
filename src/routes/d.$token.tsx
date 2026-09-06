import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DeliveryPaper } from "@/components/delivery-paper";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { READY_COWS } from "@/lib/ready-cows";
import { fulfillByToken } from "@/lib/stripe-checkout";
import { money } from "@/lib/utils";

export const Route = createFileRoute("/d/$token")({ component: DownloadPage });

function DownloadPage() {
  const { token } = Route.useParams();
  const [state, setState] = useState<"load" | "ok" | "fail">("load");
  const [error, setError] = useState("");
  const [kitId, setKitId] = useState("");
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void fulfillByToken({ data: { token } }).then((res) => {
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
  }, [token]);

  const cow = READY_COWS.find((c) => c.id === kitId);

  return (
    <Shell>
      <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        {state === "load" ? <p className="text-sm text-muted">Opening the file…</p> : null}
        {state === "fail" ? (
          <>
            <h1 className="font-display text-4xl tracking-tight">No file</h1>
            <p className="mt-3 text-muted">{error}</p>
            <Button asChild className="mt-8">
              <Link to="/shop">Back to shop</Link>
            </Button>
          </>
        ) : null}
        {state === "ok" && cow ? (
          <>
            <p className="font-mono text-xs tracking-[0.2em] text-subtle uppercase">Yours</p>
            <h1 className="mt-2 font-display text-4xl tracking-tight">{cow.name}</h1>
            <p className="mt-3 text-base text-muted">
              {money(amount)} paid. Keep this link. Print or download the file.
            </p>
            <div className="mt-6">
              <Button asChild>
                <a href={`/api/download/${encodeURIComponent(token)}`}>Download .txt</a>
              </Button>
            </div>
            <div className="mt-10">
              <DeliveryPaper cow={cow} />
            </div>
          </>
        ) : null}
        {state === "ok" && !cow ? (
          <p className="text-muted">Payment is good. This stall’s file is not hosted here.</p>
        ) : null}
      </main>
    </Shell>
  );
}
