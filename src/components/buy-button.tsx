import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createCheckout, stripeStatus } from "@/lib/stripe-checkout";
import { useTill } from "@/lib/till";
import type { CashCow } from "@/lib/types";
import { cn, money } from "@/lib/utils";

export function BuyButton({
  cow,
  size = "lg",
  className,
}: {
  cow: CashCow;
  size?: "default" | "lg";
  className?: string;
}) {
  const payUrl = useTill((s) => s.payUrl);
  const contact = useTill((s) => s.contact);
  const fallback = payUrl.trim() || String(import.meta.env.VITE_PAY_URL ?? "").trim();
  const [stripeOn, setStripeOn] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let live = true;
    void stripeStatus().then((s) => {
      if (live) setStripeOn(s.checkoutReady);
    });
    return () => {
      live = false;
    };
  }, []);

  async function onStripe() {
    setBusy(true);
    try {
      const res = await createCheckout({
        data: { kitId: cow.id, name: cow.name, price: cow.price },
      });
      if (!res.ok) {
        toast(res.error);
        return;
      }
      window.location.href = res.url;
    } catch {
      toast("Checkout failed.");
    } finally {
      setBusy(false);
    }
  }

  if (stripeOn) {
    return (
      <Button type="button" size={size} disabled={busy} className={className} onClick={() => void onStripe()}>
        {busy ? "Opening Stripe…" : `Buy ${money(cow.price)}`}
      </Button>
    );
  }

  if (fallback) {
    return (
      <Button asChild size={size} className={className}>
        <a href={fallback} target="_blank" rel="noreferrer">
          Buy {money(cow.price)}
          <ExternalLink />
        </a>
      </Button>
    );
  }

  if (contact.trim()) {
    const mail = `mailto:${contact.trim()}?subject=${encodeURIComponent(`Buy ${cow.name}`)}&body=${encodeURIComponent(`I want ${cow.name} for ${money(cow.price)}. Send the file and your payment link.`)}`;
    return (
      <Button asChild size={size} className={className}>
        <a href={mail}>Request {money(cow.price)}</a>
      </Button>
    );
  }

  return (
    <Button asChild size={size} variant="secondary" className={cn(className)}>
      <Link to="/till">List on Live</Link>
    </Button>
  );
}
