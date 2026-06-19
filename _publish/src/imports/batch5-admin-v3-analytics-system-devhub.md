아래는 **2단계 파일**입니다.  
아래 내용을 그대로 복사해서 다음 경로의 `.md` 파일로 저장하시면 됩니다.

```text
_docs/stitch-prompts/batch5-admin-v3-analytics-system-devhub.md
```

---

```md
# Stitch 생성 프롬프트 — 배치5 V3.0  
# 관리자 분석·시스템·DevHub 4화면

**파일 경로:** `_docs/stitch-prompts/batch5-admin-v3-analytics-system-devhub.md`  
**문서 버전:** Ver 3.0  
**갱신일:** 2026-06-19  
**선행 문서:** `00_glossary.md`, `01_sitemap.md`, `02_file-list.md`, `03_userflow.md`, `05_design-guide.md`, `06_db-erd.md`, `STITCH_RULES.md`

---

## 0. 배치5 V3.0 개요

이 문서는 팝콘PC AI 조립PC 추천 시스템의 관리자 백오피스 V3.0 화면 중, 마케팅 분석·시스템 제어·개발 허브 중심 4개 화면을 Stitch 또는 Figma Make 계열 도구에서 생성하기 위한 프롬프트 세트다.

배치5 V3.0은 배치4에서 생성한 비즈니스·상품·정책 화면 이후에 이어지는 관리자 후반부 화면이다.

관리자 V3.0의 후반부 우선순위는 다음과 같다.

1. 부품 스왑 및 특가 클릭률 리포트
2. 초보자/고급자 모드별 퍼널 이탈 관제
3. AI 비용 제어 및 트래픽 서킷 브레이커
4. 통합 개발 진척도 허브 DevHub

V3.0 기준에서 AI 비용·Rate Limit·Circuit Breaker는 관리자 첫 화면의 핵심 영역이 아니라, 운영 후순위의 시스템 제어 메뉴로 통합한다.  
다만 `adm-dashboard`에서는 AI 비용 상태를 미니 위젯으로 축소 노출한다.

---

## 1. 배치5 V3.0 생성 대상 화면

| 순서 | 화면 ID | Screen 키 | 화면명 | 관리자 메뉴 그룹 |
|------|---------|-----------|--------|----------------|
| 1 | `ADM-ANA-020` | `adm-click-report` | 부품 스왑 및 특가 클릭률 리포트 | 마케팅분석 |
| 2 | `ADM-ANA-030` | `adm-funnel` | 초보자/고급자 모드별 퍼널 이탈 관제 | 마케팅분석 |
| 3 | `ADM-SYS-010` | `adm-system-limit` | AI 비용 제어 및 트래픽 서킷 브레이커 | 시스템제어 |
| 4 | `DEV-HUB-010` | `dev-hub` | 통합 개발 진척도 허브 | 시스템제어 / 개발전용 |

---

## 2. 공통 규칙 블록 B — 관리자 V3.0 공통 규칙

아래 블록은 배치5의 관리자 화면 1~3에 붙여넣는다.

`dev-hub`는 관리자 LNB를 쓰지 않는 독립 게이트이므로, 별도의 `dev-hub 전용 규칙`을 사용한다.

```text
[관리자 공통 규칙 B — V3.0]
- 한국어 UI. 기술 약어만 영문 허용. 폰트는 Pretendard/Noto Sans KR, 행간 1.6.
- 타이포·컬러 토큰은 전역 디자인 가이드를 따른다.
  H1 28px Bold, H2 22px SemiBold, H3 18px SemiBold, 본문 14px.
  수치 강조는 24px Bold + Primary #0075d5.
  위험 #D32F2F, 정상 #2e7d32, 경고 #f9a825.
  배경 #f7f9fc, 카드 #ffffff, 테두리 #e0e0e0.
