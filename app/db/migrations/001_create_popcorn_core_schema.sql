-- Popcorn PC AI Sales core schema
-- PostgreSQL database: popcorn_pc

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS categories (
  category_id BIGSERIAL PRIMARY KEY,
  raw_name VARCHAR(100) NOT NULL,
  normalized_name VARCHAR(100) NOT NULL,
  part_type VARCHAR(30),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE (raw_name)
);

CREATE TABLE IF NOT EXISTS products (
  product_code BIGINT PRIMARY KEY,
  unified_code BIGINT,
  model_name VARCHAR(255),
  product_name VARCHAR(500) NOT NULL,
  maker VARCHAR(100),
  category1 VARCHAR(100),
  category2 VARCHAR(100),
  category3 VARCHAR(100),
  category4 VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT '판매중',
  purchase_price INTEGER,
  order_price INTEGER,
  supplier VARCHAR(200),
  market_price INTEGER,
  member_price INTEGER,
  dealer_lv1 INTEGER,
  dealer_lv2 INTEGER,
  dealer_lv3 INTEGER,
  guide_price_now INTEGER,
  guide_price_card INTEGER,
  danawa_no VARCHAR(50),
  enuri_no VARCHAR(50),
  spec_raw TEXT,
  ship_fee INTEGER,
  free_ship VARCHAR(20),
  cert_no1 VARCHAR(100),
  cert_no2 VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT chk_products_status CHECK (status IN ('판매중', '품절', '단종', '삭제대기'))
);

CREATE TABLE IF NOT EXISTS product_specs (
  product_code BIGINT PRIMARY KEY REFERENCES products(product_code) ON DELETE CASCADE,
  part_type VARCHAR(30),
  socket VARCHAR(30),
  chipset VARCHAR(50),
  mem_type VARCHAR(10),
  tdp_watt INTEGER,
  rated_watt INTEGER,
  length_mm INTEGER,
  gpu_max_mm INTEGER,
  cooler_tdp INTEGER,
  pcie_gen VARCHAR(10),
  tag_white BOOLEAN NOT NULL DEFAULT false,
  tag_rgb BOOLEAN NOT NULL DEFAULT false,
  tag_silent BOOLEAN NOT NULL DEFAULT false,
  margin_locked BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  user_id BIGINT PRIMARY KEY,
  grade VARCHAR(20) NOT NULL DEFAULT '일반',
  guest_uid VARCHAR(50),
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT chk_users_grade CHECK (grade IN ('일반', '우수', '딜러', '게스트'))
);

CREATE TABLE IF NOT EXISTS logs (
  log_id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(user_id) ON DELETE SET NULL,
  guest_uid VARCHAR(50),
  event_type VARCHAR(30) NOT NULL,
  mode VARCHAR(10),
  prompt_raw TEXT,
  api_model VARCHAR(20),
  in_tokens INTEGER,
  out_tokens INTEGER,
  response_ms INTEGER,
  swap_from BIGINT,
  swap_to BIGINT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT chk_logs_mode CHECK (mode IS NULL OR mode IN ('beginner', 'expert'))
);

CREATE TABLE IF NOT EXISTS recommendations (
  recommendation_id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(user_id) ON DELETE SET NULL,
  guest_uid VARCHAR(50),
  mode VARCHAR(10) NOT NULL,
  raw_text TEXT,
  masked_text TEXT,
  selected_set VARCHAR(20) NOT NULL DEFAULT 'recommend',
  total_estimated_price INTEGER,
  ai_summary TEXT,
  source_models JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT chk_recommendations_mode CHECK (mode IN ('beginner', 'expert')),
  CONSTRAINT chk_recommendations_set CHECK (selected_set IN ('value', 'recommend', 'highend'))
);

