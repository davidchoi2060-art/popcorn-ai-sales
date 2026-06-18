# 02. 파일 · 디렉토리 구조서

**파일 경로:** `_docs/02_file-list.md`
**문서 버전:** Ver 1.0
**선행 문서:** `_docs/00_glossary.md`, `_docs/01_sitemap.md`

## 1. 최상위 디렉토리 개요

프로젝트 루트는 `popcorn-ai-system/`이며, 6개의 1차 디렉토리와 게이트 파일로 구성된다. 각 디렉토리는 명확한 책임과 담당 주체를 가진다.

| 디렉토리 | 책임 | 담당 도구/주체 | 수정 권한 |
|----------|------|---------------|----------|
| `dev_index.html` | 공용 진척 게이트 | Codex | 개발자 |
| `_docs/` | 모든 기획·설계 산출물 | 기획자 | 기획자 |
| `_publish/` | Stitch 정적 HTML 원본 | Google Stitch | **읽기 전용** |
| `app/` | 실제 개발본(로직 포함) | Codex | 개발자 |
| `_mock/` | 테스트·목 데이터 | Codex | 개발자 |
| `deploy/` | 인프라·배포 설정 | Codex | 개발자 |

핵심 원칙은 `_publish/`는 절대 직접 수정하지 않고 원본으로 보존하며, 개발은 `app/`에서만 이루어진다는 점이다.

## 2. 전체 디렉토리 트리

```
popcorn-ai-system/
│
├── dev_index.html                  ← 공용 진척 게이트
├── README.md                       ← 프로젝트 개요·실행법
│
├── _docs/                          ← [기획자] 산출물 문서
│   ├── 00_glossary.md
│   ├── 01_sitemap.md
│   ├── 02_file-list.md             (본 문서)
│   ├── 03_userflow.md
│   ├── 04_wireframe/               (와이어프레임 모음)
│   ├── 05_design-guide.md
│   ├── 06_db-erd.md
│   ├── 07_api-spec.md
│   ├── 08_architecture.md
│   ├── STITCH_RULES.md
│   ├── CODEX_HANDOFF.md
│   └── PROMPT_MASTER.txt
│
├── _publish/                       ← [Stitch 원본·읽기전용]
│   ├── _MAPPING.md                 ← 화면ID↔파일↔버전 매핑표
│   ├── assets/
│   │   ├── css/common.css
│   │   ├── js/common.js
│   │   └── img/
│   ├── User_Main/
│   │   ├── index.html
│   │   └── auth-modal.html
│   ├── Rec_Beginner/
│   │   ├── step1-purpose.html
│   │   ├── step2-budget.html
│   │   ├── step3-option.html
│   │   ├── step4-summary.html
│   │   ├── result.html
│   │   └── estimate-detail.html
│   ├── Rec_Expert/
│   │   ├── step1-priority.html
│   │   ├── step2-cpu-gpu.html
│   │   ├── step3-ram-ssd.html
│   │   ├── step4-power.html
│   │   ├── step5-review.html
│   │   ├── result-expert.html
│   │   └── estimate-detail-expert.html
│   ├── Admin_AI/
│   │   ├── dashboard.html
│   │   ├── monitoring.html
│   │   └── rate-limit.html
│   ├── Admin_Parts/
│   │   ├── master.html
│   │   ├── product-edit.html
│   │   ├── csv-import.html
│   │   └── category-policy.html
│   └── Admin_Analytics/
│       ├── keywords.html
│       ├── swap-report.html
│       └── funnel.html
│
├── app/                            ← [Codex 개발본]
│   ├── public/                     ← _publish에서 이관·정제된 화면
│   │   ├── assets/
│   │   ├── User_Main/
│   │   ├── Rec_Beginner/
│   │   ├── Rec_Expert/
│   │   ├── Admin_AI/
│   │   ├── Admin_Parts/
│   │   └── Admin_Analytics/
│   ├── src/                        ← 프론트 인터랙션 스크립트
│   │   ├── prompt-builder.js       (실시간 대괄호 치환)
│   │   ├── chart-render.js         (Chart.js 바인딩)
│   │   ├── swap-handler.js         (부품 스왑·연쇄 스왑)
│   │   ├── session-inject.js       (가상 세션 주입 - 개발용)
│   │   └── api-client.js           (백엔드 통신)
│   ├── server/                     ← 백엔드
│   │   ├── server.js               (진입점)
│   │   ├── routes/
│   │   │   ├── recommend.js        (/api/recommend)
│   │   │   ├── products.js         (상품 CRUD·검색)
│   │   │   ├── admin.js            (정책·비용·Rate Limit)
│   │   │   └── analytics.js        (로그·통계)
│   │   ├── services/
│   │   │   ├── orchestrator.js     (3사 LLM 병렬 호출)
│   │   │   ├── validator.js        (4단계 검증 엔진)
│   │   │   ├── compatibility.js    (호환성·물리 연산)
│   │   │   ├── cost-guard.js       (비용 관제·Circuit Breaker)
│   │   │   └── rate-limiter.js     (Redis 카운터)
│   │   ├── llm/
│   │   │   ├── gemini.js
│   │   │   ├── openai.js
│   │   │   ├── claude.js
│   │   │   └── mock.js             (Mock API 응답)
│   │   └── middlewares/
│   │       ├── auth.js             (SSO·JWT 검증)
│   │       └── pii-mask.js         (개인정보 마스킹)
│   ├── db/
│   │   ├── migrations/             (테이블 생성 SQL)
│   │   ├── seeds/                  (초기 시드 데이터)
│   │   └── pool.js                 (PostgreSQL 연결)
│   ├── package.json
│   └── .env.example                (키 없는 예시 - 실제 .env는 Git 제외)
│
├── _mock/                          ← [테스트 데이터]
│   ├── products-seed.csv           (CSV 정제본)
│   ├── llm-response-budget.json    (가성비 세트)
│   ├── llm-response-recommend.json (추천 세트)
│   └── llm-response-highend.json   (고성능 세트)
│
├── deploy/                         ← [배포·인프라]
│   ├── nginx.conf
│   ├── deploy.sh
│   ├── ecosystem.config.js         (PM2 프로세스)
│   └── QA_CHECKLIST.md
│
└── .gitignore                      ← .env, node_modules 등 제외
```

