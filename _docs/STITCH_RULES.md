이 문서는 Google Stitch가 화면을 만들 때 지켜야 할 규칙입니다. 핵심 목적은 Stitch가 만든 정적 HTML을 나중에 Codex가 받아서 로직을 붙일 때 "어디에 데이터를 넣고, 어떤 요소를 잡아야 하는지" 헤매지 않도록, 클래스·ID·자리표시자를 미리 약속해두는 것입니다. 이 약속이 없으면 두 AI가 같은 화면을 서로 다르게 다뤄 충돌합니다.

---

# STITCH_RULES — Google Stitch 산출물 규격서

**파일 경로:** `_docs/STITCH_RULES.md`
**문서 버전:** Ver 1.0
**적용 대상:** `_publish/` 의 모든 정적 HTML
**선행 문서:** `05_design-guide.md`, `02_file-list.md`

## 1. 이 규격서의 목적

Google Stitch는 화면(HTML·CSS·기본 인터랙션)까지만 담당하고, Codex가 그 위에 데이터·API·상태관리를 붙인다. 두 단계가 매끄럽게 이어지려면 Stitch 산출물이 예측 가능한 구조여야 한다. 따라서 모든 정적 HTML은 아래 네이밍·식별자·자리표시자 규칙을 반드시 따른다. Stitch에 지시할 때 이 규격서를 프롬프트에 함께 첨부한다.

## 2. 화면 식별 규칙 (필수)

모든 HTML 파일의 최상위 컨테이너(`<body>` 직속 첫 요소 또는 `<body>` 자체)에 두 속성을 부여한다. 하나는 화면 ID(`data-screen-id`), 다른 하나는 도메인(`data-domain`)이다. 이로써 dev_index와 Codex가 화면을 자동 추적한다.

```html
<body data-screen-id="FR-BEG-010" data-domain="beginner">
```

화면 ID는 사이트맵(`01_sitemap.md`)과 파일 목록(`02_file-list.md`)에 정의된 값을 그대로 쓴다.

## 3. CSS 클래스 네이밍 규칙 (BEM 간소화)

클래스명은 `블록__요소--상태` 형태의 BEM 간소화 규칙을 따르고, 모두 영문 소문자 kebab-case를 쓴다. 임의의 인라인 스타일이나 의미 없는 클래스명(`div1`, `box-a`)은 금지한다.

| 구분 | 형식 | 예시 |
|------|------|------|
| 블록(컴포넌트) | `.블록` | `.gnb`, `.hero`, `.mode-card`, `.prompt-panel` |
| 요소(하위) | `.블록__요소` | `.mode-card__title`, `.prompt-panel__text` |
| 상태(변형) | `.블록--상태` | `.mode-card--active`, `.chip--selected` |

공통 레이아웃 블록명은 다음으로 통일한다: `gnb`(상단 내비), `lnb`(관리자 사이드바), `page-header`(페이지 헤더), `footer`(푸터), `content`(콘텐츠 영역), `step-indicator`(단계 표시), `input-panel`/`prompt-panel`(2분할 패널).

## 4. 디자인 토큰 강제 사용

색상·글자크기·간격은 `05_design-guide.md`의 CSS 변수(`--color-primary`, `--fs-h1` 등)만 사용한다. Stitch가 임의의 HEX 색이나 px 값을 생성하지 않도록, 공통 스타일은 `_publish/assets/css/common.css`의 `:root` 변수를 참조하게 한다. 즉 각 HTML은 `<link rel="stylesheet" href="/assets/css/common.css">`를 head에 포함한다.

## 5. 데이터 자리표시자 규칙 (Codex 인계 핵심)

Stitch는 실제 데이터를 모르므로 **더미 값 + 자리표시자 주석**을 함께 넣는다. Codex는 이 자리표시자를 찾아 실제 데이터 바인딩으로 교체한다. 두 가지 표기를 병행한다.

첫째, 동적으로 채워질 텍스트·수치에는 `data-bind` 속성을 부여하고 더미 값을 보여준다.
```html
<span class="estimate__price" data-bind="total_price">1,250,000원</span>
<span class="set-card__engine" data-bind="ai_engine">Claude</span>
```

