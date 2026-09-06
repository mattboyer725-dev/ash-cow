import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { readCheckout } from "@/lib/stripe-checkout";

type PaidSearch = { session_id?: string };

export const Route = createFileRoute("/paid")({
  validateSearch: (raw: Record<string, unknown>): PaidSearch => ({
    session_id: typeof raw.session_id === "string" ? raw.session_id : undefined,
  }),
  component: PaidPage,
});

function PaidPage() {
  const navigate = useNavigate();
  const { session_id: sessionId } = Route.useSearch();
  const [error, setError] = useState(sessionId ? "" : "Missing session.");

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    void readCheckout({ data: { sessionId } }).then((res) => {
      if (cancelled) return;
      if (!res.ok) {
        setError(res.error);
        return;
      }
      void navigate({ to: "/d/$token", params: { token: res.token } });
    });
    return () => {
      cancelled = true;
    };
  }, [sessionId, navigate]);

  if (!error) {
    return (
      <Shell>
        <main className="mx-auto w-full max-w-lg px-4 py-16 sm:px-6">
          <p className="font-mono text-xs tracking-[0.2em] text-subtle uppercase">Checkout</p>
          <h1 className="mt-2 font-display text-3xl tracking-tight">Checking Stripe</h1>
          <p className="mt-3 text-sm text-muted">Hold this tab. The file opens when the session is paid.</p>
        </main>
      </Shell>
    );
  }

  return (
    <Shell>
      <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="font-display text-4xl tracking-tight">Not paid</h1>
        <p className="mt-3 text-muted">{error}</p>
        <Button asChild className="mt-8">
          <Link to="/shop">Back to shop</Link>
        </Button>
      </main>
    </Shell>
  );
}
