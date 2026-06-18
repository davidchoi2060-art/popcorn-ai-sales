# 01. 전체 메뉴 구성도 (IA / 사이트맵)

**파일 경로:** `_docs/01_sitemap.md`  
**문서 버전:** Ver 2.0  
**기준 산출물:** `_publish/` Vite/React 정적 소스  
**갱신일:** 2026-06-19

## 1. 현재 구현 기준

현재 `_publish/`는 화면별 HTML 파일을 여러 폴더에 나누는 구조가 아니라, **Vite + React 단일 페이지 앱(SPA)** 구조로 생성되어 있다.

실제 브라우저 진입점은 `_publish/index.html` 하나이며, 모든 화면은 `_publish/src/app/App.tsx` 내부의 `Screen` 상태와 `screenMap`에 의해 전환된다.

```
팝콘PC AI 추천 시스템 (_publish)
│
├── index.html                       ← 단일 정적 진입점
└── src/app/App.tsx                  ← 전체 화면 컴포넌트·화면 전환 상태 관리
        │
        ├── landing                  ← 랜딩
        ├── auth-modal               ← SSO 인증 모달
        ├── beg-*                    ← 초급자 모드
        ├── exp-*                    ← 고급자 모드
        ├── adm-*                    ← 관리자 허브
        └── dev-hub                  ← 개발·운영 제어 허브
```

따라서 기존 문서의 `User_Main/index.html`, `Rec_Beginner/step1-purpose.html` 같은 화면별 정적 파일 경로는 더 이상 `_publish`의 실제 구조와 일치하지 않는다. 화면 식별은 파일 경로가 아니라 `Screen` 키와 React 컴포넌트명을 기준으로 한다.

## 2. 전체 화면 트리

### 2.1 게이트

| 화면명 | 화면 ID | `_publish` 진입점 | Screen 키 | React 컴포넌트 |
|--------|---------|------------------|-----------|----------------|
| 통합 개발·운영 제어 허브 | DEV-HUB-010 | `index.html` | `dev-hub` | `DevHub` |

### 2.2 랜딩 / 인증

| 화면명 | 화면 ID | `_publish` 진입점 | Screen 키 | React 컴포넌트 | 비고 |
|--------|---------|------------------|-----------|----------------|------|
| 메인 랜딩 페이지 | FR-LND-010 | `index.html` | `landing` | `Landing` | 초급/고급 분기 카드 |
| SSO 인증 모달 | FR-LND-020 | `index.html` | `auth-modal` | `AuthModal` | 기존 쇼핑몰 회원 DB 연동 예정 |

### 2.3 초급자 모드

| 화면명 | 화면 ID | `_publish` 진입점 | Screen 키 | React 컴포넌트 |
|--------|---------|------------------|-----------|----------------|
| 1단계 용도 선택 | FR-BEG-010 | `index.html` | `beg-step1` | `BegStep1` |
| 2단계 예산 선택 | FR-BEG-020 | `index.html` | `beg-step2` | `BegStep2` |
| 3단계 감성 옵션 | FR-BEG-030 | `index.html` | `beg-step3` | `BegStep3` |
| 4단계 요약·편집 | FR-BEG-050 | `index.html` | `beg-step4` | `BegStep4` |
| 결과 대시보드 | FR-BEG-090 | `index.html` | `beg-result` | `BegResult` |
| 견적 상세·부품 스왑 | FR-BEG-110 | `index.html` | `beg-detail` | `BegDetail` |

### 2.4 고급자 모드

| 화면명 | 화면 ID | `_publish` 진입점 | Screen 키 | React 컴포넌트 |
|--------|---------|------------------|-----------|----------------|
| 1단계 우선순위·제조사 | FR-EXP-010 | `index.html` | `exp-step1` | `ExpStep1` |
| 2단계 CPU/GPU 세대 | FR-EXP-020 | `index.html` | `exp-step2` | `ExpStep2` |
| 3단계 메모리/SSD | FR-EXP-030 | `index.html` | `exp-step3` | `ExpStep3` |
| 4단계 전력/쿨링 마진 | FR-EXP-040 | `index.html` | `exp-step4` | `ExpStep4` |
| 5단계 검토·편집 | FR-EXP-060 | `index.html` | `exp-step5` | `ExpStep5` |
| 전문가 결과 대시보드 | FR-EXP-090 | `index.html` | `exp-result` | `ExpResult` |
| 견적 상세·연쇄 스왑 | FR-EXP-110 | `index.html` | `exp-detail` | `ExpDetail` |

### 2.5 관리자 허브

