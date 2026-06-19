# 06. DB 설계 (ERD & 스키마)

**파일 경로:** `_docs/06_db-erd.md`
**문서 버전:** Ver 1.0
**DBMS:** PostgreSQL (DB명 `popcorn_pc`)
**선행 문서:** `00_glossary.md`, 상품 CSV(`00.상품다운.csv`)

## 1. 설계 원칙

원본 CSV는 쇼핑몰 운영용 컬럼이 많아 그대로 쓰면 추천 연산에 비효율적이다. 따라서 두 층으로 나눈다. 첫째, **원본 보존층**(`products`)은 CSV 컬럼을 최대한 손실 없이 받아 Upsert의 기준(자체상품코드 PK)으로 삼는다. 둘째, **AI 연산층**(`product_specs`)은 추천·호환성 연산에 필요한 정형 필드(소켓·전력 W·치수 mm·감성 태그)를 분리해, 비정형 `스펙` 문자열에서 추출·정제한 값을 담는다. 이렇게 하면 CSV 재업로드 시 원본은 덮어쓰되 연산 필드는 관리자가 보강한 값을 보존할 수 있다.

## 2. ERD 개요



## 3. 핵심 테이블 — products (CSV 매핑)

CSV 컬럼을 1:1로 매핑한다. PK는 `자체상품코드`다.

| 컬럼명 | 타입 | CSV 원본 | 비고 |
|--------|------|---------|------|
| product_code | BIGINT PK | 자체상품코드 | Upsert 기준 |
| unified_code | BIGINT | 통합상품코드 | |
| model_name | VARCHAR(255) | 모델명 | |
| product_name | VARCHAR(500) | 상품명 | |
| maker | VARCHAR(100) | 제조사 | |
| category1 | VARCHAR(100) | 카테고리1 | 대분류 |
| category2 | VARCHAR(100) | 카테고리2 | 중분류(추천 핵심) |
| category3 | VARCHAR(100) | 카테고리3 | |
| category4 | VARCHAR(100) | 카테고리4 | |
| status | VARCHAR(20) | 상태값 | 판매중/품절/단종/삭제대기 |
| purchase_price | INTEGER | 매입가 | |
| order_price | INTEGER | 발주가 | |
| supplier | VARCHAR(200) | 공급처 | |
| market_price | INTEGER | 시중가 | |
| member_price | INTEGER | 일반회원 | 표시가 |
| dealer_lv1~3 | INTEGER | 딜러Lv1~3 | |
| guide_price_now | INTEGER | 지도가현 | |
| guide_price_card | INTEGER | 지도가카 | |
| danawa_no | VARCHAR(50) | 다나와No | |
| enuri_no | VARCHAR(50) | 에누리No | |
| spec_raw | TEXT | 스펙 | 비정형 원문(연산 추출 원천) |
| ship_fee | INTEGER | 택배비 | |
| free_ship | VARCHAR(20) | 무료여부 | |
| cert_no1 | VARCHAR(100) | 인증코드번호1 | |
| cert_no2 | VARCHAR(100) | 인증코드번호2 | |
| created_at | TIMESTAMP | (자동) | |
| updated_at | TIMESTAMP | (자동) | Upsert 시 갱신 |

CSV에서 관찰된 카테고리 표기 혼선(`삭제대기`, `그래픽카드ㅇㅇㅇ`, `ㄴ` 등 비정상 분류)은 정제 단계에서 `categories` 매핑 테이블로 표준화한다. 또한 동일 상품코드(예: 100111)가 중복 적재된 행이 있으므로, Upsert 시 PK 중복은 마지막 값으로 덮어쓰되 중복 건은 로그로 분리한다.

## 4. AI 연산층 — product_specs (1:1)

비정형 `spec_raw`에서 추출하거나 관리자가 직접 입력하는 정형 필드다. 추천·호환성·물리 시뮬레이션의 입력이 된다.

