배치1의 공통 규칙 블록을 그대로 재사용하되, 고급자 화면은 `data-domain="expert"`, 랜딩은 `data-domain="user"`로 지정합니다.

---

# Stitch 생성 프롬프트 — 배치2 (랜딩 + 고급자 전반 6화면)

**파일 경로:** `_docs/stitch-prompts/batch2-landing-expert.md`
**선행 문서:** `04_wireframe/00~01`, `05_design-guide.md`, `STITCH_RULES.md`

## ★ 공통 규칙 블록 (배치1과 동일 — 모든 프롬프트 맨 앞에 붙여넣기)

```
[공통 규칙]
- 한국어 UI로 제작. 기술 약어(CPU, GPU, NVMe 등)만 영문 허용.
- 폰트: Pretendard, 없으면 Noto Sans KR. 본문 행간 1.6.
- 타이포 위계 고정: 히어로 Display 32px Bold, 제목 H1 28px Bold,
  부제목 H2 22px SemiBold, 소제목 H3 18px SemiBold, 본문 14px,
  강조본문 16px, 캡션 12px 회색, 가격·수치 24px Bold + 파란(#0075d5).
- 컬러: Primary #0075d5, 위험 #D32F2F, 본문 #333, 보조 #888,
  배경 #f7f9fc, 카드 흰색, 테두리 #e0e0e0.
- 간격 8px 그리드. 모서리 6~10px. 카드 옅은 그림자.
- 공통 GNB(상단 고정 64px): 좌측 "팝콘PC AI" 로고, 중앙 [초급자 모드]
  [고급자 모드] 탭, 우측 [로그인/회원가입][장바구니][마이페이지].
- 공통 푸터: "팝콘PC | 고객센터 1234-5678 | 이용약관·개인정보처리방침
  © 2026 팝콘PC".
- 반응형: 1024px↑ 기본, 768px↓ 2분할을 세로 1열 스택.
- 동적 텍스트엔 data-bind, 반복목록엔 data-repeat, 버튼엔 data-action,
  차트 자리엔 <canvas data-chart>, 예외 UI는 hidden으로 포함.
- 인라인 스타일/임의 색상 금지. 외부 API 직접 호출 코드 금지.
```

## 화면 1 — index (랜딩, FR-LND-010)
```
위 [공통 규칙]을 적용해 "메인 랜딩 페이지"를 만들어줘.
body에 data-screen-id="FR-LND-010" data-domain="user".
- 히어로 섹션: Display 32px Bold 메인 카피
  "컴퓨터를 몰라도, 전문가 스펙을 원해도! 3대 AI가 팝콘PC 부품으로
  맞춤 설계하는 단 하나의 조립PC". 그 아래 강조본문 16px
  "용도와 예산만 알려주세요. 1초 만에 견적.".
- 그 아래 2분할 카드(모바일 세로 스택):
  좌측 카드 H2 "초급자 모드" + 본문 "컴퓨터 부품을 잘 몰라요" +
  불릿 "용도·예산만으로 견적 / AI 영업사원 멘토링" + 버튼 [시작하기]
  data-action="goto-beginner" href="../Rec_Beginner/step1-purpose.html".
  우측 카드 H2 "고급자 모드" + 본문 "원하는 스펙이 확실해요" +
  불릿 "선호 브랜드·물리 규격 검증 / 전문가용 고정밀 제어" +
  버튼 [시작하기] data-action="goto-expert"
  href="../Rec_Expert/step1-priority.html".
- 카드 hover: 파란 테두리(#0075d5), Scale 1.02, 그림자 깊어짐,
  0.2s ease-in-out.
- 메인 이미지는 WebP 가정 + loading="lazy" 더미.
```

## 화면 2 — auth-modal (SSO 인증, FR-LND-020)
```
위 [공통 규칙]을 적용해 "SSO 통합 로그인 모달" 화면.
data-screen-id="FR-LND-020" data-domain="user".
- 화면 중앙 모달(딤 배경 오버레이). H2 "팝콘PC 통합 로그인".
- 캡션 "기존 팝콘PC 쇼핑몰 계정으로 로그인됩니다.".
- 입력 폼: <label>아이디</label> + input, <label>비밀번호</label> + input.
- 버튼: [로그인] data-action="sso-login"(강조), [회원가입]
  data-action="signup"(보조).
- 하단 링크 "비회원으로 계속하기" data-action="guest-continue".
- 인증 실패 안내 영역 hidden 포함: "로그인에 실패했습니다.
  다시 시도하거나 비회원으로 진행하세요.".
- 닫기 버튼(X) data-action="close-modal".
```

