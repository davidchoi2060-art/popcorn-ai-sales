아래 내용을 그대로 복사해서 `.md` 파일로 저장하시면 됩니다.

권장 파일 경로:

```text
_docs/codex-prompts/admin-product-sourcing.md
```

---

```md
# Codex 구현 프롬프트 — 관리자 제품 소싱 기능

**파일 경로:** `_docs/codex-prompts/admin-product-sourcing.md`  
**문서 버전:** Ver 1.0  
**대상 기능:** 관리자 기능 > 제품 소싱  
**신규 Screen 키:** `adm-sourcing`  
**신규 화면 ID:** `ADM-SRC-010`  
**우선순위:** 관리자 V3.0 기준 독립 관리자 메뉴 핵심 기능  
**선행 문서:**  
- `_docs/00_glossary.md`
- `_docs/01_sitemap.md`
- `_docs/02_file-list.md`
- `_docs/03_userflow.md`
- `_docs/05_design-guide.md`
- `_docs/06_db-erd.md`
- `_docs/category-normalization-guide.md`

---

# 1. 구현 목적

팝콘PC 관리자 백오피스에 **제품 소싱** 메뉴를 추가한다.

이 기능의 목적은 시시각각 변하는 거래처별 제품 가격, 수량, 납품 가능 여부를 메신저 대화, 문자, 이메일, 거래처 답변 등 비정형 텍스트에서 수집하고, 이를 AI API로 정제하여 시간대별로 보관하는 것이다.

관리자는 거래처와 주고받은 메신저 내용을 오른쪽 패널의 텍스트 박스에 붙여넣는다.  
시스템은 붙여넣은 원문을 AI API로 전송하여 제품명, 카테고리, 요청수량, 납품가능수량, 단가, VAT 여부, 거래처, 담당자, 기록일시 등을 구조화한다.

정제된 소싱 데이터는 기존 상품 마스터와 매칭하여 견적 산출 시 참고 가격으로 활용한다.

---

# 2. 관리자 메뉴 추가 위치

관리자 V3.0 LNB 메뉴에 `제품 소싱`을 독립 메뉴로 추가한다.

```text
관리자
├─ 상품/재고
   ├─ 상품 마스터 및 재고 제어          adm-product-master
   └─ CSV 업서트                       adm-csv-import
├─ 제품 소싱                           adm-sourcing
├─ 가격/정책
├─ 마케팅 분석
├─ 운영자 관리
└─ 시스템 제어
```

---

# 3. 신규 화면 정의

| 항목 | 값 |
|------|----|
| 화면 ID | `ADM-SRC-010` |
| Screen 키 | `adm-sourcing` |
| React 컴포넌트 | `AdmSourcing` |
| 메뉴명 | 제품 소싱 |
| LNB 활성 | 제품 소싱 |
| 목적 | 거래처별 비정형 가격/수량 정보를 수집, 정제, 저장, 상품 마스터와 매칭 |
| 주요 API | `GET /api/admin/sourcing`, `POST /api/admin/sourcing/parse`, `POST /api/admin/sourcing/confirm`, `PUT /api/admin/sourcing/:id/match` |

---

# 4. 핵심 사용자 시나리오

## 4.1 정상 플로우

```text
관리자 로그인
  → 제품 소싱
  → adm-sourcing
  → 오른쪽 패널에 메신저 대화 내용 붙여넣기
  → [AI 정제] 클릭
  → 백엔드가 AI API에 원문 전송
  → AI가 제품별 소싱 항목을 JSON으로 반환
  → 서버가 제품명/카테고리를 상품 마스터와 매칭
  → 중복 후보가 있으면 관리자 선택 모달 표시
  → 관리자 확인
  → 제품 소싱 목록에 저장
  → 이후 견적 산출 시 최신/최저/거래처별 소싱 단가 참고
