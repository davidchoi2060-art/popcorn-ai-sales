# 📂 AI 조립 PC 추천 서비스: prototype-html 디렉토리 구조 가이드

본 문서는 `popcorn-ai-sales` 프로젝트 내의 퍼블리싱 및 프로토타입 HTML 파일의 구조와 관리 규칙을 정의합니다. 기획서의 도메인(Directory) 분류 체계를 그대로 반영하여 파일 간의 간섭을 최소화하고 유지보수성을 높이도록 설계되었습니다.

## 🛠️ 전체 디렉토리 트리 구조

```text
popcorn-ai-sales/
└── apps/web/
    └── prototype-html/
        ├── index.html            # 전체 페이지 링크 모음 (개발 및 검수용 메인)
        ├── assets/               # 공통 자원 폴더
        │   ├── css/
        │   │   └── common.css    # 공통 스타일시트
        │   ├── js/
        │   │   └── prompt.js     # 공통 자바스크립트 및 프롬프트 로직
        │   └── images/           # 이미지 자원 폴더
        └── pages/                # 도메인별 화면 폴더
            ├── User_Main/
            ├── User_Auth/
            ├── Rec_Beginner/     # 초보자 추천 프로세스
            ├── Rec_Expert/       # 고급자 추천 프로세스
            ├── Rec_Common/       # 추천 공통 (로딩, 비교 등)
            ├── User_Account/
            ├── Checkout/         # 주문 및 결제
            ├── Admin_Core/       # 어드민 코어 (대시보드 등)
            ├── Admin_Parts/      # 어드민 부품 관리
            ├── Admin_AI/         # 어드민 AI 품질 및 프롬프트 관리
            ├── Admin_Orders/     # 어드민 주문/배송 관리
            ├── Admin_Users/      # 어드민 회원 관리
            ├── Admin_Stats/      # 어드민 통계/분석
            └── Admin_Config/     # 전역 운영 설정