- 간격은 8px 그리드 기준으로 설계한다.
- 관리자 화면은 GNB 대신 좌측 LNB를 사용한다.
- LNB 폭은 200px이며 상단에 "팝콘PC 관리"를 표시한다.
- LNB 메뉴는 V3.0 기준으로 다음 순서다.
  [대시보드] [상품/재고] [가격/정책] [마케팅분석] [시스템제어]
- 현재 메뉴는 --active 클래스로 강조한다.
- LNB 하단 또는 상단 보조 영역에 "관리자님 ▾" 계정 영역을 둔다.
- LNB 우측에는 관리자 헤더를 둔다.
  헤더에는 현재 경로 breadcrumb, 화면 제목 보조 문구, 계정 상태를 표시한다.
- 본문은 LNB 우측 콘텐츠 영역에 배치한다.
- 동적 값은 data-bind, 반복 목록은 data-repeat, 버튼은 data-action을 사용한다.
- 차트 영역은 <canvas data-chart="...">로 표시한다.
- 예외 UI, 모달, 토스트, 로딩 영역은 기본 hidden 상태로 포함한다.
- 반응형: 768px 이하에서는 LNB가 햄버거로 접히고 본문은 1열 스택이 된다.
- body 또는 최상위 wrapper에 data-domain="admin"을 넣는다.
- 각 화면 최상위 wrapper에는 data-screen-id와 data-screen-key를 모두 넣는다.
- 인라인 스타일과 임의 색상 사용 금지. 반드시 디자인 토큰 기반 클래스를 사용한다.
- API Key, 개인정보, 실제 회원정보는 하드코딩 금지. 표기 시 *** 마스킹한다.
- 관리자 V3.0 우선순위는 다음과 같다.
  1) 비즈니스 대시보드
  2) 상품 마스터 및 재고 제어
  3) 가격 정책 및 추천 가중치
  4) 마케팅 및 사용자 행동 분석
  5) 시스템 비용·Rate Limit 제어
```

---

# 화면 1 — 부품 스왑 및 특가 클릭률 리포트

```text
위 [관리자 공통 규칙 B — V3.0]을 적용해
"부품 스왑 및 특가 클릭률 리포트" 화면을 만들어줘.

- data-screen-id="ADM-ANA-020"
- data-screen-key="adm-click-report"
- data-domain="admin"
- LNB의 [마케팅분석] 활성.

[헤더]
- H1 "마케팅 분석"
- 보조 문구 "AI 추천 부품의 스왑 이탈과 특가상품 CTR을 함께 분석합니다."

[상단 탭]
- [인기 키워드]
- [클릭/스왑 리포트] 활성
- [전환 퍼널]
- 각 탭 data-action="switch-analytics-tab".
- 인기 키워드는 adm-keywords로 이동.
- 전환 퍼널은 adm-funnel로 이동.

[필터]
- 기간 선택 시작일~종료일
- 모드 셀렉트 전체 / 초급자 / 고급자
- 카테고리 셀렉트 전체 / CPU / 그래픽카드 / 메모리 / SSD / 파워
- [조회] 버튼 data-action="query-click-report"

[섹션 1] 특가상품 클릭률 CTR
- H2 "특가상품 클릭률"
- <canvas data-chart="promo-ctr">
- 표 data-repeat="promo_click_items".
- 열:
  순위 / 상품명 / 노출 수 / 클릭 수 / CTR / 전주 대비
- CTR 높은 항목은 Primary 강조.
- 전주 대비 하락은 경고 또는 위험 배지.
- 더미:
  1 / RTX 4060 화이트 특가 / 12,400 / 1,860 / 15.0% / +2.1%
  2 / 라이젠 7500F 기획전 / 9,800 / 1,120 / 11.4% / -0.8%
  3 / 1TB NVMe SSD 특가 / 7,200 / 680 / 9.4% / +1.3%

[섹션 2] 카테고리별 최다 탈락 부품 TOP 10
- H2 "최다 탈락 부품 TOP 10"
- <canvas data-chart="swap-bar">
- 표 data-repeat="swap_items".
- 열:
  순위 / 부품명 / 카테고리 / 최초 추천 횟수 / 스왑 제외 횟수 / 제외율
