-- Destructive product-domain reset for standard product CSV v1.
-- Existing product rows and legacy product-normalization tables are intentionally discarded.

BEGIN;

DROP TABLE IF EXISTS product_upload_reviews CASCADE;
DROP TABLE IF EXISTS product_normalization_review_queue CASCADE;
DROP TABLE IF EXISTS product_category_normalized CASCADE;
DROP TABLE IF EXISTS category_alias_rules CASCADE;
DROP TABLE IF EXISTS product_spec_values CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

TRUNCATE TABLE
  recommendation_items,
  product_price_history,
  promo_click_logs,
  swap_event_logs,
  products
CASCADE;

DROP TABLE IF EXISTS product_specs CASCADE;

ALTER TABLE products
  DROP COLUMN IF EXISTS unified_code,
  DROP COLUMN IF EXISTS category1,
  DROP COLUMN IF EXISTS category2,
  DROP COLUMN IF EXISTS category3,
  DROP COLUMN IF EXISTS category4,
  DROP COLUMN IF EXISTS order_price,
  DROP COLUMN IF EXISTS member_price,
  DROP COLUMN IF EXISTS dealer_lv1,
  DROP COLUMN IF EXISTS dealer_lv2,
  DROP COLUMN IF EXISTS dealer_lv3,
  DROP COLUMN IF EXISTS guide_price_now,
  DROP COLUMN IF EXISTS guide_price_card,
  DROP COLUMN IF EXISTS danawa_no,
  DROP COLUMN IF EXISTS enuri_no,
  DROP COLUMN IF EXISTS spec_raw,
  DROP COLUMN IF EXISTS ship_fee,
  DROP COLUMN IF EXISTS free_ship,
  DROP COLUMN IF EXISTS cert_no1,
  DROP COLUMN IF EXISTS cert_no2;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS brand VARCHAR(100),
  ADD COLUMN IF NOT EXISTS part_type VARCHAR(50) NOT NULL DEFAULT 'UNKNOWN',
  ADD COLUMN IF NOT EXISTS category_group VARCHAR(50) NOT NULL DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS ai_candidate_yn BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sale_price BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS warranty_months INTEGER,
  ADD COLUMN IF NOT EXISTS spec_source_text TEXT,
  ADD COLUMN IF NOT EXISTS review_required_yn BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS review_reason TEXT;

ALTER TABLE products
  ALTER COLUMN purchase_price TYPE BIGINT,
  ALTER COLUMN market_price TYPE BIGINT;

CREATE TABLE product_specs (
  product_code BIGINT PRIMARY KEY REFERENCES products(product_code) ON DELETE CASCADE,
  part_type VARCHAR(50) NOT NULL,
  socket VARCHAR(30),
  chipset VARCHAR(50),
  mem_type VARCHAR(10),
  capacity_gb INTEGER,
  clock_mhz INTEGER,
  tdp_watt INTEGER,
  rated_watt INTEGER,
  required_power_watt INTEGER,
  length_mm INTEGER,
  gpu_max_mm INTEGER,
  cooler_height_mm INTEGER,
  cooler_tdp INTEGER,
  pcie_gen VARCHAR(20),
  form_factor VARCHAR(50),
  interface VARCHAR(50),
  tag_white BOOLEAN NOT NULL DEFAULT false,
  tag_rgb BOOLEAN NOT NULL DEFAULT false,
  tag_silent BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE product_upload_reviews (
  review_id BIGSERIAL PRIMARY KEY,
  row_no INTEGER,
  product_code BIGINT,
  product_name VARCHAR(500),
  error_type VARCHAR(50) NOT NULL,
  error_message TEXT,
  raw_category1 VARCHAR(100),
  raw_category2 VARCHAR(100),
  raw_category3 VARCHAR(100),
  raw_spec TEXT,
  review_status VARCHAR(30) NOT NULL DEFAULT '대기',
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_standard_filter
ON products (status, category_group, part_type, maker);

CREATE INDEX IF NOT EXISTS idx_products_ai_candidate
ON products (ai_candidate_yn, part_type)
WHERE ai_candidate_yn = true;

CREATE INDEX IF NOT EXISTS idx_products_name_trgm
ON products USING gin (product_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_specs_parttype
ON product_specs (part_type);

CREATE INDEX IF NOT EXISTS idx_product_upload_reviews_status
ON product_upload_reviews (review_status, created_at DESC);

COMMIT;
