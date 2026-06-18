# 02. 파일 · 디렉토리 구조서

**파일 경로:** `_docs/02_file-list.md`  
**문서 버전:** Ver 2.0  
**기준 산출물:** `_publish/` Vite/React 정적 소스  
**갱신일:** 2026-06-19

## 1. 최상위 디렉토리 개요

현재 프로젝트 루트는 `popcorn-ai-sales/`이며, `_publish/`의 실제 생성 결과는 기존 문서의 “화면별 HTML 폴더 구조”가 아니라 **Vite + React 단일 앱 구조**다.

| 경로 | 책임 | 담당 도구/주체 | 수정 권한 |
|------|------|---------------|----------|
| `_docs/` | 기획·설계·구조 문서 | 기획자 / Codex | 문서 갱신 시 수정 |
| `_publish/` | 와이어프레임 기반 정적 React 소스 원본 | Stitch / Figma Make 계열 산출물 | 원본 보존, 직접 수정 지양 |
| `app/` | 실제 개발본(백엔드·연동·운영 코드) | Codex | 개발자 |
| `_mock/` | 테스트·목 데이터 | Codex | 개발자 |
| `deploy/` | 인프라·배포 설정 | Codex | 개발자 |
| `README.md` | 프로젝트 개요 | Codex | 개발자 |

핵심 원칙은 `_publish/`를 “화면 원본”으로 보존하고, 실제 기능 연동은 `app/`에서 수행하는 것이다. 다만 `_publish`가 React 앱으로 생성되었으므로, 이관 시 화면별 HTML 복사가 아니라 React 앱 구조를 기준으로 편입 전략을 정해야 한다.

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

## 4. 화면 ID ↔ Screen 키 ↔ 컴포넌트 매핑

기존의 `_publish/User_Main/*.html` 같은 화면별 파일은 현재 존재하지 않는다. 모든 화면은 `_publish/index.html`에서 시작하고 `_publish/src/app/App.tsx`의 `screenMap`으로 렌더링된다.

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
| FR-ADM-010 | 마스터 대시보드 | `index.html` | `adm-dashboard` | `AdmDashboard` | `Admin_AI/dashboard.html` 대체 |
| FR-ADM-010-MON | AI 트래픽·비용 모니터링 | `index.html` | `adm-monitoring` | `AdmMonitoring` | `Admin_AI/monitoring.html` 대체 |
| FR-ADM-020 | 이용 제한 정책 | `index.html` | `adm-rate-limit` | `AdmRateLimit` | `Admin_AI/rate-limit.html` 대체 |
| FR-ADM-035 | 상품 마스터 목록·검색 | `index.html` | `adm-master` | `AdmMaster` | `Admin_Parts/master.html` 대체 |
| FR-ADM-040 | 상품 개별 등록·수정 | `index.html` | `adm-product-edit` | `AdmProductEdit` | `Admin_Parts/product-edit.html` 대체 |
| FR-ADM-030 | CSV 일괄 업서트 | `index.html` | `adm-csv` | `AdmCsv` | `Admin_Parts/csv-import.html` 대체 |
| FR-ADM-050 | 카테고리 마진·품절 제어 | `index.html` | `adm-category` | `AdmCategory` | `Admin_Parts/category-policy.html` 대체 |
| FR-ANA-010 | 인기 키워드 분석 | `index.html` | `adm-keywords` | `AdmKeywords` | `Admin_Analytics/keywords.html` 대체 |
| FR-ANA-020 | 탈락 부품 분석 | `index.html` | `adm-swap-report` | `AdmSwapReport` | `Admin_Analytics/swap-report.html` 대체 |
| FR-ANA-030 | 전환 퍼널 분석 | `index.html` | `adm-funnel` | `AdmFunnel` | `Admin_Analytics/funnel.html` 대체 |

## 5. 현재 `app/` 개발본 구조

`app/`는 실제 기능 개발본 영역으로 유지한다. 기존에 생성된 빈 껍데기 파일들은 백엔드·연동 개발을 위한 자리표시자이며, `_publish`의 실제 React 소스와는 아직 구조가 일치하지 않을 수 있다.

```text
app/
├── public/                         ← 향후 정적 빌드 산출물 또는 이관된 프론트 앱 배치 후보
├── src/                            ← 프론트 연동 스크립트 자리표시자
├── server/                         ← 백엔드 API 자리표시자
│   ├── routes/
│   ├── services/
│   ├── llm/
│   └── middlewares/
├── db/
│   ├── migrations/
│   ├── seeds/
│   └── pool.js
├── package.json
└── .env.example
```

## 6. 이관 규칙 갱신

기존 규칙은 “`_publish/[도메인]/화면.html` → `app/public/[동일경로]` 복사”였지만, 현재 `_publish`는 React SPA이므로 다음 규칙으로 갱신한다.

1. `_publish/`는 원본으로 보존한다.
2. 화면 수정의 기준 파일은 `_publish/src/app/App.tsx`다.
3. 화면별 추적 단위는 HTML 파일이 아니라 `Screen` 키와 React 컴포넌트다.
4. 개발본으로 이관할 때는 `_publish` 전체 앱을 프론트 앱으로 편입하거나, `App.tsx`의 화면 컴포넌트를 `app`의 프론트 구조로 분리한다.
5. 백엔드 API, LLM 호출, 비용 통제, DB 연동은 `app/server`에서 구현한다.
6. `_publish` 안의 더미 데이터와 상태 연출은 개발본에서 실제 API 호출 또는 Mock API 호출로 교체한다.

## 7. 명명 규칙 갱신

| 구분 | 기존 기준 | 현재 `_publish` 기준 |
|------|-----------|---------------------|
| 화면 파일 | `kebab-case.html` | 단일 `index.html` |
| 화면 식별 | `data-screen-id` + HTML 경로 | `Screen` union key + 컴포넌트명 |
| 화면 전환 | `<a href="...html">` | `navigate("screen-key")` |
| 화면 구현 | 도메인별 HTML 파일 | `App.tsx` 내부 React 컴포넌트 |
| 스타일 | `assets/css/common.css` | `src/styles/*.css`, Tailwind, inline style token |
| 공통 UI | HTML partial 또는 공통 CSS | `GNB`, `Footer`, `AdminLayout`, `components/ui/*` |

## 8. Git 관리 정책

`.gitignore`에는 `node_modules/`, `.env`, 로그 파일, 빌드 산출물(`dist/`, `build/`)을 포함한다. 실제 API Key가 포함된 `.env`는 어떤 경우에도 커밋하지 않는다.

`_publish`가 Vite 앱이므로 의존성 설치 후 생성되는 `_publish/node_modules/`와 빌드 결과 `_publish/dist/`는 커밋 대상에서 제외한다.
