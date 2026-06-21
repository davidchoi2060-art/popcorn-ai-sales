좋습니다. 분량이 많아서 **2단계로 나누어 생성**하겠습니다.

이번 답변에서는 먼저 아래 파일 1개를 생성합니다.

```text
_docs/stitch-prompts/batch4-admin-v3-business-inventory.md
```

다음 답변에서 이어서 아래 파일을 생성하면 됩니다.

```text
_docs/stitch-prompts/batch5-admin-v3-analytics-system-devhub.md
```

아래 내용을 그대로 복사해서 해당 경로의 `.md` 파일로 저장하시면 됩니다.

---

```md
# Stitch 생성 프롬프트 — 배치4 V3.0  
# 관리자 비즈니스·상품·정책 6화면

**파일 경로:** `_docs/stitch-prompts/batch4-admin-v3-business-inventory.md`  
**문서 버전:** Ver 3.0  
**갱신일:** 2026-06-19  
**선행 문서:** `00_glossary.md`, `01_sitemap.md`, `02_file-list.md`, `03_userflow.md`, `05_design-guide.md`, `06_db-erd.md`, `STITCH_RULES.md`

---

## 0. 배치4 V3.0 개요

이 문서는 팝콘PC AI 조립PC 추천 시스템의 관리자 백오피스 V3.0 화면 중, 비즈니스·상품·정책 중심 6개 화면을 Stitch 또는 Figma Make 계열 도구에서 생성하기 위한 프롬프트 세트다.

관리자 V3.0은 기존 AI 비용 관제 중심 구조가 아니라, 실제 운영자와 MD가 출근 후 먼저 확인하고 조치해야 하는 업무 순서에 맞춰 다음 우선순위로 재정렬한다.

1. 통합 비즈니스 & 트렌드 대시보드
2. 상품 마스터 및 재고 제어
3. CSV 대량 상품 업데이트
4. 가격 정책 및 카테고리 마진 통제
5. AI 추천 엔진 가중치 제어
6. 실시간 유저 관심 키워드 및 형태소 관제

---

## 1. 배치4 V3.0 생성 대상 화면

| 순서 | 화면 ID | Screen 키 | 화면명 | 관리자 메뉴 그룹 |
|------|---------|-----------|--------|----------------|
| 1 | `ADM-DSH-010` | `adm-dashboard` | 통합 비즈니스 & 트렌드 대시보드 | 대시보드 |
| 2 | `ADM-PRD-010` | `adm-product-master` | 마스터 상품 검색 및 실시간 품절 스위치 | 상품/재고 |
| 3 | `ADM-CSV-010` | `adm-csv-import` | 대량 상품 업데이트 CSV 업서트 | 상품/재고 |
| 4 | `ADM-POL-010` | `adm-price-policy` | 부품 가격동향 및 카테고리 마진 통제 | 가격/정책 |
| 5 | `ADM-POL-020` | `adm-recommend-weights` | AI 추천 엔진 가중치 제어 | 가격/정책 |
| 6 | `ADM-ANA-010` | `adm-keywords` | 실시간 유저 관심 키워드 및 형태소 관제 | 마케팅분석 |

---

## 2. 공통 규칙 블록 B — 관리자 V3.0 공통 규칙

아래 블록을 배치4의 모든 관리자 화면 프롬프트 앞에 붙여넣는다.

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

# 화면 1 — 통합 비즈니스 & 트렌드 대시보드

```text
위 [관리자 공통 규칙 B — V3.0]을 적용해
"통합 비즈니스 & 트렌드 대시보드" 화면을 만들어줘.

- data-screen-id="ADM-DSH-010"
- data-screen-key="adm-dashboard"
- data-domain="admin"
- LNB의 [대시보드] 활성.

[헤더]
- H1 "통합 비즈니스 & 트렌드 대시보드"
- 보조 문구 "오늘의 견적 흐름, 특가 반응, 유저 관심사, 가격동향을 한 화면에서 확인합니다."
- 우측 상단에 날짜 범위 선택 + [새로고침] 버튼 data-action="refresh-dashboard".

