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

### 2.5 관리자 허브 — V3.0 최종 사이트맵

관리자 허브는 V3.0부터 AI 비용 관제 중심 구조가 아니라, 실제 MD/운영진의 출근 후 업무 순서에 맞춘 비즈니스 운영 구조로 재정렬한다.

우선순위는 다음과 같다.

1. 운영자 메인 컨트롤 타워
2. 상품 마스터 및 재고 제어
3. 제품 소싱
4. 가격 정책 및 추천 가중치 제어
5. 마케팅 및 사용자 행동 분석
6. 시스템 인프라 및 개발 특수 제어
7. 운영자 관리

| 단계 | 화면명 | 화면 ID | `_publish` 진입점 | Screen 키 | React 컴포넌트 | 주요 API |
|------|--------|---------|------------------|-----------|----------------|----------|
| 1 | 통합 비즈니스 & 트렌드 대시보드 | ADM-DSH-010 | `index.html` | `adm-dashboard` | `AdmDashboard` | `GET /api/admin/dashboard/business`, `GET /api/admin/cost` |
| 2 | 마스터 상품 검색 및 실시간 품절 스위치 | ADM-PRD-010 | `index.html` | `adm-product-master` | `AdmProductMaster` | `GET /api/admin/products`, `PUT /api/admin/products/:code/status` |
| 2 | 대량 상품 업데이트 CSV 업서트 | ADM-CSV-010 | `index.html` | `adm-csv-import` | `AdmCsvImport` | `POST /api/admin/products/csv` |
| 3 | 제품 소싱 | ADM-SRC-010 | `index.html` | `adm-sourcing` | `AdmSourcing` | `GET /api/admin/sourcing`, `POST /api/admin/sourcing/parse`, `POST /api/admin/sourcing/confirm`, `PUT /api/admin/sourcing/:id/match` |
| 4 | 부품 가격동향 및 카테고리 마진 통제 | ADM-POL-010 | `index.html` | `adm-price-policy` | `AdmPricePolicy` | `PUT /api/admin/policy/margin` |
| 4 | AI 추천 엔진 가중치 제어 | ADM-POL-020 | `index.html` | `adm-recommend-weights` | `AdmRecommendWeights` | `PUT /api/admin/policy/weights` |
| 5 | 실시간 유저 관심 키워드 및 형태소 관제 | ADM-ANA-010 | `index.html` | `adm-keywords` | `AdmKeywords` | `GET /api/analytics/keywords` |
| 5 | 부품 스왑 및 특가 클릭률 리포트 | ADM-ANA-020 | `index.html` | `adm-click-report` | `AdmClickReport` | `GET /api/analytics/swap-report` |
| 5 | 초보자/고급자 모드별 퍼널 이탈 관제 | ADM-ANA-030 | `index.html` | `adm-funnel` | `AdmFunnel` | `GET /api/analytics/funnel` |
| 6 | AI 비용 제어 및 트래픽 서킷 브레이커 | ADM-SYS-010 | `index.html` | `adm-system-limit` | `AdmSystemLimit` | `GET /api/admin/rate-limit`, `PUT /api/admin/rate-limit`, `PUT /api/admin/cost/threshold` |
| 6 | 통합 개발 진척도 허브 | DEV-HUB-010 | `index.html` | `dev-hub` | `DevHub` | 개발/검수 전용 |
| 7 | 운영자 및 권한 관리 | ADM-OPS-010 | `index.html` | `adm-operators` | `AdmOperators` | 운영자 계정·권한 관리 API 예정 |


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
 ├─ [실시간 견적 피드 확인]
 ├─ [특가 CTR / 키워드 / 가격동향 확인]
 ├─ [AI 비용 미니 위젯 확인] │ ├─→ adm-product-master │ ├─ 상품 검색 │ ├─ AI 호환성 정형 필드 수정 │ └─ 품절/단종 1초 차단 토글 │ ├─→ adm-csv-import │ └─ 00.상품다운.csv Upsert 및 오류 행 리포트 │ ├─→ adm-sourcing │ ├─ 거래처 원문 붙여넣기 │ ├─ AI 제품·가격 정제 │ └─ 상품 마스터 매칭 │ ├─→ adm-price-policy │ └─ 카테고리별 마진율 조정 │ ├─→ adm-recommend-weights │ └─ 재고소진/마진극대/가성비 추천 가중치 조정 │ ├─→ adm-keywords ├─→ adm-click-report ├─→ adm-funnel │ ├─→ adm-system-limit ├─ Rate Limit 정책 ├─ AI 비용 Threshold └─ Circuit Breaker │ └─→ adm-operators ├─ 운영자 초대 ├─ 역할 권한 관리 └─ 활동 로그 확인
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

관리자 화면은 `AdminLayout`을 사용하며, 좌측 LNB 메뉴는 V3.0 기준 다음 그룹으로 구성한다.

