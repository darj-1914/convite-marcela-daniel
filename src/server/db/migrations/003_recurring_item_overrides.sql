CREATE TABLE IF NOT EXISTS recurring_item_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recurring_item_id TEXT NOT NULL REFERENCES recurring_items(id) ON DELETE CASCADE,
  month_ref TEXT NOT NULL,
  amount_override NUMERIC(12, 2),
  due_day_override INTEGER,
  active_override BOOLEAN,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (recurring_item_id, month_ref)
);

CREATE INDEX IF NOT EXISTS idx_recurring_item_overrides_month_ref
  ON recurring_item_overrides(month_ref);