[섹션 1] 실시간 피드 — AI 최종 견적 출력 목록
- H2 "실시간 AI 최종 견적 피드"
- 카드형 타임라인 data-repeat="final_quotes".
- 각 행에는 다음 요소를 표시:
  - 모드 배지: 초급자 / 고급자
  - 견적명 또는 주요 용도
  - 주요 부품 요약 CPU/GPU/RAM/SSD
  - 최종 견적 금액 data-bind="quote.total_price" 수치 24px Bold Primary
  - 생성 시각
  - 상태 배지: 추천완료 / 장바구니 / 결제진입
- 더미 예시:
  "초급자 · 배틀그라운드용 · Ryzen 5 / RTX 4060 / 32GB / 1TB · 1,280,000원 · 추천완료"

[섹션 2] 금주 특가상품 클릭률 CTR
- H2 "금주 특가상품 클릭률"
- <canvas data-chart="promo-ctr-bar">
- 우측에 TOP 5 리스트 data-repeat="promo_ctr_items".
- 열 또는 항목: 상품명 / 노출 수 / 클릭 수 / CTR / 전주 대비.
- 상승은 정상색, 하락은 경고색 또는 위험색 보조 배지.

[섹션 3] 유저 자연어 형태소 트렌드
- H2 "유저 관심사 TOP 10"
- 랭킹 리스트 data-repeat="keyword_trends".
- 예시 키워드:
  1. 배틀그라운드 상옵
  2. 원컴방송용
  3. 딥러닝 코딩
  4. 화이트 감성
  5. RTX 4070
- 급상승 키워드는 "급상승" 배지 표시.
- 캡션 "개인정보 마스킹 후 프롬프트 명사 키워드만 집계합니다."

[섹션 4] 부품 가격동향 및 클릭분포
- H2 "부품 가격동향 및 클릭분포"
- 좌측 <canvas data-chart="price-trend-line">
- 우측 <canvas data-chart="price-click-distribution">
- 가격동향은 공급가/판매가/시장가 라인을 구분.
- 클릭분포는 유저가 가장 많이 조회한 가격대 구간을 표시.

[섹션 5] AI 비용 미니 위젯
- 대시보드 우측 하단 또는 보조 카드로 작게 배치.
- H3 "AI 비용 상태"
- Gemini / ChatGPT / Claude 누적 달러 비용을 한 줄로 표시.
  data-bind="cost.gemini", data-bind="cost.chatgpt", data-bind="cost.claude"
- Circuit Breaker 상태 배지:
  "정상" / "주의" / "차단"
- [시스템 제어로 이동] 버튼 data-action="go-system-limit".
- 비용 위젯은 메인 지표보다 작게 배치한다.

[예외 UI]
- 데이터 로딩 skeleton hidden.
- 대시보드 조회 실패 알림 hidden: "대시보드 데이터를 불러오지 못했습니다."
```

---

# 화면 2 — 마스터 상품 검색 및 실시간 품절 스위치

```text
위 [관리자 공통 규칙 B — V3.0]을 적용해
"마스터 상품 검색 및 실시간 품절 스위치" 화면을 만들어줘.

- data-screen-id="ADM-PRD-010"
- data-screen-key="adm-product-master"
- data-domain="admin"
- LNB의 [상품/재고] 활성.

[헤더]
- H1 "상품 마스터 및 재고 제어"
- 보조 문구 "상품 검색, AI 호환성 필드 수정, 품절/단종 1초 차단을 처리합니다."

[상단 검색 필터]
- 한 줄 또는 2줄 검색바 구성.
- 카테고리 셀렉트 data-bind="filter.category"
  예: CPU, 그래픽카드, 메모리, SSD, 메인보드, 파워, 케이스, 쿨러
- 상태 셀렉트 data-bind="filter.status"
  판매중 / 품절 / 단종 / 삭제대기
