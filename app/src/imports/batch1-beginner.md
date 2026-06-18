먼저 전체 배치 계획부터 확정하면 이렇습니다. 배치1 랜딩+초급자(6개: index, auth-modal, step1~4 — 단, auth-modal 포함 시 6개이므로 조정), 이 부분을 깔끔하게 다시 정리하면 다음과 같습니다.

배치1 — 초급자 모드 핵심 6개(step1-purpose, step2-budget, step3-option, step4-summary, result, estimate-detail), 배치2 — 랜딩+고급자 전반 6개(index, auth-modal, step1-priority, step2-cpu-gpu, step3-ram-ssd, step4-power), 배치3 — 고급자 후반+관리자 시작 6개(step5-review, result-expert, estimate-detail-expert, dashboard, monitoring, rate-limit), 배치4 — 관리자 상품 6개(master, product-edit, csv-import, category-policy, keywords, swap-report), 배치5 — 나머지 3개(funnel, dev_index, 그리고 분석 탭 통합 여부)로 진행합니다.

이번에는 **배치1: 초급자 모드 6개 화면 프롬프트**입니다. `_docs/stitch-prompts/batch1-beginner.md`로 저장하시면 됩니다. 각 프롬프트는 Stitch에 그대로 복사해 붙여넣으면 되고, 맨 앞에 공통 규칙 블록을 두어 모든 화면이 일관되게 나오도록 했습니다.

---

# Stitch 생성 프롬프트 — 배치1 (초급자 모드 6화면)

**파일 경로:** `_docs/stitch-prompts/batch1-beginner.md`
**선행 문서:** `04_wireframe/00`, `05_design-guide.md`, `STITCH_RULES.md`

## ★ 공통 규칙 블록 (모든 프롬프트 맨 앞에 함께 붙여넣기)

```
[공통 규칙]
- 한국어 UI로 제작. 기술 약어(CPU, GPU, NVMe 등)만 영문 허용.
- 폰트: Pretendard, 없으면 Noto Sans KR. 본문 행간 1.6.
- 타이포 위계 고정: 제목 H1 28px Bold, 부제목 H2 22px SemiBold,
  소제목 H3 18px SemiBold, 본문 14px, 강조본문 16px, 캡션 12px 회색,
  가격·수치 24px Bold + 파란색(#0075d5).
- 컬러: Primary #0075d5, 위험 #D32F2F, 본문 #333, 보조 #888,
  배경 #f7f9fc, 카드 흰색, 테두리 #e0e0e0.
- 간격은 8px 그리드. 모서리 라운드 6~10px. 카드 옅은 그림자.
- 공통 GNB(상단 고정 64px): 좌측 "팝콘PC AI" 로고, 중앙 [초급자 모드]
  [고급자 모드] 탭, 우측 [로그인/회원가입][장바구니][마이페이지].
- 공통 푸터: "팝콘PC | 고객센터 1234-5678 | 이용약관·개인정보처리방침
  © 2026 팝콘PC".
- 반응형: 1024px↑ 기본, 768px↓ 2분할을 세로 1열 스택.
- 동적 텍스트엔 data-bind, 반복목록엔 data-repeat, 버튼엔 data-action,
  차트 자리엔 <canvas data-chart>, 예외 UI는 hidden으로 포함.
- body에 data-screen-id 와 data-domain="beginner" 부여.
- 인라인 스타일/임의 색상 금지. 외부 API 직접 호출 코드 금지.

## 화면 1 — step1-purpose (FR-BEG-010)
```
위 [공통 규칙]을 적용해 "초급자 1단계: 용도 선택" 화면을 만들어줘.
body에 data-screen-id="FR-BEG-010".
- 페이지 헤더: H1 "어떤 용도로 쓰실 PC인가요?", 그 아래 단계 인디케이터
  "1/4" 와 4점 표시(첫번째 활성, aria-current).
- 좌우 2분할: 좌측 입력 패널 60%, 우측 프롬프트 패널 40%(스크롤 고정).
- 좌측: H3 "주 용도 선택" + 칩 4개(사무용/게임용/영상편집용/인터넷방송용),
  단일 선택. 게임용 선택 시 하위에 H3 "게임 선택" + 다중선택 칩
  (배틀그라운드/디아블로4/리그오브레전드). 칩 선택 시 파란 배경+테두리.
- 우측 프롬프트 패널: H3 "실시간 AI 주문서" + 박스 안에 문장,
  "주 용도는 [게임]이며..." 의 대괄호를 <span class="prompt__keyword"
  data-key="purpose">로 감싸기.
- 하단 우측 버튼: [다음] data-action="next-step" href="step2-budget.html".
- 칩에 data-action, 동적 키워드에 data-bind 표시.
```

## 화면 2 — step2-budget (FR-BEG-020)
```
위 [공통 규칙]을 적용해 "초급자 2단계: 예산" 화면. data-screen-id="FR-BEG-020".
- 헤더 H1 "예산은 어느 정도 생각하세요?", 인디케이터 "2/4"(2점 활성).
- 2분할 동일. 좌측: H3 "예산 범위" + 최소/최대 양방향 슬라이더
  (트랙 회색, 채움·핸들 파란색, 100만~130만 더미). H3 "간편 선택" +
  칩(50만원대/100만원대/150만원대).
