이 배치부터 관리자 화면이 시작되므로, GNB 대신 LNB(사이드바)를 쓰는 **관리자용 공통 규칙 블록**을 별도로 추가했습니다. 앞 3개(고급자)는 기존 공통 규칙을, 뒤 3개(관리자)는 관리자 규칙을 함께 붙여넣으시면 됩니다.

---

# Stitch 생성 프롬프트 — 배치3 (고급자 후반 + 관리자 시작 6화면)

**파일 경로:** `_docs/stitch-prompts/batch3-expert-admin.md`
**선행 문서:** `04_wireframe/01~02`, `05_design-guide.md`, `STITCH_RULES.md`

## ★ 공통 규칙 블록 A — 사용자/고급자용 (배치1·2와 동일)
배치2의 [공통 규칙] 블록을 그대로 사용한다(GNB·푸터 포함). 고급자 화면은 `data-domain="expert"`로 지정한다.

## ★ 공통 규칙 블록 B — 관리자용 (관리자 3개 화면에 붙여넣기)
```
[관리자 공통 규칙]
- 한국어 UI. 기술 약어만 영문 허용. 폰트 Pretendard/Noto Sans KR, 행간 1.6.
- 타이포·컬러 토큰은 사용자 화면과 동일(H1 28px Bold, H2 22px, H3 18px,
  본문 14px, 수치 24px Bold 파란색 #0075d5, 위험 #D32F2F, 배경 #f7f9fc).
- GNB 대신 좌측 LNB(고정 폭 200px): 상단 "팝콘PC 관리" 타이틀, 메뉴
  [대시보드][비용관제][상품관리][통계분석], 하단 "관리자님 ▾".
  현재 메뉴는 활성(--active) 표시.
- LNB 우측에 관리자 헤더(현재 경로 표시 + 관리자 계정).
- 본문은 LNB 오른쪽 콘텐츠 영역. 카드·표 기반 레이아웃.
- 동적 값 data-bind, 반복 data-repeat, 버튼 data-action,
  차트 <canvas data-chart>, 예외 UI hidden.
- 반응형: 768px↓ LNB는 햄버거 메뉴로 접힘.
- body에 data-domain="admin". 인라인 스타일/임의 색상 금지.
- 외부 API Key·개인정보 하드코딩 금지. API Key 표기는 항상 *** 마스킹.
```

---

## 화면 1 — step5-review (고급자 5단계, FR-EXP-060) — 규칙 A
```
위 [공통 규칙(A)]을 적용해 "고급자 5단계: 검토·편집" 화면.
data-screen-id="FR-EXP-060" data-domain="expert".
- 헤더 H1 "전문가 주문서를 검토하고 추천받으세요", 인디케이터 "5/5"
  (5점 모두 활성).
- 전체폭. H3 "전문가 AI 주문서 (완전 편집 모드)" + 큰 편집형 textarea
  (Readonly 아님). 더미 문장:
  "안녕하세요! 직접 스펙을 통제하려는 고급자입니다.
   [CPU: AMD AM5 소켓 기반 9000시리즈 필수], [GPU: NVIDIA 칩셋 지정]
   조건을 절대 준수해 주십시오. 메모리는 [DDR5 32GB 듀얼 채널 고주파
   클럭], [정격 전력 마진 30% 이상], [3열 수랭 쿨러] 조합의 JSON 명세를
   도출하십시오."
- 캡션 "시스템 지시문은 전송 시 자동 결합됩니다.".
- 우측 하단 강조 버튼 [추천받기] data-action="recommend".
- 로딩 레이어 hidden 포함:
  "3대 AI가 전문가 견적을 정밀 조율 중입니다...".
```

## 화면 2 — result-expert (전문가 결과, FR-EXP-090) — 규칙 A
```
위 [공통 규칙(A)]을 적용해 "전문가 결과 대시보드" 화면.
data-screen-id="FR-EXP-090" data-domain="expert".
- 헤더 H1 "전문가 맞춤 견적 리포트".
- 본문 2열. 좌측: H2 "추천 구성" + 가격 24px Bold 파란색
  data-bind="total_price" "2,480,000원" + H3 "부품 명세" 리스트
  data-repeat="components"(CPU/GPU/RAM/SSD/파워/쿨러/케이스 더미).
- 우측: H2 "성능·호환성 리포트" + <canvas data-chart="low-fps">
  (1% Low FPS) + <canvas data-chart="benchmark">(3DMark).
  그 아래 H3 "5대 호환성 매트릭스" 표(테이블 그리드):
  행 [CPU 소켓 일치 / 메모리 규격 / 파워 정격 마진 / 쿨러 발열 TDP /
  케이스 실장 공간], 값 더미(✓, 132%, 여유 등).
- 하단 [부품 변경하기] data-action="goto-detail"
  href="estimate-detail-expert.html", [장바구니 담기]
  data-action="add-cart".
```