## 화면 3 — step1-priority (고급자 1단계, FR-EXP-010)
```
위 [공통 규칙]을 적용해 "고급자 1단계: 우선순위·제조사" 화면.
data-screen-id="FR-EXP-010" data-domain="expert".
- 헤더 H1 "우선순위와 선호 브랜드를 지정하세요", 인디케이터 "1/5"
  (5점, 첫 활성).
- 2분할(좌 60% / 우 40% 고정).
- 좌측: H3 "가치 우선순위 밸런스" + 슬라이더 3개
  (성능극대/전원안정/가성비, 더미 70/80/40).
  H3 "CPU 제조사(필수 고정)" 라디오 Intel/AMD/상관없음(AMD 선택 더미).
  H3 "GPU 제조사(필수 고정)" 라디오 NVIDIA/AMD/상관없음(NVIDIA 더미).
- 우측 프롬프트: H3 "전문가 AI 요청서" + 박스 안 기술 문장,
  "[CPU: AMD 필수], [GPU: NVIDIA 지정]..." 대괄호를
  data-key="cpu_maker", data-key="gpu_maker" 로 감싸기.
- 하단 [다음] data-action="next-step" href="step2-cpu-gpu.html".
```

## 화면 4 — step2-cpu-gpu (고급자 2단계, FR-EXP-020)
```
위 [공통 규칙]을 적용해 "고급자 2단계: CPU 세대·오버클럭" 화면.
data-screen-id="FR-EXP-020" data-domain="expert".
- 헤더 H1 "CPU 세대와 오버클럭 옵션을 선택하세요", 인디케이터 "2/5".
- 2분할. 좌측 아코디언 형태:
  ▾ Intel: 체크박스 "14세대 Core".
  ▾ AMD: 체크박스 "라이젠 9000 시리즈"(체크 더미).
  H3 "오버클럭 라인업": 체크박스 K시리즈(체크)/X시리즈.
- 우측 프롬프트: "...[CPU: AMD AM5 소켓 9000시리즈 필수]..."
  data-key="cpu_gen".
- 하단 [이전] href="step1-priority.html", [다음] href="step3-ram-ssd.html".
```

## 화면 5 — step3-ram-ssd (고급자 3단계, FR-EXP-030)
```
위 [공통 규칙]을 적용해 "고급자 3단계: 메모리·SSD" 화면.
data-screen-id="FR-EXP-030" data-domain="expert".
- 헤더 H1 "메모리와 저장장치 규격을 지정하세요", 인디케이터 "3/5".
- 2분할. 좌측: H3 "메모리 타입" 라디오 DDR4/DDR5(DDR5 더미).
  H3 "최소 용량" 라디오 16GB/32GB(더미)/64GB 이상.
  H3 "채널 구성" 라디오 듀얼(더미)/싱글.
  H3 "SSD 인터페이스" 라디오 NVMe PCIe 4.0 / PCIe 5.0(더미).
- 우측 프롬프트: "...메모리는 [DDR5 32GB 듀얼채널 고클럭], SSD는
  [NVMe PCIe 5.0]..." data-key="mem_type", data-key="ssd_gen".
- 하단 [이전] href="step2-cpu-gpu.html", [다음] href="step4-power.html".
```

## 화면 6 — step4-power (고급자 4단계, FR-EXP-040)
```
위 [공통 규칙]을 적용해 "고급자 4단계: 전력 마진·쿨링" 화면.
data-screen-id="FR-EXP-040" data-domain="expert".
- 헤더 H1 "전력 여유와 쿨링 방식을 설정하세요", 인디케이터 "4/5".
- 2분할. 좌측: H3 "파워 전력 여유 마진율" 라디오 20%/30%(더미)/40%
  + 슬라이더(30% 위치). H3 "쿨링 솔루션" 라디오
  대장급 공랭 / 2열 수랭 / 3열 수랭(더미).
- 우측 프롬프트: "...[정격 전력 마진 30% 이상 여유 확보] 및
  [3열 수랭 쿨러] 조합의 JSON 명세를 도출..." data-key="power_margin",
  data-key="cooler".
- 하단 [이전] href="step3-ram-ssd.html", [다음] href="step5-review.html".
```

---

배치2 산출물이 완성되었습니다. 랜딩(히어로 Display 카피 + 분기 카드 + hover 효과), SSO 모달(실패 처리 포함), 고급자 1~4단계(우선순위·세대·메모리·전력)를 모두 한국어 통일·자리표시자 포함으로 작성했습니다. 생성 후 랜딩은 `_publish/User_Main/`, 고급자는 `_publish/Rec_Expert/`에 저장하시면 됩니다.

---

## 화면 1 갱신 — index 확장 랜딩 기준 (2026-06-19)

기존 index 프롬프트는 히어로 + 초급자/고급자 2분할 카드 중심이었으나, 현재 개발 기준 랜딩은 다음 섹션을 모두 포함한다.

1. GNB: 브랜드 로고, 초급자 모드, 고급자 모드, 로그인, 회원가입, 관리자, DEV 버튼
2. Hero: 3대 AI 병렬 분석, 팝콘PC 실재고 검증, 초급자/고급자 CTA
3. RealtimePanel: 실시간 인기 견적 TOP 5, 실시간 가격 동향
4. Mode Select: 초급자 모드 카드, 고급자 모드 카드
5. How It Works: 4단계 사용 흐름 탭/도트
6. Spec Preview: 추천 견적 부품 미리보기
7. AI Engines: Gemini / ChatGPT / Claude 역할 설명, 7초 Fail-safe 안내
8. Reviews: 사용자 후기 3개
9. Special Event Banner: 특가·이벤트 롤링 배너
10. Final CTA + Footer

새 랜딩을 재생성할 경우, 위 섹션 구조를 우선 기준으로 사용한다.