| 메뉴 그룹 | 포함 Screen 키 | 기본 이동 | 우선순위 |
|----------|----------------|-----------|----------|
| 메인 대시보드 | `adm-dashboard` | `adm-dashboard` | 1 |
| 상품/재고 | `adm-product-master`, `adm-csv-import` | `adm-product-master` | 2 |
| 제품 소싱 | `adm-sourcing` | `adm-sourcing` | 3 |
| 가격/정책 | `adm-price-policy`, `adm-recommend-weights` | `adm-price-policy` | 4 |
| 마케팅 분석 | `adm-keywords`, `adm-click-report`, `adm-funnel` | `adm-keywords` | 5 |
| 시스템 제어 | `adm-system-limit`, `dev-hub` | `adm-system-limit` | 6 |
| 운영자 관리 | `adm-operators` | `adm-operators` | 7 |


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

---

## 7. 랜딩 페이지 갱신 기준 (2026-06-19)

현재 개발본의 메인 랜딩은 단순한 히어로 + 모드 분기 카드 화면이 아니라, `app/src/app/screens/landing/LandingScreens.tsx` 기준의 확장형 세일즈 랜딩으로 관리한다.

`FR-LND-010` / `landing` / `Landing` 화면은 다음 섹션 순서를 기준으로 한다.

| 순서 | 섹션 | 주요 내용 |
|------|------|-----------|
| 1 | GNB | 브랜드 로고, 초급자 모드, 고급자 모드, 로그인, 회원가입, 관리자, DEV 이동 |
| 2 | Hero | 3대 AI 병렬 분석, 팝콘PC 실재고 검증, 초급자/고급자 진입 CTA |
| 3 | RealtimePanel | 실시간 인기 견적 TOP 5와 실시간 가격 동향을 2열로 노출 |
| 4 | Mode Select | 초급자 모드와 고급자 모드 선택 카드. 각각 `beg-step1`, `exp-step1`로 이동 |
| 5 | How It Works | 4단계 사용 흐름 탭/타임라인 |
| 6 | Spec Preview | 추천 견적 부품 6종 미리보기와 예상 금액 |
| 7 | AI Engines | Gemini, ChatGPT, Claude의 역할과 Fail-safe 안내 |
| 8 | Reviews | 사용자 후기 카드 3개 |
| 9 | Special Event Banner | 특가/이벤트 롤링 배너 |
| 10 | Final CTA | 초급자 견적 받기, 고급자 견적 받기 CTA |
| 11 | Footer | 서비스, 고객지원, 회사 링크와 고객센터 정보 |

따라서 사이트맵에서 `FR-LND-010`의 비고는 “초급/고급 분기 카드”가 아니라 “확장형 랜딩: 히어로, 실시간 견적/가격, 모드 분기, 사용 흐름, 견적 미리보기, AI 엔진, 후기, 이벤트, CTA”로 해석한다.

## 8. 관리자 사이트맵 V3.0 갱신 기준

관리자 사이트맵은 V3.0부터 비용 관제 중심이 아니라 비즈니스 운영 중심으로 재정렬한다. 운영자가 출근 후 가장 먼저 확인해야 하는 것은 외부 LLM 비용이 아니라, 실제 매출과 추천 품질에 직접 영향을 주는 상품 데이터, 품절 상태, 가격 정책, 고객 관심 트렌드다.

따라서 관리자 첫 화면 `adm-dashboard`는 다음 정보를 우선 노출한다.

1. AI 최종 견적 출력 실시간 피드
2. 금주 특가상품 클릭률 CTR
3. 유저 자연어 형태소 트렌드 TOP 10
4. 부품 가격동향 및 클릭분포
5. 3사 AI 비용 미니 위젯

상품 마스터 및 재고 제어는 2단계 최우선 운영 레이어로 격상한다. `adm-product-master`에서 상품 상태를 `품절` 또는 `단종`으로 변경하면 1초 이내에 AI 추천 연산 풀과 부품 스왑 대안 목록에서 해당 상품이 완전히 제외되어야 한다.

제품 소싱은 `상품/재고` 하위가 아니라 독립 관리자 메뉴로 관리한다. `adm-sourcing`은 거래처 메신저·문자·이메일 원문을 AI로 정제해 제품명, 수량, 단가, VAT, 거래처, 기록일시를 구조화하고 상품 마스터 매칭 후보를 관리한다.

기존 관리자 Screen 키 중 다음 항목은 V3.0에서 대체된다.

| 기존 Screen 키 | V3.0 Screen 키 | 변경 사유 |
|----------------|----------------|----------|
| `adm-master` | `adm-product-master` | 상품 마스터와 재고 제어 역할 명확화 |
| `adm-product-edit` | `adm-product-master` 내부 편집 레이어 | 개별 수정 화면을 별도 페이지보다 마스터 내 인라인/모달 편집으로 통합 |
| `adm-csv` | `adm-csv-import` | CSV 업서트 기능 명확화 |
| `adm-category` | `adm-price-policy` | 카테고리 마진 정책으로 역할 재정의 |
| `adm-monitoring` | `adm-system-limit` 또는 `adm-dashboard` 미니 위젯 | 비용 관제를 후순위 시스템 메뉴로 이동 |
| `adm-rate-limit` | `adm-system-limit` | Rate Limit과 비용 Threshold 통합 |
| `adm-swap-report` | `adm-click-report` | 스왑 리포트와 특가 CTR 리포트 통합 |
| `adm-operators` | `adm-operators` | UI 설계 산출물 기준 운영자·권한 관리 화면 유지 |
