import { useEffect } from "react";
import { kickNangoSync, listLedger } from "@/lib/stripe-checkout";
import { useBarn } from "@/lib/store";
import { useTill } from "@/lib/till";

export function useStripeSync() {
  const recordPaidSale = useBarn((s) => s.recordPaidSale);
  const operatorKey = useTill((s) => s.operatorKey);

  useEffect(() => {
    let cancelled = false;

    async function pull() {
      try {
        const res = await listLedger();
        if (cancelled || !res.ok) return;
        for (const sale of res.sales) recordPaidSale(sale);
      } catch {
        // Ledger unset or network — barn stays as-is.
      }
    }

    void kickNangoSync({ data: { key: operatorKey } });
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
  }, [recordPaidSale, operatorKey]);
}