CREATE TABLE IF NOT EXISTS recommendation_items (
  item_id BIGSERIAL PRIMARY KEY,
  recommendation_id BIGINT NOT NULL REFERENCES recommendations(recommendation_id) ON DELETE CASCADE,
  set_type VARCHAR(20) NOT NULL,
  part_type VARCHAR(30) NOT NULL,
  product_code BIGINT REFERENCES products(product_code) ON DELETE SET NULL,
  product_name VARCHAR(500),
  estimated_price INTEGER,
  reason TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT chk_recommendation_items_set CHECK (set_type IN ('value', 'recommend', 'highend'))
);

CREATE TABLE IF NOT EXISTS policy_weights (
  policy_id SMALLINT PRIMARY KEY DEFAULT 1,
  stock_weight INTEGER NOT NULL DEFAULT 40,
  margin_weight INTEGER NOT NULL DEFAULT 30,
  value_weight INTEGER NOT NULL DEFAULT 30,
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT chk_policy_weights_total CHECK (stock_weight + margin_weight + value_weight = 100)
);

CREATE TABLE IF NOT EXISTS category_margin_policies (
  policy_id BIGSERIAL PRIMARY KEY,
  category2 VARCHAR(100) NOT NULL,
  base_margin_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  extra_margin_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE (category2)
);

