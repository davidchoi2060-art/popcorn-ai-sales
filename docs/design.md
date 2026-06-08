# 팝콘 AI 디자인 시스템 가이드

## 개요

팝콘 AI 조립PC 추천 시스템의 표준 디자인 시스템입니다. 이 가이드는 Phoenix Dashboard Template v1.22.0을 기반으로 하며, 모든 프로토타입 및 프로덕션 페이지에서 일관된 디자인을 제공합니다.

---

## 1. 색상 시스템

### 1.1 기본 색상 팔레트

#### 프라이머리
- **Primary**: `#3874ff` - 주요 액션, 링크, 강조 요소
- **Primary Light**: `#6090ff`
- **Primary Lighter**: `#85a9ff`
- **Primary Lightest**: `#adc5ff`
- **Primary Dark**: `#2958c4`
- **Primary Darker**: `#1f409f`

#### 세컨더리
- **Secondary**: `#02c3a4` - 대체 액션, 성공 상태
- **Secondary Light**: `#33d9b9`
- **Secondary Lighter**: `#66e5ce`

#### 상태 색상
- **Success**: `#00d97e` - 성공, 완료 상태
- **Danger**: `#ff3838` - 에러, 위험 상태
- **Warning**: `#ffc107` - 경고, 주의 상태
- **Info**: `#2196f3` - 정보, 알림 상태

### 1.2 그레이스케일

| 레벨 | 코드 | 용도 |
|------|------|------|
| 50 | `#f5f7fa` | 매우 연한 배경 |
| 100 | `#eff2f6` | 기본 배경 |
| 200 | `#e3e6ed` | 호버 상태, 보더 |
| 300 | `#cbd0dd` | 보더, 구분선 |
| 400 | `#9fa6bc` | 플레이스홀더, 약한 텍스트 |
| 500 | `#8a94ad` | 보조 텍스트 |
| 600 | `#6e7891` | 텍스트 |
| 700 | `#525b75` | 강한 텍스트 |
| 800 | `#3e465b` | 본문 텍스트 |
| 900 | `#31374a` | 제목, 강조 텍스트 |
| 1000 | `#222834` | 다크 배경 |
| 1100 | `#141824` | 매우 다크 배경 |

### 1.3 사용 사례

```css
/* Primary 사용 */
.btn-primary { background-color: var(--color-primary); }
.text-primary { color: var(--color-primary); }
.bg-primary { background-color: var(--color-primary); }

/* Gray 사용 */
.border { border-color: var(--color-gray-300); }
.text-muted { color: var(--color-gray-600); }
.bg-light { background-color: var(--color-gray-50); }
```

---

## 2. 타이포그래피

### 2.1 폰트 패밀리

```css
/* San-serif 본문 */
--font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;

/* 모노스페이스 */
--font-family-mono: 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', monospace;
```

### 2.2 폰트 크기

| 클래스 | 크기 | 사용 사례 |
|--------|------|----------|
| xs | `0.75rem` | 작은 라벨 |
| sm | `0.875rem` | 부제목, 보조 텍스트 |
| base | `1rem` | 본문, 기본 텍스트 |
| lg | `1.125rem` | 본문 강조 |
| xl | `1.25rem` | 서브헤딩 |
| 2xl | `1.5rem` | 섹션 제목 |
| 3xl | `1.875rem` | 페이지 제목 |
| 4xl | `2.25rem` | 메인 제목 |
| 5xl | `3rem` | 랜딩 페이지 제목 |

### 2.3 폰트 무게

| 레벨 | 값 | CSS 클래스 | 사용 사례 |
|------|-----|-----------|----------|
| Light | 300 | `.font-light` | 텍스트 강조 안 함 |
| Normal | 400 | `.font-normal` | 기본 본문 |
| Medium | 500 | `.font-medium` | 라벨, 설명 |
| Semibold | 600 | `.font-semibold` | 버튼, 강조 |
| Bold | 700 | `.font-bold` | 제목 |
| Bolder | 800 | `.font-bolder` | 메인 제목 |

### 2.4 라인높이

| 레벨 | 값 | 사용 사례 |
|------|-----|----------|
| sm | 1.25 | 제목 |
| base | 1.5 | 일반 본문 |
| lg | 1.75 | 강조 본문 |
| xl | 2 | 여유 있는 본문 |

### 2.5 제목 스타일

