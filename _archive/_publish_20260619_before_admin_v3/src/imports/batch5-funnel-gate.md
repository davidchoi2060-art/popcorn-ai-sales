# Stitch 생성 프롬프트 — 배치5 (전환 퍼널 + dev_index 게이트)

**파일 경로:** `_docs/stitch-prompts/batch5-funnel-gate.md`
**선행 문서:** `04_wireframe/02`, `03_userflow.md`, `STITCH_RULES.md`

## 화면 1 — funnel (전환 퍼널 분석, FR-ANA-030) — 관리자 규칙 B
```
위 [관리자 공통 규칙(B)]을 적용해 "통계 분석 - 전환 퍼널" 화면.
data-screen-id="FR-ANA-030" data-domain="admin". LNB의 [통계분석] 활성.
- 헤더 H1 "통계 분석".
- 상단 탭: [인기 키워드] [탈락 부품] [전환 퍼널(활성)]
  data-action="switch-tab".
- 기간 선택(시작~종료) + [조회] data-action="query-range".
- H2 "사용자 전환 퍼널" + 깔대기 차트 <canvas data-chart="funnel">.
- 그 아래 단계별 수치 표 data-repeat="funnel_steps":
  열 [단계 / 도달 수 / 직전 대비 전환율 / 이탈률], 행 더미
  (메인 진입 / 모드 선택 / 조건 입력 완료 / 추천 노출 / 커스터마이징 /
   장바구니 / 결제 성공).
- 이탈률이 급증한 단계는 위험색(#D32F2F) 강조 배지로 표시.
- 캡션 "메인 진입부터 결제까지 유저 저니 단계별 도달·이탈 분석".
```

## 화면 2 — dev_index (통합 개발 제어 허브, DEV-HUB-010) — 전용 규칙
dev_index는 GNB/LNB를 쓰지 않는 독립 게이트이므로, 아래 전용 규칙을 함께 붙여넣는다.

```
[dev_index 전용 규칙]
- 한국어 UI. 폰트 Pretendard/Noto Sans KR, 행간 1.6. 8px 그리드.
- 타이포·컬러 토큰 동일(H1 28px Bold, H2 22px, H3 18px, 본문 14px,
  Primary #0075d5, 위험 #D32F2F, 정상 #2e7d32, 진행중 #f9a825,
  배경 #f7f9fc, 카드 흰색).
- GNB/LNB 없음. 상단 풀폭 타이틀 바 + 인프라 상태 바 + 3개 섹션 카드.
- 동적 값 data-bind, 반복 data-repeat, 버튼 data-action.
- body에 data-screen-id="DEV-HUB-010" data-domain="dev".

위 규칙으로 "팝콘PC AI 통합 개발·운영 마스터 제어 허브" 화면을 만들어줘.

[상단 타이틀 바]
- H1 "팝콘PC AI — 통합 개발·운영 마스터 제어 허브".

[인프라 상태 바] (가로 한 줄, 색 점 표시)
- "로컬 DB: ● ONLINE" data-bind="local_db" (초록/빨강 토글),
  "개발서버 DB: ● ONLINE" data-bind="server_db",
  "Nginx: 정상" data-bind="nginx".
- DB 오프라인(빨강) 시 노출되는 툴팁 영역 hidden 포함:
  "DB 연결 예외 — 'Show all databases' 조치를 확인하세요.".

[섹션 1] H2 "① 화면 구현 진척도 매트릭스"
- 표(테이블 그리드) data-repeat="screens": 열
  [화면 ID / 파일명 / 구현 상태 / 이동 링크].
- 구현 상태는 색 배지: ⚪대기(회색) / 🟡코딩중(주황) /
  🔵로컬검증(파랑) / ●배포완료(초록).
- 이동 링크 열에 버튼 3개:
  [정적 미리보기] data-action="preview-static",
  [동작 테스트] data-action="preview-live",
  [수정 프롬프트] data-action="copy-prompt".
- 더미 2행: (FR-LND-010 / index.html / ●배포완료 / 3버튼),
  (FR-BEG-010 / step1-purpose.html / 🟡코딩중 / 3버튼).
- 캡션 "상태: ⚪대기 → 🟡코딩중 → 🔵로컬검증 → ●배포완료".

[섹션 2] H2 "② 개발 테스트 도구 (개발자 전용)"
- 2개 카드 나란히:
  카드1 H3 "가상 세션 강제 주입" + 버튼 [일반 회원][우수 회원][게스트 유입]
   data-action="inject-session" data-grade 지정.
  카드2 H3 "외부 LLM API Mock 스위치" + 토글 [실제 API 호출][가상 JSON 응답]
   data-action="toggle-mock". 기본 "가상 JSON 응답" 활성(--active).

[섹션 3] H2 "③ 운영자 미리보기 (DB 연동형)"
- 2개 카드 나란히:
  카드1 H3 "추천 로직 실시간 가중치" + 슬라이더
   재고소진[40%] / 마진극대[80%] / 최저가가성비[60%] 더미,
   채움·핸들 파란색, 각 data-bind. 하단 [가중치 저장] data-action="save-weights".
  카드2 H3 "3사 LLM API 비용 관제" + 수치 라인
   "Gemini $12.50 | ChatGPT $18.20 | Claude $22.10" 각 data-bind +
   버튼 [🚨 비용 차단 임계] data-action="set-threshold"(위험색 강조).
```

---

배치5 산출물이 완성되어 **11단계 Stitch 프롬프트 세트가 모두 끝났습니다.** 정리하면 배치1(초급자 6) + 배치2(랜딩·고급자 전반 6) + 배치3(고급자 후반·관리자 시작 6) + 배치4(관리자 상품·분석 6) + 배치5(퍼널·게이트 2)로, 총 27개 화면의 생성 프롬프트를 모두 한국어 통일·자리표시자 포함·6개 단위 배치로 완비했습니다.

이제 이 프롬프트들로 Stitch에서 화면을 생성해 `_publish/`에 적재하고 `_MAPPING.md`에 기록하면, 퍼블리싱 단계가 완료됩니다.