둘째, 반복 렌더링될 목록은 첫 항목을 템플릿으로 두고 `data-repeat`로 표시한다.
```html
<ul class="parts-list" data-repeat="components">
  <li class="parts-list__item" data-bind-item="cpu">CPU: 라이젠 R5 (더미)</li>
  <!-- Codex가 7개 부품으로 반복 생성 -->
</ul>
```

셋째, 프롬프트 빌더의 대괄호 키워드는 `<span class="prompt__keyword" data-key="purpose">[게임]</span>` 형태로 감싸, Codex가 실시간 치환 대상을 정확히 잡게 한다.

## 6. 버튼·링크 동작 표시

버튼과 링크는 시각만 만들고 실제 동작은 Codex가 붙인다. 따라서 각 액션 요소에 `data-action` 속성으로 의도를 명시한다.

```html
<button class="btn btn--primary" data-action="recommend">추천받기</button>
<a class="btn btn--secondary" data-action="prev-step">이전</a>
<button class="btn" data-action="swap-part" data-part="gpu">변경</button>
```

화면 전환 링크는 사이트맵의 실제 경로를 `href`에 넣어 정적 미리보기에서도 이동이 되게 한다(예: `href="step2-budget.html"`). Codex는 필요 시 이를 라우터 동작으로 대체한다.

## 7. 차트·이미지 자리표시자

Chart.js가 들어갈 자리는 빈 `<canvas>`에 식별자를 부여하고, 어떤 차트인지 `data-chart`로 명시한다. 이미지는 비율을 유지한 더미 박스로 둔다.

```html
<canvas class="chart" data-chart="fps-bar" width="400" height="240"></canvas>
<canvas class="chart" data-chart="price-pie"></canvas>
<div class="pc-image" data-bind="pc_image">[완성 PC 이미지 4:3]</div>
```

## 8. 상태·예외 UI 미리 포함

호환성 Error, 로딩, 빈 결과 같은 예외 UI도 Stitch가 미리 마크업해 두고 기본은 숨김(`hidden` 또는 `--hidden` 클래스) 처리한다. Codex가 조건에 따라 노출만 토글한다.

```html
<div class="compat-status compat-status--error" hidden>● 위험 — 호환되지 않습니다</div>
<div class="loading-layer" hidden>3대 AI가 최적의 견적을 조율 중입니다...</div>
<div class="empty-result" hidden>조건에 맞는 견적이 없습니다.</div>
```

## 9. 접근성·시맨틱 규칙

의미에 맞는 시맨틱 태그를 쓴다(`<header>`, `<nav>`, `<main>`, `<footer>`, `<button>`, `<form>`). 이미지에는 `alt`, 입력에는 `<label>`을 연결한다. 색에만 의존하지 않도록 상태에는 텍스트 라벨을 병기한다(디자인 가이드 8항과 일치). 단계 인디케이터는 `aria-current`로 현재 단계를 표시한다.

## 10. 금지 사항

다음은 금지한다. 인라인 스타일 남용, 디자인 토큰 외 임의 색·크기, 의미 없는 클래스명, 외부 LLM·API 직접 호출 스크립트(보안), 실제 API Key·개인정보 하드코딩, `data-screen-id` 누락. 또한 Stitch 산출물은 `_publish/`에만 두고, 생성 후에는 직접 수정하지 않는다(수정은 Stitch 재생성으로만).

## 11. 산출 직후 체크리스트

각 화면을 Stitch로 생성한 직후 다음을 확인하고 `_publish/_MAPPING.md`에 기록한다. `data-screen-id`·`data-domain`이 정확한가, common.css를 링크했는가, 동적 값에 `data-bind`/`data-repeat`가 있는가, 버튼에 `data-action`이 있는가, 예외 UI가 hidden으로 포함됐는가, 화면 전환 링크가 사이트맵 경로와 일치하는가, 한국어로 통일됐는가를 점검한다.

---

10단계 산출물이 완성되었습니다. 이제 Stitch가 만든 화면은 `data-screen-id`로 식별되고, `data-bind`·`data-repeat`·`data-action`·`data-chart`로 "어디에 데이터·동작·차트가 들어갈지"가 표시되어, Codex가 정적 화면을 받아 로직만 정확히 얹을 수 있습니다. 이것이 단방향 이관(`_publish` → `app`)을 실제로 작동하게 하는 연결 고리입니다.