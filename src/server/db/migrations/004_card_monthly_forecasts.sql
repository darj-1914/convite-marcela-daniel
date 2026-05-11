CREATE TABLE IF NOT EXISTS card_monthly_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id TEXT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  month_ref TEXT NOT NULL,
  variable_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (card_id, month_ref)
);

CREATE INDEX IF NOT EXISTS idx_card_monthly_forecasts_month_ref
  ON card_monthly_forecasts(month_ref);
