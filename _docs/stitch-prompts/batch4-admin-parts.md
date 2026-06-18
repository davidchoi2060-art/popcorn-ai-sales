6개 화면 모두 배치3에서 정의한 관리자 공통 규칙 B(LNB 사이드바)를 사용합니다.

---

# Stitch 생성 프롬프트 — 배치4 (관리자 상품·분석 6화면)

**파일 경로:** `_docs/stitch-prompts/batch4-admin-parts.md`
**선행 문서:** `04_wireframe/02`, `06_db-erd.md`, `STITCH_RULES.md`

## ★ 공통 규칙 블록 B — 관리자용 (배치3과 동일, 6개 모두 앞에 붙여넣기)
```
[관리자 공통 규칙]
- 한국어 UI. 기술 약어만 영문 허용. 폰트 Pretendard/Noto Sans KR, 행간 1.6.
- 타이포·컬러 토큰 동일(H1 28px Bold, H2 22px, H3 18px, 본문 14px,
  수치 24px Bold 파란 #0075d5, 위험 #D32F2F, 배경 #f7f9fc, 카드 흰색,
  테두리 #e0e0e0). 간격 8px 그리드.
- GNB 대신 좌측 LNB(폭 200px): "팝콘PC 관리" + 메뉴
  [대시보드][비용관제][상품관리][통계분석] + "관리자님 ▾". 현재 메뉴 --active.
- LNB 우측 관리자 헤더(현재 경로 + 계정). 본문은 콘텐츠 영역.
- 동적 값 data-bind, 반복 data-repeat, 버튼 data-action,
  차트 <canvas data-chart>, 예외 UI hidden.
- 반응형: 768px↓ LNB 햄버거 접힘.
- body에 data-domain="admin". 인라인 스타일/임의 색상 금지.
- API Key·개인정보 하드코딩 금지(표기 시 *** 마스킹).
```

---

## 화면 1 — master (상품 마스터 목록·검색)
```
위 [관리자 공통 규칙]을 적용해 "상품 마스터 관리" 화면.
data-screen-id="ADM-PARTS-MASTER". LNB의 [상품관리] 활성.
- 헤더 H1 "상품 마스터 관리".
- 검색바 한 줄: 카테고리 셀렉트(그래픽카드 등) + 상태 셀렉트
  (판매중/품절/단종/삭제대기) + 키워드 입력(예 RTX) + [검색] 버튼
  data-action="search-products".
- 결과 표(테이블 그리드) data-repeat="products": 열
  [상품코드 / 상품명 / 카테고리 / 상태 / 관리]. 행 더미
  (101268 / 라이젠 R5 1400 / CPU / 판매중 / [수정]).
  [수정] 버튼 data-action="edit-product" data-code 지정.
  상태값은 색 배지(판매중 초록 / 품절·단종 회색).
- 하단 페이지네이션 "◂ 1 2 3 ▸" data-action="paging" +
  캡션 "50개 단위 페이징 · 0.3초 이내 스캔".
- 빈 결과 영역 hidden 포함: "검색 결과가 없습니다.".
```

## 화면 2 — product-edit (상품 등록·수정, FR-ADM-040)
```
위 [관리자 공통 규칙]을 적용해 "상품 등록 / 수정" 화면.
data-screen-id="FR-ADM-040". LNB의 [상품관리] 활성.
- 헤더 H1 "상품 등록 / 수정".
- H2 "기본 정보": 자체상품코드(읽기전용, PK 표시) + 상품명 +
  제조사 + 카테고리 셀렉트 + 상태값 셀렉트 + 매입가/시중가/일반회원가
  입력. 각 input에 <label> 연결, data-bind 지정.
- H2 "AI 연산 필드 (필수 검증)" — 추천 엔진 주입용:
  소켓 규격 입력(예 AM5)* / 소비전력 W 입력* / 부품 가로 mm 입력*.
  필수표시(*) + 누락 시 에러 텍스트 영역 hidden 포함
  ("필수 입력값을 채워주세요.").
- H2 "외관 감성 속성": 체크박스 #화이트 / #RGB LED / #저소음.
- 우측 하단 강조 버튼 [저장하기] data-action="save-product".
- 캡션 "*필수 입력. 누락 시 저장이 차단됩니다.".
```

