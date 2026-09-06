import { Nango } from "@nangohq/node";
import { CHECKOUT_SESSIONS_SYNC, STRIPE_SYNC_CATALOG } from "./nango-config";
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

export { CHECKOUT_SESSIONS_SYNC, STRIPE_SYNC_CATALOG } from "./nango-config";

export function nangoConfig() {
  const apiKey = (process.env.NANGO_API_KEY ?? process.env.NANGO_SECRET_KEY ?? "").trim();
  const webhookSigningKey = (process.env.NANGO_WEBHOOK_SIGNING_KEY ?? "").trim();
  const integrationId = (process.env.NANGO_INTEGRATION_ID ?? "stripe").trim();
  const connectionId = (process.env.NANGO_CONNECTION_ID ?? "ash-cow").trim();
  const syncName = (process.env.NANGO_SYNC_NAME ?? CHECKOUT_SESSIONS_SYNC.name).trim();
  const model = (process.env.NANGO_MODEL ?? CHECKOUT_SESSIONS_SYNC.model).trim();
  const frequency = (process.env.NANGO_SYNC_FREQUENCY ?? CHECKOUT_SESSIONS_SYNC.frequency).trim();
  return {
    apiKey,
    webhookSigningKey,
    integrationId,
    connectionId,
    syncName,
    model,
    frequency,
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
  if (cfg.frequency) {
    try {
      await nango.updateSyncConnectionFrequency(
        cfg.integrationId,
        cfg.syncName,
        cfg.connectionId,
        cfg.frequency,
      );
    } catch {
      // Invalid frequency or missing connection — keep the template default.
    }
  }
  await nango.triggerSync(cfg.integrationId, [cfg.syncName], cfg.connectionId);
  return { ok: true as const };
}

export type NangoSyncRow = {
  name: string;
  status: string;
  frequency: string;
  finishedAt?: string;
  nextScheduledSyncAt?: string;
  records: number;
};

export async function inspectNangoSyncs() {
  const cfg = nangoConfig();
  const expected = {
    integrationId: cfg.integrationId,
    connectionId: cfg.connectionId,
    syncName: cfg.syncName,
    model: cfg.model,
    frequency: cfg.frequency,
    autoStart: CHECKOUT_SESSIONS_SYNC.autoStart,
    endpoint: CHECKOUT_SESSIONS_SYNC.endpoint,
    catalog: STRIPE_SYNC_CATALOG.map((row) => row.name),
  };
  if (!cfg.ready) {
    return { ok: false as const, error: "Nango is not configured.", expected, functions: [] as string[], syncs: [] as NangoSyncRow[] };
  }
  const nango = getNango();
  if (!nango) {
    return { ok: false as const, error: "Nango is not configured.", expected, functions: [] as string[], syncs: [] as NangoSyncRow[] };
  }

  let functions: string[] = [];
  try {
    const listed = await nango.listFunctions({ uniqueKey: cfg.integrationId }, { type: "sync", limit: 50 });
    const rows = Array.isArray(listed) ? listed : ((listed as { data?: { name: string }[] }).data ?? []);
    functions = rows.map((row) => row.name);
  } catch {
    functions = [];
  }

  let syncs: NangoSyncRow[] = [];
  try {
    const status = await nango.syncStatus(cfg.integrationId, "*", cfg.connectionId);
    syncs = status.syncs.map((row) => ({
      name: row.name,
      status: row.status,
      frequency: row.frequency,
      finishedAt: row.finishedAt,
      nextScheduledSyncAt: row.nextScheduledSyncAt,
      records: Object.values(row.recordCount ?? {}).reduce((sum, n) => sum + n, 0),
    }));
  } catch {
    syncs = [];
  }

  return { ok: true as const, expected, functions, syncs };
}