- 더미:
  1 / RTX 3060 12GB / 그래픽카드 / 380 / 92 / 24.2%
  2 / 500GB SATA SSD / SSD / 210 / 51 / 24.0%
  3 / 600W 보급형 파워 / 파워 / 190 / 43 / 22.6%
- 제외율이 높은 항목은 위험색 배지로 강조.

[섹션 3] 운영 액션 제안
- H2 "운영 액션 제안"
- 카드 3개:
  1. "CTR은 높지만 스왑 제외율이 높은 상품"
     - 설명: "클릭 관심은 높으나 최종 구성 만족도가 낮은 상품입니다."
     - [정책 화면으로 이동] data-action="go-recommend-weights"
  2. "노출은 많지만 클릭률이 낮은 특가"
     - 설명: "특가 문구, 가격, 썸네일 또는 배치 우선순위 점검이 필요합니다."
     - [대시보드로 이동] data-action="go-dashboard"
  3. "가중치 조정 검토 대상"
     - 설명: "반복적으로 스왑 제외되는 카테고리는 추천 가중치 조정 대상입니다."
     - [추천 가중치 보기] data-action="go-recommend-weights"

[캡션]
- "AI가 제안했으나 사용자가 제외한 부품과 특가 클릭률을 함께 분석해 추천 품질과 마케팅 효율을 개선합니다."

[예외 UI]
- 데이터 없음 hidden:
  "선택한 조건에 해당하는 클릭/스왑 데이터가 없습니다."
- 조회 실패 hidden:
  "클릭/스왑 리포트 데이터를 불러오지 못했습니다."
```

---

# 화면 2 — 초보자/고급자 모드별 퍼널 이탈 관제

```text
위 [관리자 공통 규칙 B — V3.0]을 적용해
"초보자/고급자 모드별 퍼널 이탈 관제" 화면을 만들어줘.

- data-screen-id="ADM-ANA-030"
- data-screen-key="adm-funnel"
- data-domain="admin"
- LNB의 [마케팅분석] 활성.

[헤더]
- H1 "마케팅 분석"
- 보조 문구 "메인 진입부터 결제 레일까지 초급자/고급자 모드별 이탈 구간을 추적합니다."

[상단 탭]
- [인기 키워드]
- [클릭/스왑 리포트]
- [전환 퍼널] 활성
- 각 탭 data-action="switch-analytics-tab".
- 인기 키워드는 adm-keywords로 이동.
- 클릭/스왑 리포트는 adm-click-report로 이동.

[필터]
- 기간 선택 시작일~종료일
- 모드 셀렉트 전체 / 초급자 / 고급자
- 유입 채널 셀렉트 전체 / 검색 / 광고 / 직접유입 / 이벤트
- [조회] 버튼 data-action="query-funnel"

[섹션 1] 사용자 전환 퍼널
- H2 "사용자 전환 퍼널"
- <canvas data-chart="mode-funnel">
- 차트는 초급자와 고급자 모드를 구분할 수 있게 표시한다.
- 전체 선택 시 초급자/고급자 2개 퍼널을 비교 표시한다.
- 단계:
  1. 메인 진입
  2. 모드 선택
  3. 조건 입력 시작
  4. 조건 입력 완료
  5. AI 추천 요청
  6. 추천 결과 노출
  7. 커스터마이징
  8. 장바구니
  9. 결제 레일 진입
  10. 결제 성공

[섹션 2] 단계별 수치 표
- H2 "단계별 도달·이탈 수치"
- 표 data-repeat="funnel_steps".
- 열:
  단계 / 초급자 도달 수 / 고급자 도달 수 / 직전 대비 전환율 / 이탈률 / 상태
- 더미 행:
  메인 진입 / 12,400 / 3,210 / 100% / 0% / 정상
  모드 선택 / 8,920 / 2,540 / 78.4% / 21.6% / 정상
  조건 입력 완료 / 5,310 / 1,420 / 58.7% / 41.3% / 주의
  AI 추천 결과 노출 / 4,980 / 1,310 / 93.4% / 6.6% / 정상
  장바구니 / 1,120 / 410 / 24.3% / 75.7% / 위험