```html
<!-- 제목 예시 -->
<h1>H1 제목 (3rem, 800 weight)</h1>
<h2>H2 제목 (2.25rem, 800 weight)</h2>
<h3>H3 제목 (1.875rem, 800 weight)</h3>
<h4>H4 제목 (1.5rem, 700 weight)</h4>
<h5>H5 제목 (1.25rem, 700 weight)</h5>
<h6>H6 제목 (1.125rem, 700 weight)</h6>

<!-- Lead 텍스트 -->
<p class="lead">강조된 본문 텍스트</p>

<!-- 작은 텍스트 -->
<small>작은 텍스트</small>
```

---

## 3. 스페이싱

### 3.1 스페이싱 스케일

기본 단위: `1rem (16px)`

| 레벨 | 값 | CSS 변수 |
|------|-----|---------|
| 0 | 0 | `--spacer-0` |
| 0.25 | 0.25rem | `--spacer-0-25` |
| 0.5 | 0.5rem | `--spacer-0-5` |
| 1 | 0.25rem | `--spacer-1` |
| 2 | 0.5rem | `--spacer-2` |
| 3 | 1rem | `--spacer-3` |
| 4 | 1.5rem | `--spacer-4` |
| 5 | 2rem | `--spacer-5` |
| 6 | 2.5rem | `--spacer-6` |
| 7 | 3rem | `--spacer-7` |
| 8 | 3.5rem | `--spacer-8` |
| 9 | 4rem | `--spacer-9` |
| 10 | 4.5rem | `--spacer-10` |
| 11 | 5rem | `--spacer-11` |
| 12 | 6rem | `--spacer-12` |

### 3.2 마진/패딩 유틸리티

```html
<!-- 마진 -->
<div class="m-0">마진 없음</div>
<div class="mt-3">상단 마진</div>
<div class="mb-4">하단 마진</div>
<div class="mx-auto">좌우 자동 마진</div>

<!-- 패딩 -->
<div class="p-3">전체 패딩</div>
<div class="px-4">좌우 패딩</div>
<div class="py-3">상하 패딩</div>

<!-- Gap (플렉스박스) -->
<div class="d-flex gap-3">
  <div>항목 1</div>
  <div>항목 2</div>
</div>
```

---

## 4. 보더 라디우스

| 클래스 | 값 | 사용 사례 |
|--------|-----|----------|
| `rounded-none` | 0 | 정사각형 모서리 |
| `rounded-sm` | 0.375rem | 약간 둥근 |
| `rounded` | 0.5rem | 기본 둥근 |
| `rounded-md` | 0.75rem | 중간 둥근 |
| `rounded-lg` | 1rem | 둥근 카드 |
| `rounded-xl` | 1.25rem | 매우 둥근 |
| `rounded-2xl` | 1.5rem | 극도로 둥근 |
| `rounded-full` | 9999px | 원형/필 모양 |

---

## 5. 섀도우

### 5.1 섀도우 단계

| 레벨 | 값 | 사용 사례 |
|------|-----|----------|
| xs | `0 1px 2px rgba(0,0,0,0.05)` | 미묘한 깊이 |
| sm | `0 1px 3px rgba(0,0,0,0.1)` | 가벼운 카드 |
| base | `0 4px 6px rgba(0,0,0,0.1)` | 기본 카드 |
| md | `0 10px 15px rgba(0,0,0,0.1)` | 중간 높이 |
| lg | `0 20px 25px rgba(0,0,0,0.1)` | 떠있는 요소 |
| xl | `0 25px 50px rgba(0,0,0,0.25)` | 모달, 팝오버 |
| 2xl | `0 25px 50px rgba(0,0,0,0.3)` | 최상위 요소 |

### 5.2 사용 예시

```html
<div class="shadow">기본 섀도우</div>
<div class="shadow-lg">큰 섀도우</div>
<div class="shadow-xl">매우 큰 섀도우</div>
```

---

## 6. 컴포넌트

### 6.1 버튼

```html
<!-- 기본 버튼 -->
<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary">Secondary</button>
<button class="btn btn-outline-primary">Outline</button>
<button class="btn btn-ghost">Ghost</button>

<!-- 크기 변형 -->
<button class="btn btn-sm">Small</button>
<button class="btn">Medium (기본)</button>
<button class="btn btn-lg">Large</button>

<!-- 상태 -->
<button class="btn btn-primary" disabled>Disabled</button>

<!-- 아이콘과 함께 -->
<button class="btn btn-primary d-flex align-items-center gap-2">
  <span>✓</span>
  <span>확인</span>
</button>
```

