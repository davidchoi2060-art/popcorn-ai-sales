-- Product price values can exceed PostgreSQL INTEGER range in source CSV.

ALTER TABLE products
  ALTER COLUMN purchase_price TYPE BIGINT,
  ALTER COLUMN order_price TYPE BIGINT,
  ALTER COLUMN market_price TYPE BIGINT,
  ALTER COLUMN member_price TYPE BIGINT,
  ALTER COLUMN dealer_lv1 TYPE BIGINT,
  ALTER COLUMN dealer_lv2 TYPE BIGINT,
  ALTER COLUMN dealer_lv3 TYPE BIGINT,
  ALTER COLUMN guide_price_now TYPE BIGINT,
  ALTER COLUMN guide_price_card TYPE BIGINT,
  ALTER COLUMN ship_fee TYPE BIGINT;

ALTER TABLE product_price_history
  ALTER COLUMN purchase_price TYPE BIGINT,
  ALTER COLUMN market_price TYPE BIGINT,
  ALTER COLUMN member_price TYPE BIGINT;

ALTER TABLE recommendations
  ALTER COLUMN total_estimated_price TYPE BIGINT;

ALTER TABLE recommendation_items
  ALTER COLUMN estimated_price TYPE BIGINT;

