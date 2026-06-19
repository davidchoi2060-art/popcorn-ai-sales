# 02. 파일 · 디렉토리 구조서

**파일 경로:** `_docs/02_file-list.md`  
**문서 버전:** Ver 3.0  
**기준 산출물:** `_publish/` Vite/React 정적 소스 + `app/` 개발본 분리 구조  
**갱신일:** 2026-06-19  
**주요 변경:** 관리자 백오피스 V3.0 사이트맵 반영


## 1. 최상위 디렉토리 개요

현재 프로젝트 루트는 `popcorn-ai-sales/`이며, `_publish/`의 실제 생성 결과는 기존 문서의 “화면별 HTML 폴더 구조”가 아니라 **Vite + React 단일 앱 구조**다.

| 경로 | 책임 | 담당 도구/주체 | 수정 권한 |
|------|------|---------------|----------|
| `_docs/` | 기획·설계·구조 문서 | 기획자 / Codex | 문서 갱신 시 수정 |
| `_publish/` | 와이어프레임 기반 정적 React 소스 원본 | Stitch / Figma Make 계열 산출물 | 원본 보존, 직접 수정 지양 |
| `app/` | 실제 개발본. 프론트 화면 분리 구조, 백엔드 API, DB, LLM 오케스트레이터, 관리자 V3.0 백오피스 연동 코드 | Codex | 개발자 |
| `_mock/` | 테스트·목 데이터 | Codex | 개발자 |
| `deploy/` | 인프라·배포 설정 | Codex | 개발자 |
| `README.md` | 프로젝트 개요 | Codex | 개발자 |

핵심 원칙은 `_publish/`를 “화면 원본”으로 보존하고, 실제 기능 연동은 `app/`에서 수행하는 것이다. 다만 `_publish`가 React 앱으로 생성되었으므로, 이관 시 화면별 HTML 복사가 아니라 React 앱 구조를 기준으로 편입 전략을 정해야 한다.
관리자 백오피스는 V3.0부터 기존 AI 비용 관제 중심 구조가 아니라, 실제 운영 우선순위에 맞춘 비즈니스 관리자 구조로 재정렬한다.  
따라서 `app/` 개발본의 관리자 화면은 `adm-dashboard` → `adm-product-master` → `adm-csv-import` → `adm-price-policy` → `adm-recommend-weights` → `adm-keywords` / `adm-click-report` / `adm-funnel` → `adm-system-limit` → `adm-operators` 순서로 관리한다.


## 2. 현재 `_publish/` 실제 구조

아래 구조가 2026-06-19 기준 실제 `_publish/` 소스다.

```text
_publish/
├── ATTRIBUTIONS.md
├── README.md
├── default_shadcn_theme.css
├── index.html
├── package.json
├── pnpm-workspace.yaml
├── postcss.config.mjs
├── vite.config.ts
├── guidelines/
│   └── Guidelines.md
└── src/
    ├── main.tsx
    ├── app/
    │   ├── App.tsx
    │   └── components/
    │       ├── figma/
    │       │   └── ImageWithFallback.tsx
    │       └── ui/
    │           ├── accordion.tsx
    │           ├── alert-dialog.tsx
    │           ├── alert.tsx
    │           ├── aspect-ratio.tsx
    │           ├── avatar.tsx
    │           ├── badge.tsx
    │           ├── breadcrumb.tsx
    │           ├── button.tsx
    │           ├── calendar.tsx
    │           ├── card.tsx
    │           ├── carousel.tsx
    │           ├── chart.tsx
    │           ├── checkbox.tsx
    │           ├── collapsible.tsx
    │           ├── command.tsx
    │           ├── context-menu.tsx
    │           ├── dialog.tsx
    │           ├── drawer.tsx
    │           ├── dropdown-menu.tsx
    │           ├── form.tsx
    │           ├── hover-card.tsx
    │           ├── input-otp.tsx
    │           ├── input.tsx
    │           ├── label.tsx
    │           ├── menubar.tsx
    │           ├── navigation-menu.tsx
    │           ├── pagination.tsx
    │           ├── popover.tsx
    │           ├── progress.tsx
    │           ├── radio-group.tsx
    │           ├── resizable.tsx
    │           ├── scroll-area.tsx
    │           ├── select.tsx
    │           ├── separator.tsx
    │           ├── sheet.tsx
    │           ├── sidebar.tsx
    │           ├── skeleton.tsx
    │           ├── slider.tsx
    │           ├── sonner.tsx
    │           ├── switch.tsx
    │           ├── table.tsx
    │           ├── tabs.tsx
    │           ├── textarea.tsx
    │           ├── toggle-group.tsx
    │           ├── toggle.tsx
    │           ├── tooltip.tsx
    │           ├── use-mobile.ts
    │           └── utils.ts
    ├── imports/
    │   ├── 00_glossary.md
    │   ├── 01_sitemap.md
    │   ├── 02_file-list.md
    │   ├── 05_design-guide.md
    │   ├── batch1-beginner.md
    │   ├── batch2-landing-expert.md
    │   ├── batch3-expert-admin.md
    │   ├── batch4-admin-parts.md
    │   └── batch5-funnel-gate.md
    └── styles/
        ├── fonts.css
        ├── globals.css
        ├── index.css
        ├── tailwind.css
        └── theme.css
```