## 화면 3 — estimate-detail-expert (연쇄 스왑, FR-EXP-110) — 규칙 A
```
위 [공통 규칙(A)]을 적용해 "전문가 견적 상세·연쇄 스왑" 화면.
data-screen-id="FR-EXP-110" data-domain="expert".
- 헤더 H1 "부품 상세 및 연쇄 변경".
- 현재 부품 리스트(각 [변경] 버튼 data-action="swap-part" data-part 지정).
- 호환성 상태: 정상(초록 ●)과 위험(빨강 ● #D32F2F
  "위험 — 파워 용량 부족") 두 상태, 위험 hidden 기본.
- 연쇄 변경 안내 박스 hidden 포함: ⚠ H3 "연쇄 변경이 필요합니다" +
  본문 "현재 그래픽카드를 유지하려면 파워서플라이를 1000W 이상 등급으로
  함께 변경해야 조립이 가능합니다." + 라디오 대안
  data-repeat="chain_options"([시소닉 1000W +80,000원] 등) +
  버튼 [연쇄 변경하고 계속하기] data-action="apply-chain-swap".
- 캡션 "승인 시 파워가 자동 교체되고 위험 상태가 해제됩니다.".
- 하단 [장바구니 담기] data-action="add-cart"
  (위험 시 btn--disabled 예시 포함).
```

---

## 화면 4 — dashboard (마스터 대시보드, FR-ADM-010) — 규칙 B
```
위 [관리자 공통 규칙(B)]을 적용해 "통합 운영 대시보드" 화면.
data-screen-id="FR-ADM-010". LNB의 [대시보드] 활성.
- 헤더 H1 "통합 운영 대시보드".
- 상단 3개 비용 카드: 각 H3 "Gemini"/"ChatGPT"/"Claude" +
  수치 24px Bold data-bind(각 $12.50 / $18.20 / $22.10 더미).
- H2 "일일 누적 비용 추이" + <canvas data-chart="cost-line">.
- H2 "비용 차단 임계치" + 상태 인디케이터 ● 정상(초록) "한도 $50" +
  버튼 [🚨 비용 차단 임계 설정] data-action="set-threshold".
```

## 화면 5 — monitoring (트래픽 모니터링, FR-ADM-010) — 규칙 B
```
위 [관리자 공통 규칙(B)]을 적용해 "AI API 트래픽 모니터링" 화면.
data-screen-id="FR-ADM-010". LNB의 [비용관제] 활성.
- 헤더 H1 "AI API 트래픽 모니터링".
- H2 "모델별 토큰 사용량" + 표(테이블 그리드) data-repeat="models":
  열 [모델 / 인 토큰 / 아웃 토큰 / 평균 속도], 행 더미
  (Gemini 1.2M/0.8M/2.1s 등).
- 캡션 "분당/시간당/일별 토글 · logs 테이블 고속 집계" +
  토글 버튼 data-action="change-period".
```

## 화면 6 — rate-limit (이용 제한, FR-ADM-020) — 규칙 B
```
위 [관리자 공통 규칙(B)]을 적용해 "회원별 AI 추천 이용 제한" 화면.
data-screen-id="FR-ADM-020". LNB의 [비용관제] 활성.
- 헤더 H1 "회원별 AI 추천 이용 제한".
- H2 "등급별 일일 호출 한도" + 표: 열 [등급 / 일일 최대 횟수(입력박스)],
  행 일반회원[10]/우수회원[50]/딜러[200] 더미. 입력에 data-bind.
- H3 "특정 회원/IP 개별 차단" + 입력 [회원ID/IP] + 버튼 [차단 추가]
  data-action="add-block".
- 우측 하단 강조 버튼 [정책 저장] data-action="save-policy".
- 캡션 "저장 시 카운터에 즉시 캐싱 반영됩니다.".
```

---

배치3 산출물이 완성되었습니다. 고급자 후반 3개(검토·결과·연쇄 스왑)와 관리자 시작 3개(대시보드·모니터링·이용 제한)를 작성했고, 관리자용 LNB 공통 규칙을 새로 정의했습니다. 생성 후 고급자는 `_publish/Rec_Expert/`, 관리자는 `_publish/Admin_AI/`에 저장하시면 됩니다.