```

---

## 4.2 예외 플로우

| 예외 | 조건 | 처리 |
|------|------|------|
| 필수 항목 누락 | 제품명, 카테고리, 요청수량, 개별 단가, 기록일시 중 하나라도 누락 | 미완성 상태로 표시하고 저장 전 검수 요구 |
| 상품 마스터 매칭 없음 | 유사 상품이 없음 | `매칭필요` 상태로 저장, 관리자 수동 검색 제공 |
| 상품 마스터 중복 매칭 | 유사 상품 후보가 2개 이상 | 선택 모달에서 운영자가 상품 선택 |
| 가격 표현 모호 | 묶음가/개별가 구분 불명확 | `price_confidence` 낮게 표시, 검수 큐 등록 |
| VAT 여부 불명확 | 포함/별도 표현 없음 | `vat_included = unknown`으로 저장 |
| 거래처/담당자 추출 실패 | 메신저 이름 또는 본문에서 추출 불가 | 수동 입력 필드 제공 |
| AI API 실패 | API 오류/타임아웃 | 원문 보존, 수동 입력 모드 제공 |
| 동일 시간/동일 거래처/동일 상품 중복 | 이미 저장된 소싱 항목과 유사 | 중복 경고 후 덮어쓰기/별도 저장 선택 |

---

# 5. 화면 UI 요구사항

## 5.1 전체 레이아웃

관리자 공통 레이아웃을 사용한다.

```text
┌──────────────┬──────────────────────────────────────────────────────────────┐
│ LNB          │ 관리자 헤더: 제품 소싱                         관리자님 ▾    │
│ 팝콘PC 관리  ├──────────────────────────────────────────────────────────────┤
│              │                                                              │
│ ▸대시보드    │ ┌───────────────────────────────┬──────────────────────────┐ │
│ ▸제품 소싱 ● │ │ 메인뷰 70%                     │ 오른쪽 입력 패널 30%     │ │
│ ▸가격/정책   │ │ 제품 소싱 목록                 │ 메신저 원문 붙여넣기     │ │
│ ▸마케팅분석  │ │ 필터/검색/테이블                │ AI 정제 결과 미리보기    │ │
│ ▸시스템제어  │ └───────────────────────────────┴──────────────────────────┘ │
└──────────────┴──────────────────────────────────────────────────────────────┘
```

---

## 5.2 메인뷰 70% — 제품 소싱 목록

메인뷰에는 지금까지 취합된 제품 소싱 목록을 표시한다.

### 상단 필터

```text
[거래처] [카테고리] [상품명 검색] [기간 시작~종료] [VAT] [매칭상태] [조회]
```

필터 항목:

| 필터 | 설명 |
|------|------|
| 거래처 | 인텍, 클릭, 대원, 기타 |
| 카테고리 | CPU, GPU, MB, RAM, SSD, POWER, CASE 등 표준 카테고리 |
| 상품명 검색 | 정규화 제품명 또는 원문 제품명 검색 |
| 기간 | 기록일시 기준 |
| VAT | 포함 / 별도 / 미확인 |
| 매칭상태 | 매칭완료 / 후보복수 / 매칭필요 / 검수필요 |

---

### 목록 테이블 컬럼

필수 컬럼은 다음 순서로 표시한다.

```text
기록일시
제품명
카테고리
요청수량
납품가능수량
단가(개별)
단가(묶음)
묶음수량
VAT
거래처
담당자
상품마스터 매칭
상태
관리
```

상세 컬럼 정의:

| 컬럼 | 필드명 | 필수 여부 | 설명 |
|------|--------|----------|------|
| 기록일시 | `recorded_at` | 필수 | 메시지를 보낸 시간 또는 붙여넣은 현재시간 |
| 제품명 | `product_name_raw`, `product_name_normalized` | 필수 | 원문 제품명과 정규화 제품명 |
| 카테고리 | `normalized_part_type` | 필수 | CPU/GPU/MB/RAM 등 |
| 요청수량 | `requested_qty` | 필수 | 요청 또는 문의 수량 |
| 납품가능수량 | `available_qty` | 선택 | 거래처가 실제 가능하다고 한 수량 |
| 단가(개별) | `unit_price` | 필수 | 개별 단가 |
| 단가(묶음) | `bundle_price` | 선택 | 묶음 가격 |
| 묶음수량 | `bundle_qty` | 선택 | 묶음 단가일 때 기준 수량 |
| VAT | `vat_included` | 선택 | 포함/별도/미확인 |
| 거래처 | `vendor_name` | 선택 | 인텍, 클릭 등 |
| 담당자 | `vendor_contact` | 선택 | 이경진차장, 하성훈차장 등 |
| 상품마스터 매칭 | `matched_product_code` | 선택 | products.product_code |
| 상태 | `parse_status` | 필수 | 정상/검수필요/매칭필요/오류 |
| 관리 | 버튼 | - | 상세, 매칭, 수정, 삭제 |

---

### 테이블 예시

```text
┌────────────┬────────────────────────────┬──────┬──────┬──────┬────────┬────┬──────┬──────┬──────┬──────┐
│기록일시     │제품명                       │카테고리│요청 │가능 │개별단가 │VAT │거래처│담당자│매칭  │상태  │
├────────────┼────────────────────────────┼──────┼──────┼──────┼────────┼────┼──────┼──────┼──────┼──────┤
│12:45       │ASUS PRIME B760M-A D5        │MB    │50   │50   │141000  │포함│인텍  │이경진│완료  │정상  │
│10:21       │MSI PRO B760M-A DDR4 II      │MB    │50   │50   │133000  │미확인│클릭│하성훈│후보2 │검수  │
│10:22       │GIGABYTE RTX 5060 WINDFORCE  │GPU   │50   │20   │465000  │미확인│클릭│하성훈│완료  │정상  │
└────────────┴────────────────────────────┴──────┴──────┴──────┴────────┴────┴──────┴──────┴──────┴──────┘
```

---

## 5.3 오른쪽 패널 30% — 메신저 원문 붙여넣기

오른쪽 패널은 고정 폭 30% 또는 최소 360px을 유지한다.

### 구성

```text
[H2] 메신저 소싱 내용 붙여넣기