- 이탈률이 급증한 단계는 위험색 #D32F2F 배지로 강조한다.
- 정상은 초록, 주의는 경고색, 위험은 위험색으로 표시한다.

[섹션 3] 이탈 취약 구간 분석
- H2 "이탈 취약 구간"
- 카드 3개 data-repeat="dropoff_insights".
- 각 카드 구성:
  - 구간명
  - 이탈률
  - 추정 원인
  - 권장 조치
- 더미:
  "장바구니 전환 구간 · 이탈률 75.7% · 가격 부담 또는 스왑 피로도 · 업셀링 문구와 장바구니 CTA 개선 권장"
  "조건 입력 완료 전 · 이탈률 41.3% · 입력 단계 피로도 · 초급자 옵션 수 축소 검토"
  "결제 레일 진입 전 · 이탈률 36.2% · 로그인 유도 시점 부담 · 게스트 보관 기능 개선 검토"

[섹션 4] 운영 액션 버튼
- [랜딩 CTA 점검] 버튼 data-action="go-landing-check"
- [추천 결과 UI 점검] 버튼 data-action="go-result-check"
- [클릭/스왑 리포트 보기] 버튼 data-action="go-click-report"

[캡션]
- "모드 선택, 조건 입력, 추천 요청, 결과 노출, 장바구니, 결제 레일까지의 유저 저니 단계별 도달·이탈 분석입니다."

[예외 UI]
- 데이터 없음 hidden:
  "선택한 기간에 집계된 퍼널 데이터가 없습니다."
- 조회 실패 hidden:
  "퍼널 데이터를 불러오지 못했습니다."
```

---

# 화면 3 — AI 비용 제어 및 트래픽 서킷 브레이커

```text
위 [관리자 공통 규칙 B — V3.0]을 적용해
"AI 비용 제어 및 트래픽 서킷 브레이커" 화면을 만들어줘.

- data-screen-id="ADM-SYS-010"
- data-screen-key="adm-system-limit"
- data-domain="admin"
- LNB의 [시스템제어] 활성.

[헤더]
- H1 "시스템 제어"
- 보조 문구 "Rate Limit, AI 비용 임계치, Circuit Breaker를 통합 관리합니다."
- 우측에 현재 시스템 상태 배지:
  "정상 운영" / "주의" / "외부 AI 차단 중"

[섹션 1] AI 비용 상태
- H2 "3사 AI 비용 상태"
- 비용 요약 카드 3개:
  1. Gemini
     - 오늘 누적 비용 data-bind="cost.gemini.today"
     - 인바운드 토큰 data-bind="cost.gemini.in_tokens"
     - 아웃바운드 토큰 data-bind="cost.gemini.out_tokens"
     - 상태 배지 정상/주의/차단
  2. ChatGPT
     - 오늘 누적 비용 data-bind="cost.chatgpt.today"
     - 인바운드 토큰 data-bind="cost.chatgpt.in_tokens"
     - 아웃바운드 토큰 data-bind="cost.chatgpt.out_tokens"
     - 상태 배지 정상/주의/차단
  3. Claude
     - 오늘 누적 비용 data-bind="cost.claude.today"
     - 인바운드 토큰 data-bind="cost.claude.in_tokens"
     - 아웃바운드 토큰 data-bind="cost.claude.out_tokens"
     - 상태 배지 정상/주의/차단
- 비용 수치는 24px Bold Primary로 표시.
- 모델별 색상 보조:
  Gemini #4285f4
  ChatGPT #10a37f
  Claude #d97757
- 단, 전역 디자인 토큰 범위를 벗어나는 색상은 차트/배지 보조색으로만 사용한다.