## 3. `_publish` 실행 구조

| 파일 | 역할 |
|------|------|
| `_publish/package.json` | Vite 앱 실행·빌드 스크립트와 의존성 정의 |
| `_publish/index.html` | 브라우저 단일 진입 HTML |
| `_publish/src/main.tsx` | React root 생성, `App.tsx` 마운트, 전역 CSS 로드 |
| `_publish/src/app/App.tsx` | 전체 화면 컴포넌트, 화면 상태, 화면 전환, 더미 데이터 포함 |
| `_publish/src/app/components/ui/` | shadcn/Radix 기반 UI 컴포넌트 모음 |
| `_publish/src/styles/` | Tailwind 및 전역 스타일 |
| `_publish/src/imports/` | 생성 시 참조된 문서/프롬프트 복사본 |

실행 명령은 `_publish/README.md` 기준으로 다음과 같다.

```bash
npm i
npm run dev
```

단, `_publish/src/app/App.tsx` 내부 관리자 Screen 키는 기존 V2.0 명칭을 포함할 수 있다.  
개발본 `app/`에서는 V3.0 관리자 사이트맵 기준으로 Screen 키를 재정렬한다.

기존 `_publish` 관리자 Screen 키는 다음과 같이 해석한다.

| 기존 `_publish` Screen 키 | V3.0 개발본 Screen 키 | 처리 방향 |
|--------------------------|----------------------|-----------|
| `adm-dashboard` | `adm-dashboard` | 유지하되 비즈니스 대시보드로 내용 재구성 |
| `adm-monitoring` | `adm-system-limit` 또는 대시보드 미니 위젯 | 비용 관제 후순위 이동 |
| `adm-rate-limit` | `adm-system-limit` | Rate Limit + 비용 Threshold 통합 |
| `adm-master` | `adm-product-master` | 상품 마스터·재고 제어로 명확화 |
| `adm-product-edit` | `adm-product-master` 내부 편집 레이어 | 별도 화면보다 마스터 내 모달/패널 편집으로 통합 |
| `adm-csv` | `adm-csv-import` | CSV Upsert 역할 명확화 |
| `adm-category` | `adm-price-policy` | 카테고리 마진 정책으로 재정의 |
| `adm-keywords` | `adm-keywords` | 유지 |
| `adm-swap-report` | `adm-click-report` | 스왑 리포트 + 특가 CTR 통합 |
| `adm-funnel` | `adm-funnel` | 유지 |
| `adm-operators` | `adm-operators` | UI 설계 산출물 기준 운영자·권한 관리 화면 유지 |



## 4. 화면 ID ↔ Screen 키 ↔ 컴포넌트 매핑

기존의 `_publish/User_Main/*.html` 같은 화면별 파일은 현재 존재하지 않는다. 모든 화면은 `_publish/index.html`에서 시작하고 `_publish/src/app/App.tsx` 또는 개발본 `app/src/app/App.tsx`의 `screenMap`으로 렌더링된다.

