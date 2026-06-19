이 문서는 프론트엔드와 백엔드, 그리고 백엔드와 3사 LLM 사이의 "계약서"입니다. 각 엔드포인트의 요청/응답 JSON 규격을 확정해, Codex가 프론트와 백엔드를 따로 개발해도 서로 맞물리게 합니다.

---

# 07. API 명세서 (인터페이스 정의)

**파일 경로:** `_docs/07_api-spec.md`
**문서 버전:** Ver 1.0
**Base URL:** `/api` (개발: `http://localhost:3000/api`)
**선행 문서:** `03_userflow.md`, `06_db-erd.md`

## 1. 공통 규약

모든 응답은 JSON이며 공통 봉투(envelope)를 사용한다. 성공 시 `{ "success": true, "data": {...} }`, 실패 시 `{ "success": false, "error": { "code": "...", "message": "..." } }` 형식이다. 인증이 필요한 요청은 헤더에 `Authorization: Bearer <JWT>`를 싣는다. 게스트는 `X-Guest-UID` 헤더로 임시 식별한다. 모든 시간은 ISO 8601(KST), 금액은 정수(원), 토큰·비용은 숫자로 표현한다.

주요 에러 코드는 다음과 같이 표준화한다: `RATE_LIMIT_EXCEEDED`(429, 일일 한도 초과), `COST_CIRCUIT_OPEN`(503, 비용 차단), `LLM_ALL_FAILED`(502, 3사 전부 실패), `NO_CANDIDATE`(200+빈배열, 후보 없음), `COMPAT_VIOLATION`(409, 호환성 위반), `VALIDATION_ERROR`(400, 필수값 누락), `UNAUTHORIZED`(401).

## 2. 추천 핵심 — POST /api/recommend

초급자·고급자 공통 추천 엔드포인트. Raw Text 프롬프트를 받아 3사 병렬 호출 + 검증 후 최적안을 반환한다.

**요청**
```json
{
  "mode": "beginner",            // beginner | expert
  "raw_text": "안녕하세요! 저는 PC를 잘 모르는 초급자입니다. 주 용도는 [게임(배틀그라운드)]이며, 예산은 [100만~130만] ...",
  "budget": { "min": 1000000, "max": 1300000 },   // 초급자
  "constraints": {                                  // 고급자(있을 때만)
    "cpu_maker": "AMD", "gpu_maker": "NVIDIA",
    "mem_type": "DDR5", "power_margin": 0.3, "cooler": "수랭3열"
  },
  "use_mock": true               // 개발용 Mock 스위치(기본 true)
}
```

**응답 (성공)**
```json
{
  "success": true,
  "data": {
    "recommendation_id": 10293,
    "sets": [
      {
        "type": "value",         // value(가성비) | recommend(추천) | highend(고성능)
        "total_price": 1180000,
        "ai_engine": "Claude",
        "components": {
          "cpu": { "code": 101268, "name": "라이젠 R5...", "price": 191900 },
          "gpu": { "code": 376681, "name": "...", "price": 0 },
          "ram": {}, "ssd": {}, "mb": {}, "power": {}, "case": {}
        },
        "chart": {
          "fps": { "fhd": 144, "qhd": 90 },
          "price_ratio": { "cpu_gpu": 55, "mem_storage": 20, "etc": 25 }
        },
        "mentoring_reason": "초급자 맞춤 한 줄 추천 사유"
      }
      // recommend / highend 세트 동일 구조, recommend가 기본 활성
    ],
    "meta": {
      "responded_models": ["gemini", "claude"],   // chatgpt는 타임아웃 Drop
      "dropped_models": ["chatgpt"],
      "elapsed_ms": 4200
    }
  }
}
```

**예외 응답 예시**
```json
// 후보 없음(EX-BEG-03)
{ "success": true, "data": { "sets": [], "suggestion": "예산을 10만원 상향하면 후보가 생깁니다." } }
// 전부 실패(EX-BEG-02)
{ "success": false, "error": { "code": "LLM_ALL_FAILED", "message": "잠시 후 다시 시도해 주세요." } }
// 한도 초과(EX-BEG-06)
{ "success": false, "error": { "code": "RATE_LIMIT_EXCEEDED", "message": "오늘 이용 한도를 초과했습니다." } }
```

이 엔드포인트는 내부적으로 7초 타임아웃 감시, PII 마스킹, 4단계 검증(재고→호환성→마진→점수합산)을 수행한다. 상세 로직은 9단계 아키텍처에서 다룬다.

## 3. 부품 스왑 — POST /api/swap/candidates · POST /api/swap/validate

`/candidates`는 특정 부품의 안전 대안 목록(현 구성과 호환 100% 통과 + 판매중)만 반환한다. `/validate`는 사용자가 선택한 스왑 조합을 검증해 호환성 결과와(위반 시) 연쇄 변경 해결책을 반환한다.

```json
// POST /api/swap/validate 요청
{ "recommendation_id": 10293, "swap": { "part": "gpu", "to_code": 999001 } }

// 응답(연쇄 변경 필요 — EX-EXP-05)
{
  "success": true,
  "data": {
    "compatible": false,
    "reason": "파워 정격 용량 부족 (필요 950W > 현재 750W)",
    "chain_solution": {
      "part": "power",
      "options": [
        { "code": 888001, "name": "시소닉 1000W", "extra_price": 80000 },
        { "code": 888002, "name": "B제품 1000W", "extra_price": 65000 }
      ]
    }
  }
}
```