- 제조사 셀렉트 data-bind="filter.maker"
- 키워드 입력 placeholder "상품명, 모델명, RTX, Ryzen 등"
- [검색] 버튼 data-action="search-products"
- [필터 초기화] 버튼 data-action="reset-product-filter"

[상품 목록 테이블]
- 테이블 data-repeat="products".
- 50건/페이지 기준.
- 열:
  상품코드 / 상품명 / 카테고리 / 제조사 / 상태 / 판매가 / AI 필드 상태 / 관리
- 더미 행:
  101268 / AMD 라이젠 R5 1400 / CPU / AMD / 판매중 / 89,000원 / 완료 / [편집]
  204455 / RTX 4060 WHITE 8GB / 그래픽카드 / NVIDIA / 판매중 / 438,000원 / 일부누락 / [편집]
- 상태 배지:
  판매중은 정상색
  품절/단종은 회색 또는 비활성 배지
  삭제대기는 경고색
- AI 필드 상태:
  완료 / 일부누락 / 검증필요 배지

[상태 즉시 변경]
- 각 행에 상태 토글 또는 상태 셀렉트 포함.
- 판매중 / 품절 / 단종으로 즉시 변경 가능.
- 상태 변경 버튼 data-action="update-product-status" data-code.
- 품절 또는 단종 선택 시 확인 모달 hidden:
  "해당 상품은 1초 이내 추천 후보군과 스왑 대안 목록에서 제외됩니다. 계속하시겠습니까?"
- 확인 버튼 data-action="confirm-status-change".
- 성공 토스트 hidden:
  "추천 후보군에서 제외 완료"

[AI 호환성 필드 편집 패널]
- [편집] 클릭 시 우측 슬라이드 패널 또는 모달 hidden 영역을 포함.
- 패널 제목 H2 "AI 호환성 필드 편집"
- 필드:
  자체상품코드 읽기전용 PK
  상품명 읽기전용 또는 수정 가능
  part_type 셀렉트 CPU/GPU/RAM/SSD/MB/POWER/COOLER/CASE
  socket 입력 예 AM5, LGA1700
  chipset 입력
  mem_type 셀렉트 DDR4/DDR5
  tdp_watt 입력
  rated_watt 입력
  length_mm 입력
  gpu_max_mm 입력
  cooler_tdp 입력
  pcie_gen 입력
  tag_white 체크박스
  tag_rgb 체크박스
  tag_silent 체크박스
  margin_locked 체크박스 "관리자 보강값 보존"
- 필수 연산 필드 누락 오류 hidden:
  "소켓, 전력 W, 치수 mm 등 필수 연산 필드를 확인해주세요."
- [저장] 버튼 data-action="save-product-spec"
- [닫기] 버튼 data-action="close-product-panel"

[하단]
- 페이지네이션 "◂ 1 2 3 ▸" data-action="paging"
- 캡션 "50개 단위 페이징 · 상품 검색 0.3초 이내 응답 목표"
- 빈 결과 hidden: "검색 결과가 없습니다."
```

---

# 화면 3 — 대량 상품 업데이트 CSV 업서트

```text
위 [관리자 공통 규칙 B — V3.0]을 적용해
"대량 상품 업데이트 CSV 업서트" 화면을 만들어줘.

- data-screen-id="ADM-CSV-010"
- data-screen-key="adm-csv-import"
- data-domain="admin"
- LNB의 [상품/재고] 활성.

[헤더]
- H1 "대량 상품 업데이트 CSV"
- 보조 문구 "00.상품다운.csv를 자체상품코드 기준으로 Insert / Update 처리합니다."

[업로드 영역]
- 큰 드래그앤드롭 업로드 박스.
- 문구:
  "00.상품다운.csv 파일을 끌어놓거나 선택하세요."
- [파일 선택] 버튼 data-action="choose-file"
- 선택 파일명 data-bind="csv.file_name"
- 캡션:
  "자체상품코드(PK) 기준 — 신규 상품 Insert / 기존 상품 Update"