사용자 화면은 기존 FR 계열 ID를 유지한다.  
관리자 화면은 V3.0부터 운영 우선순위를 명확히 하기 위해 `ADM-DSH`, `ADM-PRD`, `ADM-CSV`, `ADM-POL`, `ADM-ANA`, `ADM-SYS`, `ADM-OPS` 계열 ID를 사용한다.

### 4.1 게이트 / 랜딩 / 인증 / 사용자 화면

| 화면 ID | 화면명 | `_publish` 진입점 | Screen 키 | React 컴포넌트 | 기존 문서 경로 대체 |
|---------|--------|------------------|-----------|----------------|--------------------|
| DEV-HUB-010 | 통합 개발·운영 제어 허브 | `index.html` | `dev-hub` | `DevHub` | `dev_index.html` 대체 |
| FR-LND-010 | 메인 랜딩 페이지 | `index.html` | `landing` | `Landing` | `User_Main/index.html` 대체 |
| FR-LND-020 | SSO 인증 모달 | `index.html` | `auth-modal` | `AuthModal` | `User_Main/auth-modal.html` 대체 |
| FR-BEG-010 | 1단계 용도 선택 | `index.html` | `beg-step1` | `BegStep1` | `Rec_Beginner/step1-purpose.html` 대체 |
| FR-BEG-020 | 2단계 예산 선택 | `index.html` | `beg-step2` | `BegStep2` | `Rec_Beginner/step2-budget.html` 대체 |
| FR-BEG-030 | 3단계 감성 옵션 | `index.html` | `beg-step3` | `BegStep3` | `Rec_Beginner/step3-option.html` 대체 |
| FR-BEG-050 | 4단계 요약·편집 | `index.html` | `beg-step4` | `BegStep4` | `Rec_Beginner/step4-summary.html` 대체 |
| FR-BEG-090 | 결과 대시보드 | `index.html` | `beg-result` | `BegResult` | `Rec_Beginner/result.html` 대체 |
| FR-BEG-110 | 견적 상세·부품 스왑 | `index.html` | `beg-detail` | `BegDetail` | `Rec_Beginner/estimate-detail.html` 대체 |
| FR-EXP-010 | 1단계 우선순위·제조사 | `index.html` | `exp-step1` | `ExpStep1` | `Rec_Expert/step1-priority.html` 대체 |
| FR-EXP-020 | 2단계 CPU/GPU 세대 | `index.html` | `exp-step2` | `ExpStep2` | `Rec_Expert/step2-cpu-gpu.html` 대체 |
| FR-EXP-030 | 3단계 메모리/SSD | `index.html` | `exp-step3` | `ExpStep3` | `Rec_Expert/step3-ram-ssd.html` 대체 |
| FR-EXP-040 | 4단계 전력/쿨링 마진 | `index.html` | `exp-step4` | `ExpStep4` | `Rec_Expert/step4-power.html` 대체 |
| FR-EXP-060 | 5단계 검토·편집 | `index.html` | `exp-step5` | `ExpStep5` | `Rec_Expert/step5-review.html` 대체 |
| FR-EXP-090 | 전문가 결과 대시보드 | `index.html` | `exp-result` | `ExpResult` | `Rec_Expert/result-expert.html` 대체 |
| FR-EXP-110 | 견적 상세·연쇄 스왑 | `index.html` | `exp-detail` | `ExpDetail` | `Rec_Expert/estimate-detail-expert.html` 대체 |

### 4.2 관리자 V3.0 화면 매핑

