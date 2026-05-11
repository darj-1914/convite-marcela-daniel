CREATE TABLE IF NOT EXISTS card_installment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id TEXT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Cartao Parcelado',
  total_amount NUMERIC(12, 2) NOT NULL,
  installment_amount NUMERIC(12, 2) NOT NULL,
  total_installments INTEGER NOT NULL,
  start_month TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_card_installment_plans_card_id
  ON card_installment_plans(card_id);