[사전 검증 카드]
- H2 "업로드 전 검증"
- 파일 선택 후 노출되는 요약 영역 hidden.
- 항목:
  전체 행 수 data-bind="csv.total_rows"
  예상 신규 data-bind="csv.expected_insert"
  예상 수정 data-bind="csv.expected_update"
  예상 오류 data-bind="csv.expected_errors"
- 필수 컬럼 체크리스트:
  자체상품코드 / 상품명 / 카테고리 / 상태값 / 매입가 / 일반회원가
- 오류가 있으면 위험색 배지.

[처리 실행]
- 우측 하단 Primary 버튼 [업로드 실행] data-action="run-upsert"
- 업로드 중 hidden 영역:
  "업로드 처리 중입니다..."
  progress bar data-bind="csv.progress"

[처리 결과]
- H2 "처리 결과"
- 기본 hidden.
- 결과 카드 3개:
  ✓ 신규 N건 data-bind="csv.inserted_count"
  ✓ 수정 N건 data-bind="csv.updated_count"
  ⚠ 오류 N건 data-bind="csv.error_count"
- 오류 행 표 data-repeat="csv_errors":
  행 번호 / 자체상품코드 / 오류 필드 / 오류 사유
- [오류 목록 다운로드] 버튼 data-action="download-errors"
- [상품 마스터로 이동] 버튼 data-action="go-product-master"

[주의 문구]
- "가격 관련 필드가 변경된 경우 product_price_history에 이력이 저장됩니다."
- "정상 행은 처리하고 오류 행은 리포트로 분리합니다."
```

---

# 화면 4 — 부품 가격동향 및 카테고리 마진 통제

```text
위 [관리자 공통 규칙 B — V3.0]을 적용해
"부품 가격동향 및 카테고리 마진 통제" 화면을 만들어줘.

- data-screen-id="ADM-POL-010"
- data-screen-key="adm-price-policy"
- data-domain="admin"
- LNB의 [가격/정책] 활성.

[헤더]
- H1 "가격 정책 및 카테고리 마진"
- 보조 문구 "공급가 변동과 시장 가격동향을 참고해 카테고리별 마진율을 조정합니다."

[섹션 1] 부품 가격동향
- H2 "부품 가격동향"
- 필터:
  카테고리 셀렉트 CPU / 그래픽카드 / 메모리 / SSD / 파워
  기간 선택 시작일~종료일
  [조회] 버튼 data-action="query-price-trend"
- <canvas data-chart="admin-price-trend">
- 라인 범례:
  공급가 / 일반회원가 / 시장가
- 캡션 "CSV 업서트 시 가격 변동이 감지되면 가격 이력에 저장됩니다."

[섹션 2] 카테고리별 마진율 정책
- H2 "카테고리별 마진율"
- 테이블 또는 슬라이더 그리드 data-repeat="margin_policies".
- 열:
  카테고리 / 기본 마진율 / 추가 가산율 / 적용 여부 / 최근 수정일
- 더미:
  그래픽카드 / 15% / 2% / 적용
  CPU / 12% / 1% / 적용
  메모리 / 18% / 0% / 적용
  파워 / 20% / 3% / 적용
- 각 마진율은 슬라이더 + 숫자 입력을 함께 제공.
- 슬라이더 채움과 핸들은 Primary 색상.
- 적용 여부 switch data-action="toggle-margin-policy".

[섹션 3] 저장 전 영향 안내
- 카드 문구:
  "마진 정책 변경은 다음 AI 추천 요청부터 반영됩니다."
  "기존 확정 견적은 저장 시점 기준 가격을 유지하거나 재검증 대상이 됩니다."

[하단 버튼]
- [정책 저장] Primary 버튼 data-action="save-margin-policy"
- [변경 취소] Secondary 버튼 data-action="reset-margin-policy"

[예외 UI]
- 저장 실패 hidden:
  "정책 저장에 실패했습니다. 입력값을 확인해주세요."
