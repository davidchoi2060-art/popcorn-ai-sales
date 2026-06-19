-- Preserve raw product spec key/value rows from db_product_specs.csv.
-- product_specs remains the 1:1 AI calculation table.

CREATE TABLE IF NOT EXISTS product_spec_values (
  spec_value_id BIGSERIAL PRIMARY KEY,
  product_code BIGINT NOT NULL REFERENCES products(product_code) ON DELETE CASCADE,
  spec_key VARCHAR(100) NOT NULL,
  spec_value TEXT,
  is_numeric BOOLEAN NOT NULL DEFAULT false,
  num_value NUMERIC,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_spec_values_product
ON product_spec_values (product_code);

CREATE INDEX IF NOT EXISTS idx_product_spec_values_key
ON product_spec_values (spec_key);

