업로드해주신 CSV에서 실제 존재하는 부품(ASUS 메인보드, AONE 파워, ABKO 케이스, AMD CPU, ARCTIC 쿨러 등)을 골라 가성비/추천/고성능 3종 견적의 Mock JSON을 만들었습니다. 이걸로 Mock 모드에서 외부 비용 없이 결과 화면·차트가 실제처럼 렌더링됩니다.

참고로 CSV의 부품들은 대부분 구형(인텔 8~10세대, 라이젠 1세대, GTX 750/960 등)이고 상당수가 `품절` 상태라, 견적이 시연상 자연스럽도록 `판매중` 위주로 골라 구성하되 일부는 설명을 덧붙였습니다.

---

# 09. 테스트 데이터 & 목 응답 명세

**파일 경로:** `_docs/09_mock-data.md`
**실제 데이터 위치:** `_mock/`
**선행 문서:** `06_db-erd.md`, `07_api-spec.md`, `CODEX_HANDOFF.md`

## 1. 목적과 구성

Mock 데이터는 두 용도다. 첫째, **Mock API 응답**으로 외부 LLM을 호출하지 않고도 결과 화면·차트를 렌더링한다(비용 0). 둘째, **시드 데이터**로 DB에 초기 상품을 적재해 관리자 화면·검증 엔진을 테스트한다. `_mock/` 폴더에 다음 파일을 둔다: `products-seed.csv`(CSV 정제본), `llm-response-value.json`(가성비), `llm-response-recommend.json`(추천), `llm-response-highend.json`(고성능).

## 2. 시드 데이터 정제 규칙 (products-seed.csv)

업로드 CSV를 그대로 쓰되 다음을 정제한다. 비정상 카테고리 표기(`그래픽카드ㅇㅇㅇ`, `ㄴ`, `삭제대기`)는 표준 `part_type`으로 매핑한다. 중복 행(상품코드 100111이 4회 등)은 1건만 남긴다. 빈 가격(0원) 행은 시연 견적 후보에서 제외하되 데이터는 보존한다. `상태값`이 `판매중`인 행을 추천 후보 풀로 우선 사용한다. CSV에서 확인된 `판매중` 부품 예시는 다음과 같다: AONE 태왕 EP600L 파워(114625), ABKO NCORE 마션 화이트 케이스(97820), AMD 라이젠 R5 1400(101268), APC UPS 다수, ASUS TUF B360-PLUS(102546) 등.

## 3. Mock 응답 — 가성비형 (llm-response-value.json)

```json
{
  "success": true,
  "data": {
    "recommendation_id": 90001,
    "sets": [{
      "type": "value",
      "total_price": 720000,
      "ai_engine": "Gemini",
      "components": {
        "cpu":   { "code": 101268, "name": "AMD 라이젠 R5 1400", "price": 191900 },
        "gpu":   { "code": 100111, "name": "AXLE 지포스 GTX750 Ti V2 D5 1GB", "price": 97800 },
        "mb":    { "code": 102546, "name": "ASUS TUF B360-PLUS GAMING", "price": 164000 },
        "ram":   { "code": 86262,  "name": "AVEXIR DDR3 8G CORE 4Gx2", "price": 65200 },
        "ssd":   { "code": 118338, "name": "ADATA SU650 240GB", "price": 28300 },
        "power": { "code": 114625, "name": "AONE 태왕 EP600L KC", "price": 21000 },
        "case":  { "code": 97820,  "name": "ABKO NCORE 마션 화이트", "price": 42100 }
      },
      "chart": {
        "fps": { "fhd": 72, "qhd": 41 },
        "price_ratio": { "cpu_gpu": 40, "mem_storage": 13, "etc": 47 }
      },
      "mentoring_reason": "예산을 최우선으로, 기본 사무·라이트 게임에 적합한 가성비 구성입니다."
    }],
    "meta": { "responded_models": ["gemini","chatgpt","claude"], "dropped_models": [], "elapsed_ms": 3100 }
  }
}
```

## 4. Mock 응답 — 추천형 (llm-response-recommend.json)

```json
{
  "success": true,
  "data": {
    "recommendation_id": 90002,
    "sets": [{
      "type": "recommend",
      "total_price": 1180000,
      "ai_engine": "Claude",
      "components": {
        "cpu":   { "code": 101266, "name": "AMD 라이젠 R5 1600", "price": 241100 },
        "gpu":   { "code": 91925,  "name": "ASUS STRIX GTX960 DC2 OC 2GB", "price": 300800 },
        "mb":    { "code": 102561, "name": "ASRock FATAL1TY H370 Performance", "price": 148000 },
        "ram":   { "code": 86267,  "name": "AVEXIR DDR3 16G CORE 8Gx2", "price": 146700 },
        "ssd":   { "code": 118338, "name": "ADATA SU650 240GB", "price": 28300 },
        "power": { "code": 81572,  "name": "Antec TP-650C 80PLUS GOLD", "price": 148700 },
        "case":  { "code": 100895, "name": "ABKO NCORE 사파이어 3.0 화이트", "price": 60300 }
      },
      "chart": {
        "fps": { "fhd": 110, "qhd": 68 },
        "price_ratio": { "cpu_gpu": 46, "mem_storage": 15, "etc": 39 }
      },
      "mentoring_reason": "성능과 가격의 균형이 가장 좋은 권장 구성으로, 화이트 감성 케이스를 반영했습니다."
    }],
    "meta": { "responded_models": ["gemini","claude"], "dropped_models": ["chatgpt"], "elapsed_ms": 4200 }
  }
}
```