| 화면 ID | 화면명 | `_publish` 진입점 | V3.0 Screen 키 | React 컴포넌트 권장명 | 기존 Screen 키 대체 | 주요 API |
|---------|--------|------------------|----------------|----------------------|--------------------|----------|
| ADM-DSH-010 | 통합 비즈니스 & 트렌드 대시보드 | `index.html` | `adm-dashboard` | `AdmDashboard` | `adm-dashboard` 유지 | `GET /api/admin/dashboard/business`, `GET /api/admin/cost` |
| ADM-PRD-010 | 마스터 상품 검색 및 실시간 품절 스위치 | `index.html` | `adm-product-master` | `AdmProductMaster` | `adm-master`, `adm-product-edit` 대체 | `GET /api/admin/products`, `PUT /api/admin/products/:code/status` |
| ADM-CSV-010 | 대량 상품 업데이트 CSV 업서트 | `index.html` | `adm-csv-import` | `AdmCsvImport` | `adm-csv` 대체 | `POST /api/admin/products/csv` |
| ADM-POL-010 | 부품 가격동향 및 카테고리 마진 통제 | `index.html` | `adm-price-policy` | `AdmPricePolicy` | `adm-category` 대체 | `PUT /api/admin/policy/margin` |
| ADM-POL-020 | AI 추천 엔진 가중치 제어 | `index.html` | `adm-recommend-weights` | `AdmRecommendWeights` | DevHub 일부 기능 분리 | `PUT /api/admin/policy/weights` |
| ADM-ANA-010 | 실시간 유저 관심 키워드 및 형태소 관제 | `index.html` | `adm-keywords` | `AdmKeywords` | `adm-keywords` 유지 | `GET /api/analytics/keywords` |
| ADM-ANA-020 | 부품 스왑 및 특가 클릭률 리포트 | `index.html` | `adm-click-report` | `AdmClickReport` | `adm-swap-report` 대체 | `GET /api/analytics/swap-report` |
| ADM-ANA-030 | 초보자/고급자 모드별 퍼널 이탈 관제 | `index.html` | `adm-funnel` | `AdmFunnel` | `adm-funnel` 유지 | `GET /api/analytics/funnel` |
| ADM-SYS-010 | AI 비용 제어 및 트래픽 서킷 브레이커 | `index.html` | `adm-system-limit` | `AdmSystemLimit` | `adm-monitoring`, `adm-rate-limit` 통합 | `GET /api/admin/rate-limit`, `PUT /api/admin/rate-limit`, `PUT /api/admin/cost/threshold` |
| ADM-OPS-010 | 운영자 및 권한 관리 | `index.html` | `adm-operators` | `AdmOperators` | UI 설계 산출물 기준 유지 | 운영자 계정·권한 관리 API 예정 |
| DEV-HUB-010 | 통합 개발 진척도 허브 | `index.html` | `dev-hub` | `DevHub` | `dev-hub` 유지 | 개발/검수 전용 |


## 5. 현재 `app/` 개발본 구조

`app/`는 실제 기능 개발본 영역으로 유지한다.  
`_publish`는 원본 보존용이며, 개발본에서는 화면 단위 분리 구조를 사용한다.

관리자 백오피스는 V3.0 사이트맵 기준으로 새 Screen 키와 컴포넌트 파일을 사용한다.

```text
app/
├── public/
│   └── assets/                         ← 정적 이미지, WebP, 아이콘 등
├── src/
│   └── app/
│       ├── App.tsx                     ← screenMap 및 전역 화면 전환
│       ├── types.ts                    ← Screen union 타입
│       ├── constants/
│       │   └── design.ts               ← 디자인 토큰, 컬러, 버튼 스타일
│       ├── layouts/
│       │   └── AppLayouts.tsx          ← UserLayout, AdminLayout
│       ├── components/
│       │   ├── common/
│       │   │   └── Navigation.tsx      ← GNB, Footer
│       │   └── ui/                     ← shadcn/Radix 기반 UI 컴포넌트
│       └── screens/
│           ├── landing/
│           │   └── LandingScreens.tsx
│           ├── beginner/
│           │   ├── BeginnerSteps.tsx
│           │   └── BeginnerResult.tsx
│           ├── expert/
│           │   ├── ExpertSteps.tsx
│           │   └── ExpertResult.tsx
│           ├── admin/
│           │   ├── AdmDashboard.tsx
│           │   ├── AdmProductMaster.tsx
│           │   ├── AdmCsvImport.tsx
│           │   ├── AdmPricePolicy.tsx
│           │   ├── AdmRecommendWeights.tsx
│           │   ├── AdmOperators.tsx
│           │   ├── AdmKeywords.tsx
│           │   ├── AdmClickReport.tsx
│           │   ├── AdmFunnel.tsx
│           │   ├── AdmSystemLimit.tsx
│           │   └── AdmOperators.tsx
│           └── dev/
│               └── DevHub.tsx
├── server/
│   ├── routes/
│   │   ├── recommend.routes.js
│   │   ├── admin.dashboard.routes.js
│   │   ├── admin.products.routes.js
│   │   ├── admin.policy.routes.js
│   │   ├── admin.system.routes.js
│   │   ├── admin.operators.routes.js
│   │   └── analytics.routes.js
│   ├── services/
│   │   ├── product.service.js
│   │   ├── inventory.service.js
│   │   ├── csv-upsert.service.js
│   │   ├── policy.service.js
│   │   ├── dashboard.service.js
│   │   ├── analytics.service.js
│   │   ├── cost-control.service.js
│   │   └── operator.service.js
│   ├── llm/
│   │   ├── orchestrator.js
│   │   ├── prompt-builder.js
│   │   └── mock-response.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── rate-limit.middleware.js
│   │   └── circuit-breaker.middleware.js
│   └── server.js
├── db/
│   ├── migrations/
│   ├── seeds/
│   └── pool.js
├── package.json
└── .env.example

```

