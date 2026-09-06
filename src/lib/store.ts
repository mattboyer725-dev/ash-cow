import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CashCow, Sale } from "./types";
import { uid } from "./utils";

type BarnState = {
  cows: CashCow[];
  sales: Sale[];
  launches: Record<string, number>;
  hourDone: Record<string, number[]>;
  addCow: (cow: CashCow) => void;
  adoptCow: (cow: CashCow) => CashCow;
  removeCow: (id: string) => void;
  addSale: (kitId: string, amount: number) => void;
  recordPaidSale: (sale: Sale) => boolean;
  removeSale: (id: string) => void;
  startLaunch: (kitId: string) => void;
  resetLaunch: (kitId: string) => void;
  toggleHour: (kitId: string, hour: number) => void;
};

export const useBarn = create<BarnState>()(
  persist(
    (set, get) => ({
      cows: [],
      sales: [],
      launches: {},
      hourDone: {},
      addCow: (cow) => set({ cows: [cow, ...get().cows.filter((c) => c.id !== cow.id)] }),
      adoptCow: (cow) => {
        const clone: CashCow = {
          ...cow,
          id: uid("cow"),
          createdAt: new Date().toISOString(),
        };
        set({ cows: [clone, ...get().cows] });
        return clone;
      },
      removeCow: (id) =>
        set({
          cows: get().cows.filter((c) => c.id !== id),
        }),
      addSale: (kitId, amount) =>
        set({
          sales: [
            { id: uid("sale"), kitId, amount, at: new Date().toISOString(), source: "manual" },
            ...get().sales,
          ],
        }),
      recordPaidSale: (sale) => {
        if (get().sales.some((row) => row.id === sale.id)) return false;
        set({ sales: [sale, ...get().sales] });
        return true;
      },
      removeSale: (id) => set({ sales: get().sales.filter((s) => s.id !== id) }),
      startLaunch: (kitId) =>
        set({ launches: { ...get().launches, [kitId]: Date.now() } }),
      resetLaunch: (kitId) => {
        const next = { ...get().launches };
        delete next[kitId];
        const hours = { ...get().hourDone };
        delete hours[kitId];
        set({ launches: next, hourDone: hours });
      },
      toggleHour: (kitId, hour) => {
        const current = get().hourDone[kitId] ?? [];
        const next = current.includes(hour)
          ? current.filter((h) => h !== hour)
          : [...current, hour];
        set({ hourDone: { ...get().hourDone, [kitId]: next } });
      },
    }),
    { name: "ash-cow-barn" },
  ),
);

export function barnTotals(sales: Sale[], kitId?: string) {
  const rows = kitId ? sales.filter((s) => s.kitId === kitId) : sales;
  return {
    count: rows.length,
    amount: rows.reduce((sum, s) => sum + s.amount, 0),
  };
}

export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const finish = () => setHydrated(true);
    const unsub = useBarn.persist.onFinishHydration(finish);
    if (useBarn.persist.hasHydrated()) finish();
    return unsub;
  }, []);
  return hydrated;
}