## 3. 화면 ID ↔ 파일 매핑 (이관 추적용)

이 표는 `_publish/_MAPPING.md`의 기준이 되며, 정적 원본이 개발본으로 이관될 때 추적에 사용한다. `이관 상태`는 단방향 이관 진행을 표시한다.

| 화면 ID | 정적 원본 (`_publish/`) | 개발본 (`app/public/`) | 이관 상태 |
|---------|------------------------|----------------------|----------|
| DEV-HUB-010 | (루트) `dev_index.html` | — | N/A |
| FR-LND-010 | `User_Main/index.html` | `User_Main/index.html` | 대기 |
| FR-LND-020 | `User_Main/auth-modal.html` | `User_Main/auth-modal.html` | 대기 |
| FR-BEG-010 | `Rec_Beginner/step1-purpose.html` | 동일 경로 | 대기 |
| FR-BEG-020 | `Rec_Beginner/step2-budget.html` | 동일 경로 | 대기 |
| FR-BEG-030 | `Rec_Beginner/step3-option.html` | 동일 경로 | 대기 |
| FR-BEG-050 | `Rec_Beginner/step4-summary.html` | 동일 경로 | 대기 |
| FR-BEG-090 | `Rec_Beginner/result.html` | 동일 경로 | 대기 |
| FR-BEG-110 | `Rec_Beginner/estimate-detail.html` | 동일 경로 | 대기 |
| FR-EXP-010 | `Rec_Expert/step1-priority.html` | 동일 경로 | 대기 |
| FR-EXP-020 | `Rec_Expert/step2-cpu-gpu.html` | 동일 경로 | 대기 |
| FR-EXP-030 | `Rec_Expert/step3-ram-ssd.html` | 동일 경로 | 대기 |
| FR-EXP-040 | `Rec_Expert/step4-power.html` | 동일 경로 | 대기 |
| FR-EXP-060 | `Rec_Expert/step5-review.html` | 동일 경로 | 대기 |
| FR-EXP-090 | `Rec_Expert/result-expert.html` | 동일 경로 | 대기 |
| FR-EXP-110 | `Rec_Expert/estimate-detail-expert.html` | 동일 경로 | 대기 |
| FR-ADM-010 | `Admin_AI/dashboard.html` | 동일 경로 | 대기 |
| FR-ADM-010 | `Admin_AI/monitoring.html` | 동일 경로 | 대기 |
| FR-ADM-020 | `Admin_AI/rate-limit.html` | 동일 경로 | 대기 |
| (검색) | `Admin_Parts/master.html` | 동일 경로 | 대기 |
| FR-ADM-040 | `Admin_Parts/product-edit.html` | 동일 경로 | 대기 |
| FR-ADM-030 | `Admin_Parts/csv-import.html` | 동일 경로 | 대기 |
| FR-ADM-050 | `Admin_Parts/category-policy.html` | 동일 경로 | 대기 |
| FR-ANA-010 | `Admin_Analytics/keywords.html` | 동일 경로 | 대기 |
| FR-ANA-020 | `Admin_Analytics/swap-report.html` | 동일 경로 | 대기 |
| FR-ANA-030 | `Admin_Analytics/funnel.html` | 동일 경로 | 대기 |

## 4. 이관 규칙 (단방향)

정적 원본을 개발본으로 옮길 때는 다음 순서를 따른다. 첫째, `_publish/`의 화면이 정적 검증(디자인 확정)을 통과하면 `_MAPPING.md`의 상태를 `로컬 검증 완료`로 갱신한다. 둘째, 해당 파일을 `app/public/`의 동일 경로로 복사한다. 셋째, Codex가 `app/public/`의 사본에 `src/`의 스크립트와 백엔드 연동 코드를 결합한다. 넷째, 이후 디자인 변경이 필요하면 `_publish/`에서 Stitch로 재생성한 뒤 다시 이관하며, `app/public/`을 직접 손대지 않는다. 이 규칙으로 디자인 원본과 개발본의 책임이 분리된다.

## 5. Git 관리 정책

`.gitignore`에는 `node_modules/`, `app/.env`, 로그 파일, 빌드 산출물을 반드시 포함한다. `.env.example`은 키 값을 비운 채로 커밋하여 다른 개발자가 환경 변수 구조만 참고할 수 있게 한다. 유료 API Key가 포함된 실제 `.env`는 어떤 경우에도 커밋하지 않는다.

## 6. 명명 규칙 요약

폴더는 도메인 단위로 파스칼/언더스코어를 혼용하되 사이트맵과 일치시킨다(`User_Main`, `Rec_Beginner`, `Admin_AI` 등). 화면 파일은 `kebab-case.html`(예: `step1-purpose.html`)을 사용한다. 스크립트는 `kebab-case.js`(예: `prompt-builder.js`)를 사용한다. 화면 ID는 모두 대문자 `FR-도메인-번호` 형식을 유지하며, 이 ID는 HTML 파일의 최상위 요소에 `data-screen-id` 속성으로도 심어 Codex와 dev_index가 추적할 수 있게 한다.

---