### 6.2 카드

```html
<div class="card">
  <div class="card-header">
    <h5>카드 제목</h5>
  </div>
  <div class="card-body">
    <p>카드 본문 내용</p>
  </div>
  <div class="card-footer">
    <button class="btn btn-primary">액션</button>
  </div>
</div>
```

### 6.3 배지

```html
<span class="badge badge-primary">Primary</span>
<span class="badge badge-secondary">Secondary</span>
<span class="badge badge-success">Success</span>
<span class="badge badge-danger">Danger</span>
<span class="badge badge-warning">Warning</span>
<span class="badge badge-info">Info</span>
<span class="badge badge-light">Light</span>
<span class="badge badge-dark">Dark</span>
```

### 6.4 알럿

```html
<div class="alert alert-primary">Primary 알럿</div>
<div class="alert alert-success">Success 알럿</div>
<div class="alert alert-danger">Danger 알럿</div>
<div class="alert alert-warning">Warning 알럿</div>
<div class="alert alert-info">Info 알럿</div>

<!-- 닫기 버튼 포함 -->
<div class="alert alert-primary">
  알럿 메시지
  <button class="alert-close">×</button>
</div>
```

### 6.5 폼 요소

```html
<div>
  <label for="input">라벨</label>
  <input type="text" id="input" placeholder="입력하세요">
</div>

<div>
  <label for="select">선택</label>
  <select id="select">
    <option>옵션 1</option>
    <option>옵션 2</option>
  </select>
</div>

<div>
  <label for="textarea">텍스트 영역</label>
  <textarea id="textarea" placeholder="여러 줄 입력"></textarea>
</div>
```

### 6.6 테이블

```html
<table>
  <thead>
    <tr>
      <th>헤더 1</th>
      <th>헤더 2</th>
      <th>헤더 3</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>데이터 1</td>
      <td>데이터 2</td>
      <td>데이터 3</td>
    </tr>
  </tbody>
</table>
```

---

## 7. 레이아웃

### 7.1 컨테이너

```html
<div class="container">
  <!-- 최대 너비 제한된 콘텐츠 -->
</div>
```

**반응형 컨테이너 최대 너비:**
- `xs`: 기본 (100%)
- `sm`: 540px
- `md`: 720px
- `lg`: 960px
- `xl`: 1184px
- `xxl`: 1400px

### 7.2 플렉스박스

```html
<!-- 행 레이아웃 -->
<div class="d-flex flex-row gap-3">
  <div>항목 1</div>
  <div>항목 2</div>
</div>

<!-- 열 레이아웃 -->
<div class="d-flex flex-column gap-3">
  <div>항목 1</div>
  <div>항목 2</div>
</div>

<!-- 정렬 -->
<div class="d-flex justify-content-between align-items-center">
  <div>왼쪽</div>
  <div>오른쪽</div>
</div>

<!-- 중앙 정렬 -->
<div class="d-flex justify-content-center align-items-center">
  <div>중앙</div>
</div>
```

### 7.3 그리드

```html
<!-- 그리드 레이아웃 -->
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem;">
  <div class="card">항목 1</div>
  <div class="card">항목 2</div>
  <div class="card">항목 3</div>
</div>
```

---

## 8. 텍스트 유틸리티

### 8.1 정렬

```html
<p class="text-left">왼쪽 정렬</p>
<p class="text-center">중앙 정렬</p>
<p class="text-right">오른쪽 정렬</p>
<p class="text-justify">양쪽 정렬</p>
```

### 8.2 변환

```html
<p class="text-uppercase">대문자</p>
<p class="text-lowercase">소문자</p>
<p class="text-capitalize">첫글자 대문자</p>
```

### 8.3 색상

```html
<p class="text-primary">Primary 텍스트</p>
<p class="text-secondary">Secondary 텍스트</p>
<p class="text-success">Success 텍스트</p>
<p class="text-danger">Danger 텍스트</p>
<p class="text-warning">Warning 텍스트</p>
<p class="text-muted">Muted 텍스트</p>
```

### 8.4 배경색

```html
<div class="bg-primary text-white p-3">Primary 배경</div>
<div class="bg-secondary text-white p-3">Secondary 배경</div>
<div class="bg-gray-50 p-3">Light Gray 배경</div>
```

---

## 9. 반응형 설계

### 9.1 미디어 쿼리 중단점

