# Popcorn PC DB

PostgreSQL DB name: `popcorn_pc`

상품 DB는 표준 CSV v1 기준으로 관리한다. 기존 `db_products.csv`,
`db_product_specs.csv`, 통합 원본 CSV 직접 적재 방식은 폐기한다.

## 초기 스키마

```bash
createdb popcorn_pc
psql -d popcorn_pc -f app/db/migrations/001_create_popcorn_core_schema.sql
```

## 표준 상품 CSV 생성

```bash
npm.cmd run normalize:products
npm.cmd run standardize:products
```

생성 위치:

```text
app/db/standardized/products_standard_v1.csv
app/db/standardized/product_specs_standard_v1.csv
app/db/standardized/product_upload_review_v1.csv
app/db/standardized/product_upload_template_v1.csv
```

## 상품 도메인 reset 및 적재

기존 상품 데이터는 폐기된다.

```bash
npm.cmd run db:reset-products-standard-v1
```

실행 내용:

```text
1. 기존 상품 행 삭제
2. 레거시 상품 정규화 테이블 삭제
3. products 테이블을 표준 CSV v1 컬럼으로 정리
4. product_specs 재생성
5. product_upload_reviews 생성
6. standardized CSV 적재
```

DB 접속 환경변수:

```bash
PGHOST
PGPORT
PGDATABASE
PGUSER
PGPASSWORD
```
