# 05. 디자인 가이드라인 (디자인 시스템)

**파일 경로:** `_docs/05_design-guide.md`
**문서 버전:** Ver 1.0
**선행 문서:** `04_wireframe/00~02`

## 1. 디자인 원칙

본 시스템의 디자인은 세 가지 원칙을 따른다. 첫째, **신뢰감**이다. AI가 고가의 PC를 추천하는 서비스이므로 정돈되고 전문적인 인상을 준다. 둘째, **명확한 위계**다. 제목·부제목·본문·수치가 크기와 굵기로 즉시 구분되어 정보를 빠르게 파악하게 한다. 셋째, **한국어 우선**이다. 모든 UI 텍스트는 한국어로 통일하고 기술 약어(CPU, NVMe 등)만 영문을 허용한다.

## 2. 디자인 토큰 (CSS 변수)

Stitch와 Codex는 아래 변수만 사용하며 임의의 색상·크기를 쓰지 않는다.

```css
:root {
  /* ── 컬러 ── */
  --color-primary: #0075d5;        /* 강조·활성·CTA·수치 */
  --color-primary-hover: #005fae;  /* 버튼 hover */
  --color-primary-light: #e6f2fc;  /* 활성 배경·선택 칩 */
  --color-error: #D32F2F;          /* 호환성 위험·경고 */
  --color-success: #2e7d32;        /* 정상·온라인 */
  --color-warning: #f9a825;        /* 진행중·주의 */

  --color-text-strong: #1a1a1a;    /* 제목 */
  --color-text-body: #333333;      /* 본문 */
  --color-text-sub: #888888;       /* 보조·캡션 */
  --color-line: #e0e0e0;           /* 구분선·테두리 */
  --color-bg: #f7f9fc;             /* 페이지 배경 */
  --color-surface: #ffffff;        /* 카드·패널 배경 */

  /* ── 타이포 크기 ── */
  --fs-display: 32px;  --fw-display: 700;
  --fs-h1: 28px;       --fw-h1: 700;
  --fs-h2: 22px;       --fw-h2: 600;
  --fs-h3: 18px;       --fw-h3: 600;
  --fs-body-l: 16px;   --fw-body-l: 400;
  --fs-body: 14px;     --fw-body: 400;
  --fs-caption: 12px;  --fw-caption: 400;
  --fs-button: 15px;   --fw-button: 600;
  --fs-number: 24px;   --fw-number: 700;
  --lh-base: 1.6;      /* 본문 행간 */

  /* ── 폰트 ── */
  --font-family: 'Pretendard', 'Noto Sans KR', system-ui, sans-serif;

  /* ── 간격(8px 그리드) ── */
  --space-xs: 4px;  --space-sm: 8px;  --space-md: 16px;
  --space-lg: 24px; --space-xl: 32px; --space-2xl: 48px;

  /* ── 모서리·그림자 ── */
  --radius-sm: 6px;  --radius-md: 10px;  --radius-lg: 16px;
  --shadow-card: 0 2px 8px rgba(0,0,0,0.06);
  --shadow-hover: 0 6px 20px rgba(0,0,0,0.12);

  /* ── 레이아웃 ── */
  --gnb-height: 64px;
  --lnb-width: 200px;
  --content-max: 1200px;
}
```

## 3. 타이포그래피 적용 규칙

각 토큰의 용도는 와이어프레임과 일치한다. Display(32px Bold)는 랜딩 히어로 카피에만 화면당 1회 사용한다. H1(28px Bold)은 각 화면의 대표 제목에 1개만 쓴다. H2(22px SemiBold)는 섹션 제목, H3(18px SemiBold)는 카드·그룹 제목에 쓴다. 본문은 주요 설명에 Body-L(16px), 일반 텍스트에 Body(14px)를 쓰고 행간은 1.6으로 통일한다. 가격·점수·FPS 같은 수치는 Number(24px Bold)로 Primary 색을 입혀 시각적으로 돋보이게 한다. 도움말·각주·단계 라벨은 Caption(12px) 회색을 쓴다.

## 4. 컴포넌트 규격

### 4.1 버튼
| 종류 | 배경 | 글자 | 용도 |
|------|------|------|------|
| Primary | `--color-primary` | 흰색 | 주요 행동(추천받기·저장·다음) |
| Secondary | 흰색 + Primary 테두리 | Primary | 보조 행동(이전·취소) |
| Disabled | `#cccccc` | `#888888` | 호환성 Error 시 장바구니/결제 잠금 |
| Danger | `--color-error` | 흰색 | 차단·삭제 |

버튼 공통 규격은 높이 44px, 좌우 패딩 24px, 모서리 `--radius-sm`, 글자 `--fs-button(15px) SemiBold`, hover 시 색상 진하게 + 0.2s ease 전환이다.