| 컬럼명 | 타입 | 의미 | 출처 |
|--------|------|------|------|
| product_code | BIGINT PK FK | products 참조 | |
| part_type | VARCHAR(30) | CPU/GPU/RAM/SSD/MB/POWER/COOLER/CASE | category 정제 |
| socket | VARCHAR(30) | 소켓 규격(AM5, LGA1700 등) | 호환성 |
| chipset | VARCHAR(50) | 칩셋(B650, Z790 등) | 호환성 |
| mem_type | VARCHAR(10) | DDR4/DDR5 | 호환성 |
| tdp_watt | INTEGER | 소비/설계 전력(W) | 전력 마진 |
| rated_watt | INTEGER | (파워) 정격 출력 W | 전력 마진 |
| length_mm | INTEGER | (GPU) 가로 길이 mm | 물리 충돌 |
| gpu_max_mm | INTEGER | (케이스) GPU 장착 한계 mm | 물리 충돌 |
| cooler_tdp | INTEGER | (쿨러) 해소 가능 TDP | 쿨링 마진 |
| pcie_gen | VARCHAR(10) | (SSD) PCIe 4.0/5.0 | 규격 |
| tag_white | BOOLEAN | #화이트감성 | 감성 매칭 |
| tag_rgb | BOOLEAN | #화려한LED | 감성 매칭 |
| tag_silent | BOOLEAN | #저소음 | 감성 매칭 |
| margin_locked | BOOLEAN | 관리자 보강값 보존 여부 | Upsert 보호 |

`margin_locked = true`인 행은 CSV 재업로드 시 연산 필드를 덮어쓰지 않아, 관리자가 손으로 채운 소켓·전력·치수 값이 유지된다.

## 5. 사용자·로그 테이블

### 5.1 users
회원 정보는 기존 쇼핑몰과 SSO 공유하므로, 본 DB에는 추천 서비스에 필요한 최소 정보만 둔다.

| 컬럼 | 타입 | 의미 |
|------|------|------|
| user_id | BIGINT PK | 쇼핑몰 회원번호(SSO 매핑) |
| grade | VARCHAR(20) | 일반/우수/딜러 |
| guest_uid | VARCHAR(50) | 비회원 임시 UID |
| created_at | TIMESTAMP | |

### 5.2 logs (유저 저니·프롬프트·AI응답)
명세서 요구대로 대량 적재되며 복합 인덱스로 고속 조회한다.

| 컬럼 | 타입 | 의미 |
|------|------|------|
| log_id | BIGSERIAL PK | |
| user_id | BIGINT FK | 회원/게스트 |
| event_type | VARCHAR(30) | 진입/입력완료/추천요청/클릭/스왑제외/장바구니/결제 |
| mode | VARCHAR(10) | beginner/expert |
| prompt_raw | TEXT | PII 마스킹 후 원시 프롬프트 |
| api_model | VARCHAR(20) | gemini/chatgpt/claude |
| in_tokens | INTEGER | 인바운드 토큰 |
| out_tokens | INTEGER | 아웃바운드 토큰 |
| response_ms | INTEGER | 응답 시간 |
| swap_from / swap_to | BIGINT | 스왑 제외/대체 부품코드 |
| created_at | TIMESTAMP | |

## 6. 정책·추천·비용·마케팅 테이블

### 6.0 recommendations / recommendation_items

추천 요청과 확정된 견적 세트를 저장한다. `POST /api/recommend` 응답, 결과 화면, 스왑 이력의 기준 ID로 사용한다.

| 테이블 | 주요 컬럼 | 의미 |
|--------|-----------|------|
| recommendations | recommendation_id, user_id, guest_uid, mode, raw_text, masked_text, selected_set, total_estimated_price, ai_summary, source_models, created_at | 추천 요청 1건의 헤더 |
| recommendation_items | item_id, recommendation_id, set_type, part_type, product_code, product_name, estimated_price, reason, sort_order | value/recommend/highend 세트별 부품 목록 |

`source_models`는 Gemini, ChatGPT, Claude 중 정상 응답한 모델과 Drop 사유를 JSONB로 보존한다.

### 6.1 policy_weights

추천 엔진의 전역 가중치를 저장한다. `adm-recommend-weights` 화면과 연동된다.