[섹션 2] 비용 추이 차트
- H2 "일별 비용 추이"
- 기간 선택 시작일~종료일
- [조회] 버튼 data-action="query-cost-range"
- <canvas data-chart="llm-cost-line">
- 범례 Gemini / ChatGPT / Claude.
- 캡션 "토큰 사용량 기반 예상 달러 비용입니다."

[섹션 3] Circuit Breaker 임계치 설정
- H2 "비용 차단 임계치"
- 입력 필드:
  일일 전체 비용 임계치 USD data-bind="threshold.daily_total_usd"
  Gemini 개별 임계치 USD data-bind="threshold.gemini_usd"
  ChatGPT 개별 임계치 USD data-bind="threshold.chatgpt_usd"
  Claude 개별 임계치 USD data-bind="threshold.claude_usd"
- 예시 값:
  전체 $50
  Gemini $20
  ChatGPT $20
  Claude $20
- [임계치 저장] 버튼 data-action="save-cost-threshold"
- [즉시 외부 AI 차단] Danger 버튼 data-action="manual-circuit-break"
- [차단 해제] Secondary 버튼 data-action="release-circuit-breaker"
- 위험 변경 확인 모달 hidden:
  "외부 LLM 호출이 즉시 차단됩니다. 계속하시겠습니까?"

[섹션 4] 회원/IP별 Rate Limit 정책
- H2 "이용 제한 정책"
- 테이블 data-repeat="rate_limits".
- 열:
  대상 유형 / 대상 값 / 일일 한도 / 현재 사용량 / 적용 여부 / 관리
- 더미:
  회원등급 / 일반 / 10회 / 7회 / 적용 / [수정]
  회원등급 / 우수 / 30회 / 12회 / 적용 / [수정]
  회원등급 / 딜러 / 50회 / 18회 / 적용 / [수정]
  IP / 123.***.***.45 / 5회 / 5회 / 적용 / [수정]
- [정책 추가] 버튼 data-action="add-rate-limit"
- [저장] 버튼 data-action="save-rate-limit"

[섹션 5] 현재 차단 상태 로그
- H2 "차단 이벤트 로그"
- 표 data-repeat="system_block_logs".
- 열:
  발생 시각 / 차단 유형 / 대상 / 사유 / 처리 상태
- 예시:
  2026-06-19 10:22 / Rate Limit / 일반회원 / 일일 10회 초과 / 429 반환
  2026-06-19 11:05 / Circuit Breaker / 전체 LLM / 일일 $50 초과 / 외부 호출 차단

[보안 안내]
- 캡션:
  "API Key는 서버 .env에서만 관리하며, 관리자 화면에는 절대 평문 노출하지 않습니다."
  "Rate Limit과 Circuit Breaker는 외부 LLM 호출 전에 먼저 검사됩니다."

[예외 UI]
- 저장 성공 토스트 hidden:
  "시스템 제어 정책이 저장되었습니다."
- 저장 실패 hidden:
  "정책 저장에 실패했습니다."
- Circuit Breaker 발동 안내 hidden:
  "외부 AI 호출이 차단되었습니다."
```

---

# 화면 4 — 통합 개발 진척도 허브 DevHub

`dev-hub`는 관리자 LNB를 쓰지 않는 독립 게이트다.  
다만 V3.0 기준에서는 관리자 사이트맵의 5단계인 **시스템 인프라 및 개발 특수 제어** 하위에 속한다.

```text
[dev-hub 전용 규칙 — V3.0]
- 한국어 UI. 기술 약어만 영문 허용.
- 폰트는 Pretendard/Noto Sans KR, 행간 1.6.
- 간격은 8px 그리드.
- 타이포·컬러 토큰은 전역 디자인 가이드를 따른다.
  H1 28px Bold, H2 22px SemiBold, H3 18px SemiBold, 본문 14px.
  Primary #0075d5, 위험 #D32F2F, 정상 #2e7d32, 경고 #f9a825.
  배경 #f7f9fc, 카드 #ffffff, 테두리 #e0e0e0.
