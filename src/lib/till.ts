import { create } from "zustand";
import { persist } from "zustand/middleware";

type TillState = {
  payUrl: string;
  payLabel: string;
  contact: string;
  emails: string;
  operatorKey: string;
  setPayUrl: (v: string) => void;
  setPayLabel: (v: string) => void;
  setContact: (v: string) => void;
  setEmails: (v: string) => void;
  setOperatorKey: (v: string) => void;
};

export const useTill = create<TillState>()(
  persist(
    (set) => ({
      payUrl: "",
      payLabel: "Gumroad",
      contact: "",
      emails: "",
      operatorKey: "",
      setPayUrl: (payUrl) => set({ payUrl }),
      setPayLabel: (payLabel) => set({ payLabel }),
      setContact: (contact) => set({ contact }),
      setEmails: (emails) => set({ emails }),
      setOperatorKey: (operatorKey) => set({ operatorKey }),
    }),
    { name: "ash-cow-till" },
  ),
);

export function resolvedPayUrl() {
  const fromTill = useTill.getState().payUrl.trim();
  if (fromTill) return fromTill;
  const fromEnv = String(import.meta.env.VITE_PAY_URL ?? "").trim();
  return fromEnv;
}

export function shopPath(id: string) {
  return `/s/${id}`;
}

export function shopHref(id: string) {
  if (typeof window === "undefined") return shopPath(id);
  return `${window.location.origin}${shopPath(id)}`;
}

export function tweetIntent(text: string) {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}

export function parseEmails(raw: string) {
  return raw
    .split(/[\s,;]+/)
    .map((s) => s.trim())
    .filter((s) => s.includes("@"));
}

export function outreachMailto(emails: string[], subject: string, body: string) {
  const to = emails.join(",");
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
