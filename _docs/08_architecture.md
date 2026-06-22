이 문서는 시스템의 전체 구조와, 추천 요청 한 건이 들어왔을 때 어떤 모듈들이 어떤 순서로 맞물려 동작하는지를 흐름도로 정리합니다. 특히 비용 안전(Mock·Circuit Breaker·Rate Limit), 7초 Fail-safe, PII 마스킹, 4단계 검증이 어디서 작동하는지 명확히 합니다.

---

# 08. 소프트웨어 아키텍처 정의

**파일 경로:** `_docs/08_architecture.md`
**문서 버전:** Ver 1.0
**선행 문서:** `06_db-erd.md`, `07_api-spec.md`

## 1. 아키텍처 개요

본 시스템은 5개 계층으로 구성된다. 사용자 브라우저의 **프론트엔드(Vite/React SPA + 인터랙션 상태)**, 요청을 받는 **Nginx 리버스 프록시**, 비즈니스 로직을 처리하는 **Node.js 백엔드**, 데이터를 저장하는 **PostgreSQL(+ 인메모리/Redis 캐시)**, 그리고 외부의 **3사 LLM API**와 **기존 쇼핑몰**이다. 핵심 설계 사상은 "외부 비용이 새거나 조립 불가능한 제품이 팔리는 것을 시스템이 구조적으로 막는다"이다.

```
[브라우저: Vite/React SPA]
        │ HTTPS
        ▼
[Nginx 리버스 프록시] ── 정적 파일 서빙 + /api 프록시
        │
        ▼
┌───────────────────────────────────────────────┐
│ [Node.js 백엔드]                                │
│  미들웨어: auth(JWT/SSO) → pii-mask             │
│  라우트: recommend / products / admin / analytics│
│  서비스: orchestrator · validator · compatibility│
│         cost-guard · rate-limiter               │
│  LLM 어댑터: gemini · openai · claude · mock     │
└───────────────────────────────────────────────┘
   │              │                  │
   ▼              ▼                  ▼
[PostgreSQL]  [캐시(인메모리/Redis)]  [외부: 3사 LLM]
   │
   └──(장바구니 릴레이)──> [기존 쇼핑몰 결제]
```

## 2. 계층별 책임

**프론트엔드**는 React 컴포넌트 렌더링, 실시간 프롬프트 빌더, Recharts 시각화, 부품 스왑 UI를 담당하며 외부 LLM을 직접 호출하지 않는다(보안·비용 통제). **Nginx**는 빌드된 SPA 정적 파일을 서빙하고 `/api` 요청을 Node.js로 프록시하며 HTTPS를 종단한다. **Node.js 백엔드**는 인증·마스킹·오케스트레이션·검증·비용통제를 수행하는 두뇌다. **PostgreSQL**은 상품·로그·정책·견적을 영속 저장하고, **캐시 계층**은 Rate Limit 카운터와 품절 무효화 신호를 담당한다(초기 인메모리, 확장 시 Redis).

## 3. 추천 요청 전체 흐름 (핵심 시퀀스)

`POST /api/recommend` 한 건이 들어왔을 때의 전 과정이다. 비용·보안 게이트가 가장 앞에 위치한다.

```
[1] 요청 수신
     │
     ▼
[2] auth 미들웨어 — JWT/게스트 식별
     │
     ▼
[3] rate-limiter — 카운터 대조
     │  초과? ──예──→ 429 RATE_LIMIT_EXCEEDED (외부 미호출, 종료)
     │  아니오 → 카운터 +1
     ▼
[4] cost-guard — 일일 비용 임계치 확인
     │  초과? ──예──→ 503 COST_CIRCUIT_OPEN (외부 미호출, 종료)
     │  아니오
     ▼
[5] use_mock 확인
     │  true? ──예──→ mock.js에서 사전 JSON 반환 → [9]로 점프(외부 미호출)
     │  false
     ▼
[6] pii-mask — 정규식으로 개인정보 *** 마스킹
     │
     ▼
[7] orchestrator — 시스템 프롬프트 결합 + JSON Mode 강제
     │  Promise.allSettled로 3사 동시 호출
     │  7초 타임아웃 타이머 가동
     │  ┌ Gemini  ─응답─┐
     │  ├ ChatGPT ─타임아웃→ Drop
     │  └ Claude  ─응답─┘
     │  (정상 응답만 수집, JSON 깨진 모델 Drop) ← Fail-safe
     ▼
[8] 토큰·비용 기록 → api_cost_logs / logs 적재
     │
     ▼
[9] validator — 4단계 검증
     │  1) 실시간 재고 대조 (status='판매중'만)
     │  2) 호환성 연산 (compat_rules) — 위반 Drop
     │  3) 마진·예산 평가 (policy_weights 가중치)
     │  4) 점수 합산 → 최고점 1안을 Top Pick
     ▼
[10] 가성비/추천/고성능 3세트 구성 + 차트 데이터 생성
     │
     ▼
[11] recommendations 저장 → 응답 반환
```