- GNB/LNB 없음.
- 상단 풀폭 타이틀 바 + 인프라 상태 바 + 4개 섹션 카드 구조.
- 동적 값은 data-bind, 반복은 data-repeat, 버튼은 data-action을 사용한다.
- 차트가 필요한 경우 <canvas data-chart="..."> 사용.
- 예외 UI, 모달, 토스트, 로딩 영역은 기본 hidden 상태로 포함한다.
- body 또는 최상위 wrapper에 data-screen-id="DEV-HUB-010", data-screen-key="dev-hub", data-domain="dev"를 넣는다.
- 인라인 스타일과 임의 색상 사용 금지.
- API Key, 개인정보, 실제 회원정보는 하드코딩 금지. 표기 시 *** 마스킹한다.

위 규칙으로 "팝콘PC AI 통합 개발·운영 마스터 제어 허브" 화면을 만들어줘.

[상단 타이틀 바]
- H1 "팝콘PC AI — 통합 개발·운영 마스터 제어 허브"
- 보조 문구 "기획·개발·고객 검수를 위한 화면 진척도, 세션, Mock API, 운영 정책 테스트 게이트입니다."
- 우측에 [랜딩으로 이동] 버튼 data-action="go-landing"
- 우측에 [관리자 대시보드] 버튼 data-action="go-admin-dashboard"

[인프라 상태 바]
- 가로 한 줄 카드 형태.
- 상태 항목:
  - "로컬 DB: ● ONLINE" data-bind="infra.local_db"
  - "개발서버 DB: ● ONLINE" data-bind="infra.server_db"
  - "Nginx: 정상" data-bind="infra.nginx"
  - "Mock API: ON" data-bind="infra.mock_api"
  - "Circuit Breaker: 정상" data-bind="infra.circuit_breaker"
- 상태 점 색상:
  정상 초록
  진행/주의 경고색
  오류/차단 위험색
- DB 오프라인 시 노출되는 툴팁 hidden:
  "DB 연결 예외 — 'Show all databases' 조치를 확인하세요."

[섹션 1] 화면 구현 진척도 매트릭스
- H2 "① 화면 구현 진척도 매트릭스"
- 설명:
  "Screen 키 기준으로 정적 미리보기와 개발본 동작 테스트를 추적합니다."
- 표 data-repeat="screens".
- 열:
  화면 ID / Screen 키 / 컴포넌트 / 구현 상태 / 이동 링크
- 구현 상태 배지:
  ⚪ 대기
  🟡 코딩중
  🔵 로컬검증
  ● 배포완료
- 이동 링크 열 버튼:
  [정적 미리보기] data-action="preview-static"
  [동작 테스트] data-action="preview-live"
  [수정 프롬프트] data-action="copy-prompt"
- 더미 행:
  FR-LND-010 / landing / Landing / ● 배포완료
  ADM-DSH-010 / adm-dashboard / AdmDashboard / 🔵 로컬검증
  ADM-PRD-010 / adm-product-master / AdmProductMaster / 🟡 코딩중
  ADM-SYS-010 / adm-system-limit / AdmSystemLimit / ⚪ 대기
- 캡션:
  "상태: ⚪대기 → 🟡코딩중 → 🔵로컬검증 → ●배포완료"

[섹션 2] 개발 테스트 도구
- H2 "② 개발 테스트 도구"
- 2개 카드 나란히.

카드 1:
- H3 "가상 세션 강제 주입"
- 설명 "SSO 연동 없이 개발 테스트용 세션을 주입합니다."
- 버튼:
  [일반 회원] data-action="inject-session" data-grade="normal"
  [우수 회원] data-action="inject-session" data-grade="vip"
  [딜러] data-action="inject-session" data-grade="dealer"
  [게스트 유입] data-action="inject-session" data-grade="guest"
- 세션 주입 성공 토스트 hidden:
  "가상 세션이 주입되었습니다."