추천형의 `dropped_models`에 chatgpt를 넣어, 7초 타임아웃 Fail-safe로 한 모델이 빠진 상황도 화면에서 검증되게 했다.

## 5. Mock 응답 — 고성능형 (llm-response-highend.json)

```json
{
  "success": true,
  "data": {
    "recommendation_id": 90003,
    "sets": [{
      "type": "highend",
      "total_price": 1880000,
      "ai_engine": "ChatGPT",
      "components": {
        "cpu":   { "code": 100902, "name": "AMD 라이젠 R7 1700+Wraith Spire", "price": 364700 },
        "gpu":   { "code": 101601, "name": "ASUS ROG STRIX GTX1080 Ti O11G 11GB", "price": 1321300 },
        "mb":    { "code": 104190, "name": "ASUS ROG MAXIMUS XI HERO", "price": 478000 },
        "ram":   { "code": 93569,  "name": "AVEXIR DDR3 8G RAIDEN 4Gx2", "price": 141300 },
        "ssd":   { "code": 118338, "name": "ADATA SU650 240GB", "price": 28300 },
        "power": { "code": 89736,  "name": "Antec EDGE750 GOLD 풀모듈러", "price": 209300 },
        "case":  { "code": 101641, "name": "3RSYS T200 발키리 NT PWM", "price": 115000 }
      },
      "chart": {
        "fps": { "fhd": 165, "qhd": 120 },
        "price_ratio": { "cpu_gpu": 62, "mem_storage": 9, "etc": 29 }
      },
      "mentoring_reason": "고프레임 게이밍·작업을 위한 최고 성능 구성입니다."
    }],
    "meta": { "responded_models": ["gemini","chatgpt","claude"], "dropped_models": [], "elapsed_ms": 5100 }
  }
}
```

## 6. 스왑·연쇄 스왑 Mock (swap-mock.json)

부품 변경 검증용 Mock도 둔다. 안전 대안 목록과 연쇄 변경(파워 부족) 시나리오를 포함해 `estimate-detail` 화면의 Error 토글·연쇄 스왑 UI를 비용 없이 검증한다.

```json
{
  "candidates": [
    { "code": 100884, "name": "ABKO NCORE 커브 화이트", "extra_price": 9900 },
    { "code": 100895, "name": "ABKO NCORE 사파이어 3.0 화이트", "extra_price": 18200 }
  ],
  "chain_case": {
    "compatible": false,
    "reason": "파워 정격 용량 부족 (필요 950W > 현재 750W)",
    "chain_solution": {
      "part": "power",
      "options": [
        { "code": 89736, "name": "Antec EDGE750 GOLD", "extra_price": 0, "note": "여전히 부족" },
        { "code": 126795, "name": "APC Smart-UPS 1000VA 급 대체 예시", "extra_price": 80000 }
      ]
    }
  }
}
```

## 7. 관리자·분석 Mock

관리자 화면용으로 비용 집계 Mock(`cost-mock.json`: Gemini $12.50 / ChatGPT $18.20 / Claude $22.10, 일별 추이 배열), 인기 키워드 Mock(배틀그라운드상옵·원컴방송용·딥러닝코딩 등 랭킹), 탈락 부품 TOP10 Mock, 전환 퍼널 단계별 수치 Mock을 둔다. 이들은 각 분석 차트(`keyword-rank`, `swap-bar`, `funnel`, `cost-line`)를 데이터 없이도 렌더링하게 한다.

## 8. Mock 사용 규칙

백엔드 `llm/mock.js`는 `use_mock=true`(개발 기본값)일 때 요청의 견적 성격에 따라 위 3개 JSON을 반환한다. 프론트는 Mock 여부와 무관하게 동일한 응답 스키마로 처리하므로, 실제 API 전환 시 코드 변경이 없다. Mock 데이터는 실제 CSV 부품코드를 쓰므로, 검증 엔진이 시드 DB와 대조했을 때 정상 매칭되어 재고·호환성 흐름까지 시연된다.

## 9. 데이터 현실성에 대한 주의

업로드 CSV는 구형 부품 중심이고 다수가 품절이라, 위 Mock은 "시스템 동작 검증용"이지 실제 판매 권장 견적이 아니다. 실서비스 전에는 최신 부품이 담긴 CSV로 시드를 교체하고, `product_specs`의 연산 필드(소켓·전력·치수)를 관리자 화면에서 보강해야 검증 엔진이 정확히 작동한다.

---

13단계 산출물이 완성되었습니다. 실제 CSV 부품으로 가성비/추천/고성능 3종 견적, 스왑·연쇄 스왑, 관리자·분석 Mock을 모두 만들어, Mock 모드에서 외부 비용 0으로 전 화면·차트를 실제처럼 검증할 수 있습니다. 추천형에 일부러 chatgpt Drop을 넣어 Fail-safe까지 시연되게 했습니다.

여기까지 **개발 준비 영역이 거의 끝났습니다.** 남은 것은 AI 프롬프트 마스터, 그리고 실제 구현·배포입니다.
