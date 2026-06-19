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