### 5.1 관리자 V3.0 개발본 파일 매핑

| 화면 ID | Screen 키 | React 컴포넌트 | 개발본 위치 |
|---------|-----------|----------------|-------------|
| ADM-DSH-010 | `adm-dashboard` | `AdmDashboard` | `app/src/app/screens/admin/AdmDashboard.tsx` |
| ADM-PRD-010 | `adm-product-master` | `AdmProductMaster` | `app/src/app/screens/admin/AdmProductMaster.tsx` |
| ADM-CSV-010 | `adm-csv-import` | `AdmCsvImport` | `app/src/app/screens/admin/AdmCsvImport.tsx` |
| ADM-POL-010 | `adm-price-policy` | `AdmPricePolicy` | `app/src/app/screens/admin/AdmPricePolicy.tsx` |
| ADM-POL-020 | `adm-recommend-weights` | `AdmRecommendWeights` | `app/src/app/screens/admin/AdmRecommendWeights.tsx` |
| ADM-ANA-010 | `adm-keywords` | `AdmKeywords` | `app/src/app/screens/admin/AdmKeywords.tsx` |
| ADM-ANA-020 | `adm-click-report` | `AdmClickReport` | `app/src/app/screens/admin/AdmClickReport.tsx` |
| ADM-ANA-030 | `adm-funnel` | `AdmFunnel` | `app/src/app/screens/admin/AdmFunnel.tsx` |
| ADM-SYS-010 | `adm-system-limit` | `AdmSystemLimit` | `app/src/app/screens/admin/AdmSystemLimit.tsx` |
| DEV-HUB-010 | `dev-hub` | `DevHub` | `app/src/app/screens/dev/DevHub.tsx` |

## 5.2 관리자 V3.0 API 라우트 파일 매핑

| API 영역 | 주요 엔드포인트 | 라우트 파일 | 서비스 파일 |
|----------|----------------|-------------|-------------|
| 비즈니스 대시보드 | `GET /api/admin/dashboard/business` | `admin.dashboard.routes.js` | `dashboard.service.js` |
| AI 비용 미니 위젯 | `GET /api/admin/cost` | `admin.system.routes.js` | `cost-control.service.js` |
| 상품 검색 | `GET /api/admin/products` | `admin.products.routes.js` | `product.service.js` |
| 품절/단종 상태 변경 | `PUT /api/admin/products/:code/status` | `admin.products.routes.js` | `inventory.service.js` |
| CSV 업서트 | `POST /api/admin/products/csv` | `admin.products.routes.js` | `csv-upsert.service.js` |
| 카테고리 마진 정책 | `PUT /api/admin/policy/margin` | `admin.policy.routes.js` | `policy.service.js` |
| 추천 가중치 | `PUT /api/admin/policy/weights` | `admin.policy.routes.js` | `policy.service.js` |
| 키워드 분석 | `GET /api/analytics/keywords` | `analytics.routes.js` | `analytics.service.js` |
| 스왑/CTR 리포트 | `GET /api/analytics/swap-report` | `analytics.routes.js` | `analytics.service.js` |
| 퍼널 분석 | `GET /api/analytics/funnel` | `analytics.routes.js` | `analytics.service.js` |
| Rate Limit | `GET /api/admin/rate-limit`, `PUT /api/admin/rate-limit` | `admin.system.routes.js` | `cost-control.service.js` |
| 비용 임계치 | `PUT /api/admin/cost/threshold` | `admin.system.routes.js` | `cost-control.service.js` |
| 운영자 및 권한 관리 | 운영자 초대, 역할 변경, 활성/비활성 처리, 활동 로그 조회 | `admin.operators.routes.js` 예정 | `operator.service.js` 예정 |