### 4.2 카드
카드는 `--color-surface` 배경, `--radius-md` 모서리, `--shadow-card` 그림자, 내부 패딩 `--space-lg`를 기본으로 한다. 랜딩의 모드 분기 카드는 hover 시 `--color-primary` 테두리, Scale 1.02, `--shadow-hover`로 변하며 0.2s ease-in-out 전환한다(요구사항 FR-LND-060).

### 4.3 선택 칩(Chip)
용도·예산·감성 옵션에 쓰는 칩은 기본 상태가 흰 배경 + `--color-line` 테두리이고, 선택 시 `--color-primary-light` 배경 + `--color-primary` 테두리·글자로 바뀐다. 다중 선택 칩은 선택된 항목에 체크 아이콘을 추가한다.

### 4.4 입력 요소
텍스트 입력·셀렉트는 높이 40px, `--color-line` 테두리, `--radius-sm`, 포커스 시 Primary 테두리로 강조한다. 슬라이더(예산·전력 마진)는 트랙을 `--color-line`, 채워진 부분과 핸들을 `--color-primary`로 한다. 프롬프트 빌더의 대괄호 키워드는 `--color-primary` 굵게 표시하고 치환 시 0.3s 페이드 애니메이션을 준다.

### 4.5 상태 인디케이터
호환성·인프라 상태는 색 점(●)으로 표시한다. 정상/온라인은 `--color-success`, 진행중은 `--color-warning`, 위험/오프라인은 `--color-error`를 쓴다. 진척도 상태는 대기(`⚪` 회색) → 코딩중(`🟡` warning) → 로컬검증(`🔵` primary) → 배포완료(`●` success)로 통일한다.

## 5. 차트 색상 규격 (Chart.js)

차트는 정보 종류별로 색을 고정해 화면 간 일관성을 유지한다. 성능 막대그래프(FPS)는 Primary(`#0075d5`) 계열을 쓴다. 가격 원형도표는 CPU/GPU를 `#0075d5`, 메모리·저장장치를 `#4db6ac`, 기타 부품(파워·보드·케이스)을 `#ffb74d`로 구분한다. 비용 추이 라인 차트는 모델별로 Gemini `#4285f4`, ChatGPT `#10a37f`, Claude `#d97757`를 쓴다. 전환 퍼널은 Primary 단색의 명도 단계로 표현한다.

## 6. 레이아웃 규격

사용자 화면은 GNB(높이 64px, sticky 고정) + 콘텐츠(최대 폭 1200px, 중앙 정렬) + 푸터 구조다. 초급자·고급자 입력 화면은 좌측 입력 패널 60% + 우측 프롬프트 패널 40%로 분할하며, 우측 패널은 스크롤 시 화면에 고정(sticky)된다. 관리자 화면은 좌측 LNB(폭 200px 고정) + 우측 콘텐츠 구조다. 모든 영역 간 간격은 8px 그리드(`--space-*`)를 따른다.

## 7. 반응형 중단점 (Responsive Breakpoint)

| 중단점 | 폭 | 동작 |
|--------|----|----|
| Desktop | ≥1024px | 기본 레이아웃(2분할·LNB 전개) |
| Tablet | 768~1023px | 입력/프롬프트 패널 비율 유지하되 여백 축소, LNB 축소 |
| Mobile | <768px | 2분할 → 세로 1열 스택(`flex-direction: column`), 프롬프트 패널은 하단 고정 또는 접기, LNB → 햄버거 메뉴 |

모바일 전환 시 랜딩의 2분할 모드 카드는 세로 1열로 스택되어 화면 깨짐을 방지한다(NFR-LND-020). 터치 타깃은 최소 44×44px를 보장한다.

## 8. 성능·접근성 가이드

랜딩 페이지는 최초 진입 시 화면 인터랙션 가능 시간(TTI)을 1.5초 이내로 보장하기 위해, 메인 이미지를 WebP로 인코딩하고 레이지 로딩을 적용한다(NFR-LND-010). 폰트는 시스템 폴백을 두어 로딩 지연 시에도 텍스트가 즉시 보이게 한다. 접근성을 위해 본문 대비 비율은 4.5:1 이상을 유지하고, 색에만 의존하지 않도록 호환성 상태에는 색 점과 함께 "정상/위험" 텍스트 라벨을 병기한다.

## 9. 아이콘·이미지 규칙

아이콘은 선(line) 스타일로 통일하고 굵기를 일관되게 한다. 완성 PC 대표 이미지는 동일 비율(4:3 권장)로 통일하고 WebP로 제공한다. 부품 카테고리 아이콘은 CPU·GPU·RAM·SSD·파워·보드·케이스 7종을 동일 스타일로 준비한다.

---