거래처 선택/입력 [__________]
담당자 선택/입력 [__________]
기록 기준 시간 [현재시간 사용 ▾]

[textarea]
메신저 내용을 붙여넣으세요...

[AI 정제]
[초기화]
```

---

### 원문 입력 텍스트 박스

- 여러 줄 입력 가능
- 카카오톡, 문자, 이메일, 텔레그램 등 형식 혼합 허용
- 운영자가 그대로 붙여넣을 수 있어야 함
- 붙여넣은 원문은 `sourcing_batches.raw_text`에 저장

---

### AI 정제 결과 미리보기

AI 정제 후 오른쪽 패널 하단에 미리보기 테이블을 표시한다.

```text
[H3] AI 정제 결과 미리보기

제품명 / 카테고리 / 요청수량 / 가능수량 / 개별단가 / VAT / 거래처 / 담당자 / 상태
[확정 저장]
[검수 필요 항목만 보기]
```

---

# 6. 필수 데이터 항목

소싱 항목 하나가 저장되려면 아래 필드가 반드시 필요하다.

```text
제품명
카테고리
요청수량
단가(개별가격)
기록일시
```

필수 필드 매핑:

| 한글명 | DB 필드 | 필수 |
|--------|---------|------|
| 제품명 | `product_name_normalized` 또는 `product_name_raw` | 예 |
| 카테고리 | `normalized_part_type` | 예 |
| 요청수량 | `requested_qty` | 예 |
| 단가(개별가격) | `unit_price` | 예 |
| 기록일시 | `recorded_at` | 예 |

---

# 7. 데이터 추출 규칙

## 7.1 제품명 추출

제품명은 다음 패턴에서 추출한다.

```text
BOARD ASUS PRIME B760M-A 50 EA d5
MSI PRO B860M-A WIFI 50 EA
GIGABYTE 지포스 RTX 5060 Ti WINDFORCE MAX OC D7 8GB 50 EA
ASUS PRIME A520M-K 인텍앤컴퍼니
LR-LINK LRES2004PT-POE 기가비트 랜카드 50 EA
```

제품명 정규화 시 다음을 처리한다.

```text
d5 → DDR5
d4 → DDR4
B76oM → B760M 오타 가능성 보정
Msi → MSI
ASUS PRIME B760M-A d5 → ASUS PRIME B760M-A DDR5
```

---

## 7.2 카테고리 추출

카테고리는 기존 상품 카테고리 정규화 지침을 따른다.

| 원문 키워드 | normalized_part_type |
|------------|----------------------|
| BOARD | MB |
| M/B | MB |
| 메인보드 | MB |
| VGA | GPU |
| RTX | GPU |
| GTX | GPU |
| 지포스 | GPU |
| Radeon | GPU |
| RAM | RAM |
| DDR4 | RAM |
| DDR5 | RAM |
| SSD | SSD |
| NVMe | SSD |
| M.2 | SSD |
| LAN CARD | NETWORK |
| 랜카드 | NETWORK |
| CPU | CPU |
| POWER | POWER |
| 파워 | POWER |
| CASE | CASE |
| 케이스 | CASE |

---

## 7.3 요청수량 추출

다음 표현을 모두 수량으로 인식한다.

```text
50 EA
50EA
50    EA
10장
100장
750개
250개
30 EA
```

수량 추출 규칙:

```text
EA, 장, 개 앞의 숫자를 수량으로 본다.
```

만약 요청수량과 납품가능수량이 구분되지 않고 단일 수량만 있으면 다음처럼 처리한다.

```text
requested_qty = 해당 수량
available_qty = 해당 수량
qty_inferred = true
```

---

## 7.4 납품가능수량 추출

다음 표현에서 납품가능수량을 추출한다.

```text
재고 가능 합니다
100장 구했구요
20장 미만 보유 상태
750개
250개
없는데
재고 없음
```

처리 규칙:

| 표현 | available_qty |
|------|---------------|
| `재고 가능` | requested_qty와 동일 |
| `100장 구했구요` | 100 |
| `20장 미만 보유` | 20, `available_qty_note = "미만"` |
| `없는데`, `재고 없음` | 0 |
| 단일 수량만 있는 경우 | 해당 수량 |

---

## 7.5 가격 추출

다음 표현을 가격으로 인식한다.

```text
141,000포함이에여
\126,000
191.000원
192.000원
585.000
49만입니다
265000입니다
133000
147000 입니다
```

정규화:

```text
141,000 → 141000
191.000 → 191000
49만 → 490000
\126,000 → 126000
```

---

## 7.6 단가 구분

### 개별 단가

기본적으로 제품 1개당 가격으로 판단한다.

```text
ASUS PRIME B760M-A 50 EA
141,000 포함이에여