| 화면명 | 화면 ID | `_publish` 진입점 | Screen 키 | React 컴포넌트 |
|--------|---------|------------------|-----------|----------------|
| 마스터 대시보드(비용 관제) | FR-ADM-010 | `index.html` | `adm-dashboard` | `AdmDashboard` |
| AI 트래픽·비용 모니터링 | FR-ADM-010-MON | `index.html` | `adm-monitoring` | `AdmMonitoring` |
| 회원별 이용 제한(Rate Limit) | FR-ADM-020 | `index.html` | `adm-rate-limit` | `AdmRateLimit` |
| 상품 마스터 목록·검색 | FR-ADM-035 | `index.html` | `adm-master` | `AdmMaster` |
| 상품 개별 등록·수정 | FR-ADM-040 | `index.html` | `adm-product-edit` | `AdmProductEdit` |
| CSV 일괄 업로드(Upsert) | FR-ADM-030 | `index.html` | `adm-csv` | `AdmCsv` |
| 카테고리 마진·품절 제어 | FR-ADM-050 | `index.html` | `adm-category` | `AdmCategory` |
| 인기 키워드·형태소 분석 | FR-ANA-010 | `index.html` | `adm-keywords` | `AdmKeywords` |
| 탈락 부품·CTR 리포트 | FR-ANA-020 | `index.html` | `adm-swap-report` | `AdmSwapReport` |
| 전환 퍼널 분석 | FR-ANA-030 | `index.html` | `adm-funnel` | `AdmFunnel` |

## 3. 사용자 라우팅 흐름

현재 `_publish`는 URL 라우터가 아니라 `useState<Screen>` 기반 화면 전환을 사용한다. 화면 이동은 `navigate("screen-key")` 호출로 처리되며, 이동 시 `window.scrollTo(0, 0)`을 수행한다.

### 3.1 초급자 동선

```
landing
  └─[초급자 모드]→ beg-step1 → beg-step2 → beg-step3 → beg-step4
        └─[추천받기]→ beg-result
              └─[부품 변경]→ beg-detail
                    └─[장바구니 담기]→ 외부 쇼핑몰 결제 레일 연동 예정
```

### 3.2 고급자 동선

```
landing
  └─[고급자 모드]→ exp-step1 → exp-step2 → exp-step3 → exp-step4 → exp-step5
        └─[추천받기]→ exp-result
              └─[부품 변경]→ exp-detail
                    └─[연쇄 스왑 승인]→ 외부 쇼핑몰 결제 레일 연동 예정
```

### 3.3 관리자 동선

```
adm-dashboard
  ├─→ adm-monitoring / adm-rate-limit
  ├─→ adm-master
  │      ├─→ adm-product-edit
  │      ├─→ adm-csv
  │      └─→ adm-category
  └─→ adm-keywords / adm-swap-report / adm-funnel
```

### 3.4 개발 허브 동선

```
landing 또는 GNB DEV 버튼
  └─→ dev-hub
        ├─ 화면 구현 진척도 매트릭스
        ├─ 가상 세션 주입 UI
        ├─ Mock/Real API 스위치 UI
        └─ 운영자 가중치·비용 관제 미리보기
```

## 4. 전역 내비게이션 구성

사용자 화면은 `GNB`와 `Footer`를 포함하는 `UserLayout`을 사용한다. GNB의 주요 전환은 다음과 같다.

| UI | 이동 Screen 키 |
|----|----------------|
| 브랜드 로고 | `landing` |
| 초급자 모드 | `beg-step1` |
| 고급자 모드 | `exp-step1` |
| 로그인 / 회원가입 | `auth-modal` |
| 관리자 | `adm-dashboard` |
| DEV | `dev-hub` |

관리자 화면은 `AdminLayout`을 사용하며, 좌측 LNB 메뉴는 다음 그룹으로 구성된다.

| 메뉴 | 포함 Screen 키 | 기본 이동 |
|------|----------------|-----------|
| 대시보드 | `adm-dashboard` | `adm-dashboard` |
| 비용관제 | `adm-monitoring`, `adm-rate-limit` | `adm-monitoring` |
| 상품관리 | `adm-master`, `adm-product-edit`, `adm-csv`, `adm-category` | `adm-master` |
| 통계분석 | `adm-keywords`, `adm-swap-report`, `adm-funnel` | `adm-keywords` |

## 5. `_publish` 기준 링크 정책

현재 `_publish`는 화면별 HTML 파일이 없으므로 정적 미리보기 링크는 모두 `_publish/index.html`을 기준으로 한다. 화면별 식별은 DevHub 매트릭스나 향후 라우팅/쿼리 파라미터 도입 시 `Screen` 키를 함께 전달하는 방식으로 확장한다.

| 링크 종류 | 현재 기준 | 비고 |
|----------|-----------|------|
| 정적 미리보기 | `_publish/index.html` | SPA 내부 상태로 화면 전환 |
| 동작 테스트 | 개발 서버의 Vite 앱 또는 이관된 앱 진입점 | 예: `npm run dev` 후 Vite URL |
| 수정 기준 | `_publish/src/app/App.tsx`의 컴포넌트 | 화면별 HTML 파일 없음 |

## 6. 외부 시스템 연계 지점

본 시스템은 두 개의 외부 경계를 가진다. 하나는 기존 팝콘PC 쇼핑몰로, SSO 로그인과 최종 장바구니·결제 레일을 담당한다. 다른 하나는 3사 외부 LLM API(Gemini, OpenAI, Claude)로, 실제 개발본에서는 백엔드 오케스트레이터를 통해서만 호출한다.

현재 `_publish` 산출물은 정적 와이어프레임/프로토타입 성격이므로 외부 시스템 호출은 더미 UI와 상태 연출로만 표현되어 있다.
