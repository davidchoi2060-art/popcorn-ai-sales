BEGIN;

CREATE TABLE IF NOT EXISTS sourcing_batches (
  batch_id BIGSERIAL PRIMARY KEY,
  raw_text TEXT NOT NULL,
  raw_text_masked TEXT NOT NULL,
  raw_text_hash VARCHAR(64) NOT NULL,
  parser_mode VARCHAR(20) NOT NULL DEFAULT 'mock',
  parse_status VARCHAR(30) NOT NULL DEFAULT 'parsed',
  created_by VARCHAR(200),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_sourcing_batches_parser_mode CHECK (parser_mode IN ('mock', 'real')),
  CONSTRAINT chk_sourcing_batches_parse_status CHECK (parse_status IN ('parsed', 'confirmed', 'failed'))
);

ALTER TABLE sourcing_batches
  ADD COLUMN IF NOT EXISTS raw_text TEXT;

UPDATE sourcing_batches
SET raw_text = COALESCE(raw_text, raw_text_masked, '')
WHERE raw_text IS NULL;

ALTER TABLE sourcing_batches
  ALTER COLUMN raw_text SET NOT NULL;

CREATE TABLE IF NOT EXISTS product_sourcing_quotes (
  quote_id BIGSERIAL PRIMARY KEY,
  batch_id BIGINT REFERENCES sourcing_batches(batch_id) ON DELETE SET NULL,
  product_name_raw TEXT NOT NULL,
  product_name_normalized TEXT NOT NULL,
  normalized_part_type VARCHAR(50) NOT NULL,
  requested_qty INTEGER NOT NULL,
  available_qty INTEGER,
  unit_price BIGINT,
  bundle_price BIGINT,
  bundle_qty INTEGER,
  vat_included VARCHAR(20) NOT NULL DEFAULT 'unknown',
  vendor_name VARCHAR(200),
  contact_name VARCHAR(200),
  recorded_at TIMESTAMPTZ NOT NULL,
  match_status VARCHAR(30) NOT NULL DEFAULT '매칭필요',
  matched_product_code BIGINT REFERENCES products(product_code) ON DELETE SET NULL,
  confidence NUMERIC(5, 4),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT chk_product_sourcing_vat CHECK (vat_included IN ('included', 'excluded', 'unknown')),
  CONSTRAINT chk_product_sourcing_requested_qty CHECK (requested_qty > 0),
  CONSTRAINT chk_product_sourcing_available_qty CHECK (available_qty IS NULL OR available_qty >= 0)
);

ALTER TABLE product_sourcing_quotes
  DROP CONSTRAINT IF EXISTS chk_product_sourcing_match_status;

CREATE TABLE IF NOT EXISTS product_sourcing_match_candidates (
  candidate_id BIGSERIAL PRIMARY KEY,
  quote_id BIGINT NOT NULL REFERENCES product_sourcing_quotes(quote_id) ON DELETE CASCADE,
  product_code BIGINT REFERENCES products(product_code) ON DELETE SET NULL,
  product_name VARCHAR(500) NOT NULL,
  maker VARCHAR(100),
  score NUMERIC(5, 4) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sourcing_batches_created_at
ON sourcing_batches (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_product_sourcing_quotes_recorded_at
ON product_sourcing_quotes (recorded_at DESC)
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_product_sourcing_quotes_filter
ON product_sourcing_quotes (normalized_part_type, match_status, vendor_name)
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_product_sourcing_quotes_matched_product
ON product_sourcing_quotes (matched_product_code)
WHERE matched_product_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_product_sourcing_candidates_quote
ON product_sourcing_match_candidates (quote_id, score DESC);

COMMIT;
