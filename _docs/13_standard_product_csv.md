# 13. 표준 상품 CSV v1 설계

## 1. 목적

`팝콘PC_상품_2026-06-10기준(통합).csv`는 쇼핑몰 운영, 장부, 공급처, 카테고리, 스펙 문자열이 한 파일에 섞여 있어 AI 추천용 상품 DB의 기준 원천으로 쓰기 어렵다.

앞으로 운영자는 아래 표준 CSV를 기준으로 상품을 대량 등록·수정한다.

```text
products_standard_v1.csv
product_specs_standard_v1.csv
```

기존 통합 CSV는 레거시 원천 샘플로만 사용하고, 새 상품 DB는 표준 CSV 기준으로 설계한다.

---

## 2. products_standard_v1.csv

상품의 기본 운영 정보와 AI 추천 후보 여부를 저장한다.

| 필드 | 필수 | 설명 |
|---|---:|---|
| `product_code` | Y | 팝콘PC 내부 상품코드 |
| `product_name` | Y | 정제된 상품명 |
| `maker` |  | 제조사 |
| `brand` |  | 브랜드. 제조사와 다를 경우 분리 입력 |
| `model_name` |  | 모델명 |
| `part_type` | Y | 표준 부품 타입 |
| `category_group` | Y | `core_part`, `peripheral`, `service`, `internal` 등 |
| `status` | Y | `판매중`, `품절`, `단종`, `삭제대기` |
| `ai_candidate_yn` | Y | AI 추천 후보 여부 |
| `purchase_price` |  | 매입가 |
| `sale_price` | Y | 판매가 |
| `market_price` |  | 시중가 |
| `supplier` |  | 공급처 |
| `warranty_months` |  | 보증기간 |
| `spec_source_text` |  | 원본 스펙 문자열 정제본 |
| `review_required_yn` | Y | 운영자 검수 필요 여부 |
| `review_reason` |  | 검수 필요 사유 |

---

## 3. product_specs_standard_v1.csv

AI 추천과 호환성 검증에 필요한 정형 스펙만 저장한다.

| 필드 | 설명 |
|---|---|
| `product_code` | 상품코드 |
| `part_type` | 표준 부품 타입 |
| `socket` | CPU/메인보드 소켓 |
| `chipset` | 메인보드 칩셋 |
| `mem_type` | DDR4, DDR5 등 |
| `capacity_gb` | RAM/SSD/HDD 용량 |
| `clock_mhz` | 메모리 클럭 |
| `tdp_watt` | CPU/GPU 소비전력 |
| `rated_watt` | 파워 정격 출력 |
| `required_power_watt` | GPU 권장 파워 |
| `length_mm` | GPU 길이 |
| `gpu_max_mm` | 케이스 GPU 장착 가능 길이 |
| `cooler_height_mm` | 케이스 CPU 쿨러 장착 가능 높이 또는 공랭쿨러 높이 |
| `cooler_tdp` | 쿨러 대응 TDP |
| `pcie_gen` | PCIe 세대 |
| `form_factor` | ATX, M-ATX, Mini-ITX 등 |
| `interface` | NVMe, SATA 등 |
| `tag_white` | 화이트 감성 |
| `tag_rgb` | RGB/LED |
| `tag_silent` | 저소음 |

---

## 4. product_upload_review_v1.csv

표준 CSV 자동 변환 시 운영자 검수가 필요한 행을 분리한다.

| 필드 | 설명 |
|---|---|
| `row_no` | 원본 CSV 행 번호 |
| `product_code` | 상품코드 |
| `product_name` | 상품명 |
| `error_type` | 검수 유형 |
| `error_message` | 상세 사유 |
| `raw_category1` | 원본 카테고리1 |
| `raw_category2` | 원본 카테고리2 |
| `raw_category3` | 원본 카테고리3 |
| `raw_spec` | 원본 스펙 |

---

## 5. 운영자 업로드 필수 기준

모든 상품 필수:

```text
product_code
product_name
part_type
category_group
status
sale_price
ai_candidate_yn
```

AI 추천 후보 필수:

| part_type | 필수 스펙 |
|---|---|
| `CPU` | `socket`, `tdp_watt` |
| `GPU` | `length_mm`, `tdp_watt` 또는 `required_power_watt` |
| `MB` | `socket`, `chipset`, `mem_type`, `form_factor` |
| `RAM` | `mem_type`, `capacity_gb` |
| `SSD` | `capacity_gb`, `interface` |
| `POWER` | `rated_watt` |
| `CASE` | `gpu_max_mm`, `cooler_height_mm` |
| `COOLER_CPU_AIR` | `cooler_tdp`, `cooler_height_mm` |
| `COOLER_CPU_AIO` | `cooler_tdp` |

---

## 6. 정제 규칙

표준 CSV 생성 시 아래 값은 제거하거나 표준화한다.

```text
HTML 태그
HTML 엔티티: &nbsp;, &#160; 등
운영 오염 문자열: <~>, OOO, ㅇㅇㅇ
단독 한글 자모: ㄱ, ㄴ, ㄷ, ㄹ 등
반복 공백
```

원본 카테고리의 오염 여부와 관계없이 `part_type`, `category_group`은 표준 정규화 결과를 사용한다.

---

## 7. 산출 위치

```text
app/db/standardized/products_standard_v1.csv
app/db/standardized/product_specs_standard_v1.csv
app/db/standardized/product_upload_review_v1.csv
app/db/standardized/product_upload_template_v1.csv
app/db/standardized/standardization_report.json
```