unit_price = 141000
requested_qty = 50
vat_included = true
```

---

### 묶음 가격

묶음 가격이라는 표현이 있거나, “총액”, “묶음”, “일괄”, “패키지”가 있으면 묶음 가격으로 판단한다.

```text
bundle_price = 묶음가격
bundle_qty = 묶음수량
unit_price = bundle_price / bundle_qty
```

묶음 여부가 불확실하면:

```text
price_type = unknown
review_required = true
```

---

## 7.7 VAT 포함 여부

VAT 포함 여부는 다음 규칙으로 판단한다.

| 표현 | vat_included |
|------|--------------|
| `포함` | true |
| `부가세 포함` | true |
| `VAT 포함` | true |
| `별도` | false |
| `부가세 별도` | false |
| 표현 없음 | null |
| `포함이에여` | true |

---

## 7.8 거래처/담당자 추출

메신저 대괄호 이름에서 거래처와 담당자를 추출한다.

예:

```text
[이경진차장인텍]
```

추출:

```text
vendor_contact = 이경진차장
vendor_name = 인텍
```

예:

```text
[하성훈차장클릭]
```

추출:

```text
vendor_contact = 하성훈차장
vendor_name = 클릭
```

운영자가 오른쪽 패널에서 거래처/담당자를 수동 입력한 경우, 수동 입력값이 AI 추출값보다 우선한다.

---

## 7.9 기록일시 추출

메신저 시간 형식:

```text
[오후 12:45]
[오전 11:17]
[오전 10:21]
```

처리:

```text
오전 10:21 → 오늘 날짜 10:21
오후 12:45 → 오늘 날짜 12:45
오후 1:05 → 오늘 날짜 13:05
```

날짜가 없는 경우:

```text
recorded_at = 사용자가 붙여넣은 현재 날짜 + 메시지 시간
```

메시지 시간도 없는 경우:

```text
recorded_at = 붙여넣은 현재 시간
recorded_at_source = pasted_at
```

---

# 8. AI 정제 출력 JSON 스키마

AI API는 반드시 아래 JSON 형식으로만 응답해야 한다.

```json
{
  "batch": {
    "source_text_summary": "string",
    "detected_vendor_name": "string | null",
    "detected_vendor_contact": "string | null",
    "message_time": "string | null",
    "recorded_at_source": "message_time | pasted_at | manual",
    "parse_confidence": 0.0
  },
  "items": [
    {
      "source_line": "string",
      "product_name_raw": "string",
      "product_name_normalized": "string",
      "normalized_part_type": "CPU | GPU | MB | RAM | SSD | HDD | POWER | CASE | COOLER_CPU_AIR | COOLER_CPU_AIO | NETWORK | ETC",
      "requested_qty": 0,
      "available_qty": 0,
      "qty_unit": "EA | 장 | 개 | null",
      "qty_inferred": false,
      "bundle_price": null,
      "bundle_qty": null,
      "unit_price": 0,
      "price_type": "unit | bundle | unknown",
      "vat_included": true,
      "vendor_name": "string | null",
      "vendor_contact": "string | null",
      "recorded_at": "YYYY-MM-DD HH:mm:ss",
      "memo": "string | null",
      "required_fields_complete": true,
      "review_required": false,
      "review_reason": null,
      "confidence": 0.0
    }
  ],
  "warnings": [
    {
      "type": "string",
      "message": "string"
    }
  ]
}
```

---

# 9. 상품 마스터 매칭 규칙

AI가 정제한 `product_name_normalized`와 `normalized_part_type`을 기준으로 기존 상품 마스터 `products`와 매칭한다.

## 9.1 매칭 기준

우선순위:

```text
1. product_name 완전 일치
2. model_name 완전 일치
3. product_name 부분 일치
4. 제조사 + 핵심 모델명 일치
5. normalized_part_type 일치 + 유사도 검색
```

---

## 9.2 매칭 후보 산출

매칭 후보는 최대 10개까지 반환한다.

```json
{
  "source_item_id": 1,
  "candidates": [
    {
      "product_code": 123456,
      "product_name": "ASUS PRIME B760M-A",
      "maker": "ASUS",
      "normalized_part_type": "MB",
      "status": "판매중",
      "member_price": 150000,
      "match_score": 0.94
    }
  ]
}
```

---

## 9.3 중복 후보 발생 시

동일 또는 유사 상품이 여러 개 있으면 운영자가 선택할 수 있도록 모달을 띄운다.

모달 구성:

```text
[H2] 상품 마스터 매칭 후보 선택

원문 제품명:
ASUS PRIME B760M-A DDR5

후보 목록:
상품코드 / 상품명 / 제조사 / 상태 / 현재 판매가 / 매칭점수 / 선택

