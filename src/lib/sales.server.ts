import { randomBytes } from "node:crypto";
import { getSql } from "@/lib/db";

export type LedgerSale = {
  id: string;
  kitId: string;
  amount: number;
  status: "paid" | "refunded";
  at: string;
  source: "stripe";
};

export type FulfilledSale = LedgerSale & { token: string };

function newToken() {
  return randomBytes(24).toString("base64url");
}

function rowToSale(row: {
  id: string;
  kit_id: string;
  amount: number;
  status: string;
  created_at: string | Date;
  token?: string;
}): FulfilledSale {
  const at =
    typeof row.created_at === "string" ? row.created_at : new Date(row.created_at).toISOString();
  return {
    id: row.id,
    kitId: row.kit_id,
    amount: Number(row.amount),
    status: row.status === "refunded" ? "refunded" : "paid",
    at,
    source: "stripe",
    token: row.token ?? "",
  };
}

export async function upsertPaidSale(input: {
  id: string;
  kitId: string;
  amount: number;
  paymentIntent?: string | null;
}): Promise<FulfilledSale> {
  const sql = await getSql();
  const token = newToken();
  const rows = await sql<{
    id: string;
    kit_id: string;
    amount: number;
    status: string;
    token: string;
    created_at: string | Date;
  }>`
    insert into sales (id, kit_id, amount, status, token, payment_intent)
    values (${input.id}, ${input.kitId}, ${input.amount}, ${"paid"}, ${token}, ${input.paymentIntent ?? null})
    on conflict (id) do update set
      kit_id = excluded.kit_id,
      amount = excluded.amount,
      payment_intent = coalesce(excluded.payment_intent, sales.payment_intent),
      status = case when sales.status = 'refunded' then sales.status else excluded.status end
    returning id, kit_id, amount, status, token, created_at
  `;
  return rowToSale(rows[0]);
}

export async function markSaleRefunded(ref: string): Promise<number> {
  const sql = await getSql();
  const rows = await sql<{ id: string }>`
    update sales
    set status = 'refunded'
    where id = ${ref} or payment_intent = ${ref}
    returning id
  `;
  return rows.length;
}

export async function listLedgerSales(kitId?: string): Promise<LedgerSale[]> {
  const sql = await getSql();
  const rows = kitId
    ? await sql<{
        id: string;
        kit_id: string;
        amount: number;
        status: string;
        created_at: string | Date;
      }>`
        select id, kit_id, amount, status, created_at
        from sales
        where kit_id = ${kitId}
        order by created_at desc
      `
    : await sql<{
        id: string;
        kit_id: string;
        amount: number;
        status: string;
        created_at: string | Date;
      }>`
        select id, kit_id, amount, status, created_at
        from sales
        order by created_at desc
      `;
  return rows.map((row) => {
    const sale = rowToSale(row);
    return {
      id: sale.id,
      kitId: sale.kitId,
      amount: sale.amount,
      status: sale.status,
      at: sale.at,
      source: "stripe" as const,
    };
  });
}

export async function saleByToken(token: string): Promise<FulfilledSale | null> {
  const sql = await getSql();
  const rows = await sql<{
    id: string;
    kit_id: string;
    amount: number;
    status: string;
    token: string;
    created_at: string | Date;
  }>`
    select id, kit_id, amount, status, token, created_at
    from sales
    where token = ${token}
    limit 1
  `;
  if (!rows[0]) return null;
  return rowToSale(rows[0]);
}
