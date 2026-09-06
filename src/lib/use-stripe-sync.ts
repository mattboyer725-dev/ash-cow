import { useEffect } from "react";
import { kickNangoSync, listStripeSales } from "@/lib/stripe-checkout";
import { useBarn } from "@/lib/store";

export function useStripeSync() {
  const recordPaidSale = useBarn((s) => s.recordPaidSale);

  useEffect(() => {
    let cancelled = false;

    async function pull() {
      try {
        const res = await listStripeSales();
        if (cancelled || !res.ok) return;
        for (const sale of res.sales) recordPaidSale(sale);
      } catch {
        // Nango/Stripe unset or network — barn stays as-is.
      }
    }

    void kickNangoSync();
    void pull();
    const id = window.setInterval(() => void pull(), 30_000);
    const onFocus = () => {
      if (document.visibilityState === "visible") void pull();
    };
    window.addEventListener("visibilitychange", onFocus);
    return () => {
      cancelled = true;
      window.clearInterval(id);
      window.removeEventListener("visibilitychange", onFocus);
    };
  }, [recordPaidSale]);
}