| 컬럼 | 타입 | 의미 |
|------|------|------|
| policy_id | SMALLINT PK | 단일 정책 행 |
| stock_weight | INTEGER | 재고소진 비중 |
| margin_weight | INTEGER | 마진극대 비중 |
| value_weight | INTEGER | 가성비 비중 |
| updated_at | TIMESTAMP | 수정일 |

`stock_weight + margin_weight + value_weight = 100` 조건을 Validation으로 강제한다.

### 6.2 category_margin_policies

카테고리별 마진 정책을 저장한다. `adm-price-policy` 화면과 연동된다.

| 컬럼 | 타입 | 의미 |
|------|------|------|
| policy_id | BIGSERIAL PK | |
| category2 | VARCHAR(100) | 중분류 카테고리 |
| base_margin_rate | NUMERIC(5,2) | 기본 마진율 |
| extra_margin_rate | NUMERIC(5,2) | 추가 가산 마진율 |
| active | BOOLEAN | 적용 여부 |
| updated_at | TIMESTAMP | 수정일 |

### 6.3 product_price_history

공급처 단가 변동과 시장 가격동향을 추적한다. `adm-dashboard`, `adm-price-policy`의 가격동향 차트에 사용한다.

| 컬럼 | 타입 | 의미 |
|------|------|------|
| history_id | BIGSERIAL PK | |
| product_code | BIGINT FK | products 참조 |
| purchase_price | INTEGER | 매입가 |
| market_price | INTEGER | 시중가 |
| member_price | INTEGER | 일반회원 판매가 |
| supplier | VARCHAR(200) | 공급처 |
| captured_at | TIMESTAMP | 수집/업로드 시각 |

CSV 업서트 시 가격 관련 필드가 변경되면 기존 값과 비교하여 이력 행을 적재한다.

### 6.4 api_cost_logs

3사 LLM 비용 집계 테이블이다. V3.0에서는 `adm-dashboard`의 미니 위젯과 `adm-system-limit` 화면에서 참조한다.

| 컬럼 | 타입 | 의미 |
|------|------|------|
| cost_id | BIGSERIAL PK | |
| cost_date | DATE | 비용 집계일 |
| api_model | VARCHAR(20) | gemini/chatgpt/claude |
| in_tokens | INTEGER | 인바운드 토큰 |
| out_tokens | INTEGER | 아웃바운드 토큰 |
| estimated_usd | NUMERIC(10,4) | 예상 비용 |
| created_at | TIMESTAMP | |

### 6.5 promo_click_logs

특가상품, 이벤트 배너, 추천 부품 상세 조회의 CTR 분석에 사용한다.

| 컬럼 | 타입 | 의미 |
|------|------|------|
| click_id | BIGSERIAL PK | |
| user_id | BIGINT | 회원 또는 게스트 식별자 |
| product_code | BIGINT | 클릭된 상품코드 |
| source_area | VARCHAR(50) | special_event, recommendation, detail, banner 등 |
| impression_id | VARCHAR(100) | 노출 세션 식별자 |
| clicked_at | TIMESTAMP | 클릭 시각 |

CTR 계산은 노출 로그 대비 클릭 로그를 기준으로 한다. 노출 로그가 별도 테이블로 분리되지 않은 초기 단계에서는 `logs.event_type = 'impression'`과 결합한다.

### 6.6 swap_event_logs

AI 추천 부품 중 사용자가 제외하거나 대체한 이력을 저장한다. `adm-click-report`의 최다 탈락 부품 TOP 10 분석에 사용한다.

| 컬럼 | 타입 | 의미 |
|------|------|------|
| swap_id | BIGSERIAL PK | |
| user_id | BIGINT | 회원 또는 게스트 |
| mode | VARCHAR(10) | beginner/expert |
| recommendation_id | BIGINT | 추천 견적 ID |
| part_type | VARCHAR(30) | CPU/GPU/RAM 등 |
| swap_from | BIGINT | 제외된 상품코드 |
| swap_to | BIGINT | 대체된 상품코드 |
| reason | VARCHAR(200) | 가격, 성능, 감성, 호환성 등 |
| created_at | TIMESTAMP | |

### 6.7 rate_limit_policies / cost_thresholds

`adm-system-limit` 화면의 Rate Limit, 비용 임계치, Circuit Breaker 상태를 저장한다.

