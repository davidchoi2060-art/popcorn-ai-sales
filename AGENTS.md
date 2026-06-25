# AGENTS.md

팝콘PC AI 조립PC 추천 시스템. 이 문서는 **탐색 없이 바로 작업**하기 위한 지도다.
새 작업 전에 이 파일을 먼저 읽으면 프로젝트를 다시 훑을 필요가 없다 → 토큰 절약의 1순위.

> 동일 파일이 `app/server/AGENTS.md`, `app/public/AGENTS.md`에도 있다. **이 루트 파일이 정본(canonical)**이며, 규칙 갱신은 여기서만 한다.

---

# 0. 프로젝트 지도 (먼저 여기서 찾고, 없으면 탐색)

## 스택 / 실행
- **프론트**: Vite 6 + React 19 + Tailwind v4 (TypeScript). URL 라우팅 없음 — `Screen` 상태값으로 화면 전환.
- **백엔드**: 순수 Node `http` 서버 (Express 아님). `app/server/server.js`가 `url.pathname.match(...)`로 라우팅.
- **DB**: PostgreSQL `popcorn_pc` @ `100.123.164.85:5433` (user `postgres`). 비밀번호는 **`PGPASSWORD` 환경변수로만** 주입 — 코드/문서에 하드코딩 금지. 상품 약 24,000건.
- 앱 본체는 리포 루트가 아니라 **`app/` 하위**에 있다.

```bash
# 개발 실행 (두 프로세스, 둘 다 app/ 에서)
PGPASSWORD=*** PORT=3000 node server/server.js        # API → http://127.0.0.1:3000
npm run dev -- --host 0.0.0.0 --port 5173             # 프론트 → :5173, /api 를 3000으로 프록시
curl -s http://127.0.0.1:3000/api/dev/health          # db.ok:true 면 연결 성공
```
- env: `PORT=3000`, `USE_MOCK=true`, `DEV_TOOLS_ENABLED=true` (`app/.env.example` 참고. **dotenv 미사용** → 실행 시 직접 export).
- **타입체크 도구 없음**(tsc 미설치). 변경 검증은 `npm run build`(vite/esbuild, 타입은 미검사) + 서버 파일은 `node --check <file>`.
- `server.js`는 정적 파일을 서빙하지 않는다(개발은 vite 프록시 전제). 운영 배포는 별도 구성 필요(`_docs/10_infra-deploy.md`).

## 디렉터리 / 파일 크기 (줄 수 = 통째로 읽기 전 비용 판단용)
```
app/
├─ server/                         순수 Node API
│  ├─ server.js (290)             라우팅 진입점 — 새 엔드포인트는 여기 match+dispatch 추가
│  ├─ routes/                     요청 핸들러 (success/failure 래퍼, requireAdmin)
│  ├─ services/                   DB·비즈니스 로직 (pool.query)
│  ├─ llm/                        claude.js openai.js gemini.js mock.js sourcing-parser.js
│  ├─ middlewares/                auth.js  pii-mask.js
│  └─ db/pool.js                  pg 커넥션 풀 (PG* env)
├─ db/migrations/                 001~008 .sql (누적·버전드)
└─ src/app/
   ├─ App.tsx (78)                Screen 상태 + screenMap + navigate()
   ├─ types.ts (13)               Screen 유니온 타입
   ├─ api/{client.ts(172), admin.ts(397), recommend.ts}   fetch 래퍼 + 엔드포인트
   └─ screens/{landing,beginner,expert,admin}/...
```
**대형 파일 — 절대 통째로 읽지 말 것. Grep으로 심볼 찾고 offset/limit 범위만 읽기:**
| 파일 | 줄 |
|---|---|
| `src/app/screens/admin/AdminV3Screens.tsx` | **3011** |
| `src/app/screens/beginner/BeginnerScreens.tsx` | 1372 |
| `src/app/screens/expert/ExpertScreens.tsx` | 1014 |
| `src/app/screens/landing/LandingScreens.tsx` | 834 |
| `server/services/product.service.js` | ~478 |
| `api/admin.ts` | 397 |

## 백엔드 라우트 ↔ 서비스 (엔드포인트 빨리 찾기)
| 영역 | 라우트 파일 | 서비스 파일 |
|---|---|---|
| 추천(LLM) | `routes/recommend.js` | `services/orchestrator.js` `validator.js` `cost-guard.js` `rate-limiter.js` |
| 상품 | `routes/admin.products.js` `routes/products.js` | `services/product.service.js` `compatibility.js` |
| 소싱(견적 파싱·매칭) | `routes/admin.sourcing.routes.js` | `services/sourcing*.service.js` + `llm/sourcing-parser.js` |
| 운영자 인증·관리 | `routes/admin.operators.routes.js` | `services/operator.service.js` |
| 변경요청 게시판 | `routes/admin.change-requests.routes.js` | `services/change-request.service.js` |
| 가격/마진 정책 | `routes/admin.policy.js` | `services/policy.service.js` |
| 개발/헬스 | (server.js 내) | `services/dev.service.js` |

