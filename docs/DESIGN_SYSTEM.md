# 팝콘PC AI 추천 서비스 - 전역 디자인 시스템 (Design System)

## 1. 시스템 및 브랜드 개요
본 시스템은 초보자와 고급자 모두가 AI를 통해 최적의 조립 PC 견적을 추천받고 구매할 수 있는 팝콘PC의 독립 서비스입니다. 전체 UI는 일관된 컴포넌트 구조와 신뢰감을 주는 컬러 시스템을 기반으로 구성됩니다.

- **브랜드명 (Brand Name):** PoPcornAI
- **서비스 성격:** AI 영업사원 기반 맞춤형 조립 PC 큐레이션 및 커머스 통합 플랫폼

---

## 2. 브랜드 로고 자산 (Identity Assets)
모든 화면의 헤더(GNB), 푸터, 로딩 스크린, 모달 창 등에서 로고를 호출할 때는 지정된 파일 경로의 자산을 사용하며, 레이아웃 구조에 맞춰 적절한 형태를 적용합니다.

### 2-1. 로고 유형 및 경로
1. **사각형 로고 (Square Logo)**
   - **파일명:** `로고-사각형.png`
   - **추천 해상도:** 1:1 비율 (예: 512x512 px)
   - **주요 용도:** 파비콘(Favicon), 모바일 앱 아이콘 프로토타입, 인터스티셜 로딩 화면(`loading-ai.html`), 앱 푸시 알림, 프로필 이미지 등 가로폭이 제한된 정방형 영역.
2. **가로형 로고 (Horizontal Logo)**
   - **파일명:** `로고-가로.png`
   - **주요 용도:** 데스크톱 및 태블릿 웹의 전역 상단 바(GNB) 좌측 영역, 결제 완료 페이지, 푸터 내 브랜드 표시 영역 등 가로 레이아웃이 강조되는 영역.

### 2-2. 로고 적용 가이드라인 (AI 바이브 코딩 지침)
- GNB 좌측에 로고 배치 시 `index.html`로 이동하는 하이퍼링크를 포함해야 합니다.
- 다크 테마 배경(`Surface Dark: #222F3E`) 및 화이트 배경(`Surface Main: #FFFFFF`) 어디서나 가시성이 확보되도록 배경 투명도(Transparent 알파 채널)가 적용된 PNG 자산을 기본으로 사용합니다.

---

## 3. 컬러 팔레트 (Color Palette)
- **Primary (주요 색상):** `#005daa` (팝콘PC 신뢰감을 주는 블루)
- **Primary Container:** `#0075d5` (강조 버튼 및 주요 활성화 상태)
- **Secondary (보조 색상):** `#415c9d` (서브 기능 및 안내 요소)
- **Surface (배경/카드):** `#f7f9fc` (기본 화면 바탕색)
- **Surface Main (콘텐츠 영역):** `#FFFFFF` (카드 및 입력 패널 배경)
- **Surface Dark (다크/포인트):** `#222F3E` (GNB, 툴팁, 헤더 강조색 - 가로형 로고 배치 구역)
- **Border (테두리):** `#E5E7EB` (낮은 대비의 경계선)
- **Error (오류/주의):** `#D32F2F` (호환성 오류 및 예산 초과 경고)
- **Success (정상/완료):** `#388E3C` (호환성 통과 및 재고 충분 상태)

---

## 4. 타이포그래피 (Typography)
- **Font Family:** `Inter`, `'Noto Sans KR'`, `sans-serif`
- **Headline Large:** 32px, Bold, LineHeight 1.2 (메인 카피, 결과 화면 대제목)
- **Headline Medium:** 24px, Bold, LineHeight 1.3 (각 STEP별 타이틀, 섹션 제목)
- **Title Medium:** 18px, SemiBold, LineHeight 1.4 (카드 내 제목, 부품명 강조)
- **Body Large:** 16px, Regular, LineHeight 1.5 (AI 추천 사유 본문, 안내 텍스트)
- **Body Medium:** 14px, Regular, LineHeight 1.5 (부품 세부 스펙 리스트, 표 내부 텍스트)
- **Label Small:** 12px, Medium, LineHeight 1.4 (배지, 툴팁, 폼 필드 안내어)