카드 2:
- H3 "외부 LLM API Mock 스위치"
- 설명 "개발·테스트 중 외부 LLM 비용 발생을 차단합니다."
- 토글:
  [실제 API 호출] data-action="toggle-real-api"
  [가상 JSON 응답] data-action="toggle-mock-api"
- 기본은 [가상 JSON 응답] 활성 --active.
- 위험 안내:
  "실제 API 호출 전 비용 임계치와 API Key 설정을 확인하세요."

[섹션 3] 운영 정책 미리보기
- H2 "③ 운영 정책 미리보기"
- 2개 카드 나란히.

카드 1:
- H3 "추천 로직 실시간 가중치"
- 슬라이더 3개:
  재고소진 data-bind="weights.stock_weight" 기본 40%
  마진극대 data-bind="weights.margin_weight" 기본 30%
  가성비 data-bind="weights.value_weight" 기본 30%
- 총합 표시:
  "총합 100%" data-bind="weights.total"
- 총합 오류 메시지 hidden:
  "가중치 총합은 100%여야 합니다."
- [가중치 저장] 버튼 data-action="save-weights"
- [관리자 정책 화면으로 이동] 버튼 data-action="go-recommend-weights"

카드 2:
- H3 "AI 비용·서킷 브레이커"
- 수치 라인:
  Gemini $12.50 data-bind="cost.gemini"
  ChatGPT $18.20 data-bind="cost.chatgpt"
  Claude $22.10 data-bind="cost.claude"
- Circuit Breaker 상태 배지 data-bind="circuit.status"
- 버튼:
  [비용 차단 임계 설정] data-action="go-system-limit"
  [Mock 강제 ON] data-action="force-mock-on"

[섹션 4] 관리자 V3.0 빠른 이동
- H2 "④ 관리자 V3.0 빠른 이동"
- 카드 그리드 5개:
  1. "비즈니스 대시보드" / adm-dashboard / [이동] data-action="go-adm-dashboard"
  2. "상품 마스터 및 재고" / adm-product-master / [이동] data-action="go-adm-product-master"
  3. "CSV 업서트" / adm-csv-import / [이동] data-action="go-adm-csv-import"
  4. "가격/추천 정책" / adm-price-policy, adm-recommend-weights / [이동] data-action="go-adm-price-policy"
  5. "시스템 제어" / adm-system-limit / [이동] data-action="go-adm-system-limit"
- 각 카드에는 작은 설명:
  "V3.0 기준 운영 우선순위에 맞춘 이동 경로입니다."

[예외 UI]
- 프롬프트 복사 성공 토스트 hidden:
  "수정 프롬프트가 클립보드에 복사되었습니다."
- Mock 전환 성공 토스트 hidden:
  "Mock API 상태가 변경되었습니다."
- 인프라 조회 실패 hidden:
  "인프라 상태를 불러오지 못했습니다."
```

---

# 3. 배치5 V3.0 변경 요약

| 기존 화면 | 기존 Screen 키 | V3.0 화면 | V3.0 Screen 키 | 처리 |
|----------|----------------|-----------|----------------|------|
| 탈락 부품 분석 | `adm-swap-report` | 클릭/스왑 리포트 | `adm-click-report` | 특가 CTR 통합 |
| 전환 퍼널 | `adm-funnel` | 모드별 퍼널 이탈 관제 | `adm-funnel` | 유지하되 초급/고급 비교 확장 |
| AI 트래픽·비용 모니터링 | `adm-monitoring` | 시스템 제어 | `adm-system-limit` | 통합 |
| 이용 제한 정책 | `adm-rate-limit` | 시스템 제어 | `adm-system-limit` | 통합 |
| DevHub | `dev-hub` | 통합 개발 진척도 허브 | `dev-hub` | 유지하되 V3.0 빠른 이동 추가 |

---

# 4. 생성 후 편입 기준

현재 `_publish`는 화면별 HTML 파일 구조가 아니라 Vite/React SPA 구조다.  
따라서 Stitch 생성 결과는 화면별 HTML 경로가 아니라 Screen 키 기준으로 추적한다.

## 4.1 프롬프트 문서 편입 위치

```text
_publish/src/imports/batch5-admin-v3-analytics-system-devhub.md
```

## 4.2 개발본 React 컴포넌트 분리 위치

```text
app/src/app/screens/admin/
├── AdmClickReport.tsx
├── AdmFunnel.tsx
└── AdmSystemLimit.tsx