## 6. 이관 규칙 갱신

기존 규칙은 “`_publish/[도메인]/화면.html` → `app/public/[동일경로]` 복사”였지만, 현재 `_publish`는 React SPA이므로 다음 규칙으로 갱신한다.

1. `_publish/`는 원본으로 보존한다.
2. 사용자 화면 수정의 기준은 `_publish/src/app/App.tsx` 또는 개발본의 분리된 화면 컴포넌트다.
3. 개발본에서는 화면 단위 분리 구조를 사용한다.
4. 화면별 추적 단위는 HTML 파일이 아니라 `Screen` 키와 React 컴포넌트다.
5. 백엔드 API, LLM 호출, 비용 통제, DB 연동은 `app/server`에서 구현한다.
6. `_publish` 안의 더미 데이터와 상태 연출은 개발본에서 실제 API 호출 또는 Mock API 호출로 교체한다.
7. 관리자 화면은 V3.0 사이트맵 기준으로 Screen 키를 재정렬한다.
8. 기존 `_publish`의 관리자 Screen 키는 개발본에서 다음 기준으로 대체한다.

| 기존 Screen 키 | V3.0 Screen 키 | 이관 방식 |
|----------------|----------------|-----------|
| `adm-dashboard` | `adm-dashboard` | 화면 유지, 내용은 비즈니스 대시보드로 재구성 |
| `adm-monitoring` | `adm-system-limit` | 비용/트래픽 관제 후순위 시스템 메뉴로 이동 |
| `adm-rate-limit` | `adm-system-limit` | Rate Limit과 Circuit Breaker 통합 |
| `adm-master` | `adm-product-master` | 상품 검색 및 재고 제어 중심으로 재구성 |
| `adm-product-edit` | `adm-product-master` 내부 편집 패널 | 별도 화면 제거 또는 보조 레이어화 |
| `adm-csv` | `adm-csv-import` | CSV 업서트 화면명 명확화 |
| `adm-category` | `adm-price-policy` | 카테고리 마진 정책으로 재정의 |
| `adm-keywords` | `adm-keywords` | 유지 |
| `adm-swap-report` | `adm-click-report` | 스왑 리포트와 특가 CTR 통합 |
| `adm-funnel` | `adm-funnel` | 유지 |
| `adm-operators` | `adm-operators` | UI 설계 산출물 기준 운영자·권한 관리 화면 유지 |

## 7. 명명 규칙 갱신

| 구분 | 기존 기준 | 현재 기준 |
|------|-----------|-----------|
| 화면 파일 | `kebab-case.html` | 단일 `index.html` 또는 React 컴포넌트 |
| 화면 식별 | `data-screen-id` + HTML 경로 | `Screen` union key + 컴포넌트명 |
| 화면 전환 | `<a href="...html">` | `navigate("screen-key")` |
| 화면 구현 | 도메인별 HTML 파일 | 화면별 React 컴포넌트 |
| 스타일 | `assets/css/common.css` | `src/styles/*.css`, Tailwind, 디자인 토큰 |
| 공통 UI | HTML partial 또는 공통 CSS | `GNB`, `Footer`, `AdminLayout`, `components/ui/*` |
| 관리자 화면 ID | `FR-ADM-*`, `FR-ANA-*` 혼재 | `ADM-DSH`, `ADM-PRD`, `ADM-CSV`, `ADM-POL`, `ADM-ANA`, `ADM-SYS`, `ADM-OPS` |
| 관리자 Screen 키 | 기능별 단편 키 | V3.0 운영 우선순위 기반 키 |

### 7.1 관리자 V3.0 화면 ID 규칙

관리자 화면은 V3.0부터 다음 ID 체계를 사용한다.

