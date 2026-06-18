좋습니다. **2단계: 전체 메뉴 구성도(IA/사이트맵)**를 만들어 드리겠습니다. `_docs/01_sitemap.md`로 저장하시면 됩니다.

이 문서는 시스템의 모든 화면을 한눈에 보여주는 지도입니다. 앞서 정한 단방향 이관 구조와 정적/동작 이중 링크 원칙을 그대로 반영했고, 화면마다 ID와 파일 경로를 붙여 이후 단계(파일 목록, 와이어프레임, dev_index 게이트)가 이 문서를 그대로 받아쓸 수 있게 했습니다.

---

# 01. 전체 메뉴 구성도 (IA / 사이트맵)

**파일 경로:** `_docs/01_sitemap.md`
**문서 버전:** Ver 1.0
**선행 문서:** `_docs/00_glossary.md`

## 1. 도메인 최상위 구조

시스템은 4개의 독립 도메인과 1개의 개발 게이트로 구성된다.

```
팝콘PC AI 추천 시스템
│
├── [게이트]  dev_index.html              ← 개발자/기획자/고객 공용 진입점 (개발 단계 전용)
│
├── [도메인 1] User_Main      랜딩 페이지        (모든 사용자 첫 관문)
├── [도메인 2] Rec_Beginner   초급자 모드        (4단계 → 결과 → 상세)
├── [도메인 3] Rec_Expert     고급자 모드        (5단계 → 결과 → 상세)
└── [도메인 4] Admin Hub      관리자 백오피스    (대시보드/상품/분석)
        │
        └─→ (외부 연계) 기존 팝콘PC 쇼핑몰 — SSO 로그인 · 장바구니 · 결제
```

`dev_index.html`은 개발·검수 기간에만 쓰는 진입점이며, 실제 서비스 오픈 시 사용자는 `User_Main/index.html`(랜딩)로 직접 진입한다.

## 2. 전체 화면 트리 (화면 ID · 파일 경로 포함)

### 2.1 게이트
| 화면명 | 화면 ID | 파일 경로 |
|--------|---------|----------|
| 통합 개발 제어 허브 | DEV-HUB-010 | `dev_index.html` |

### 2.2 도메인 1 — 랜딩 (User_Main)
| 화면명 | 화면 ID | 파일 경로 | 비고 |
|--------|---------|----------|------|
| 메인 랜딩 페이지 | FR-LND-010 | `User_Main/index.html` | 초급/고급 분기 카드 |
| SSO 인증 모달 | FR-LND-020 | `User_Main/auth-modal.html` | 기존 쇼핑몰 회원 DB 연동 |

### 2.3 도메인 2 — 초급자 모드 (Rec_Beginner)
| 화면명 | 화면 ID | 파일 경로 |
|--------|---------|----------|
| 1단계 용도 선택 | FR-BEG-010 | `Rec_Beginner/step1-purpose.html` |
| 2단계 예산 선택 | FR-BEG-020 | `Rec_Beginner/step2-budget.html` |
| 3단계 감성 옵션 | FR-BEG-030 | `Rec_Beginner/step3-option.html` |
| 4단계 요약·편집 | FR-BEG-050 | `Rec_Beginner/step4-summary.html` |
| 결과 대시보드 | FR-BEG-090 | `Rec_Beginner/result.html` |
| 견적 상세·부품 스왑 | FR-BEG-110 | `Rec_Beginner/estimate-detail.html` |

### 2.4 도메인 3 — 고급자 모드 (Rec_Expert)
| 화면명 | 화면 ID | 파일 경로 |
|--------|---------|----------|
| 1단계 우선순위·제조사 | FR-EXP-010 | `Rec_Expert/step1-priority.html` |
| 2단계 CPU/GPU 세대 | FR-EXP-020 | `Rec_Expert/step2-cpu-gpu.html` |
| 3단계 메모리/SSD | FR-EXP-030 | `Rec_Expert/step3-ram-ssd.html` |
| 4단계 전력/쿨링 마진 | FR-EXP-040 | `Rec_Expert/step4-power.html` |
| 5단계 검토·편집 | FR-EXP-060 | `Rec_Expert/step5-review.html` |
| 전문가 결과 대시보드 | FR-EXP-090 | `Rec_Expert/result-expert.html` |
| 견적 상세·연쇄 스왑 | FR-EXP-110 | `Rec_Expert/estimate-detail-expert.html` |