| 이름 | 값 |
|------|-----|
| xs | 0px (기본) |
| sm | 576px |
| md | 768px |
| lg | 992px |
| xl | 1200px |
| xxl | 1540px |

### 9.2 모바일 우선 접근

```css
/* 모바일 기본 */
.card {
  grid-template-columns: 1fr;
}

/* 태블릿 이상 */
@media (min-width: 768px) {
  .card {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 데스크톱 이상 */
@media (min-width: 1200px) {
  .card {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

---

## 10. 어두운 모드 지원

CSS 변수를 사용하여 다크 모드를 쉽게 지원할 수 있습니다:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: var(--color-gray-900);
    --color-text: var(--color-white);
  }
}
```

또는 데이터 속성으로 명시적 제어:

```html
<html data-bs-theme="dark">
  <!-- 다크 모드 콘텐츠 -->
</html>
```

---

## 11. 트랜지션 & 애니메이션

### 11.1 기본 트랜지션

```css
--transition-base: all 0.2s ease;
--transition-fade: opacity 0.15s linear;
--transition-collapse: height 0.35s ease;
```

### 11.2 사용 예시

```css
.btn {
  transition: var(--transition-base);
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
```

---

## 12. 접근성

### 12.1 포커스 상태

```css
input:focus,
button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(56, 116, 255, 0.1);
  border-color: var(--color-primary);
}
```

### 12.2 선택 텍스트

```css
::selection {
  background-color: var(--color-primary);
  color: var(--color-white);
}
```

### 12.3 최소 터치 대상

```css
button,
a.btn {
  min-height: 44px;
  min-width: 44px;
}
```

---

## 13. 사용 예시

### 13.1 전체 페이지 예시

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>페이지 제목</title>
  <link rel="stylesheet" href="/assets/css/common.css">
</head>
<body>
  <div class="container">
    <header class="mt-8 mb-8">
      <h1>페이지 제목</h1>
      <p class="lead">부제목 또는 설명</p>
    </header>

    <main>
      <!-- 카드 그리드 -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
        <div class="card">
          <div class="card-header">
            <h3>카드 1</h3>
          </div>
          <div class="card-body">
            <p>카드 내용</p>
          </div>
          <div class="card-footer">
            <button class="btn btn-primary">액션</button>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>카드 2</h3>
          </div>
          <div class="card-body">
            <p>카드 내용</p>
          </div>
          <div class="card-footer">
            <button class="btn btn-secondary">액션</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</body>
</html>
```

---

## 14. CSS 변수 참조

모든 CSS 변수는 `:root` 선택자에서 정의되며, 다음과 같이 사용합니다:

```css
/* 색상 */
color: var(--color-primary);
background: var(--color-gray-50);

/* 타이포그래피 */
font-size: var(--font-size-lg);
font-weight: var(--font-weight-bold);
line-height: var(--line-height-lg);

/* 스페이싱 */
padding: var(--spacer-4);
margin: var(--spacer-3);

/* 보더 라디우스 */
border-radius: var(--border-radius-lg);

/* 섀도우 */
box-shadow: var(--shadow-lg);

/* 트랜지션 */
transition: var(--transition-base);
```

---

## 15. 가이드라인

### 15.1 색상 사용 규칙

- 🔵 **Primary**: 주요 액션, CTA 버튼, 링크
- 🟢 **Secondary**: 대체 액션, 성공 피드백
- ✅ **Success**: 성공 메시지, 완료 상태
- ❌ **Danger**: 에러 메시지, 삭제 액션
- ⚠️ **Warning**: 경고 메시지, 주의 필요
- ℹ️ **Info**: 정보 메시지, 알림

### 15.2 스페이싱 규칙

- 관련된 요소들 사이: `1rem` - `1.5rem`
- 섹션 사이: `2rem` - `3rem`
- 컨테이너 패딩: `1.5rem` - `2.5rem`

### 15.3 타이포그래피 규칙

- 제목: 항상 `font-weight-bolder` 또는 `font-weight-bold`
- 본문: `font-weight-normal`
- 라벨/버튼: `font-weight-semibold`

---

## 16. 버전 이력

| 버전 | 날짜 | 변경 사항 |
|------|------|----------|
| 1.0 | 2026-06-06 | 초기 생성 |

---

## 참고 자료

- [Phoenix Dashboard Template](https://pixelstrap.com/phoenix/)
- [Bootstrap Documentation](https://getbootstrap.com/docs/)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)

---

**Last Updated**: 2026-06-06  
**Maintained By**: 팝콘 AI 팀
