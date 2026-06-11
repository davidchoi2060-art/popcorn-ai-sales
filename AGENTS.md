# 프로젝트: 팝콘PC AI 조립PC 추천 시스템

## 기술 스택
- Frontend: Next.js (apps/web), TypeScript
- Backend: FastAPI (apps/api), Python
- 모노레포 구조 (apps / packages / scripts)

## 핵심 규칙
- 추천 로직은 "구조화된 조건값"을 우선 기준으로 사용한다.
  자연어 프롬프트는 사용자 이해를 돕는 안내용이다.
- 호환성 오류가 없는 구성만 추천한다 (CPU-메인보드 소켓 등).
- 재고 있는 부품 우선, 마진/행사 정책 반영.
- 결제는 기존 홈페이지로 리다이렉트.

## 참고 문서
- 요구사항: docs/requirements.md
- 사용자 흐름: (흐름도 문서)
- 와이어프레임: docs/wireframe-beginner.md, docs/wireframe-advanced.md
- 화면 목록/라우팅: apps/web/app 구조 참고

## 데이터
- 상품 CSV: scripts/etl/ 로 파싱 → DB 적재
- 주요 카테고리: CPU(소켓/세대), 메인보드(소켓/칩셋/폼팩터),
  메모리(DDR4/5), GPU(권장파워/길이), 파워(정격출력),
  케이스(보드규격/GPU장착길이/쿨러높이), 쿨러(소켓/높이)

## 참고 문서
- 요구사항: docs/requirements.md
- 사용자 흐름: docs/user-flow.md
- 와이어프레임: docs/wireframe-beginner.md, docs/wireframe-advanced.md
- 화면 목록: docs/screen-list.md
