CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS recurring_item_payment_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recurring_item_id TEXT NOT NULL REFERENCES recurring_items(id) ON DELETE CASCADE,
  month_ref TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('paid', 'unpaid')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (recurring_item_id, month_ref)
);

CREATE INDEX IF NOT EXISTS idx_recurring_item_payment_statuses_month_ref
  ON recurring_item_payment_statuses(month_ref);