| Prefix | 의미 | 예시 |
|--------|------|------|
| `ADM-DSH` | 관리자 메인 대시보드 | `ADM-DSH-010` |
| `ADM-PRD` | 상품 마스터 및 재고 제어 | `ADM-PRD-010` |
| `ADM-CSV` | CSV 업서트 | `ADM-CSV-010` |
| `ADM-POL` | 가격 정책 및 추천 가중치 | `ADM-POL-010` |
| `ADM-ANA` | 마케팅 및 사용자 행동 분석 | `ADM-ANA-010` |
| `ADM-SYS` | 시스템 인프라 및 비용 제어 | `ADM-SYS-010` |
| `ADM-OPS` | 운영자 및 권한 관리 | `ADM-OPS-010` |
| `DEV-HUB` | 개발·검수 허브 | `DEV-HUB-010` |

## 8. Git 관리 정책

`.gitignore`에는 `node_modules/`, `.env`, 로그 파일, 빌드 산출물(`dist/`, `build/`)을 포함한다. 실제 API Key가 포함된 `.env`는 어떤 경우에도 커밋하지 않는다.

`_publish`가 Vite 앱이므로 의존성 설치 후 생성되는 `_publish/node_modules/`와 빌드 결과 `_publish/dist/`는 커밋 대상에서 제외한다.

관리자 V3.0 기능 추가에 따라 다음 파일도 Git 관리 시 주의한다.

| 파일/경로 | 정책 |
|----------|------|
| `app/.env` | 커밋 금지 |
| `app/server/llm/*` | API Key 하드코딩 금지 |
| `app/server/services/cost-control.service.js` | 비용 임계치 기본값만 관리, 실제 운영값은 DB 또는 `.env` 사용 |
| CSV 업로드 원본 | 실제 공급처 원본은 민감 데이터로 취급. 샘플만 `_mock/`에 저장 |
| 오류 행 리포트 | 개인정보 또는 공급처 민감 정보 포함 시 커밋 금지 |


---

## 9. 개발본 랜딩 파일 구조 갱신 (2026-06-19)

현재 개발본은 `_publish/src/app/App.tsx` 단일 파일 구조를 그대로 유지하지 않고, 화면 단위로 분리한다. 랜딩 관련 기준 파일은 다음과 같다.

| 구분 | 경로 | 역할 |
|------|------|------|
| 화면 컴포넌트 | `app/src/app/screens/landing/LandingScreens.tsx` | `Landing`, `AuthModal`, `RealtimePanel`, `SpecialEventBanner` 구현 |
| 공통 네비게이션 | `app/src/app/components/common/Navigation.tsx` | `GNB`, `Footer` |
| 공통 레이아웃 | `app/src/app/layouts/AppLayouts.tsx` | `UserLayout`, `AdminLayout` |
| 디자인 토큰 | `app/src/app/constants/design.ts` | `C`, `btn` |
| Screen 타입 | `app/src/app/types.ts` | `Screen` union |
| 라우팅 연결 | `app/src/app/App.tsx` | `screenMap`에서 `landing`, `auth-modal`을 import 연결 |

`FR-LND-010`은 더 이상 `User_Main/index.html` 단일 정적 HTML을 기준으로 수정하지 않는다. 개발 기준은 `LandingScreens.tsx`이며, `_publish`는 원본 참고용으로 보존한다.

| 상수/함수 | 위치 | 내용 |
|-----------|------|------|
| `POPULAR_QUOTES` | `LandingScreens.tsx` | 실시간 인기 견적 TOP 5 |
| `PRICE_TRENDS` | `LandingScreens.tsx` | 실시간 가격 동향 |
| `SPECIAL_EVENTS` | `LandingScreens.tsx` | 이벤트 롤링 배너 |
| `steps` | `Landing` 내부 | 사용 흐름 4단계 |
| `specPreview` | `Landing` 내부 | 추천 견적 미리보기 부품 |
| `reviews` | `Landing` 내부 | 사용자 후기 |

## 10. 관리자 V3.0 개발본 파일 구조 갱신

관리자 백오피스는 V3.0부터 운영 우선순위에 따라 다음 화면 구조를 사용한다.

