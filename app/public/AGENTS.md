# AGENTS.md

## 프로젝트 목적

팝콘PC AI 추천 시스템 개발.

항상 다음 문서를 우선 참조한다.

1. _docs/01_sitemap.md
2. _docs/02_file-list.md
3. _docs/07_api-spec.md
4. _docs/08_architecture.md

설계 문서와 충돌 시 코드보다 문서를 우선한다.

---

# 작업 원칙

## 최소 변경 원칙

요청 범위 외 수정 금지.

허용:

* 버그 수정
* 기능 구현
* API 연결

금지:

* 대규모 리팩토링
* 폴더 구조 변경
* 네이밍 변경
* 스타일 변경

---

# 파일 탐색 규칙

전체 프로젝트 읽기 금지.

순서:

1. 관련 문서 확인
2. 관련 파일 확인
3. 필요한 파일만 읽기

절대 금지:

* app 전체 읽기
* src 전체 읽기
* server 전체 읽기

---

# 문서 참조 규칙

화면 개발:

01_sitemap.md 확인

파일 위치:

02_file-list.md 확인

API 구현:

07_api-spec.md 확인

비즈니스 로직:

08_architecture.md 확인

문서에 정의된 내용 추측 금지.

---

# 백엔드 규칙

recommend 흐름은 반드시 유지.

순서:

auth
→ rate-limiter
→ cost-guard
→ mock
→ pii-mask
→ orchestrator
→ validator

순서 변경 금지.

---

# LLM 호출 규칙

항상:

Promise.allSettled 사용

7초 타임아웃 적용

JSON 구조 검증

실패 모델 Drop

전체 실패만 에러 처리

---

# 비용 보호 규칙

외부 LLM 호출 전에 반드시:

1. Rate Limit 검사
2. Cost Guard 검사
3. Mock Mode 검사

이후에만 외부 호출

---

# API 개발 규칙

API 규격은 07_api-spec.md를 절대 기준으로 사용.

응답 형식:

{
"success": true,
"data": {}
}

실패 형식:

{
"success": false,
"error": {
"code": "",
"message": ""
}
}

임의 필드 추가 금지.

---

# 프론트엔드 규칙

화면 구조 변경 금지.

HTML 구조 유지.

필요한 경우:

* data attribute 추가
* event binding 추가

만 허용.

---

# 로그 규칙

console.log 남발 금지.

개발 완료 시 제거.

오류 로그만 유지.

---

# 테스트 규칙

수정 후:

관련 기능만 검증.

전체 테스트 금지.

예:

recommend 수정
→ recommend만 테스트

product 수정
→ product만 테스트

---

# 응답 규칙

항상 아래 형식 사용.

## 분석

문제 원인

## 계획

수정 계획

## 구현

수정 내용

## 검증

확인 결과

---

# 토큰 절약 규칙

큰 파일 전체 읽기 금지.

필요 시:

* 함수 검색
* 클래스 검색
* endpoint 검색

우선 사용.

문서 재읽기 최소화.

이미 읽은 문서는 재로드하지 않는다.

---

# 금지사항

절대 하지 말 것.

* _publish 수정
* API Key 출력
* .env 생성
* 전체 프로젝트 분석
* 무단 리팩토링
* 미요청 최적화
* 설계 변경
* DB 스키마 변경

---

# 프로젝트 우선순위

1. 설계 준수
2. 정확성
3. 토큰 절약
4. 개발 속도

성능 최적화는 명시적 요청 시에만 수행.