이 순서의 핵심은 **3·4·5단계가 외부 호출 이전에 있다**는 점이다. 즉 한도 초과·비용 차단·Mock 모드면 외부 LLM을 한 번도 호출하지 않아 비용이 0이다.

## 4. Fail-safe 메커니즘 (7초 타임아웃)

오케스트레이터는 `Promise.allSettled`로 3사를 동시에 호출하고, 별도의 7초 타이머를 둔다. 7초 내 응답하지 못하거나 응답 JSON 구조가 깨진 모델은 즉시 Drop하고, 정상 도착한 모델의 결과만으로 검증을 계속한다. 3사 모두 실패한 경우에만 `LLM_ALL_FAILED`를 반환한다. 응답 메타(`responded_models`, `dropped_models`, `elapsed_ms`)를 함께 내려 프론트와 관리자가 어떤 모델이 빠졌는지 추적한다.

## 5. 비용 안전 3중 방어 (Mock · Circuit Breaker · Rate Limit)

비용은 세 겹으로 막는다. 첫째 **Mock 스위치**는 개발·테스트 기본값으로, 외부 통신을 물리적으로 차단하고 사전 저장 JSON을 반환한다. 둘째 **Circuit Breaker(cost-guard)**는 `api_cost_logs`의 일일 누적 달러가 관리자 설정 임계치(예: $50)에 도달하면 외부 라우터를 강제 차단하고 사용자에게 점검 레이어를 띄운다. 셋째 **Rate Limit(rate-limiter)**는 회원 등급·IP별 일일 호출 횟수를 카운터로 대조해 초과 시 429를 반환하고 외부 호출을 막는다. 이 셋은 모두 외부 호출 이전 단계에 위치해 비용 발생을 사전 차단한다.

## 6. 관리자 제품 소싱 AI 파싱 흐름

`POST /api/admin/sourcing/parse`는 추천 생성과 별개의 관리자 업무 흐름이지만, 외부 LLM 비용과 개인정보 위험을 동일하게 통제한다. 처리 순서는 `auth → rate-limiter → cost-guard → mock → pii-mask → sourcing-parser → schema-validator`를 따른다.

관리자가 `adm-sourcing` 화면의 오른쪽 패널에 거래처 메신저·문자·이메일 원문을 붙여넣으면 백엔드는 원문을 보존 가능한 최소 단위로 받아 제품명, 카테고리, 요청수량, 납품가능수량, 단가, VAT 여부, 거래처, 담당자, 기록일시를 구조화한다. 화면 기본 provider는 Gemini이며, Mock Mode가 ON이면 외부 호출 없이 사전 정의 JSON을 반환한다. Real Mode에서는 선택 provider에 따라 Gemini 또는 OpenAI를 호출하며, `Promise.allSettled`와 7초 타임아웃을 적용하고, JSON 구조 검증에 실패한 모델은 Drop한다. 전체 모델이 실패한 경우에만 `LLM_ALL_FAILED`를 반환한다.

AI가 추출한 제품명과 카테고리는 저장 전에 상품 마스터(`products`) 기준 후보 검색을 거친다. 후보가 있으면 `products.product_name`, `products.part_type`을 정규값으로 사용하고, 후보가 없거나 복수 후보가 있으면 운영자가 `adm-sourcing` 미리보기에서 상품 마스터 항목 또는 카테고리를 직접 선택한 뒤 확정 저장한다.