[선택 적용]
[매칭 보류]
[수동 검색]
```

---

## 9.4 매칭 상태값

| 상태 | 설명 |
|------|------|
| `matched` | 상품 마스터와 1개 항목으로 확정 매칭 |
| `multi_candidate` | 후보가 2개 이상 |
| `no_match` | 후보 없음 |
| `manual_matched` | 운영자가 수동 매칭 |
| `ignored` | 매칭하지 않음 |
| `review_required` | 검수 필요 |

---

# 10. DB 설계

## 10.1 sourcing_batches

붙여넣은 원문 단위의 배치 기록이다.

```sql
CREATE TABLE sourcing_batches (
  batch_id BIGSERIAL PRIMARY KEY,

  raw_text TEXT NOT NULL,
  pasted_at TIMESTAMP NOT NULL DEFAULT now(),

  manual_vendor_name VARCHAR(100),
  manual_vendor_contact VARCHAR(100),

  detected_vendor_name VARCHAR(100),
  detected_vendor_contact VARCHAR(100),

  parse_status VARCHAR(30) NOT NULL DEFAULT '대기',
  parse_confidence NUMERIC(4,2),

  created_by BIGINT,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);
```

`parse_status` 표준값:

```text
대기
정제중
정제완료
검수필요
오류
확정
```

---

## 10.2 product_sourcing_quotes

제품별 소싱 정제 결과 테이블이다.

```sql
CREATE TABLE product_sourcing_quotes (
  sourcing_id BIGSERIAL PRIMARY KEY,
  batch_id BIGINT REFERENCES sourcing_batches(batch_id) ON DELETE CASCADE,

  source_line TEXT,

  product_name_raw VARCHAR(500) NOT NULL,
  product_name_normalized VARCHAR(500) NOT NULL,

  normalized_part_type VARCHAR(50) NOT NULL,

  requested_qty INTEGER NOT NULL,
  available_qty INTEGER,
  qty_unit VARCHAR(20),
  qty_inferred BOOLEAN NOT NULL DEFAULT false,

  bundle_price INTEGER,
  bundle_qty INTEGER,
  unit_price INTEGER NOT NULL,
  price_type VARCHAR(30) NOT NULL DEFAULT 'unit',

  vat_included BOOLEAN,
  vat_text VARCHAR(50),

  vendor_name VARCHAR(100),
  vendor_contact VARCHAR(100),

  recorded_at TIMESTAMP NOT NULL,
  recorded_at_source VARCHAR(30) NOT NULL DEFAULT 'pasted_at',

  matched_product_code BIGINT REFERENCES products(product_code),
  match_status VARCHAR(30) NOT NULL DEFAULT 'no_match',
  match_score NUMERIC(4,2),

  required_fields_complete BOOLEAN NOT NULL DEFAULT true,
  review_required BOOLEAN NOT NULL DEFAULT false,
  review_reason TEXT,

  memo TEXT,

  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
```

---

## 10.3 product_sourcing_match_candidates

중복 매칭 후보 저장 테이블이다.

```sql
CREATE TABLE product_sourcing_match_candidates (
  candidate_id BIGSERIAL PRIMARY KEY,

  sourcing_id BIGINT REFERENCES product_sourcing_quotes(sourcing_id) ON DELETE CASCADE,
  product_code BIGINT REFERENCES products(product_code),

  candidate_product_name VARCHAR(500),
  maker VARCHAR(100),
  status VARCHAR(20),
  member_price INTEGER,

  match_score NUMERIC(4,2),
  selected_yn BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMP NOT NULL DEFAULT now()
);
```

---

## 10.4 인덱스

```sql
CREATE INDEX idx_sourcing_quotes_recorded_at
ON product_sourcing_quotes (recorded_at DESC);

CREATE INDEX idx_sourcing_quotes_product
ON product_sourcing_quotes (product_name_normalized);

CREATE INDEX idx_sourcing_quotes_category_time
ON product_sourcing_quotes (normalized_part_type, recorded_at DESC);

CREATE INDEX idx_sourcing_quotes_vendor_time
ON product_sourcing_quotes (vendor_name, recorded_at DESC);

CREATE INDEX idx_sourcing_quotes_match_status
ON product_sourcing_quotes (match_status, recorded_at DESC);

CREATE INDEX idx_sourcing_quotes_matched_product
ON product_sourcing_quotes (matched_product_code, recorded_at DESC);
```

---

# 11. API 설계

## 11.1 소싱 목록 조회

```http
GET /api/admin/sourcing
```

Query:

```text
vendor_name
normalized_part_type
keyword
from
to
vat_included
match_status
page
limit
```

Response:

```json
{
  "items": [],
  "page": 1,
  "limit": 50,
  "total": 0
}
```

---

## 11.2 메신저 원문 AI 정제

```http
POST /api/admin/sourcing/parse
```

Request:

```json
{
  "raw_text": "string",
  "manual_vendor_name": "string | null",
  "manual_vendor_contact": "string | null",
  "recorded_at_mode": "message_time | pasted_at | manual",
  "manual_recorded_at": "YYYY-MM-DD HH:mm:ss | null",
  "use_mock": true
}
```

Response:

```json
{
  "batch_id": 1,
  "parsed_items": [],
  "match_candidates": [],
  "warnings": []
}
```

---

## 11.3 정제 결과 확정 저장

```http
POST /api/admin/sourcing/confirm
```

Request:

```json
{
  "batch_id": 1,
  "items": [
    {
      "temp_id": "string",
      "product_name_normalized": "string",
      "normalized_part_type": "MB",
      "requested_qty": 50,
      "available_qty": 50,
      "unit_price": 141000,
      "vat_included": true,
      "vendor_name": "인텍",
      "vendor_contact": "이경진차장",
      "recorded_at": "2026-06-19 12:45:00",
      "matched_product_code": 123456
    }
  ]
}
```

---

## 11.4 상품 마스터 매칭 후보 조회

```http
GET /api/admin/sourcing/match-candidates
```

Query:

```text
product_name
normalized_part_type
```

---

## 11.5 소싱 항목 매칭 수정

```http
PUT /api/admin/sourcing/:sourcing_id/match
```

Request:

```json
{
  "matched_product_code": 123456,
  "match_status": "manual_matched"
}
```

---

## 11.6 소싱 항목 수정

```http
PUT /api/admin/sourcing/:sourcing_id
```

---

## 11.7 소싱 항목 삭제

```http
DELETE /api/admin/sourcing/:sourcing_id
```

---

# 12. 견적 산출 반영 규칙

제품 소싱 가격은 상품 마스터의 고정 판매가를 대체하지 않는다.  
견적 산출 시 참고 가격으로 활용한다.

## 12.1 가격 선택 우선순위

견적 산출 시 가격 참고 우선순위:

```text
1. 동일 matched_product_code의 최신 소싱 가격
2. 동일 normalized_part_type + 유사 제품명의 최신 소싱 가격
3. products.member_price
4. products.market_price
5. products.purchase_price + 정책 마진
```

---

## 12.2 최신 소싱 가격 기준

기본 기준:

```text
최근 24시간 이내
동일 상품
판매중 또는 매칭완료
review_required = false
```

설정 가능 옵션:

```text
최근 6시간
최근 12시간
최근 24시간
최근 3일
최근 7일
```

---

## 12.3 가격 선택 정책

관리자 정책으로 선택 가능하도록 설계한다.

| 정책 | 설명 |
|------|------|
| latest | 가장 최근 소싱 가격 |
| lowest | 기간 내 최저 소싱 가격 |
| vendor_priority | 우선 거래처 가격 |
| average | 기간 내 평균 |
| manual | 운영자가 선택 |

초기 구현은 `latest`를 기본값으로 한다.

---

# 13. AI 파싱 프롬프트

AI API 호출 시 아래 시스템 프롬프트를 사용한다.

```text
너는 팝콘PC 관리자 제품 소싱 정제 엔진이다.

운영자가 메신저, 문자, 이메일 등에서 복사한 비정형 텍스트를 입력받아 제품 소싱 정보를 구조화한다.

반드시 JSON으로만 응답하라.
설명 문장, 마크다운, 주석은 출력하지 마라.

추출해야 할 필드는 다음과 같다.

필수:
- product_name_raw
- product_name_normalized
- normalized_part_type
- requested_qty
- unit_price
- recorded_at

선택:
- available_qty
- bundle_price
- bundle_qty
- vat_included
- vendor_name
- vendor_contact
- memo

규칙:
1. 제품명은 최대한 원문을 보존하되, 오타와 약어는 정규화한다.
2. BOARD는 MB로 분류한다.
3. VGA, RTX, GTX, 지포스, 라데온은 GPU로 분류한다.
4. SSD, NVMe, M.2는 SSD로 분류한다.
5. DDR4, DDR5, RAM은 RAM으로 분류한다.
6. LAN CARD, 랜카드는 NETWORK로 분류한다.
7. 50 EA, 10장, 750개 같은 표현은 수량으로 추출한다.
8. 가격은 141,000 / 141.000 / 49만 / \126,000 형식을 모두 숫자로 정규화한다.
9. 포함, 포함이에여, VAT 포함은 vat_included=true로 처리한다.
10. 별도, VAT 별도는 vat_included=false로 처리한다.
11. VAT 표현이 없으면 vat_included=null로 둔다.
12. 거래처와 담당자는 메신저 이름에서 추출한다. 예: [이경진차장인텍] → 담당자 이경진차장, 거래처 인텍.
13. 메시지 시간이 있으면 오늘 날짜와 결합해 recorded_at을 만든다.
14. 메시지 시간이 없으면 pasted_at을 기록일시로 사용한다.
15. 제품별 가격과 수량이 여러 줄에 나뉘어 있으면 문맥상 가장 가까운 제품에 연결한다.
16. 여러 제품을 먼저 나열하고 가격만 순서대로 답변한 경우, 제품 순서와 가격 순서를 매칭한다.
17. 원가와 공급가가 모두 있으면 공급가를 unit_price로 사용하고 원가는 memo에 저장한다.
18. 재고 없음, 없는데, 없음은 available_qty=0으로 처리한다.
19. 필수 필드가 누락되면 review_required=true로 설정한다.
20. 확신이 낮으면 confidence를 낮게 부여하고 review_reason을 작성한다.

출력 JSON 스키마를 반드시 지켜라.
```

---

# 14. 예시 입력/출력

## 14.1 예시 1

### 입력

```text
[이경진차장인텍] [오후 12:45] BOARD   ASUS PRIME B760M-A   50    EA d5
[이경진차장인텍] [오후 12:45] 141,000포함이에여
```

### 기대 출력

```json
{
  "batch": {
    "detected_vendor_name": "인텍",
    "detected_vendor_contact": "이경진차장",
    "message_time": "오후 12:45",
    "recorded_at_source": "message_time",
    "parse_confidence": 0.98
  },
  "items": [
    {
      "source_line": "BOARD ASUS PRIME B760M-A 50 EA d5 / 141,000포함이에여",
      "product_name_raw": "ASUS PRIME B760M-A d5",
      "product_name_normalized": "ASUS PRIME B760M-A DDR5",
      "normalized_part_type": "MB",
      "requested_qty": 50,
      "available_qty": 50,
      "qty_unit": "EA",
      "qty_inferred": false,
      "bundle_price": null,
      "bundle_qty": null,
      "unit_price": 141000,
      "price_type": "unit",
      "vat_included": true,
      "vendor_name": "인텍",
      "vendor_contact": "이경진차장",
      "recorded_at": "CURRENT_DATE 12:45:00",
      "memo": null,
      "required_fields_complete": true,
      "review_required": false,
      "review_reason": null,
      "confidence": 0.98
    }
  ],
  "warnings": []
}
```

---

## 14.2 예시 2

### 입력

```text
네 사장님 
문의하신 B760M Pro-A/D4 50EA 재고 가능 합니다. 
\126,000 에 드릴 수 있습니다. 
감사합니다.
```

### 기대 출력

```json
{
  "items": [
    {
      "product_name_raw": "B760M Pro-A/D4",
      "product_name_normalized": "B760M Pro-A DDR4",
      "normalized_part_type": "MB",
      "requested_qty": 50,
      "available_qty": 50,
      "qty_unit": "EA",
      "unit_price": 126000,
      "vat_included": null,
      "price_type": "unit",
      "required_fields_complete": true,
      "review_required": false,
      "confidence": 0.92
    }
  ]
}
```

---

## 14.3 예시 3

### 입력

```text
MSI PRO B860M-A WIFI   50    EA  

원가  191.000원   공급가   192.000원 쩐뛰기 ~ 
```

### 기대 출력

```json
{
  "items": [
    {
      "product_name_raw": "MSI PRO B860M-A WIFI",
      "product_name_normalized": "MSI PRO B860M-A WIFI",
      "normalized_part_type": "MB",
      "requested_qty": 50,
      "available_qty": 50,
      "unit_price": 192000,
      "vat_included": null,
      "memo": "원가 191000원, 공급가 192000원",
      "review_required": false,
      "confidence": 0.93
    }
  ]
}
```

---

## 14.4 예시 4

### 입력

```text
GIGABYTE 지포스 RTX 5060 Ti WINDFORCE MAX OC D7 8GB   50    EA
>>>>>   585.000
```

### 기대 출력

```json
{
  "items": [
    {
      "product_name_raw": "GIGABYTE 지포스 RTX 5060 Ti WINDFORCE MAX OC D7 8GB",
      "product_name_normalized": "GIGABYTE 지포스 RTX 5060 Ti WINDFORCE MAX OC D7 8GB",
      "normalized_part_type": "GPU",
      "requested_qty": 50,
      "available_qty": 50,
      "unit_price": 585000,
      "vat_included": null,
      "review_required": false,
      "confidence": 0.96
    }
  ]
}
```

---

## 14.5 예시 5

### 입력

```text
마이크론 DDR5 16GB 44800    형님 이거 ... 
하이닉스 PC801 512G  -->>이건 없는데 형 ㅠㅠ 

MSI PRO B760M-P DDR4  
118.000원이 원가에요 
```

### 기대 출력

```json
{
  "items": [
    {
      "product_name_raw": "마이크론 DDR5 16GB 44800",
      "product_name_normalized": "마이크론 DDR5 16GB PC5-44800",
      "normalized_part_type": "RAM",
      "requested_qty": 1,
      "available_qty": null,
      "unit_price": null,
      "review_required": true,
      "review_reason": "단가 누락",
      "confidence": 0.70
    },
    {
      "product_name_raw": "하이닉스 PC801 512G",
      "product_name_normalized": "하이닉스 PC801 512GB",
      "normalized_part_type": "SSD",
      "requested_qty": 1,
      "available_qty": 0,
      "unit_price": null,
      "review_required": true,
      "review_reason": "재고 없음 및 단가 누락",
      "confidence": 0.80
    },
    {
      "product_name_raw": "MSI PRO B760M-P DDR4",
      "product_name_normalized": "MSI PRO B760M-P DDR4",
      "normalized_part_type": "MB",
      "requested_qty": 1,
      "available_qty": 1,
      "unit_price": 118000,
      "memo": "원가 표현",
      "review_required": true,
      "review_reason": "요청수량이 명확하지 않음",
      "confidence": 0.82
    }
  ]
}
```

---

# 15. 프론트엔드 구현 요구사항

## 15.1 신규 파일

```text
app/src/app/screens/admin/AdmSourcing.tsx
```

---

## 15.2 Screen 타입 추가

`app/src/app/types.ts`에 추가:

```text
'adm-sourcing'
```

---

## 15.3 screenMap 연결

`app/src/app/App.tsx`의 `screenMap`에 추가:

```text
'adm-sourcing': AdmSourcing
```

---

## 15.4 AdminLayout LNB 추가

관리자 LNB에 `제품 소싱`을 독립 메뉴로 추가한다.

```text
관리자 LNB
- 상품/재고
- 제품 소싱
- 가격/정책
```

---

## 15.5 UI 컴포넌트

필요 컴포넌트:

```text
SourcingFilterBar
SourcingTable
SourcingPastePanel
SourcingParsePreview
SourcingMatchModal
SourcingEditModal
SourcingStatusBadge
```

---

# 16. 백엔드 구현 요구사항

## 16.1 라우트 파일

```text
app/server/routes/admin.sourcing.routes.js
```

---

## 16.2 서비스 파일

```text
app/server/services/sourcing.service.js
app/server/services/sourcing-parser.service.js
app/server/services/sourcing-match.service.js
```

---

## 16.3 LLM 연동

```text
app/server/llm/sourcing-parser.js
```

규칙:

```text
- API Key는 서버 .env에서만 사용
- 프론트로 API Key 노출 금지
- Mock API Switch가 ON이면 사전 정의 JSON 반환
- AI 응답은 JSON Schema 검증 후 저장
- JSON 파싱 실패 시 원문과 오류 로그 저장
```

---

# 17. 보안 및 비용 정책

```text
- 외부 LLM 호출 전 Rate Limit 확인
- Circuit Breaker 발동 시 AI 정제 차단
- Mock API 기본 ON
- 원문 raw_text에는 개인정보가 있을 수 있으므로 관리자 권한에서만 조회
- API Key는 절대 로그에 남기지 않음
- AI 요청에는 필요한 원문만 전달하고 관리자 세션 정보는 전달하지 않음
```

---

# 18. 수용 기준

다음 조건을 모두 만족해야 한다.

```text
- [ ] 관리자 LNB에 제품 소싱 독립 메뉴가 추가된다.
- [ ] adm-sourcing 화면이 정상 렌더링된다.
- [ ] 메인뷰에 제품 소싱 목록이 표시된다.
- [ ] 오른쪽 30% 패널에 메신저 원문 붙여넣기 textarea가 있다.
- [ ] [AI 정제] 버튼 클릭 시 POST /api/admin/sourcing/parse가 호출된다.
- [ ] AI 정제 결과가 미리보기로 표시된다.
- [ ] 필수 필드 누락 항목은 검수필요로 표시된다.
- [ ] 상품 마스터 후보가 복수면 선택 모달이 표시된다.
- [ ] 운영자가 매칭 상품을 선택할 수 있다.
- [ ] 확정 저장 시 product_sourcing_quotes에 저장된다.
- [ ] 목록은 기록일시 기준 최신순 정렬된다.
- [ ] 거래처, 카테고리, 기간, 매칭상태로 필터링 가능하다.
- [ ] VAT 포함 여부가 표시된다.
- [ ] 기록일시는 메시지 시간이 있으면 메시지 시간, 없으면 붙여넣은 현재시간을 사용한다.
- [ ] Mock API Switch가 ON이면 외부 LLM을 호출하지 않는다.
```

---

# 19. 최종 구현 요약

관리자 제품 소싱 기능은 다음을 구현한다.

```text
1. 비정형 메신저 텍스트 입력
2. AI API 기반 제품/가격/수량/VAT/거래처/담당자/시간 정제
3. 상품 마스터 자동 매칭
4. 중복 후보 운영자 선택
5. 시간대별 소싱 가격 저장
6. 견적 산출 시 최신 소싱 단가 참고
```

이 기능은 기존 상품 마스터 가격을 대체하지 않고, 거래처별 실시간 소싱 가격 이력으로 활용한다.

최종적으로 견적 산출 엔진은 다음 정보를 참고할 수 있어야 한다.

```text
동일 상품의 최신 소싱 단가
거래처별 공급 가능 수량
VAT 포함 여부
기록 시점
상품 마스터 매칭 여부
```
```

---  