- 우측 프롬프트: "...예산은 [100만~130만] 사이로..." 대괄호 data-key="budget".
- 하단: [이전] data-action="prev-step" href="step1-purpose.html",
  [다음] data-action="next-step" href="step3-option.html".
```

## 화면 3 — step3-option (FR-BEG-030)
```
위 [공통 규칙]을 적용해 "초급자 3단계: 감성 옵션" 화면.
data-screen-id="FR-BEG-030".
- 헤더 H1 "원하는 스타일이 있나요?", 인디케이터 "3/4"(3점 활성).
- 2분할. 좌측: H3 "감성 옵션 (다중 선택)" + 칩
  (#화이트감성/#화려한LED/#저소음/#크기가작은PC/#가성비최우선).
- 우측 프롬프트: "...외관은 [화이트감성] 스타일로..." data-key="style".
- 하단: [이전] href="step2-budget.html", [다음] href="step4-summary.html".
```

## 화면 4 — step4-summary (FR-BEG-050)
```
위 [공통 규칙]을 적용해 "초급자 4단계: 요약·편집" 화면.
data-screen-id="FR-BEG-050".
- 헤더 H1 "주문서를 확인하고 추천받으세요", 인디케이터 "4/4"(4점 모두 활성).
- 전체폭(2분할 아님). H3 "최종 AI 주문서 (직접 편집 가능)" +
  편집 가능한 큰 textarea(자동 조립 문장 더미, Readonly 아님).
  문장 예: "안녕하세요! 저는 PC를 잘 모르는 초급자입니다. 주 용도는
  [게임(배틀그라운드)]이며, 예산은 [100만 원~130만 원] 사이로, 외관은
  [화이트감성] 스타일로 최적의 견적을 조립해 주세요."
- 캡션 "자유롭게 문장을 수정하실 수 있어요."
- 우측 하단 강조 버튼 [추천받기] data-action="recommend".
- 추천 중 표시용 로딩 레이어 hidden 포함:
  "3대 AI가 최적의 견적을 조율 중입니다...".
```

## 화면 5 — result (FR-BEG-090)
```
위 [공통 규칙]을 적용해 "초급자 결과 대시보드" 화면.
data-screen-id="FR-BEG-090".
- 헤더 H1 "AI가 추천한 맞춤 PC 견적".
- 상단 3종 탭 카드: [가성비형][추천형(기본 활성, --active)][고성능형]
  data-action="select-set".
- 본문 2열: 좌측 완성PC 이미지 자리(data-bind="pc_image", 4:3 더미박스)
  + H3 "부품 명세(7종)" 리스트 data-repeat="components"
  (CPU/GPU/RAM/SSD/메인보드/파워/케이스 더미).
- 우측: H2 "추천형 견적" + 가격 24px Bold 파란색 data-bind="total_price"
  "1,250,000원" + 캡션 "당일 출고". 그 아래 성능 막대그래프
  <canvas data-chart="fps-bar"> 와 가격 원형도표 <canvas data-chart="price-pie">.
- 하단 버튼: [부품 변경하기] data-action="goto-detail"
  href="estimate-detail.html", [장바구니 담기] data-action="add-cart".
- 빈 결과 표시용 div hidden 포함: "조건에 맞는 견적이 없습니다.".
```

## 화면 6 — estimate-detail (FR-BEG-110)
```
위 [공통 규칙]을 적용해 "초급자 견적 상세·부품 스왑" 화면.
data-screen-id="FR-BEG-110".
- 헤더 H1 "부품 상세 및 교체".
- 좌측: 현재 부품 리스트(각 항목에 [변경] 버튼 data-action="swap-part"
  data-part 지정). 호환성 상태 인디케이터: 정상(초록 ●)과
  위험(빨강 ● #D32F2F "위험 — 호환되지 않습니다") 두 상태 마크업,
  위험은 hidden 기본.
- 부품 클릭 시 뜨는 "안전 대안 목록" 팝업(모달) 마크업 hidden 포함:
  H3 "호환 가능한 대안" + 리스트 data-repeat="alternatives"
  (대안명 + 가격차 더미).
- 하단 [장바구니 담기] 버튼 data-action="add-cart". 위험 상태일 때
  disabled 처리되는 클래스(btn--disabled) 예시 포함.
```

---

배치1 산출물이 완성되었습니다. 초급자 6개 화면 모두 공통 규칙 블록 + 개별 프롬프트로 구성되어, Stitch에 "공통 규칙 + 화면 N 프롬프트"를 함께 붙여넣으면 일관된 화면이 생성됩니다. 생성 후에는 `_publish/Rec_Beginner/`에 저장하고 `_MAPPING.md`에 기록하시면 됩니다.