### 2.5 도메인 4 — 관리자 허브 (Admin Hub)
| 화면명 | 화면 ID | 파일 경로 |
|--------|---------|----------|
| 마스터 대시보드(비용 관제) | FR-ADM-010 | `Admin_AI/dashboard.html` |
| AI 트래픽·비용 모니터링 | FR-ADM-010 | `Admin_AI/monitoring.html` |
| 회원별 이용 제한(Rate Limit) | FR-ADM-020 | `Admin_AI/rate-limit.html` |
| 상품 마스터 목록·검색 | (3.2 프로세스) | `Admin_Parts/master.html` |
| 상품 개별 등록·수정 | FR-ADM-040 | `Admin_Parts/product-edit.html` |
| CSV 일괄 업로드(Upsert) | FR-ADM-030 | `Admin_Parts/csv-import.html` |
| 카테고리 마진·품절 제어 | FR-ADM-050 | `Admin_Parts/category-policy.html` |
| 인기 키워드·형태소 분석 | FR-ANA-010 | `Admin_Analytics/keywords.html` |
| 탈락 부품·CTR 리포트 | FR-ANA-020 | `Admin_Analytics/swap-report.html` |
| 전환 퍼널 분석 | FR-ANA-030 | `Admin_Analytics/funnel.html` |

## 3. 사용자 라우팅 흐름 (화면 전환 경로)

### 3.1 초급자 동선
```
index.html
  └─[초급자 카드 클릭]→ step1-purpose → step2-budget → step3-option → step4-summary
        └─['추천받기']→ (백엔드 오케스트레이터)→ result.html
              └─[부품 변경]→ estimate-detail.html
                    └─[장바구니 담기]→ (외부) 기존 쇼핑몰 결제 레일
```

### 3.2 고급자 동선
```
index.html
  └─[고급자 카드 클릭]→ step1-priority → step2-cpu-gpu → step3-ram-ssd → step4-power → step5-review
        └─['추천받기']→ (백엔드 오케스트레이터)→ result-expert.html
              └─[부품 변경]→ estimate-detail-expert.html
                    └─[연쇄 스왑 승인]→ [장바구니]→ (외부) 기존 쇼핑몰 결제 레일
```

### 3.3 관리자 동선
```
(관리자 로그인)→ Admin_AI/dashboard.html
  ├─→ monitoring.html / rate-limit.html        (비용·트래픽 관제)
  ├─→ Admin_Parts/master.html
  │      ├─→ product-edit.html                 (개별 수정)
  │      ├─→ csv-import.html                    (일괄 업서트)
  │      └─→ category-policy.html               (마진·품절)
  └─→ Admin_Analytics/keywords · swap-report · funnel
```

## 4. 전역 내비게이션(GNB) 구성

랜딩과 추천 모드 화면 상단에는 공통 헤더(GNB)가 노출된다. 좌측에는 브랜드 로고(클릭 시 `index.html` 이동 및 상태 초기화), 중앙에는 [초급자 모드]/[고급자 모드] 전환 탭, 우측에는 [로그인/회원가입], [장바구니], [마이페이지/견적 보관함]이 배치된다. 관리자 허브는 별도의 사이드바 내비게이션을 사용하며 사용자 GNB와 분리한다.

## 5. dev_index 게이트의 링크 구조 (협업 핵심)

`dev_index.html`은 위 모든 화면을 진척도 매트릭스로 나열하며, 각 행마다 두 종류 링크를 제공한다.

| 링크 종류 | 가리키는 위치 | 보는 주체 |
|----------|-------------|----------|
| 정적 미리보기 | `_publish/[경로]` | 기획자·고객 (디자인 확인) |
| 동작 테스트 | `app/public/[경로]` 또는 `localhost:3000/[경로]` | 개발자 (기능 확인) |
| 수정 프롬프트 | `PROMPT_MASTER.txt` 해당 블록 복사 | 기획자 (Stitch 재지시) |

각 화면 행에는 상태 플래그(`대기` → `바이브 코딩 중` → `로컬 검증 완료` → `개발 서버 배포 완료`)도 함께 표기되어, 고객과 기획자가 전체 진척을 한눈에 본다.

## 6. 외부 시스템 연계 지점

본 시스템은 두 개의 외부 경계를 가진다. 하나는 **기존 팝콘PC 쇼핑몰**로, SSO 로그인(회원 DB·세션 공유)과 최종 장바구니·결제 레일을 담당한다. 다른 하나는 **3사 외부 LLM API**(Google Gemini, OpenAI ChatGPT, Anthropic Claude)로, 백엔드 오케스트레이터를 통해서만 호출되며 프론트엔드에서 직접 호출하지 않는다.

---

2단계 산출물이 완성되었습니다. 이 사이트맵은 총 27개 화면(게이트 1 + 랜딩 2 + 초급자 6 + 고급자 7 + 관리자 10 + SSO 모달 등)을 정의하고, 각 화면의 ID·경로·전환 흐름·이중 링크 구조를 확정했습니다.

검토하시고 추가/수정할 화면이 있는지 봐주세요. 특히 관리자 화면을 `Admin_AI`, `Admin_Parts`, `Admin_Analytics` 세 폴더로 나눴는데, 이 분류가 적절한지 확인 부탁드립니다.

문제없으면 **3단계: 파일·디렉토리 구조서(`02_file-list.md`)**로 넘어가겠습니다. 진행할까요?