## 화면 3 — csv-import (CSV 일괄 업서트, FR-ADM-030)
```
위 [관리자 공통 규칙]을 적용해 "대량 상품 업데이트(CSV)" 화면.
data-screen-id="FR-ADM-030". LNB의 [상품관리] 활성.
- 헤더 H1 "대량 상품 업데이트 (CSV)".
- 드래그앤드롭 업로드 박스: "00.상품다운.csv 파일을 끌어놓거나 선택" +
  [파일 선택] 버튼 data-action="choose-file".
- 캡션 "자체상품코드(PK) 기준 — 신규 Insert / 기존 Update".
- H3 "처리 결과"(처리 후 노출, 기본 hidden):
  "✓ 신규 N건 / ✓ 수정 N건 / ⚠ 오류 N건" data-bind 각각 +
  [오류 목록 다운로드] 버튼 data-action="download-errors".
- 우측 하단 강조 버튼 [업로드 실행] data-action="run-upsert".
- 업로드 진행 표시 영역 hidden 포함("업로드 처리 중...").
```

## 화면 4 — category-policy (마진·품절 제어, FR-ADM-050)
```
위 [관리자 공통 규칙]을 적용해 "카테고리 정책 제어" 화면.
data-screen-id="FR-ADM-050". LNB의 [상품관리] 활성.
- 헤더 H1 "카테고리 정책 제어".
- H2 "카테고리별 일괄 마진율" + 카테고리별 슬라이더 그리드
  data-repeat="categories"(그래픽카드 15% / CPU 12% / 메모리 18% /
  파워 20% 더미, 채움·핸들 파란색).
- H2 "실시간 품절/단종 스위치": 상품코드 입력 + 상태 셀렉트
  (판매중/품절/단종) + [적용] 버튼 data-action="toggle-status".
- 캡션 "적용 시 1초 이내 추천 풀·스왑 대안에서 즉시 제외됩니다.".
- 우측 하단 강조 버튼 [정책 저장] data-action="save-policy".
```

## 화면 5 — keywords (인기 키워드 분석, FR-ANA-010)
```
위 [관리자 공통 규칙]을 적용해 "통계 분석 - 인기 키워드" 화면.
data-screen-id="FR-ANA-010". LNB의 [통계분석] 활성.
- 헤더 H1 "통계 분석".
- 상단 탭: [인기 키워드(활성)] [탈락 부품] [전환 퍼널]
  data-action="switch-tab"(탈락/퍼널 탭은 각 화면으로 이동).
- 기간 선택(시작~종료 날짜) + [조회] data-action="query-range".
- H2 "인기 키워드 랭킹" + 워드클라우드 또는 막대 랭킹
  <canvas data-chart="keyword-rank"> + 상위 리스트
  data-repeat="keywords"(1.배틀그라운드상옵 / 2.원컴방송용 /
  3.딥러닝코딩 더미).
- 캡션 "유저 직접 입력 프롬프트 형태소 상위 명사 집계 (개인정보 마스킹 후)".
```

## 화면 6 — swap-report (탈락 부품 분석, FR-ANA-020)
```
위 [관리자 공통 규칙]을 적용해 "통계 분석 - 탈락 부품" 화면.
data-screen-id="FR-ANA-020". LNB의 [통계분석] 활성.
- 헤더 H1 "통계 분석".
- 상단 탭: [인기 키워드] [탈락 부품(활성)] [전환 퍼널]
  data-action="switch-tab".
- 기간 선택 + [조회].
- H2 "카테고리별 최다 탈락 부품 TOP 10" +
  <canvas data-chart="swap-bar"> + 표 data-repeat="swap_items"
  (순위 / 부품명 / 카테고리 / 탈락 횟수 더미).
- 캡션 "AI가 제안했으나 사용자가 스왑 제외한 부품 역분석 (가중치 수정용)".
```

---

배치4 산출물이 완성되었습니다. 상품 검색·수정·CSV 업서트·정책 제어·인기 키워드·탈락 부품 분석 6화면을 작성했습니다. 특히 product-edit의 AI 연산 필드 필수 검증, csv-import의 신규/수정/오류 분리 결과, category-policy의 1초 즉시 제외 안내를 요구사항대로 반영했습니다. 생성 후 상품 관련은 `_publish/Admin_Parts/`, 분석은 `_publish/Admin_Analytics/`에 저장하시면 됩니다.
