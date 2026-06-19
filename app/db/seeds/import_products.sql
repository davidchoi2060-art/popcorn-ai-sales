-- Import Popcorn PC product CSV files.
-- Run from repository root:
--   sudo -u postgres psql -d popcorn_pc -f app/db/seeds/import_products.sql

\set ON_ERROR_STOP on

BEGIN;

CREATE TEMP TABLE raw_products (
  product_id TEXT,
  custom_product_code TEXT,
  product_name TEXT,
  manufacturer TEXT,
  category_l1 TEXT,
  category_l2 TEXT,
  category_l3 TEXT,
  price_cost TEXT,
  price_selling TEXT,
  status TEXT
);

\copy raw_products FROM 'app/db/db_products.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');

WITH normalized_products AS (
  SELECT DISTINCT ON (product_code)
    product_code,
    unified_code,
    product_name,
    maker,
    category1,
    category2,
    category3,
    status,
    purchase_price,
    member_price
  FROM (
    SELECT
      NULLIF(regexp_replace(COALESCE(custom_product_code, ''), '[^0-9]', '', 'g'), '')::BIGINT AS product_code,
      NULLIF(regexp_replace(COALESCE(product_id, ''), '[^0-9]', '', 'g'), '')::BIGINT AS unified_code,
      NULLIF(product_name, '') AS product_name,
      NULLIF(manufacturer, '') AS maker,
      NULLIF(category_l1, '') AS category1,
      NULLIF(category_l2, '') AS category2,
      NULLIF(category_l3, '') AS category3,
      CASE
        WHEN status IN ('판매중', '품절', '단종', '삭제대기') THEN status
        ELSE '판매중'
      END AS status,
      NULLIF(regexp_replace(COALESCE(price_cost, ''), '[^0-9-]', '', 'g'), '')::BIGINT AS purchase_price,
      NULLIF(regexp_replace(COALESCE(price_selling, ''), '[^0-9-]', '', 'g'), '')::BIGINT AS member_price
    FROM raw_products
  ) p
  WHERE product_code IS NOT NULL
  ORDER BY product_code, unified_code DESC NULLS LAST
)
INSERT INTO products (
  product_code,
  unified_code,
  product_name,
  maker,
  category1,
  category2,
  category3,
  status,
  purchase_price,
  member_price,
  created_at,
  updated_at
)
SELECT
  product_code,
  unified_code,
  product_name,
  maker,
  category1,
  category2,
  category3,
  status,
  purchase_price,
  member_price,
  now(),
  now()
FROM normalized_products
ON CONFLICT (product_code) DO UPDATE SET
  unified_code = EXCLUDED.unified_code,
  product_name = EXCLUDED.product_name,
  maker = EXCLUDED.maker,
  category1 = EXCLUDED.category1,
  category2 = EXCLUDED.category2,
  category3 = EXCLUDED.category3,
  status = EXCLUDED.status,
  purchase_price = EXCLUDED.purchase_price,
  member_price = EXCLUDED.member_price,
  updated_at = now();

INSERT INTO product_specs (product_code, part_type, updated_at)
SELECT
  p.product_code,
  CASE
    WHEN p.category2 ILIKE '%CPU%' THEN 'CPU'
    WHEN p.category2 ILIKE '%그래픽%' OR p.category2 ILIKE '%VGA%' THEN 'GPU'
    WHEN p.category2 ILIKE '%메모리%' OR p.category2 ILIKE '%RAM%' THEN 'RAM'
    WHEN p.category2 ILIKE '%SSD%' OR p.category2 ILIKE '%HDD%' OR p.category2 ILIKE '%저장%' THEN 'SSD'
    WHEN p.category2 ILIKE '%메인보드%' THEN 'MB'
    WHEN p.category2 ILIKE '%파워%' THEN 'POWER'
    WHEN p.category2 ILIKE '%쿨러%' THEN 'COOLER'
    WHEN p.category2 ILIKE '%케이스%' THEN 'CASE'
    ELSE NULL
  END AS part_type,
  now()
FROM products p
WHERE EXISTS (
  SELECT 1
  FROM raw_products rp
  WHERE NULLIF(regexp_replace(COALESCE(rp.custom_product_code, ''), '[^0-9]', '', 'g'), '')::BIGINT = p.product_code
)
ON CONFLICT (product_code) DO UPDATE SET
  part_type = COALESCE(product_specs.part_type, EXCLUDED.part_type),
  updated_at = now();

CREATE TEMP TABLE raw_product_specs (
  product_id TEXT,
  spec_key TEXT,
  spec_value TEXT,
  is_numeric TEXT,
  num_value TEXT
);

\copy raw_product_specs FROM 'app/db/db_product_specs.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');

TRUNCATE product_spec_values;

INSERT INTO product_spec_values (
  product_code,
  spec_key,
  spec_value,
  is_numeric,
  num_value
)
SELECT
  NULLIF(regexp_replace(COALESCE(rp.custom_product_code, ''), '[^0-9]', '', 'g'), '')::BIGINT AS product_code,
  NULLIF(rps.spec_key, '') AS spec_key,
  NULLIF(rps.spec_value, '') AS spec_value,
  lower(COALESCE(rps.is_numeric, 'false')) IN ('true', 't', '1', 'yes') AS is_numeric,
  NULLIF(regexp_replace(COALESCE(rps.num_value, ''), '[^0-9.-]', '', 'g'), '')::NUMERIC AS num_value
FROM raw_product_specs rps
JOIN raw_products rp ON rp.product_id = rps.product_id
JOIN products p ON p.product_code = NULLIF(regexp_replace(COALESCE(rp.custom_product_code, ''), '[^0-9]', '', 'g'), '')::BIGINT
WHERE NULLIF(regexp_replace(COALESCE(rp.custom_product_code, ''), '[^0-9]', '', 'g'), '') IS NOT NULL
  AND NULLIF(rps.spec_key, '') IS NOT NULL;

UPDATE products p
SET spec_raw = s.spec_text,
    updated_at = now()
FROM (
  SELECT
    product_code,
    string_agg(spec_key || ': ' || COALESCE(spec_value, ''), E'\n' ORDER BY spec_value_id) AS spec_text
  FROM product_spec_values
  GROUP BY product_code
) s
WHERE s.product_code = p.product_code;

COMMIT;

SELECT 'products' AS table_name, count(*) AS rows FROM products
UNION ALL
SELECT 'product_specs', count(*) FROM product_specs
UNION ALL
SELECT 'product_spec_values', count(*) FROM product_spec_values;