app/src/app/screens/dev/
└── DevHub.tsx
```

## 4.3 Screen 키 연결 기준

```text
adm-click-report       → AdmClickReport
adm-funnel             → AdmFunnel
adm-system-limit       → AdmSystemLimit
dev-hub                → DevHub
```

---

# 5. 최종 관리자 V3.0 Stitch 배치 구성

관리자 V3.0 기준 Stitch 생성 배치는 다음과 같이 정리한다.

```text
배치4 V3.0 — 관리자 비즈니스·상품·정책 6화면
1. ADM-DSH-010 / adm-dashboard
2. ADM-PRD-010 / adm-product-master
3. ADM-CSV-010 / adm-csv-import
4. ADM-POL-010 / adm-price-policy
5. ADM-POL-020 / adm-recommend-weights
6. ADM-ANA-010 / adm-keywords

배치5 V3.0 — 관리자 분석·시스템·DevHub 4화면
1. ADM-ANA-020 / adm-click-report
2. ADM-ANA-030 / adm-funnel
3. ADM-SYS-010 / adm-system-limit
4. DEV-HUB-010 / dev-hub
```

---

# 6. 최종 Screen 키 변경 요약

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
| 개발 허브 | `dev-hub` | `dev-hub` | 유지 |

---

# 7. 최종 개발본 파일 기준

관리자 V3.0 개발본의 최종 기준 파일은 다음과 같다.

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
└── AdmSystemLimit.tsx            ← ADM-SYS-010 / adm-system-limit

app/src/app/screens/dev/
└── DevHub.tsx                    ← DEV-HUB-010 / dev-hub
```

백엔드 관리자 API 기준 파일은 다음과 같다.

```text
app/server/routes/
├── admin.dashboard.routes.js
├── admin.products.routes.js
├── admin.policy.routes.js
├── admin.system.routes.js
└── analytics.routes.js

app/server/services/
├── dashboard.service.js
├── product.service.js
├── inventory.service.js
├── csv-upsert.service.js
├── policy.service.js
├── analytics.service.js
└── cost-control.service.js
```

---

# 8. 배치5 V3.0 완료 문구

배치5 V3.0 관리자 Stitch 프롬프트가 완성되었습니다.

V3.0에서는 기존 `adm-swap-report`를 특가 CTR과 함께 보는 `adm-click-report`로 확장했고, `adm-funnel`은 초급자/고급자 모드별 퍼널 비교 관제로 고도화했습니다.  
AI 비용 모니터링과 Rate Limit은 후순위 시스템 메뉴인 `adm-system-limit`로 통합했으며, Circuit Breaker 임계치와 수동 차단/해제를 함께 관리하도록 구성했습니다.  
`dev-hub`는 독립 게이트 구조를 유지하되, 관리자 V3.0 빠른 이동, Mock API, 가상 세션, 추천 가중치, 비용 상태를 함께 확인할 수 있도록 확장했습니다.

이로써 관리자 V3.0 Stitch 프롬프트 세트는 다음 10개 화면으로 완성됩니다.

1. `adm-dashboard`
2. `adm-product-master`
3. `adm-csv-import`
4. `adm-price-policy`
5. `adm-recommend-weights`
6. `adm-keywords`
7. `adm-click-report`
8. `adm-funnel`
9. `adm-system-limit`
10. `dev-hub`
```

---

위 내용이 **2단계 파일**입니다.

생성해야 할 최종 파일은 아래 2개입니다.

```text
_docs/stitch-prompts/batch4-admin-v3-business-inventory.md
_docs/stitch-prompts/batch5-admin-v3-analytics-system-devhub.md
```