import type { Sale } from "./types";

const seenEvents = new Set<string>();
const recent: StripeNotice[] = [];
const MAX_RECENT = 24;

export type StripeNotice = {
  id: string;
  type: string;
  at: string;
  kitId?: string;
  amount?: number;
  ok: boolean;
  detail: string;
};

export function rememberNotice(notice: StripeNotice) {
  if (seenEvents.has(notice.id)) return false;
  seenEvents.add(notice.id);
  recent.unshift(notice);
  if (recent.length > MAX_RECENT) recent.pop();
  if (seenEvents.size > 400) {
    const keep = [...seenEvents].slice(-200);
    seenEvents.clear();
    for (const id of keep) seenEvents.add(id);
  }
  return true;
}

export function recentNotices() {
  return recent.slice(0, MAX_RECENT);
}

export type SessionSlice = {
  id: string;
  payment_status?: string | null;
  status?: string | null;
  amount_total?: number | null;
  created?: number | null;
  metadata?: Record<string, string> | null;
};

export function saleFromSession(session: SessionSlice): Sale | null {
  if (session.payment_status !== "paid" && session.status !== "complete") return null;
  const kitId = typeof session.metadata?.kitId === "string" ? session.metadata.kitId : "";
  if (!kitId) return null;
  const cents = session.amount_total ?? 0;
  if (cents <= 0) return null;
  return {
    id: session.id,
    kitId,
    amount: Math.round(cents / 100),
    at: new Date((session.created ?? Math.floor(Date.now() / 1000)) * 1000).toISOString(),
    source: "stripe",
  };
}

export function handleStripeEvent(event: {
  id: string;
  type: string;
  created: number;
  data: { object: SessionSlice };
}): StripeNotice {
  const base = {
    id: event.id,
    type: event.type,
    at: new Date(event.created * 1000).toISOString(),
  };

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const session = event.data.object as SessionSlice;
    const sale = saleFromSession(session);
    if (!sale) {
      return {
        ...base,
        ok: false,
        detail: "Session was not paid or had no kitId.",
      };
    }
    return {
      ...base,
      kitId: sale.kitId,
      amount: sale.amount,
      ok: true,
      detail: `Paid ${sale.amount} for ${sale.kitId}.`,
    };
  }

  return {
    ...base,
    ok: true,
    detail: "Acknowledged.",
  };
}
