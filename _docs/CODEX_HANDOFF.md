이 문서는 `_publish`에 생성된 Vite/React 와이어프레임 소스를 Codex가 받아 실제 동작하는 프로그램(`app`)으로 만들 때의 규칙입니다. 현재 `_publish`는 화면별 HTML이 아니라 `_publish/index.html` + `_publish/src/app/App.tsx` 기반 SPA이므로, 인계 단위는 정적 파일 경로가 아니라 `Screen` 키와 React 컴포넌트입니다.

---

# CODEX_HANDOFF — Codex 인계 규칙

**파일 경로:** `_docs/CODEX_HANDOFF.md`
**문서 버전:** Ver 1.0
**선행 문서:** `STITCH_RULES.md`, `07_api-spec.md`, `08_architecture.md`

## 1. 이 문서의 목적

Stitch/Figma Make 계열 산출물은 화면의 골격(React 컴포넌트·CSS·기본 인터랙션)을 `_publish/`에 만든다. Codex는 이 React 앱 구조를 `app/` 개발본으로 편입하거나 컴포넌트 단위로 분리한 뒤, 더미 데이터와 상태 연출을 실제 API·DB·Mock 응답에 연결한다. Codex에 작업을 지시할 때 이 문서와 `07_api-spec.md`를 함께 첨부한다.

## 2. 이관 절차 (단방향, 필수 준수)

이관은 다음 순서로만 진행한다. 첫째, `_docs/01_sitemap.md`와 `_docs/02_file-list.md`의 화면 ID ↔ `Screen` 키 ↔ React 컴포넌트 매핑을 확인한다. 둘째, `_publish/` 원본은 그대로 보존하고, 개발본에는 `_publish` 앱 전체를 편입하거나 `App.tsx`의 화면 컴포넌트를 분리해 가져온다. 셋째, 개발본 사본에만 데이터 바인딩·이벤트·API 연동을 추가한다. 넷째, 디자인 변경이 필요하면 `_publish` 산출물을 재생성한 뒤 다시 편입한다. 다섯째, 이관 상태는 `_docs/02_file-list.md`의 매핑 또는 별도 개발 추적 문서에 기록한다.

Codex는 어떤 경우에도 `_publish/` 디렉토리의 파일을 수정하지 않는다. 이것이 단방향 원칙의 핵심이다.

## 3. data-bind 매핑 규칙

Stitch가 `data-bind="필드명"`을 단 요소는 API 응답의 해당 필드로 텍스트를 채운다. 매핑은 `07_api-spec.md`의 응답 스키마를 기준으로 한다.

| data-bind 값 | 연결 대상(API 응답 경로) | 화면 |
|--------------|------------------------|------|
| `total_price` | `data.sets[].total_price` (원화 포맷) | result, result-expert |
| `ai_engine` | `data.sets[].ai_engine` | result |
| `pc_image` | `data.sets[].image_url` (없으면 기본 이미지) | result |
| `local_db`/`server_db`/`nginx` | `GET /api/dev/health` 결과 | dev_index |
| `cost_gemini` 등 | `GET /api/admin/cost` 모델별 | dashboard, dev_index |
| 가중치 슬라이더 | `GET /api/admin/policy/weights` | dev_index, category-policy |

금액은 천 단위 콤마 + "원"으로 포맷하고, 수치 없는 경우 빈 문자열이 아닌 "—"로 표기한다. 바인딩 실패(필드 누락) 시 콘솔 에러 대신 안전한 기본값을 표시한다.

## 4. data-repeat 매핑 규칙

`data-repeat="컬렉션명"`이 달린 요소는 첫 자식을 템플릿으로 삼아 배열만큼 복제 렌더링한다.

| data-repeat 값 | 연결 배열 | 항목 바인딩(data-bind-item) |
|----------------|----------|---------------------------|
| `components` | `data.sets[].components` | cpu/gpu/ram/ssd/mb/power/case |
| `alternatives` | `POST /api/swap/candidates` 결과 | 대안명 + 가격차 |
| `chain_options` | `swap/validate`의 `chain_solution.options` | 부품명 + extra_price |
| `products` | `GET /api/admin/products` items | 상품코드/명/카테고리/상태 |
| `keywords` / `swap_items` / `funnel_steps` | 각 분석 API | 순위·명칭·수치 |

복제 시 템플릿 요소는 1개만 유지하고 나머지는 동적 생성한다. 빈 배열이면 화면에 포함된 `empty-result`(hidden) 요소를 노출한다.

## 5. data-action 매핑 규칙

`data-action="동작명"` 버튼·링크에 이벤트 핸들러를 연결한다. 핸들러는 `app/src/`의 해당 모듈 함수를 호출한다.