## 프론트 화면 시스템
- 전환: `navigate("screen-id")` → `App.tsx`의 `screenMap`에서 컴포넌트 매핑(URL 변화 없음).
- 화면 ID는 `types.ts`의 `Screen` 유니온: `landing` / `auth-modal` / `beg-step1..5,beg-result,beg-detail` / `exp-step1..5,exp-result,exp-detail` / `adm-*`(dashboard, product-master, sourcing, operators, board 등) / `dev-hub`.
- API 호출은 `api/*.ts`에 집중. 응답은 항상 `{success, data}` / `{success:false, error:{code,message}}`.

## DB 마이그레이션
`001` 코어 스키마(products, categories, users, logs, recommendations, 정책/비용/레이트리밋) · `002` spec values · `003` price bigint · `004` 정규화 테이블 · `005` 표준화 reset · `006` 소싱 테이블 · `007` 운영자 인증(admin_operators + activity_logs) · `008` 변경요청.
- 활동로그 FK는 `ON DELETE SET NULL` (운영자 행 삭제해도 로그 보존).
- 상태 CHECK 제약 주의: `admin_operators.status ∈ {활성,비활성,초대중}`.

## 설계 문서 (`_docs/`) — 필요할 때만, 한 번만 읽기
| 상황 | 문서 |
|---|---|
| 화면/네비 | `01_sitemap.md` |
| 파일 위치 상세 | `02_file-list.md` (30K, 큼) |
| API 규격 | `07_api-spec.md` |
| 비즈니스 로직/오케스트레이션 | `08_architecture.md` |
| DB ERD | `06_db-erd.md` · 데이터 정규화 | `12_data_normalization.md`(54K, 큼) |
| 배포 | `10_infra-deploy.md` |

설계 문서와 코드가 충돌하면 **문서 우선**. 문서에 정의된 값을 추측하지 말 것.

---

# 1. 토큰 절약 규칙 (최우선 — 위반이 비용의 대부분)

1. **새 작업 시작 = 이 AGENTS.md부터.** 0번 지도에 답이 있으면 탐색하지 않는다.
2. **대형 파일 통째 읽기 금지.** 먼저 `Grep`으로 함수/엔드포인트/심볼 위치를 찾고, `Read`는 `offset/limit`로 해당 범위만. (특히 AdminV3Screens.tsx 3011줄)
3. `app` / `src` / `server` **전체 읽기 금지.** 필요한 파일만.
4. **이미 읽은 파일·문서 재로딩 금지.** 대화 내 확립된 사실 재확인 금지.
5. `node_modules`, `_publish`, `_archive`, `app/dist` 탐색·수정 금지(벤더/빌드 산출물).
6. 광범위 조사가 불가피하면 **Explore/Agent에 위임**해 결과 요약만 받는다(메인 컨텍스트 보존).

---

# 2. 작업 원칙

**최소 변경.** 요청 범위 외 수정 금지.
- 허용: 버그 수정 · 기능 구현 · API 연결
- 금지: 대규모 리팩토링 · 폴더구조/네이밍/스타일 변경 · 미요청 최적화

화면 구조(HTML/JSX 트리)는 유지. 필요 시 data attribute · event binding 추가만 허용.

---

# 3. 백엔드 규칙

**recommend 흐름 순서 고정(변경 금지):**
`auth → rate-limiter → cost-guard → mock → pii-mask → orchestrator → validator`

**LLM 호출:** `Promise.allSettled` + 7초 타임아웃 + JSON 구조 검증 + 실패 모델 Drop + 전체 실패만 에러.

**비용 보호:** 외부 LLM 호출 전 반드시 `Rate Limit → Cost Guard → Mock Mode` 검사 후에만 호출.

**API 응답 형식(임의 필드 추가 금지):**
```json
{ "success": true, "data": {} }
{ "success": false, "error": { "code": "", "message": "" } }
```
규격은 `_docs/07_api-spec.md`가 절대 기준.

---

# 4. 검증 규칙

수정한 기능만 검증(전체 테스트 금지). 예: recommend 수정 → recommend만.
- 프론트 변경: `cd app && npm run build` (esbuild 변환/번들 성공 확인).
- 서버 변경: `node --check app/server/.../changed.js`.
- DB 연동 동작: API 띄우고 `curl /api/dev/health` → `db.ok:true` 확인.

오류 로그만 유지. `console.log` 남발 금지, 완료 시 제거.

---

# 5. 절대 금지

`_publish`/`_archive`/`app/dist` 수정 · API Key·비밀번호 출력 · `.env` 무단 생성 · 전체 프로젝트 분석 · 무단 리팩토링/최적화 · 설계 변경 · **DB 스키마 무단 변경**(마이그레이션은 명시 요청 시에만).

**우선순위:** 1) 설계 준수 2) 정확성 3) 토큰 절약 4) 개발 속도. 성능 최적화는 명시 요청 시에만.

---

# 6. 운영 메모 — 우분투 서버

GitHub: `https://github.com/davidchoi2060-art/popcorn-ai-sales.git`
서버 경로: `popcornpc@popcornpc-B860M-AORUS-ELITE:/srv/projects/popcorn-ai-sales`

```bash
# 최초
cd /srv/projects && git clone https://github.com/davidchoi2060-art/popcorn-ai-sales.git
# 갱신
cd /srv/projects/popcorn-ai-sales && git pull origin main
# 실행은 0번 "스택/실행" 참고. DB(100.123.164.85)는 Tailscale 망 — 서버가 같은 망에 있어야 닿음.
```