정제 결과는 확정 전 미리보기 상태로 프론트에 전달된다. 관리자가 확정하면 `POST /api/admin/sourcing/confirm`에서 소싱 배치와 항목을 저장하고, `sourcing-match.service`가 상품 마스터 후보를 산출한다. 후보가 없으면 `매칭필요`, 후보가 2개 이상이면 `후보복수`, 관리자가 직접 선택하면 `매칭완료` 상태로 관리한다.

## 7. 검증 엔진(validator) 상세

검증은 4단계로, 각 단계가 후보를 걸러낸다. 1단계 재고 대조는 제안 부품이 `products`에 존재하고 `status='판매중'`인지 확인하며, 품절·단종은 즉시 제외한다(품절 1초 반영은 쿼리 조건 + 캐시 무효화로 보장). 2단계 호환성은 `compat_rules`와 `product_specs`로 소켓·메모리·전력·물리 치수를 연산하며, 고급자 모드에서는 하드 제약(브랜드 고정) 위반과 1mm 초과 물리 충돌을 강제 Drop한다. 3단계는 예산 적합성과 `policy_weights` 가중치로 마진을 점수화한다. 4단계는 점수를 합산해 최고점 1안을 Top Pick으로 확정한다.

## 8. 단방향 배포 흐름과의 연계

코드 산출물은 `_publish`의 Vite/React SPA 원본을 기준으로 `app` 개발본에 편입한 프론트와, `app/server` 백엔드로 구성한다. 로컬에서 검증된 산출물이 Git을 통해 Ubuntu 개발 서버로 배포되며, Nginx가 빌드된 SPA 정적 파일과 `/api` 프록시를 담당한다. `dev-hub`의 진척도 매트릭스가 각 화면의 Screen 키 기준 이관·배포 상태를 추적한다.

## 9. 보안 아키텍처

API Key는 서버 `.env`에만 저장하고 백엔드 서버사이드에서만 메모리로 호출하며, 소스·Git·프론트·관리자 화면 어디에도 평문 노출하지 않는다(관리자 화면에서도 `***` 마스킹). 사용자 프롬프트는 외부 LLM 전송 전 pii-mask 미들웨어가 정규식으로 개인정보를 마스킹한다. 인증은 기존 쇼핑몰 SSO로 위임하고 JWT로 세션을 릴레이한다. 개발 전용 API(`/api/dev/*`)는 환경 변수로 게이트해 운영 배포 시 비활성화한다.

## 10. 확장성·성능 전략

초기에는 단순성을 위해 Rate Limit 카운터와 캐시를 **인메모리**로 구현하고, 트래픽 증가 시 **Redis**로 이관한다(코드는 캐시 인터페이스를 추상화해 교체 비용을 낮춘다). DB는 복합 인덱스(logs·products)로 대량 조회 성능(0.5초/0.3초)을 보장한다. 백엔드는 PM2로 프로세스를 관리해 무중단 재시작과 다중 인스턴스 확장을 지원한다. 로그 적재량이 많으므로 logs 테이블은 향후 파티셔닝(월 단위)을 고려한다.

## 11. 장애 대응 원칙

각 외부 의존성의 장애를 독립적으로 격리한다. LLM 장애는 Fail-safe로 흡수하고, 쇼핑몰 결제 연계 장애는 견적을 보관해 재시도 가능하게 하며, DB 연결 예외는 dev_index의 인디케이터(청/적 전구)로 즉시 가시화하고 'Show all databases' 가이드를 노출한다. 캐시 장애 시에는 DB 직접 조회로 폴백(graceful degradation)해 서비스가 멈추지 않게 한다.

---

9단계 산출물이 완성되었습니다. 5계층 구조, 추천 요청 11단계 전체 시퀀스, 7초 Fail-safe, 비용 3중 방어, 4단계 검증 엔진, 보안·확장·장애 대응까지 모두 정의해 Codex가 백엔드 골격을 정확히 잡을 수 있게 했습니다.