호환 가능하면 `compatible: true`를 반환하고, 프론트는 장바구니 버튼 잠금을 해제한다.

## 4. 장바구니 릴레이 — POST /api/cart/relay

확정 견적을 기존 쇼핑몰 결제 레일로 전달한다. 부품 마스터 상품코드 배열, 공임비 코드, 수량을 페이로드로 패킹한다.

```json
{
  "recommendation_id": 10293,
  "items": [ { "code": 101268, "qty": 1 }, { "code": 376681, "qty": 1 } ],
  "labor_fee_code": "ASSEMBLY-01",
  "guest_uid": "g-abc123"        // 비회원 시
}
```
응답으로 쇼핑몰 결제 URL 또는 세션 릴레이 토큰을 반환한다.

## 5. 인증 — POST /api/auth/sso

기존 쇼핑몰 SSO 모달이 인증 성공 시 호출한다. 성공하면 JWT와 회원 등급을 반환하며, 프론트는 토큰을 로컬 스토리지·쿠키에 바인딩한다.

## 6. 관리자 API

| 메서드·경로 | 기능 | 화면 |
|------------|------|------|
| GET `/api/admin/dashboard/business` | 실시간 견적 피드, 특가 CTR, 키워드, 가격동향 요약 | adm-dashboard |
| GET `/api/admin/products` | 카테고리·상태·키워드 검색(50건 페이징) | adm-product-master |
| GET `/api/admin/products/:code` | 단일 상품 상세 | adm-product-master |
| PUT `/api/admin/products/:code` | 상품·연산필드 수정(트랜잭션) | adm-product-master |
| POST `/api/admin/products/csv` | CSV Upsert(신규 Insert/기존 Update) | adm-csv-import |
| PUT `/api/admin/products/:code/status` | 품절·단종 토글(1초 내 풀 제외) | adm-product-master |
| PUT `/api/admin/policy/margin` | 카테고리 마진율 일괄 | adm-price-policy |
| PUT `/api/admin/policy/weights` | 전역 추천 가중치(슬라이더) | adm-recommend-weights |
| GET `/api/admin/cost` | 3사 토큰·원화/달러 비용 집계 | adm-dashboard, adm-system-limit |
| PUT `/api/admin/cost/threshold` | 일일 비용 임계치 설정(Circuit Breaker) | adm-system-limit |
| GET `/api/admin/rate-limit` / PUT | 등급·IP별 한도 조회/설정 | adm-system-limit |
| GET `/api/admin/operators` | 운영자 목록 조회 | adm-operators |
| POST `/api/admin/operators/invite` | 운영자 초대 | adm-operators |
| PUT `/api/admin/operators/:id` | 운영자 역할·메모 수정 | adm-operators |
| PUT `/api/admin/operators/:id/status` | 운영자 활성/비활성 처리 | adm-operators |
| GET `/api/admin/operators/activity` | 운영자 활동 로그 조회 | adm-operators |

상품 검색 예시 요청은 `GET /api/admin/products?category=그래픽카드&status=판매중&keyword=RTX&page=1`이며, 응답은 `{ items: [...50건], total, page }` 형식이다. CSV 업로드 응답은 `{ inserted, updated, errors: [...오류행] }`로 정상·오류를 분리 반환한다(EX-ADM-04).

## 7. 분석 API

`GET /api/analytics/keywords`(인기 키워드 형태소 랭킹), `GET /api/analytics/swap-report`(카테고리별 최다 탈락 부품 TOP 10), `GET /api/analytics/funnel`(진입→결제 단계별 도달 수치)을 제공한다. 모두 기간 파라미터(`?from=&to=`)를 받는다.

## 8. 개발 전용 API (dev_index)

개발·검수 기간에만 활성화하며 운영 배포 시 비활성화한다. `POST /api/dev/session-inject`(가상 세션 강제 주입 — 일반/우수/게스트), `PUT /api/dev/mock-switch`(Mock API 온오프), `GET /api/dev/health`(로컬/서버 DB·Nginx 핑 상태)를 제공한다. 이들은 인증된 개발자 환경에서만 노출되도록 환경 변수로 게이트한다.

## 9. 3사 LLM 호출 계약 (백엔드 내부)

오케스트레이터는 3사 API에 동일한 시스템 프롬프트를 결합해 정형 JSON Mode/Structured Output을 강제한다. 모든 모델이 아래 동일 구조로만 응답하도록 한다.

```json
{
  "ai_engine": "Gemini | ChatGPT | Claude",
  "recommended_components": { "cpu": "모델명", "gpu": "모델명", "ram": "규격", "ssd": "용량" },
  "total_estimated_price": 1250000,
  "ai_mentoring_reason": "한 줄 추천 사유"
}
```

이 구조가 깨지거나 7초를 초과한 모델은 Drop되며, 나머지 정상 응답만으로 내부 검증을 진행한다. API Key는 서버 `.env`에서만 읽고 프론트에 절대 노출하지 않는다.

---

8단계 산출물이 완성되었습니다. 추천·스왑·장바구니·인증·관리자·분석·개발용 엔드포인트와 3사 LLM 내부 계약까지, 요청/응답 JSON 규격과 표준 에러 코드를 모두 확정했습니다. 이 명세 덕분에 프론트(api-client.js)와 백엔드(routes/)가 같은 계약으로 분리 개발됩니다.