CREATE TABLE IF NOT EXISTS product_price_history (
  history_id BIGSERIAL PRIMARY KEY,
  product_code BIGINT REFERENCES products(product_code) ON DELETE CASCADE,
  purchase_price INTEGER,
  market_price INTEGER,
  member_price INTEGER,
  supplier VARCHAR(200),
  captured_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS api_cost_logs (
  cost_id BIGSERIAL PRIMARY KEY,
  cost_date DATE NOT NULL DEFAULT CURRENT_DATE,
  api_model VARCHAR(20) NOT NULL,
  in_tokens INTEGER NOT NULL DEFAULT 0,
  out_tokens INTEGER NOT NULL DEFAULT 0,
  estimated_usd NUMERIC(10,4) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rate_limit_policies (
  policy_id BIGSERIAL PRIMARY KEY,
  target_type VARCHAR(20) NOT NULL,
  target_value VARCHAR(100) NOT NULL,
  daily_limit INTEGER NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE (target_type, target_value),
  CONSTRAINT chk_rate_limit_target CHECK (target_type IN ('grade', 'ip', 'user'))
);

CREATE TABLE IF NOT EXISTS cost_thresholds (
  threshold_id SMALLINT PRIMARY KEY DEFAULT 1,
  total_daily_limit_krw INTEGER NOT NULL DEFAULT 70000,
  gemini_daily_limit_krw INTEGER NOT NULL DEFAULT 28000,
  chatgpt_daily_limit_krw INTEGER NOT NULL DEFAULT 28000,
  claude_daily_limit_krw INTEGER NOT NULL DEFAULT 28000,
  circuit_breaker_active BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS promo_click_logs (
  click_id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(user_id) ON DELETE SET NULL,
  guest_uid VARCHAR(50),
  product_code BIGINT REFERENCES products(product_code) ON DELETE SET NULL,
  source_area VARCHAR(50) NOT NULL,
  impression_id VARCHAR(100),
  clicked_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS swap_event_logs (
  swap_id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(user_id) ON DELETE SET NULL,
  guest_uid VARCHAR(50),
  mode VARCHAR(10),
  recommendation_id BIGINT REFERENCES recommendations(recommendation_id) ON DELETE SET NULL,
  part_type VARCHAR(30),
  swap_from BIGINT REFERENCES products(product_code) ON DELETE SET NULL,
  swap_to BIGINT REFERENCES products(product_code) ON DELETE SET NULL,
  reason VARCHAR(200),
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS csv_import_jobs (
  job_id BIGSERIAL PRIMARY KEY,
  file_name VARCHAR(255) NOT NULL,
  total_rows INTEGER NOT NULL DEFAULT 0,
  inserted_rows INTEGER NOT NULL DEFAULT 0,
  updated_rows INTEGER NOT NULL DEFAULT 0,
  error_rows INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  started_at TIMESTAMP NOT NULL DEFAULT now(),
  finished_at TIMESTAMP,
  CONSTRAINT chk_csv_job_status CHECK (status IN ('pending', 'running', 'completed', 'failed'))
);

CREATE TABLE IF NOT EXISTS csv_import_errors (
  error_id BIGSERIAL PRIMARY KEY,
  job_id BIGINT NOT NULL REFERENCES csv_import_jobs(job_id) ON DELETE CASCADE,
  row_no INTEGER NOT NULL,
  product_code BIGINT,
  error_code VARCHAR(50) NOT NULL,
  error_message TEXT NOT NULL,
  raw_row JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_operators (
  operator_id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(30) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT '초대중',
  memo TEXT,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT chk_admin_operator_role CHECK (role IN ('슈퍼관리자', '관리자', 'MD', '분석담당', '읽기전용')),
  CONSTRAINT chk_admin_operator_status CHECK (status IN ('활성', '비활성', '초대중'))
);

CREATE TABLE IF NOT EXISTS admin_operator_activity_logs (
  activity_id BIGSERIAL PRIMARY KEY,
  operator_id BIGINT REFERENCES admin_operators(operator_id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  detail TEXT,
  ip_masked VARCHAR(50),
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_search ON products (category2, status);
CREATE INDEX IF NOT EXISTS idx_products_admin_filter ON products (status, category2, maker);
CREATE INDEX IF NOT EXISTS idx_products_code_status ON products (product_code, status);
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING gin (product_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_specs_parttype ON product_specs (part_type) WHERE part_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_logs_composite ON logs (created_at DESC, user_id, api_model);
CREATE INDEX IF NOT EXISTS idx_logs_event ON logs (event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recommendations_created ON recommendations (created_at DESC, mode);
CREATE INDEX IF NOT EXISTS idx_recommendation_items_rec ON recommendation_items (recommendation_id, set_type);
CREATE INDEX IF NOT EXISTS idx_category_margin_category ON category_margin_policies (category2) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_price_history_product_time ON product_price_history (product_code, captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_price_history_time ON product_price_history (captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_cost_daily ON api_cost_logs (cost_date, api_model);
CREATE INDEX IF NOT EXISTS idx_rate_limit_target ON rate_limit_policies (target_type, target_value) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_promo_click_area_time ON promo_click_logs (source_area, clicked_at DESC);
CREATE INDEX IF NOT EXISTS idx_promo_click_product_time ON promo_click_logs (product_code, clicked_at DESC);
CREATE INDEX IF NOT EXISTS idx_swap_event_part_time ON swap_event_logs (part_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_swap_event_from ON swap_event_logs (swap_from, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_csv_import_errors_job ON csv_import_errors (job_id, row_no);
CREATE INDEX IF NOT EXISTS idx_admin_operator_status ON admin_operators (status, role);
CREATE INDEX IF NOT EXISTS idx_admin_activity_time ON admin_operator_activity_logs (created_at DESC, operator_id);

INSERT INTO policy_weights (policy_id, stock_weight, margin_weight, value_weight)
VALUES (1, 40, 30, 30)
ON CONFLICT (policy_id) DO NOTHING;

INSERT INTO cost_thresholds (
  threshold_id,
  total_daily_limit_krw,
  gemini_daily_limit_krw,
  chatgpt_daily_limit_krw,
  claude_daily_limit_krw
)
VALUES (1, 70000, 28000, 28000, 28000)
ON CONFLICT (threshold_id) DO NOTHING;

INSERT INTO rate_limit_policies (target_type, target_value, daily_limit)
VALUES
  ('grade', '일반', 10),
  ('grade', '우수', 30),
  ('grade', '딜러', 50)
ON CONFLICT (target_type, target_value) DO NOTHING;
