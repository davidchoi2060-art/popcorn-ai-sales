-- Product category normalization layer.
-- Source of truth remains products.category1~4 and products.spec_raw.

CREATE TABLE IF NOT EXISTS product_category_normalized (
  product_code BIGINT PRIMARY KEY REFERENCES products(product_code) ON DELETE CASCADE,

  normalized_group VARCHAR(50) NOT NULL,
  normalized_part_type VARCHAR(50) NOT NULL,
  normalized_category_name VARCHAR(100),

  ai_candidate_yn BOOLEAN NOT NULL DEFAULT false,

  source_rule VARCHAR(200),
  confidence NUMERIC(4,2) NOT NULL DEFAULT 0.00,

  reviewed_yn BOOLEAN NOT NULL DEFAULT false,
  reviewed_by VARCHAR(100),
  reviewed_at TIMESTAMP,

  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS category_alias_rules (
  rule_id BIGSERIAL PRIMARY KEY,

  priority INTEGER NOT NULL DEFAULT 100,
  match_field VARCHAR(50) NOT NULL,
  match_type VARCHAR(30) NOT NULL DEFAULT 'regex',
  pattern TEXT NOT NULL,

  normalized_group VARCHAR(50) NOT NULL,
  normalized_part_type VARCHAR(50) NOT NULL,
  normalized_category_name VARCHAR(100),

  ai_candidate_yn BOOLEAN NOT NULL DEFAULT false,
  confidence NUMERIC(4,2) NOT NULL DEFAULT 0.90,

  active BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_normalization_review_queue (
  review_id BIGSERIAL PRIMARY KEY,

  product_code BIGINT NOT NULL REFERENCES products(product_code) ON DELETE CASCADE,

  detected_group VARCHAR(50),
  detected_part_type VARCHAR(50),
  detected_confidence NUMERIC(4,2),

  conflict_reason TEXT,
  review_status VARCHAR(30) NOT NULL DEFAULT '대기',

  assigned_to VARCHAR(100),
  reviewed_by VARCHAR(100),
  reviewed_at TIMESTAMP,

  created_at TIMESTAMP NOT NULL DEFAULT now()
);

ALTER TABLE product_specs
  ADD COLUMN IF NOT EXISTS height_mm INTEGER,
  ADD COLUMN IF NOT EXISTS capacity_gb INTEGER,
  ADD COLUMN IF NOT EXISTS gpu_chipset VARCHAR(50),
  ADD COLUMN IF NOT EXISTS vram_gb INTEGER,
  ADD COLUMN IF NOT EXISTS required_power_watt INTEGER,
  ADD COLUMN IF NOT EXISTS form_factor VARCHAR(50),
  ADD COLUMN IF NOT EXISTS interface VARCHAR(50);

CREATE INDEX IF NOT EXISTS idx_product_category_part_type
ON product_category_normalized (normalized_part_type);

CREATE INDEX IF NOT EXISTS idx_product_category_group
ON product_category_normalized (normalized_group);

CREATE INDEX IF NOT EXISTS idx_product_category_ai_candidate
ON product_category_normalized (ai_candidate_yn, normalized_part_type);

CREATE INDEX IF NOT EXISTS idx_product_category_confidence
ON product_category_normalized (confidence);

CREATE INDEX IF NOT EXISTS idx_product_review_status
ON product_normalization_review_queue (review_status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_category_alias_rules_active_priority
ON category_alias_rules (active, priority DESC);

CREATE INDEX IF NOT EXISTS idx_product_recommend_candidate
ON product_category_normalized (normalized_part_type, ai_candidate_yn)
WHERE ai_candidate_yn = true;
