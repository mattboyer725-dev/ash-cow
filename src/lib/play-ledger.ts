import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PlayTx = {
  id: string;
  amount: number;
  at: string;
  ok: boolean;
};

type PlayState = {
  balance: number;
  txs: PlayTx[];
  deposit: (amount: number) => PlayTx;
  withdraw: (amount: number) => PlayTx | null;
  reset: () => void;
};

export const usePlayLedger = create<PlayState>()(
  persist(
    (set, get) => ({
      balance: 0,
      txs: [],
      deposit: (amount) => {
        if (amount <= 0) throw new Error("Amount must be positive.");
        const tx: PlayTx = {
          id: `d-${Date.now().toString(36)}`,
          amount,
          at: new Date().toISOString(),
          ok: true,
        };
        set({ balance: get().balance + amount, txs: [tx, ...get().txs] });
        return tx;
      },
      withdraw: (amount) => {
        if (amount <= 0) throw new Error("Amount must be positive.");
        if (get().balance < amount) return null;
        const tx: PlayTx = {
          id: `w-${Date.now().toString(36)}`,
          amount: -amount,
          at: new Date().toISOString(),
          ok: true,
        };
        set({ balance: get().balance - amount, txs: [tx, ...get().txs] });
        return tx;
      },
      reset: () => set({ balance: 0, txs: [] }),
    }),
    { name: "ash-cow-play-ledger" },
  ),
);