| 테이블 | 주요 컬럼 | 의미 |
|--------|-----------|------|
| rate_limit_policies | policy_id, target_type, target_value, daily_limit, active, updated_at | 회원등급/IP/사용자별 일일 추천 요청 제한 |
| cost_thresholds | threshold_id, total_daily_limit_krw, gemini_daily_limit_krw, chatgpt_daily_limit_krw, claude_daily_limit_krw, circuit_breaker_active, updated_at | 3사 AI 비용 임계치와 전체 차단 상태 |

초기 개발 단계의 카운터는 인메모리로 유지하되, 정책값은 DB에서 읽는다.

### 6.8 csv_import_jobs / csv_import_errors

`adm-csv-import` 화면의 업로드 실행 이력과 오류 행 리포트를 저장한다.

| 테이블 | 주요 컬럼 | 의미 |
|--------|-----------|------|
| csv_import_jobs | job_id, file_name, total_rows, inserted_rows, updated_rows, error_rows, status, started_at, finished_at | CSV 업서트 실행 단위 |
| csv_import_errors | error_id, job_id, row_no, product_code, error_code, error_message, raw_row, created_at | 오류 행 상세 |

### 6.9 admin_operators / admin_operator_activity_logs

`adm-operators` 화면의 운영자 초대, 역할 변경, 활성/비활성 처리, 활동 로그를 저장한다.

| 테이블 | 주요 컬럼 | 의미 |
|--------|-----------|------|
| admin_operators | operator_id, name, email, role, status, memo, last_login_at, created_at, updated_at | 관리자 계정과 권한 |
| admin_operator_activity_logs | activity_id, operator_id, action, detail, ip_masked, created_at | 운영자 활동 로그 |

역할은 `슈퍼관리자`, `관리자`, `MD`, `분석담당`, `읽기전용`을 기준으로 한다. 상태는 `활성`, `비활성`, `초대중`을 사용한다.

## 7. 복합 인덱스 설계 (성능 강제)

명세서 NFR-ADM-010이 요구한 대로, 대량 로그·상품 조회 성능을 위해 복합 인덱스를 강제한다.

```sql
-- logs: 10만건+ 조건 검색 0.5초 이내 (created_at, user_id, api_model)
CREATE INDEX idx_logs_composite ON logs (created_at DESC, user_id, api_model);
CREATE INDEX idx_logs_event ON logs (event_type, created_at DESC);

-- products: 카테고리+상태+키워드 검색 0.3초 이내 (master.html)
CREATE INDEX idx_products_search ON products (category2, status);
CREATE INDEX idx_products_name_trgm ON products USING gin (product_name gin_trgm_ops); -- 키워드 LIKE

-- 추천 엔진: 판매중 상품 빠른 매칭
CREATE INDEX idx_specs_parttype ON product_specs (part_type) WHERE part_type IS NOT NULL;

-- 비용 집계
CREATE INDEX idx_cost_daily ON api_cost_logs (cost_date, api_model);

-- 추천 결과 조회
CREATE INDEX idx_recommendations_created ON recommendations (created_at DESC, mode);
CREATE INDEX idx_recommendation_items_rec ON recommendation_items (recommendation_id, set_type);

-- 시스템 제어
CREATE INDEX idx_rate_limit_target ON rate_limit_policies (target_type, target_value) WHERE active = true;

-- CSV/운영자 관리
CREATE INDEX idx_csv_import_errors_job ON csv_import_errors (job_id, row_no);
CREATE INDEX idx_admin_operator_status ON admin_operators (status, role);
CREATE INDEX idx_admin_activity_time ON admin_operator_activity_logs (created_at DESC, operator_id);
```

키워드 검색(예: "RTX")은 `pg_trgm` 확장의 GIN 인덱스로 부분 일치를 고속 처리한다.

-- V3.0 관리자 상품 마스터 검색
CREATE INDEX idx_products_admin_filter 
ON products (status, category2, maker);

CREATE INDEX idx_products_code_status 
ON products (product_code, status);

-- 가격동향 조회
CREATE INDEX idx_price_history_product_time 
ON product_price_history (product_code, captured_at DESC);