- 저장 성공 토스트 hidden:
  "가격 정책이 저장되었습니다."
```

---

# 화면 5 — AI 추천 엔진 가중치 제어

```text
위 [관리자 공통 규칙 B — V3.0]을 적용해
"AI 추천 엔진 가중치 제어" 화면을 만들어줘.

- data-screen-id="ADM-POL-020"
- data-screen-key="adm-recommend-weights"
- data-domain="admin"
- LNB의 [가격/정책] 활성.

[헤더]
- H1 "AI 추천 엔진 가중치 제어"
- 보조 문구 "재고소진, 마진극대, 가성비 비중의 총합을 100%로 조정합니다."

[섹션 1] 추천 가중치 밸브
- H2 "추천 정책 가중치"
- 3개 슬라이더 카드:
  1. 재고소진 비중 data-bind="weights.stock_weight"
  2. 마진극대 비중 data-bind="weights.margin_weight"
  3. 가성비 비중 data-bind="weights.value_weight"
- 각 슬라이더는 0~100%.
- 수치 표기는 24px Bold Primary.
- 총합 카드:
  "현재 총합: 100%" data-bind="weights.total"
- 총합이 100%가 아니면 위험색 메시지 hidden:
  "가중치 총합은 반드시 100%여야 합니다."
- 총합 오류 시 [저장] 버튼 disabled 상태를 표현.

[섹션 2] 정책 시뮬레이션 미리보기
- H2 "정책 적용 미리보기"
- 3개 카드:
  재고소진 우선 시 예상 효과
  마진극대 우선 시 예상 효과
  가성비 우선 시 예상 효과
- 각 카드에 간단한 설명:
  "재고 회전율 상승"
  "견적당 예상 마진 증가"
  "사용자 예산 적합도 상승"
- 더미 변화 수치 data-bind 포함.

[섹션 3] 운영 주의사항
- 캡션:
  "정책 변경은 다음 추천 요청부터 적용됩니다."
  "극단적인 가중치는 추천 다양성을 낮출 수 있습니다."

[하단 버튼]
- [가중치 저장] Primary 버튼 data-action="save-recommend-weights"
- [기본값 복원] Secondary 버튼 data-action="restore-default-weights"
- [DevHub 미리보기] 버튼 data-action="go-devhub"

[예외 UI]
- 저장 성공 토스트 hidden:
  "추천 가중치가 저장되었습니다."
- 저장 실패 hidden:
  "가중치 저장에 실패했습니다."
```

---

# 화면 6 — 실시간 유저 관심 키워드 및 형태소 관제

```text
위 [관리자 공통 규칙 B — V3.0]을 적용해
"실시간 유저 관심 키워드 및 형태소 관제" 화면을 만들어줘.

- data-screen-id="ADM-ANA-010"
- data-screen-key="adm-keywords"
- data-domain="admin"
- LNB의 [마케팅분석] 활성.

[헤더]
- H1 "마케팅 분석"
- 보조 문구 "유저가 직접 입력한 자연어 프롬프트에서 관심 키워드를 분석합니다."

[상단 탭]
- 탭 3개:
  [인기 키워드] 활성
  [클릭/스왑 리포트]
  [전환 퍼널]
- 각 탭 data-action="switch-analytics-tab"
- 클릭/스왑 리포트는 adm-click-report로 이동.
- 전환 퍼널은 adm-funnel로 이동.

[필터]
- 기간 선택 시작일~종료일
- 모드 셀렉트 전체 / 초급자 / 고급자
- [조회] 버튼 data-action="query-keywords"

[섹션 1] 인기 키워드 TOP 10
- H2 "인기 키워드 랭킹"
- 좌측 <canvas data-chart="keyword-rank">
- 우측 랭킹 리스트 data-repeat="keywords".
- 더미:
  1. 배틀그라운드 상옵
  2. 원컴방송용
  3. 딥러닝 코딩
  4. 화이트 감성
  5. RTX 4070
- 각 키워드는 빈도 수와 전주 대비 상승/하락 배지 표시.

