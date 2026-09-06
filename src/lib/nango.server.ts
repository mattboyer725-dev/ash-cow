import { Nango } from "@nangohq/node";
import type { Sale } from "./types";
import { saleFromCheckoutRecord } from "./stripe-events";

export type CheckoutSessionRecord = {
  id: string;
  amount_total?: number | null;
  created?: number | null;
  payment_status?: string | null;
  status?: string | null;
  metadata?: Record<string, unknown> | null;
};

export function nangoConfig() {
  const apiKey = (process.env.NANGO_API_KEY ?? process.env.NANGO_SECRET_KEY ?? "").trim();
  const webhookSigningKey = (process.env.NANGO_WEBHOOK_SIGNING_KEY ?? "").trim();
  const integrationId = (process.env.NANGO_INTEGRATION_ID ?? "stripe").trim();
  const connectionId = (process.env.NANGO_CONNECTION_ID ?? "ash-cow").trim();
  const syncName = (process.env.NANGO_SYNC_NAME ?? "checkout-sessions").trim();
  const model = (process.env.NANGO_MODEL ?? "CheckoutSession").trim();
  return {
    apiKey,
    webhookSigningKey,
    integrationId,
    connectionId,
    syncName,
    model,
    ready: apiKey.length > 0,
    webhookReady: apiKey.length > 0 && webhookSigningKey.length > 0,
  };
}

export function getNango() {
  const cfg = nangoConfig();
  if (!cfg.ready) return null;
  return new Nango({
    apiKey: cfg.apiKey,
    webhookSigningKey: cfg.webhookSigningKey || undefined,
    host: process.env.NANGO_HOST?.trim() || undefined,
  });
}

export function headersFromRequest(request: Request) {
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });
  return headers;
}

export function saleFromNangoRecord(row: CheckoutSessionRecord): Sale | null {
  return saleFromCheckoutRecord(row);
}

export async function listNangoSales(modifiedAfter?: string): Promise<Sale[]> {
  const nango = getNango();
  const cfg = nangoConfig();
  if (!nango) return [];
  const sales: Sale[] = [];
  let cursor: string | undefined;
  for (let page = 0; page < 8; page += 1) {
    const result = await nango.listRecords<CheckoutSessionRecord>({
      providerConfigKey: cfg.integrationId,
      connectionId: cfg.connectionId,
      model: cfg.model,
      limit: 100,
      cursor,
      modifiedAfter,
    });
    for (const row of result.records) {
      const sale = saleFromNangoRecord(row);
      if (sale) sales.push(sale);
    }
    if (!result.next_cursor) break;
    cursor = result.next_cursor;
  }
  return sales;
}

export async function kickNangoCheckoutSync() {
  const nango = getNango();
  const cfg = nangoConfig();
  if (!nango) return { ok: false as const, error: "Nango is not configured." };
  try {
    await nango.startSync(cfg.integrationId, [cfg.syncName], cfg.connectionId);
  } catch {
    // Already scheduled is fine.
  }
  await nango.triggerSync(cfg.integrationId, [cfg.syncName], cfg.connectionId);
  return { ok: true as const };
}