CREATE INDEX idx_price_history_time 
ON product_price_history (captured_at DESC);

-- 특가/추천 CTR 분석
CREATE INDEX idx_promo_click_area_time 
ON promo_click_logs (source_area, clicked_at DESC);

CREATE INDEX idx_promo_click_product_time 
ON promo_click_logs (product_code, clicked_at DESC);

-- 스왑/탈락 부품 리포트
CREATE INDEX idx_swap_event_part_time 
ON swap_event_logs (part_type, created_at DESC);

CREATE INDEX idx_swap_event_from 
ON swap_event_logs (swap_from, created_at DESC);

-- 추천 가중치 정책 조회
CREATE INDEX idx_category_margin_category 
ON category_margin_policies (category2) WHERE active = true;


## 8. 품절·단종 실시간 반영

V3.0 관리자 구조에서 품절·단종 처리는 AI 비용 관리보다 높은 우선순위를 가진다. `adm-product-master`에서 운영자가 상품 상태를 `품절` 또는 `단종`으로 변경하면, 해당 상품은 1초 이내에 다음 영역에서 전역 제외되어야 한다.

1. 초급자 추천 후보군
2. 고급자 추천 후보군
3. 부품 스왑 안전 대안 목록
4. 업셀링/다운셀링 후보 목록
5. 특가 추천 후보 목록

이를 위해 추천·스왑·업셀링 쿼리는 항상 다음 조건을 포함해야 한다.

```sql
WHERE products.status = '판매중'

상태 변경 API는 다음과 같이 동작한다.

CopyPUT /api/admin/products/:code/status

처리 순서:

products.status 업데이트
updated_at 갱신
추천 후보 캐시 무효화
스왑 대안 캐시 무효화
관리자 화면에 성공 응답 반환
사용자 추천 요청부터 즉시 변경 상태 반영
초기 개발 단계에서는 PostgreSQL 조건 쿼리와 서버 인메모리 캐시 무효화로 구현하고, 운영 트래픽 증가 시 Redis Pub/Sub 또는 캐시 태그 무효화 방식으로 확장한다.


## 9. 마이그레이션·시드 정책

테이블 생성 SQL은 `app/db/migrations/`에 순번을 붙여 관리한다(`001_create_products.sql` 등). 초기 시드는 `_mock/products-seed.csv`(업로드 CSV 정제본)를 `app/db/seeds/`로 적재한다. 개발 초기에는 Redis 없이 PostgreSQL + 인메모리 카운터로 단순화하고, 트래픽 증가 시 `rate_limits`·캐시 무효화를 Redis로 이관한다(8단계 아키텍처에서 상세화).


---

## 9. 마이그레이션·시드 정책 수정

기존 섹션 하단에 추가합니다.

```md
V3.0 관리자 기능 추가에 따라 다음 마이그레이션을 추가한다.

| 파일 | 목적 |
|------|------|
| `010_create_category_margin_policies.sql` | 카테고리별 마진 정책 |
| `011_create_product_price_history.sql` | 상품 가격동향 이력 |
| `012_create_promo_click_logs.sql` | 특가/추천 CTR 클릭 로그 |
| `013_create_swap_event_logs.sql` | 부품 스왑·탈락 이벤트 로그 |
| `014_update_policy_weights_v3.sql` | 재고소진/마진극대/가성비 가중치 100% 제약 |
| `015_create_recommendations.sql` | 추천 결과 헤더와 부품 목록 |
| `016_create_system_controls.sql` | Rate Limit 정책과 비용 임계치 |
| `017_create_csv_import_logs.sql` | CSV 업서트 작업과 오류 행 |
| `018_create_admin_operators.sql` | 운영자 계정·권한·활동 로그 |

현재 개발본에는 초기 구축 편의를 위해 위 항목을 통합한 `app/db/migrations/001_create_popcorn_core_schema.sql`을 제공한다. 운영 전환 시에는 도메인별 파일로 분리해도 된다.

CSV 업서트 시 가격 변동이 감지되면 `product_price_history`에 이력을 남긴다. 단순 텍스트 필드 변경만 있고 가격 변동이 없는 경우 가격 이력은 적재하지 않는다.


---


