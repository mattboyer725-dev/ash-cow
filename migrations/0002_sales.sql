-- Shared stall ledger. Unowned on purpose: auth is off.
-- Do not store emails or names. Token is the download capability and is
-- never returned by list queries.

create table if not exists sales (
  id              text primary key,
  kit_id          text not null,
  amount          integer not null,
  status          text not null default 'paid',
  token           text not null unique,
  payment_intent  text,
  created_at      timestamptz not null default now()
);

create index if not exists sales_kit_id_idx on sales (kit_id);
create index if not exists sales_status_idx on sales (status);
create index if not exists sales_payment_intent_idx on sales (payment_intent);