[섹션 2] 워드클라우드 영역
- H2 "프롬프트 워드클라우드"
- <canvas data-chart="keyword-wordcloud">
- 캡션:
  "개인정보 마스킹 후 명사 중심으로 집계합니다."

[예외 UI]
- 데이터 없음 hidden:
  "선택한 기간에 집계된 키워드가 없습니다."
```

---

# 3. 배치4 V3.0 변경 요약

| 기존 화면 | 기존 Screen 키 | V3.0 화면 | V3.0 Screen 키 | 처리 |
|----------|----------------|-----------|----------------|------|
| 마스터 대시보드 / 비용 중심 | `adm-dashboard` | 통합 비즈니스 & 트렌드 대시보드 | `adm-dashboard` | 유지하되 내용 재구성 |
| 상품 마스터 목록 | `adm-master` | 상품 마스터 및 재고 제어 | `adm-product-master` | 변경 |
| 상품 등록/수정 | `adm-product-edit` | 상품 마스터 내부 편집 패널 | `adm-product-master` | 통합 |
| CSV 일괄 업서트 | `adm-csv` | CSV 업서트 | `adm-csv-import` | 변경 |
| 카테고리 정책 제어 | `adm-category` | 가격 정책 및 카테고리 마진 | `adm-price-policy` | 역할 재정의 |
| DevHub 가중치 일부 | `dev-hub` | 추천 엔진 가중치 제어 | `adm-recommend-weights` | 관리자 정책 화면으로 분리 |
| 인기 키워드 | `adm-keywords` | 인기 키워드 | `adm-keywords` | 유지 |

---

# 4. 생성 후 편입 기준

현재 `_publish`는 화면별 HTML 파일 구조가 아니라 Vite/React SPA 구조다.  
따라서 Stitch 생성 결과는 화면별 HTML 경로가 아니라 Screen 키 기준으로 추적한다.

## 4.1 프롬프트 문서 편입 위치

```text
_publish/src/imports/batch4-admin-v3-business-inventory.md
```

## 4.2 개발본 React 컴포넌트 분리 위치

```text
app/src/app/screens/admin/
├── AdmDashboard.tsx
├── AdmProductMaster.tsx
├── AdmCsvImport.tsx
├── AdmPricePolicy.tsx
├── AdmRecommendWeights.tsx
└── AdmKeywords.tsx
```

## 4.3 Screen 키 연결 기준

```text
adm-dashboard           → AdmDashboard
adm-product-master      → AdmProductMaster
adm-csv-import          → AdmCsvImport
adm-price-policy        → AdmPricePolicy
adm-recommend-weights   → AdmRecommendWeights
adm-keywords            → AdmKeywords
```

---

# 5. 배치4 V3.0 완료 문구

배치4 V3.0 관리자 Stitch 프롬프트가 완성되었습니다.

V3.0에서는 기존 비용 관제 중심 관리자 구조를 비즈니스 운영 중심으로 재편했습니다.  
관리자 첫 화면은 `adm-dashboard`의 실시간 견적 피드, 특가 CTR, 키워드 트렌드, 가격동향, AI 비용 미니 위젯으로 구성됩니다.  
운영자가 가장 먼저 처리해야 하는 상품 데이터 갱신과 품절/단종 처리는 `adm-product-master`에서 1초 차단 토글로 명확히 전면 배치했습니다.  
가격 정책은 `adm-price-policy`, 추천 가중치는 `adm-recommend-weights`로 분리했고, 키워드 분석은 `adm-keywords`에서 관리합니다.

다음 배치5 V3.0에서는 `adm-click-report`, `adm-funnel`, `adm-system-limit`, `dev-hub` 화면을 생성합니다.
```

---

위 내용이 **1단계 파일**입니다.

다음 단계에서 바로 이어서 아래 파일을 생성해드리면 됩니다.

```text
_docs/stitch-prompts/batch5-admin-v3-analytics-system-devhub.md
```