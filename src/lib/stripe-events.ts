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
  payment_intent?: string | null;
  metadata?: Record<string, string> | null;
};

export const PAID_TYPES = new Set([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
]);

export const REFUND_TYPES = new Set([
  "charge.refunded",
  "charge.dispute.created",
  "refund.updated",
  "checkout.session.async_payment_failed",
]);

export function paymentIntentOf(object: {
  id?: string;
  payment_intent?: unknown;
  paymentIntent?: unknown;
}): string | null {
  const pi = object.payment_intent ?? object.paymentIntent;
  if (typeof pi === "string" && pi.length > 0) return pi;
  if (pi && typeof pi === "object" && "id" in pi) {
    const id = (pi as { id?: unknown }).id;
    if (typeof id === "string" && id.length > 0) return id;
  }
  if (typeof object.id === "string" && object.id.startsWith("pi_")) return object.id;
  return null;
}

export function asSessionSlice(object: {
  id?: string;
  payment_status?: string | null;
  status?: string | null;
  amount_total?: number | null;
  created?: number | null;
  payment_intent?: unknown;
  metadata?: Record<string, string> | null;
}): SessionSlice {
  return {
    id: object.id ?? "",
    payment_status: object.payment_status,
    status: object.status,
    amount_total: object.amount_total,
    created: object.created,
    payment_intent: paymentIntentOf(object),
    metadata: object.metadata ?? null,
  };
}

export function refundRefOf(object: {
  id?: string;
  payment_intent?: unknown;
}): string | null {
  const pi = paymentIntentOf(object);
  if (pi) return pi;
  if (typeof object.id === "string" && object.id.startsWith("cs_")) return object.id;
  return null;
}

export function saleFromCheckoutRecord(row: {
  id: string;
  amount_total?: number | null;
  created?: number | null;
  payment_status?: string | null;
  status?: string | null;
  metadata?: Record<string, unknown> | null;
}): Sale | null {
  const kitId = typeof row.metadata?.kitId === "string" ? row.metadata.kitId : "";
  return saleFromSession({
    id: row.id,
    amount_total: row.amount_total,
    created: row.created,
    payment_status: row.payment_status,
    status: row.status,
    metadata: kitId ? { kitId } : null,
  });
}

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
  data: { object: SessionSlice & { payment_intent?: string | null } };
}): StripeNotice {
  const base = {
    id: event.id,
    type: event.type,
    at: new Date(event.created * 1000).toISOString(),
  };

  if (PAID_TYPES.has(event.type)) {
    const session = event.data.object;
    const sale = saleFromSession(session);
    if (!sale) {
      return { ...base, ok: false, detail: "Session was not paid or had no kitId." };
    }
    return {
      ...base,
      kitId: sale.kitId,
      amount: sale.amount,
      ok: true,
      detail: `Paid ${sale.amount} for ${sale.kitId}.`,
    };
  }

  if (REFUND_TYPES.has(event.type)) {
    const ref = refundRefOf(event.data.object);
    return {
      ...base,
      ok: Boolean(ref),
      detail: ref ? `Refund against ${ref}.` : "Refund event had no payment intent.",
    };
  }

  return { ...base, ok: true, detail: "Acknowledged." };
}