| data-action | 동작 | 호출 위치 |
|-------------|------|----------|
| `recommend` | `/api/recommend` 호출 → 로딩 표시 → 결과 페이지 이동 | api-client.js |
| `next-step`/`prev-step` | 단계 이동(입력값 세션 보존) | (라우팅) |
| `select-set` | 가성비/추천/고성능 탭 전환 + 차트 갱신 | chart-render.js |
| `swap-part` | `/api/swap/candidates` → 대안 팝업 열기 | swap-handler.js |
| `apply-chain-swap` | `/api/swap/validate` 승인 → 파워 교체 + Error 해제 | swap-handler.js |
| `add-cart` | `/api/cart/relay` → 쇼핑몰 결제 이동 | api-client.js |
| `inject-session` | `/api/dev/session-inject` (개발용) | session-inject.js |
| `toggle-mock` | `/api/dev/mock-switch` (개발용) | session-inject.js |
| `search-products`/`edit-product`/`save-product`/`run-upsert`/`toggle-status` | 관리자 CRUD | api-client.js + admin |
| `preview-static`/`preview-live`/`copy-prompt` | dev_index 링크·복사 | (게이트 전용) |

`recommend`·`add-cart` 같은 비용·결제 동작은 호출 전 Rate Limit·Mock 상태를 백엔드가 검사하므로 프론트는 응답 코드(429/503)에 맞는 안내만 처리한다.

## 6. data-chart 매핑 규칙

`<canvas data-chart="차트명">`에 Chart.js를 연결하고, `05_design-guide.md` 5항의 색상 규격을 따른다.

| data-chart | 차트 종류 | 데이터 출처 | 색상 |
|------------|----------|------------|------|
| `fps-bar` | 막대(성능 FPS) | `sets[].chart.fps` | Primary 계열 |
| `price-pie` | 원형(가격 비중) | `sets[].chart.price_ratio` | CPU/GPU·메모리·기타 3색 |
| `low-fps`/`benchmark` | 막대/게이지 | 전문가 결과 | Primary |
| `cost-line` | 라인(비용 추이) | `/api/admin/cost` | 모델별 3색 |
| `keyword-rank`/`swap-bar`/`funnel` | 랭킹·깔대기 | 분석 API | Primary 명도 단계 |

차트는 데이터 도착 후 렌더링하며, Mock 모드에서는 `_mock/`의 JSON으로 렌더링해 비용 없이 시각화를 검증한다.

## 7. 예외·상태 토글 규칙

Stitch가 `hidden`으로 포함해둔 예외 UI는 Codex가 조건에 따라 노출만 토글한다. 새 마크업을 만들지 않는다. 호환성 위반 시 `compat-status--error`를 노출하고 장바구니/결제 버튼에 `btn--disabled` + `disabled` 속성을 부여한다. 로딩 중에는 `loading-layer`를 노출한다. 빈 결과는 `empty-result`를 노출한다. 연쇄 스왑 필요 시 해당 안내 박스를 노출하고 승인 시 Error 상태를 자동 해제한다(`08_architecture.md` 6항 흐름과 일치).

## 8. 화면 식별·라우팅 규칙

현재 `_publish` 화면은 `data-screen-id`가 아니라 `Screen` union 키와 `screenMap`으로 식별한다. 화면 전환은 `<a href>`가 아니라 `navigate("screen-key")` 호출로 처리한다. 입력값 보존이 필요한 단계 이동은 개발본에서 React state, context, store, sessionStorage 중 하나를 선택해 명시적으로 유지한다. GNB 로고 클릭은 상태 초기화 후 `landing`으로 이동한다.

## 9. 보안·비용 준수 규칙

프론트는 외부 LLM API를 직접 호출하지 않으며 반드시 `/api/recommend`를 경유한다. API Key·개인정보를 프론트 코드·로컬 스토리지에 평문 저장하지 않는다. 개발 전용 동작(`inject-session`, `toggle-mock`)은 개발 환경에서만 활성화되고 운영 빌드에서 비활성화한다. 기본 Mock 모드를 유지해 개발 중 외부 비용을 0으로 둔다.

## 10. 인계 완료 체크리스트

화면별 이관 후 다음을 확인한다. 해당 `Screen` 키가 요구사항 ID와 맞는가, React 컴포넌트의 더미 데이터가 실제 API/Mock 응답으로 교체됐는가, 버튼 핸들러가 API 클라이언트와 연결됐는가, Recharts 차트가 규격 색으로 렌더링되는가, 예외 UI 토글이 동작하는가, `_publish/` 원본을 수정하지 않았는가, Mock 모드에서 비용 없이 전 화면이 작동하는가를 점검하고 이관 상태를 개발 추적 문서에 기록한다.

---

12단계 산출물이 완성되었습니다. 이제 Stitch가 심은 모든 자리표시자(`data-bind`/`data-repeat`/`data-action`/`data-chart`)가 어떤 API 필드·함수·차트에 1:1로 연결되는지 표로 확정되어, Codex가 정적 화면을 받아 추측 없이 로직을 얹을 수 있고 `_publish` 원본을 건드리지 않는 단방향 이관이 코드 레벨에서 보장됩니다.