| 우선순위 | 화면 ID | Screen 키 | 개발본 파일 | 역할 |
|----------|---------|-----------|-------------|------|
| 1 | ADM-DSH-010 | `adm-dashboard` | `AdmDashboard.tsx` | 비즈니스·트렌드 메인 대시보드 |
| 2 | ADM-PRD-010 | `adm-product-master` | `AdmProductMaster.tsx` | 상품 검색, AI 필드 수정, 품절/단종 토글 |
| 2 | ADM-CSV-010 | `adm-csv-import` | `AdmCsvImport.tsx` | CSV 대량 Upsert |
| 3 | ADM-POL-010 | `adm-price-policy` | `AdmPricePolicy.tsx` | 카테고리별 마진 정책 |
| 3 | ADM-POL-020 | `adm-recommend-weights` | `AdmRecommendWeights.tsx` | 재고/마진/가성비 추천 가중치 |
| 4 | ADM-ANA-010 | `adm-keywords` | `AdmKeywords.tsx` | 자연어 키워드 분석 |
| 4 | ADM-ANA-020 | `adm-click-report` | `AdmClickReport.tsx` | 스왑 탈락 부품 및 특가 CTR |
| 4 | ADM-ANA-030 | `adm-funnel` | `AdmFunnel.tsx` | 모드별 전환 퍼널 |
| 5 | ADM-SYS-010 | `adm-system-limit` | `AdmSystemLimit.tsx` | Rate Limit, 비용 Threshold, Circuit Breaker |
| 6 | ADM-OPS-010 | `adm-operators` | `AdmOperators.tsx` | 운영자 초대, 역할 권한, 활동 로그 |
| 5 | DEV-HUB-010 | `dev-hub` | `DevHub.tsx` | 개발 진척도, Mock API, 가상 세션 |

## 11. 최종 Screen 키 변경 요약

| 구분 | 기존 Screen 키 | V3.0 최종 Screen 키 | 변경 유형 |
|------|----------------|--------------------|-----------|
| 관리자 대시보드 | `adm-dashboard` | `adm-dashboard` | 유지, 내용 재구성 |
| AI 비용 모니터링 | `adm-monitoring` | `adm-system-limit` | 통합 |
| 이용 제한 정책 | `adm-rate-limit` | `adm-system-limit` | 통합 |
| 상품 마스터 | `adm-master` | `adm-product-master` | 변경 |
| 상품 개별 수정 | `adm-product-edit` | `adm-product-master` 내부 편집 레이어 | 통합 |
| CSV 업로드 | `adm-csv` | `adm-csv-import` | 변경 |
| 카테고리 마진/품절 | `adm-category` | `adm-price-policy` | 역할 재정의 |
| 추천 가중치 | DevHub 일부 | `adm-recommend-weights` | 관리자 정책 화면으로 분리 |
| 키워드 분석 | `adm-keywords` | `adm-keywords` | 유지 |
| 탈락 부품 리포트 | `adm-swap-report` | `adm-click-report` | CTR 통합 |
| 퍼널 분석 | `adm-funnel` | `adm-funnel` | 유지 |
| 운영자 관리 | `adm-operators` | `adm-operators` | UI 설계 산출물 기준 유지 |
| 개발 허브 | `dev-hub` | `dev-hub` | 유지 |

## 12. 관리자 V3.0 최종 디렉토리 기준

관리자 개발본의 최종 기준 파일은 다음과 같다.

```text
app/src/app/screens/admin/
├── AdmDashboard.tsx              ← ADM-DSH-010 / adm-dashboard
├── AdmProductMaster.tsx          ← ADM-PRD-010 / adm-product-master
├── AdmCsvImport.tsx              ← ADM-CSV-010 / adm-csv-import
├── AdmPricePolicy.tsx            ← ADM-POL-010 / adm-price-policy
├── AdmRecommendWeights.tsx       ← ADM-POL-020 / adm-recommend-weights
├── AdmKeywords.tsx               ← ADM-ANA-010 / adm-keywords
├── AdmClickReport.tsx            ← ADM-ANA-020 / adm-click-report
├── AdmFunnel.tsx                 ← ADM-ANA-030 / adm-funnel
├── AdmSystemLimit.tsx            ← ADM-SYS-010 / adm-system-limit
└── AdmOperators.tsx              ← ADM-OPS-010 / adm-operators
