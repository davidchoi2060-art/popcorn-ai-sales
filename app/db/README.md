# Popcorn PC DB

PostgreSQL DB name: `popcorn_pc`

Apply the initial schema:

```bash
createdb popcorn_pc
psql -d popcorn_pc -f app/db/migrations/001_create_popcorn_core_schema.sql
```

The product seed/import step should load `app/db/db_products.csv` into `products`
and `app/db/db_product_specs.csv` into `product_specs` after column mapping is
confirmed.

Apply the raw spec key/value table and import current CSV files:

```bash
psql -d popcorn_pc -f app/db/migrations/002_create_product_spec_values.sql
psql -d popcorn_pc -f app/db/seeds/import_products.sql
```

On Ubuntu with the postgres user:

```bash
sudo -u postgres psql -d popcorn_pc -f app/db/migrations/002_create_product_spec_values.sql
sudo -u postgres psql -d popcorn_pc -f app/db/migrations/003_alter_price_columns_to_bigint.sql
sudo -u postgres psql -d popcorn_pc -f app/db/seeds/import_products.sql
```
