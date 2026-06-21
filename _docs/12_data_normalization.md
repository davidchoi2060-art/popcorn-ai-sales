```md
# 팝콘PC 상품 CSV 카테고리 정규화 지침서

**문서 목적:**  
팝콘PC 쇼핑몰 상품 CSV(`팝콘PC_상품_2026-06-10기준(통합).csv`)를 AI 조립PC 추천 시스템에서 사용할 수 있도록 표준 카테고리로 정규화하기 위한 지침서다.

**적용 대상:**  
- 상품 원본 CSV
- `products` 테이블
- `product_specs` 테이블
- `product_category_normalized` 테이블
- 관리자 상품 마스터 화면 `adm-product-master`
- AI 추천 후보군 필터링 로직

---

## 1. 핵심 원칙

### 1.1 원본 CSV 카테고리는 절대 덮어쓰지 않는다

CSV의 `카테고리1`, `카테고리2`, `카테고리3`, `카테고리4`는 쇼핑몰 운영용 원본 데이터로 보존한다.

CSV에는 다음과 같은 오염된 카테고리가 포함되어 있다.

```text
삭제대기
그래픽카드ㅇㅇㅇ
ㄴ
단품비노출
조립관련
고용량
웨스턴
AMD라이젠
8세대 커피레이크
인텔 i3
```

따라서 기존 카테고리 값을 직접 수정하거나 삭제하지 않는다.

---

### 1.2 AI 추천용 표준 카테고리는 별도 레이어로 생성한다

원본 카테고리는 `products`에 보존하고, AI 추천 및 관리자 필터링을 위해 별도 정규화 테이블을 사용한다.

```text
CSV 원본
  └─ products.category1~4, product_name, spec_raw 그대로 보존

정규화 레이어
  ├─ normalized_group
  ├─ normalized_part_type
  ├─ normalized_category_name
  ├─ ai_candidate_yn
  ├─ source_rule
  ├─ confidence
  └─ reviewed_yn
```

---

## 2. 표준 카테고리 구조

### 2.1 1차 그룹: normalized_group

| normalized_group | 설명 | AI 추천 후보 여부 |
|------------------|------|------------------|
| `core_part` | 조립PC 핵심 부품 | 예 |
| `peripheral` | 모니터, 키보드, 마우스, 스피커 등 주변기기 | 선택 |
| `cable_accessory` | 케이블, 젠더, 받침대, 패드 등 | 아니오 |
| `service` | 조립비, 출장 AS, 배송, 발포제 등 | 아니오 |
| `prebuilt_pc` | 완제품 PC, 채굴기, 프리미엄 PC | 아니오 |
| `software` | Windows, Office 등 소프트웨어 | 아니오 |
| `internal` | 내부관리용, 단품비노출, 장부관련 | 아니오 |
| `unknown` | 자동분류 실패 또는 관리자 검수 필요 | 아니오 |

---

### 2.2 2차 표준 부품 타입: normalized_part_type

| normalized_part_type | 한글명 | 예시 |
|----------------------|--------|------|
| `CPU` | 프로세서 | AMD 라이젠, 인텔 코어 i5 |
| `GPU` | 그래픽카드 | RTX, GTX, Radeon |
| `MB` | 메인보드 | B650, H610, Z790 |
| `RAM` | 메모리 | DDR4, DDR5 |
| `SSD` | SSD | NVMe, M.2, SATA SSD |
| `HDD` | 하드디스크 | 1TB HDD, 4TB HDD |
| `POWER` | 파워서플라이 | 600W, 750W, 1000W |
| `CASE` | 본체 케이스 | 미들타워, 미니타워, 랙마운트 |
| `COOLER_CPU_AIR` | CPU 공랭쿨러 | 타워형 공랭 |
| `COOLER_CPU_AIO` | CPU 수랭쿨러 | 240mm, 360mm 수랭 |
| `COOLER_SYSTEM` | 시스템 쿨러 | 120mm 팬, 140mm 팬 |
| `COOLER_THERMAL` | 써멀구리스/컴파운드 | Kryonaut, 써멀컴파운드 |
| `MONITOR` | 모니터 | 24인치, 27인치 |
| `KEYBOARD` | 키보드 | 기계식 키보드 |
| `MOUSE` | 마우스 | 게이밍 마우스 |
| `KEYBOARD_MOUSE_SET` | 키보드+마우스 세트 | 유선세트, 무선세트 |
| `HEADSET` | 헤드셋/이어폰 | 게이밍 헤드셋 |
| `SPEAKER` | 스피커 | 2채널, 사운드바 |
| `NETWORK` | 네트워크 장비 | 공유기, 랜카드 |
| `CABLE` | 케이블/젠더 | HDMI, DP, USB-C |
| `ACCESSORY` | 기타 액세서리 | 마우스패드, 받침대 |
| `ASSEMBLY_SERVICE` | 조립/AS 서비스 | 조립비, 출장 AS |
| `PREBUILT_PC` | 완제품/채굴기/프리미엄 PC | ALEO 채굴기 |
| `SOFTWARE` | 소프트웨어 | Windows, Office |
| `INTERNAL` | 내부관리 항목 | 장부상품, 단품비노출 |
| `EXCLUDE` | 추천 제외 | 분류 불가 또는 비추천 항목 |
| `UNKNOWN` | 미분류 | 자동분류 실패 |

---

## 3. AI 추천 후보 기준

### 3.1 AI 추천 후보에 포함할 부품

AI 조립PC 추천 후보군에는 아래 타입만 포함한다.

```text
CPU
GPU
MB
RAM
SSD
HDD
POWER
CASE
COOLER_CPU_AIR
COOLER_CPU_AIO
```

조건:

```text
products.status = '판매중'
AND ai_candidate_yn = true
```

---

### 3.2 AI 추천 후보에서 제외할 항목

아래 항목은 기본 조립PC 추천 후보에서 제외한다.

```text
MONITOR
KEYBOARD
MOUSE
KEYBOARD_MOUSE_SET
HEADSET
SPEAKER
NETWORK
CABLE
ACCESSORY
COOLER_SYSTEM
COOLER_THERMAL
SOFTWARE
ASSEMBLY_SERVICE
PREBUILT_PC
INTERNAL
EXCLUDE
UNKNOWN
```

단, 모니터, 키보드, 마우스, 스피커 등은 추후 “주변기기 추가 추천” 기능에서 별도 사용 가능하다.

---

## 4. 정규화 판단 우선순위

상품의 표준 카테고리는 아래 순서대로 판단한다.

```text
1순위: 상품명 product_name
2순위: 스펙 문자열 spec_raw
3순위: 카테고리2 category2
4순위: 카테고리3 category3
5순위: 제조사 maker + 모델명 model_name
6순위: 카테고리1 category1
```

주의:

```text
카테고리1이 '삭제대기'여도 상태값이 '판매중'이면 추천 후보가 될 수 있다.
상품 판매 가능 여부는 반드시 products.status 기준으로 판단한다.
```

---

## 5. 상태값 처리 기준

CSV의 `상태값`은 상품 노출 및 추천 후보 여부의 최우선 기준이다.

| 원본 상태값 | 표준 상태 | AI 추천 후보 |
|------------|-----------|--------------|
| `판매중` | 판매중 | 가능 |
| `품절` | 품절 | 제외 |
| `단종` | 단종 | 제외 |
| `삭제대기` | 삭제대기 | 제외 |

추천 쿼리는 항상 다음 조건을 포함해야 한다.

```sql
WHERE products.status = '판매중'
```

---

## 6. 카테고리별 정규화 규칙

---

### 6.1 CPU

#### 판단 키워드

```text
CPU
프로세서
라이젠
Ryzen
AMD
인텔
Intel
코어 i3
코어 i5
코어 i7
코어 i9
셀러론
펜티엄
애슬론
스레드리퍼
Threadripper
EPYC
소켓AM4
소켓AM5
LGA
```

#### 정규화 결과

```text
normalized_group = core_part
normalized_part_type = CPU
ai_candidate_yn = true
```

#### 추출 대상 필드

| 필드 | 예시 |
|------|------|
| `socket` | AM4, AM5, LGA1700 |
| `tdp_watt` | 65, 105, 170 |
| `core_count` | 6, 8, 16 |
| `thread_count` | 12, 16, 32 |
| `cpu_generation` | Ryzen 7000, Ryzen 9000, Intel 14세대 |

#### 예시

```text
상품명:
(AMD) 라이젠RYZEN R5 1400 /CPU

스펙:
CPU / 제조회사 : AMD / 소켓 구분 : AMD(소켓AM4) / 설계전력 : 65 W

정규화:
normalized_group = core_part
normalized_part_type = CPU
ai_candidate_yn = true
socket = AM4
tdp_watt = 65
confidence = 0.98
```

---

### 6.2 GPU

#### 판단 키워드

```text
VGA
그래픽카드
지포스
GeForce
GTX
RTX
라데온
Radeon
RX
Quadro
Tesla
GT730
GTX1060
RTX4060
RTX4070
RTX5070
```

#### 정규화 결과

```text
normalized_group = core_part
normalized_part_type = GPU
ai_candidate_yn = true
```

#### 추출 대상 필드

| 필드 | 예시 |
|------|------|
| `gpu_chipset` | RTX 4060, GTX 1060, RX 580 |
| `vram_gb` | 4, 6, 8, 12, 16 |
| `length_mm` | 210, 245, 278, 320 |
| `tdp_watt` | 75, 120, 150, 250 |
| `required_power_watt` | 450, 550, 650 |

#### 예시

```text
상품명:
(GIGABYTE) 지포스 GTX1060 G1.Gaming D5 6GB /VGA

정규화:
normalized_group = core_part
normalized_part_type = GPU
ai_candidate_yn = true
gpu_chipset = GTX 1060
vram_gb = 6
confidence = 0.98
```

---

### 6.3 메인보드

#### 판단 키워드

```text
메인보드
M/B
CPU 소켓
세부 칩셋
폼팩터
B650
B550
A620
X670
X870
Z790
B760
H610
H310
H370
LGA
AM4
AM5
m-ATX
M-ATX
ATX
Mini-ITX
```

#### 정규화 결과

```text
normalized_group = core_part
normalized_part_type = MB
ai_candidate_yn = true
```

#### 추출 대상 필드

| 필드 | 예시 |
|------|------|
| `socket` | AM4, AM5, LGA1700 |
| `chipset` | B550, B650, Z790 |
| `mem_type` | DDR4, DDR5 |
| `form_factor` | ATX, M-ATX, Mini-ITX |

#### 예시

```text
상품명:
(ASRock) B360M PRO4

스펙:
CPU 소켓 : 인텔(소켓1151v2) / 세부 칩셋 : B360 / 메모리 종류 : DDR4

정규화:
normalized_group = core_part
normalized_part_type = MB
ai_candidate_yn = true
socket = LGA1151v2
chipset = B360
mem_type = DDR4
confidence = 0.95
```

---

### 6.4 RAM

#### 판단 키워드

```text
RAM
메모리
DDR3
DDR4
DDR5
PC3
PC4
PC5
DIMM
SO-DIMM
8GB
16GB
32GB
64GB
```

#### 정규화 결과

```text
normalized_group = core_part
normalized_part_type = RAM
ai_candidate_yn = true
```

#### 추출 대상 필드

| 필드 | 예시 |
|------|------|
| `mem_type` | DDR4, DDR5 |
| `capacity_gb` | 8, 16, 32 |
| `clock_mhz` | 3200, 5600, 6000 |
| `module_count` | 1, 2, 4 |

#### 예시

```text
상품명:
ADATA DDR5-6000 CL30 LANCER

정규화:
normalized_group = core_part
normalized_part_type = RAM
ai_candidate_yn = true
mem_type = DDR5
clock_mhz = 6000
confidence = 0.97
```

---

### 6.5 SSD

#### 판단 키워드

```text
SSD
NVMe
M.2
M.2 2280
SATA SSD
2.5형 SSD
고속저장
읽기속도
쓰기속도
PCIe
```

#### 정규화 결과

```text
normalized_group = core_part
normalized_part_type = SSD
ai_candidate_yn = true
```

#### 추출 대상 필드

| 필드 | 예시 |
|------|------|
| `capacity_gb` | 256, 512, 1000, 2000 |
| `interface` | NVMe, SATA |
| `pcie_gen` | PCIe 3.0, PCIe 4.0, PCIe 5.0 |
| `form_factor` | M.2 2280, 2.5형 |

#### 예시

```text
상품명:
ADATA LEGEND 900 M.2 NVMe 1TB

정규화:
normalized_group = core_part
normalized_part_type = SSD
ai_candidate_yn = true
interface = NVMe
capacity_gb = 1000
confidence = 0.97
```

---

### 6.6 HDD

#### 판단 키워드

```text
HDD
하드디스크
저장장치(HDD)
SATA3
5400RPM
7200RPM
Barracuda
IronWolf
WD BLUE
WD BLACK
Toshiba
Seagate
```

#### 정규화 결과

```text
normalized_group = core_part
normalized_part_type = HDD
ai_candidate_yn = true
```

#### 추출 대상 필드

| 필드 | 예시 |
|------|------|
| `capacity_gb` | 1000, 2000, 4000 |
| `rpm` | 5400, 7200 |
| `interface` | SATA3 |

---

### 6.7 POWER

#### 판단 키워드

```text
파워
POWER
파워서플라이
ATX 파워
SFX
TFX
정격
500W
600W
650W
750W
850W
1000W
1200W
80PLUS
BRONZE
GOLD
PLATINUM
TITANIUM
```

#### 정규화 결과

```text
normalized_group = core_part
normalized_part_type = POWER
ai_candidate_yn = true
```

#### 추출 대상 필드

| 필드 | 예시 |
|------|------|
| `rated_watt` | 500, 650, 750, 1000 |
| `efficiency` | BRONZE, GOLD, PLATINUM |
| `form_factor` | ATX, SFX, TFX |
| `modular` | full, semi, none |

#### 예시

```text
상품명:
Antec GSK 750W 80PLUS골드 풀모듈러 ATX3.1

정규화:
normalized_group = core_part
normalized_part_type = POWER
ai_candidate_yn = true
rated_watt = 750
efficiency = GOLD
confidence = 0.95
```

---

### 6.8 CASE

#### 판단 키워드

```text
케이스
CASE
PC케이스
본체케이스
미들타워
미니타워
빅타워
슬림
LP
랙마운트
강화유리
VGA장착길이
그래픽카드 장착
CPU쿨러장착높이
```

#### 정규화 결과

```text
normalized_group = core_part
normalized_part_type = CASE
ai_candidate_yn = true
```

#### 추출 대상 필드

| 필드 | 예시 |
|------|------|
| `gpu_max_mm` | 330, 370, 400 |
| `cooler_max_mm` | 158, 165, 180 |
| `case_type` | 미들타워, 미니타워, 빅타워, 랙마운트 |
| `form_factor_support` | ATX, M-ATX, Mini-ITX |
| `tag_white` | true / false |

#### 예시

```text
상품명:
(ABKO) NCORE 마션 USB3.0 화이트 /케이스

스펙:
그래픽카드 장착 : 370 mm / CPU 쿨러높이:158mm

정규화:
normalized_group = core_part
normalized_part_type = CASE
ai_candidate_yn = true
gpu_max_mm = 370
cooler_max_mm = 158
tag_white = true
confidence = 0.95
```

---

### 6.9 COOLER

쿨러는 단일 카테고리로 묶지 않고 세분화한다.

| normalized_part_type | 기준 |
|----------------------|------|
| `COOLER_CPU_AIR` | CPU쿨러 + 공랭 |
| `COOLER_CPU_AIO` | CPU쿨러 + 수랭/수냉/240/360 |
| `COOLER_SYSTEM` | 시스템 쿨러, 120mm 팬, 140mm 팬 |
| `COOLER_THERMAL` | 써멀구리스, 써멀컴파운드 |

#### AI 추천 후보 포함

```text
COOLER_CPU_AIR
COOLER_CPU_AIO
```

#### AI 추천 후보 제외

```text
COOLER_SYSTEM
COOLER_THERMAL
```

#### 예시

```text
3RSYS Socoool RC1800
→ COOLER_CPU_AIR

3RSYS 라니 SF 360 ARGB
→ COOLER_CPU_AIO

3RSYS Silence GI 120
→ COOLER_SYSTEM

Thermal Grizzly Kryonaut
→ COOLER_THERMAL
```

---

## 7. 서비스/완제품/내부관리 분류 기준

### 7.1 조립/AS 서비스

#### 판단 키워드

```text
조립비
출장 AS
A/S
무상출장
택배서비스
발포제
배송
제작 및 테스트
```

#### 정규화

```text
normalized_group = service
normalized_part_type = ASSEMBLY_SERVICE
ai_candidate_yn = false
```

#### 예시

```text
상품명:
컴퓨터 조립비+1년 전국 방문 출장 AS 1대분

정규화:
normalized_group = service
normalized_part_type = ASSEMBLY_SERVICE
ai_candidate_yn = false
confidence = 1.00
```

---

### 7.2 완제품 / 프리미엄 PC / 채굴기

#### 판단 키워드

```text
프리미엄 피씨
완제PC
일체형
채굴기
ALEO
알레오코인
마이닝
1WAY
2WAY
4WAY
6WAY
```

#### 정규화

```text
normalized_group = prebuilt_pc
normalized_part_type = PREBUILT_PC
ai_candidate_yn = false
```

#### 예시

```text
상품명:
ALEO 채굴기 알레오코인 RTX3060 6WAY

정규화:
normalized_group = prebuilt_pc
normalized_part_type = PREBUILT_PC
ai_candidate_yn = false
confidence = 0.98
```

---

### 7.3 내부관리용

#### 판단 키워드

```text
내부관리용
단품비노출
장부관련
만상장부용
조립관련
선택하세요
중간설명
```

#### 정규화

```text
normalized_group = internal
normalized_part_type = INTERNAL
ai_candidate_yn = false
```

---

## 8. 텍스트 정제 규칙

CSV에는 HTML 태그와 HTML 엔티티가 포함되어 있으므로 정규화 전에 제거한다.

### 8.1 제거 대상

```html
<font ...>
</font>
<strong>
</strong>
<b>
</b>
<p>
</p>
<em>
</em>
```

### 8.2 변환 대상

```text
&#160; → 공백
&nbsp; → 공백
<br> → 공백
<br/> → 공백
```

### 8.3 예시

```text
원본:
<font color=red>[예약]</font> 이엠텍 XENON GTX1060

정제:
[예약] 이엠텍 XENON GTX1060
```

---

## 9. 정규화 테이블 설계

### 9.1 products

CSV 원본을 보존하는 테이블이다.

```text
products
- product_code
- product_name
- maker
- category1
- category2
- category3
- category4
- status
- spec_raw
```

---

### 9.2 product_category_normalized

상품 표준 카테고리를 저장한다.

```text
product_category_normalized
- product_code
- normalized_group
- normalized_part_type
- normalized_category_name
- ai_candidate_yn
- source_rule
- confidence
- reviewed_yn
- reviewed_by
- reviewed_at
```

#### 예시

| product_code | normalized_group | normalized_part_type | ai_candidate_yn | confidence |
|-------------|------------------|----------------------|-----------------|------------|
| 101268 | core_part | CPU | true | 0.98 |
| 99632 | core_part | GPU | true | 0.98 |
| 97820 | core_part | CASE | true | 0.95 |
| 100836 | peripheral | HEADSET | false | 0.92 |
| 68022 | service | ASSEMBLY_SERVICE | false | 1.00 |
| 121331 | prebuilt_pc | PREBUILT_PC | false | 1.00 |

---

### 9.3 product_specs

AI 추천 및 호환성 검증용 정형 필드를 저장한다.

```text
product_specs
- product_code
- part_type
- socket
- chipset
- mem_type
- tdp_watt
- rated_watt
- length_mm
- gpu_max_mm
- cooler_tdp
- pcie_gen
- tag_white
- tag_rgb
- tag_silent
- margin_locked
```

---

## 10. 정규화 룰 테이블

하드코딩 대신 룰 테이블을 사용한다.

### 10.1 category_alias_rules

```text
category_alias_rules
- rule_id
- priority
- match_field
- match_type
- pattern
- normalized_group
- normalized_part_type
- confidence
- active
```

### 10.2 룰 예시

| priority | match_field | pattern | normalized_group | normalized_part_type | confidence |
|---------|-------------|---------|------------------|----------------------|------------|
| 100 | product_name | `라이젠|Ryzen|코어i|셀러론|펜티엄|EPYC` | core_part | CPU | 0.98 |
| 100 | product_name | `RTX|GTX|지포스|라데온|RX\s?\d+|VGA` | core_part | GPU | 0.98 |
| 95 | category2 | `그래픽카드(VGA)` | core_part | GPU | 0.95 |
| 95 | category2 | `프로세서(CPU)` | core_part | CPU | 0.95 |
| 95 | category2 | `메인보드(M/B)` | core_part | MB | 0.95 |
| 90 | spec_raw | `CPU 소켓|세부 칩셋|폼팩터` | core_part | MB | 0.90 |
| 90 | spec_raw | `정격\s?\d+W|80PLUS|ATX 파워` | core_part | POWER | 0.90 |
| 90 | spec_raw | `VGA장착길이|CPU쿨러장착높이|PC용 케이스` | core_part | CASE | 0.90 |
| 100 | product_name | `조립비|출장 AS|무상출장|택배서비스` | service | ASSEMBLY_SERVICE | 1.00 |
| 100 | product_name | `채굴기|ALEO|알레오코인|프리미엄 피씨` | prebuilt_pc | PREBUILT_PC | 1.00 |
| 100 | category1 | `내부관리용` | internal | INTERNAL | 1.00 |

---

## 11. 자동 추출 규칙

### 11.1 CPU

| 원문 패턴 | 추출 필드 |
|----------|----------|
| `소켓AM4` | `socket = AM4` |
| `소켓AM5` | `socket = AM5` |
| `소켓1151` | `socket = LGA1151` |
| `설계전력 : 65 W` | `tdp_watt = 65` |
| `TDP : 105(W)` | `tdp_watt = 105` |

---

### 11.2 GPU

| 원문 패턴 | 추출 필드 |
|----------|----------|
| `RTX 4060` | `gpu_chipset = RTX 4060` |
| `GTX1060` | `gpu_chipset = GTX 1060` |
| `메모리 용량 : 6GB` | `vram_gb = 6` |
| `길이 : 278mm` | `length_mm = 278` |
| `최대 사용 전력 : 최대 150W` | `tdp_watt = 150` |

---

### 11.3 메인보드

| 원문 패턴 | 추출 필드 |
|----------|----------|
| `CPU 소켓 : AMD(소켓AM4)` | `socket = AM4` |
| `CPU 소켓 : 인텔(소켓1151v2)` | `socket = LGA1151v2` |
| `세부 칩셋 : B650` | `chipset = B650` |
| `메모리 종류 : DDR5` | `mem_type = DDR5` |
| `폼팩터 : M-ATX` | `form_factor = M-ATX` |

---

### 11.4 RAM

| 원문 패턴 | 추출 필드 |
|----------|----------|
| `DDR4` | `mem_type = DDR4` |
| `DDR5` | `mem_type = DDR5` |
| `16GB` | `capacity_gb = 16` |
| `6000(MHz)` | `clock_mhz = 6000` |
| `32GB(16Gx2)` | `capacity_gb = 32`, `module_count = 2` |

---

### 11.5 SSD

| 원문 패턴 | 추출 필드 |
|----------|----------|
| `M.2(NVMe)` | `interface = NVMe` |
| `SATA3` | `interface = SATA` |
| `1TB` | `capacity_gb = 1000` |
| `512GB` | `capacity_gb = 512` |
| `PCIe 4.0` | `pcie_gen = PCIe 4.0` |

---

### 11.6 POWER

| 원문 패턴 | 추출 필드 |
|----------|----------|
| `정격출력 : 750(W)` | `rated_watt = 750` |
| `750W` | `rated_watt = 750` |
| `80PLUS GOLD` | `efficiency = GOLD` |
| `풀모듈러` | `modular = full` |
| `세미 모듈러` | `modular = semi` |

---

### 11.7 CASE

| 원문 패턴 | 추출 필드 |
|----------|----------|
| `VGA장착길이 : 400(mm)` | `gpu_max_mm = 400` |
| `그래픽카드 장착 : 최대 370 mm` | `gpu_max_mm = 370` |
| `CPU쿨러장착높이 : 170(mm)` | `cooler_max_mm = 170` |
| `미들타워` | `case_type = mid_tower` |
| `미니타워` | `case_type = mini_tower` |
| `빅타워` | `case_type = big_tower` |
| `랙마운트` | `case_type = rackmount` |
| `화이트` | `tag_white = true` |
| `RGB` | `tag_rgb = true` |

---

## 12. 관리자 필터 기준

`adm-product-master` 화면의 카테고리 필터는 원본 CSV 카테고리가 아니라 표준 카테고리 기준으로 표시한다.

| UI 표시 | normalized_part_type |
|--------|----------------------|
| 전체 | 전체 |
| CPU | CPU |
| 그래픽카드 | GPU |
| 메인보드 | MB |
| 메모리 | RAM |
| SSD | SSD |
| HDD | HDD |
| 파워 | POWER |
| 케이스 | CASE |
| CPU쿨러 | COOLER_CPU_AIR, COOLER_CPU_AIO |
| 모니터 | MONITOR |
| 키보드 | KEYBOARD |
| 마우스 | MOUSE |
| 스피커/헤드셋 | SPEAKER, HEADSET |
| 네트워크 | NETWORK |
| 케이블/젠더 | CABLE |
| 서비스/조립비 | ASSEMBLY_SERVICE |
| 완제품/프리미엄PC | PREBUILT_PC |
| 내부관리 | INTERNAL |
| 미분류 | UNKNOWN |

---

## 13. 정규화 파이프라인

상품 CSV 정규화는 다음 순서로 처리한다.

```text
1. CSV 원본 적재
2. HTML 태그 및 엔티티 제거
3. 상품명, 모델명, 스펙 문자열 정제
4. 상태값 표준화
5. category_alias_rules 적용
6. normalized_group, normalized_part_type 자동 산출
7. product_specs용 정형 필드 추출
8. confidence 산출
9. confidence 0.8 미만 항목은 관리자 검수 큐로 분리
10. 검수 완료 항목 reviewed_yn = true 처리
11. 추천 후보 쿼리는 판매중 + ai_candidate_yn = true만 사용
12. 품절/단종 변경 시 추천 후보 캐시 즉시 무효화
```

---

## 14. 추천 후보 조회 기준

AI 추천 엔진은 다음 조건으로 상품을 조회한다.

```sql
SELECT p.*, ps.*
FROM products p
JOIN product_category_normalized pc
  ON p.product_code = pc.product_code
LEFT JOIN product_specs ps
  ON p.product_code = ps.product_code
WHERE p.status = '판매중'
  AND pc.ai_candidate_yn = true
  AND pc.normalized_part_type IN (
    'CPU',
    'GPU',
    'MB',
    'RAM',
    'SSD',
    'HDD',
    'POWER',
    'CASE',
    'COOLER_CPU_AIR',
    'COOLER_CPU_AIO'
  );
```

---

## 15. 정규화 우선순위

전체 상품을 한 번에 완벽하게 정리하려고 하지 말고, AI 추천에 직접 필요한 핵심 부품부터 처리한다.

### 15.1 1차 정규화 대상

```text
CPU
GPU
MB
RAM
SSD
HDD
POWER
CASE
COOLER_CPU_AIR
COOLER_CPU_AIO
```

### 15.2 2차 정규화 대상

```text
MONITOR
KEYBOARD
MOUSE
KEYBOARD_MOUSE_SET
HEADSET
SPEAKER
NETWORK
```

### 15.3 3차 정규화 대상

```text
CABLE
ACCESSORY
SERVICE
PREBUILT_PC
INTERNAL
EXCLUDE
UNKNOWN
```

---

## 16. 신뢰도 confidence 기준

자동 분류 결과에는 반드시 신뢰도 값을 부여한다.

| confidence | 의미 | 처리 |
|------------|------|------|
| `0.95 ~ 1.00` | 매우 확실 | 자동 반영 |
| `0.85 ~ 0.94` | 대체로 확실 | 자동 반영, 필요 시 샘플 검수 |
| `0.70 ~ 0.84` | 불확실 | 관리자 검수 권장 |
| `0.00 ~ 0.69` | 위험 | 자동 반영 금지, 관리자 검수 필수 |

---

## 17. 충돌 처리 규칙

### 17.1 상품명과 카테고리가 충돌할 때

상품명과 스펙을 우선한다.

예:

```text
카테고리1 = 삭제대기
상품명 = AMD 라이젠5 5600
상태값 = 판매중
```

정규화:

```text
normalized_part_type = CPU
ai_candidate_yn = true
```

---

### 17.2 카테고리는 GPU인데 상품명이 RAM일 때

상품명과 스펙 기준으로 판단한다.

예:

```text
카테고리2 = 그래픽카드(VGA)
상품명 = ADATA DDR5-6000 CL30
```

정규화:

```text
normalized_part_type = RAM
confidence = 0.90
reviewed_yn = false
```

---

### 17.3 완제품 문자열 안에 CPU/GPU가 포함된 경우

완제품/채굴기/프리미엄 PC가 우선이다.

예:

```text
상품명 = ALEO 채굴기 RTX3060 6WAY
```

정규화:

```text
normalized_group = prebuilt_pc
normalized_part_type = PREBUILT_PC
ai_candidate_yn = false
```

---

## 18. 최종 저장 기준

각 상품은 다음 3개 레이어로 관리한다.

```text
1. 원본 보존
   products.category1~4, spec_raw 그대로 저장

2. 표준 분류
   product_category_normalized에서 CPU/GPU/CASE 등 명확히 분류

3. AI 연산 필드
   product_specs에서 소켓, 전력, 길이, 메모리 타입 등 추출
```

---

## 19. AI에게 작업 지시 시 반드시 지킬 사항

AI는 다음 원칙을 지켜야 한다.

```text
- 원본 CSV의 카테고리1~4는 수정하지 않는다.
- 정규화 결과는 별도 필드 또는 별도 테이블에 저장한다.
- 상품 판매 가능 여부는 반드시 상태값(status)을 기준으로 판단한다.
- AI 추천 후보는 판매중 + ai_candidate_yn=true 상품만 사용한다.
- 카테고리1이 삭제대기여도 상태값이 판매중이면 상품명/스펙 기준으로 재분류한다.
- 내부관리용, 조립관련, 장부관련, 단품비노출은 추천 후보에서 제외한다.
- 완제품 PC, 채굴기, 프리미엄 PC는 부품으로 분해하지 말고 PREBUILT_PC로 분류한다.
- 쿨러는 CPU 공랭, CPU 수랭, 시스템팬, 써멀류로 세분화한다.
- confidence가 낮은 항목은 자동 반영하지 말고 관리자 검수 대상으로 분리한다.
- HTML 태그와 엔티티는 정규화 전 반드시 제거한다.
```

---

## 20. 최종 목표

이 정규화 작업의 목표는 다음이다.

```text
원본 상품 CSV를 보존하면서,
AI 추천에 필요한 핵심 부품만 정확히 분리하고,
상품명/스펙 기반으로 소켓·전력·치수·메모리 규격을 추출하여,
조립 불가능한 견적과 품절 상품 추천을 방지하는 것.
```

최종적으로 AI 추천 엔진은 아래 조건만 신뢰한다.

```text
products.status = '판매중'
AND product_category_normalized.ai_candidate_yn = true
AND product_category_normalized.normalized_part_type IN 핵심 부품 목록
```
```

```md
---

# 21. 정규화 결과 예시 데이터

아래는 실제 CSV 일부 상품을 기준으로 한 정규화 예시다.

---

## 21.1 CPU 예시

### 원본

```text
자체상품코드: 101268
상품명: (AMD) 라이젠RYZEN R5 1400 /CPU
제조사: AMD
카테고리1: 삭제대기
카테고리2: 8세대 커피레이크
카테고리3: 인텔 i3
카테고리4: AMD라이젠
상태값: 판매중
스펙: CPU / 제조회사 : AMD / 소켓 구분 : AMD(소켓AM4) / 설계전력 : 65 W
```

### 정규화 결과

```text
normalized_group = core_part
normalized_part_type = CPU
normalized_category_name = 프로세서
ai_candidate_yn = true
source_rule = product_name + spec_raw
confidence = 0.98
reviewed_yn = false
```

### product_specs 추출

```text
part_type = CPU
socket = AM4
tdp_watt = 65
```

---

## 21.2 GPU 예시

### 원본

```text
상품명: AFOX 지포스 RTX 3060 D6 12GB 대원씨티에스
제조사: AFOX
카테고리2: 그래픽카드(VGA)
상태값: 품절
스펙: AFOX / nVIDIA / Geforce RTX 30 / RTX 3060 / 메모리용량 : 12(GB)
```

### 정규화 결과

```text
normalized_group = core_part
normalized_part_type = GPU
normalized_category_name = 그래픽카드
ai_candidate_yn = true
source_rule = product_name + category2 + spec_raw
confidence = 0.98
```

### 추천 후보 여부

```text
status = 품절
최종 추천 후보 = false
```

주의:

```text
ai_candidate_yn = true 이더라도 products.status != 판매중 이면 추천 후보에서 제외한다.
```

---

## 21.3 CASE 예시

### 원본

```text
상품명: 3RSYS L700 Quiet 블랙 (미들타워)
카테고리2: 케이스(CASE)
상태값: 판매중
스펙: VGA장착길이 : 375(mm) / CPU쿨러장착높이 : 170(mm)
```

### 정규화 결과

```text
normalized_group = core_part
normalized_part_type = CASE
normalized_category_name = 본체 케이스
ai_candidate_yn = true
source_rule = product_name + category2 + spec_raw
confidence = 0.96
```

### product_specs 추출

```text
part_type = CASE
gpu_max_mm = 375
cooler_max_mm = 170
tag_white = false
tag_rgb = false
```

---

## 21.4 POWER 예시

### 원본

```text
상품명: 3RSYS AK 850W 80PLUS브론즈 모듈러 ATX3.1
카테고리2: 파워(POWER)
상태값: 판매중
스펙: ATX / 850(W) / 80PLUS : BRONZE / 세미 모듈러
```

### 정규화 결과

```text
normalized_group = core_part
normalized_part_type = POWER
normalized_category_name = 파워서플라이
ai_candidate_yn = true
source_rule = product_name + category2 + spec_raw
confidence = 0.97
```

### product_specs 추출

```text
part_type = POWER
rated_watt = 850
efficiency = BRONZE
```

---

## 21.5 COOLER 예시

### 원본

```text
상품명: 3RSYS Socoool RC1800 Quiet ARGB
카테고리2: CPU쿨러
카테고리3: 공랭쿨러
상태값: 판매중
스펙: CPU쿨러 / 공랭 / TDP : 270(W) / 높이 : 156(mm)
```

### 정규화 결과

```text
normalized_group = core_part
normalized_part_type = COOLER_CPU_AIR
normalized_category_name = CPU 공랭쿨러
ai_candidate_yn = true
confidence = 0.96
```

### product_specs 추출

```text
part_type = COOLER_CPU_AIR
cooler_tdp = 270
height_mm = 156
```

---

## 21.6 수랭쿨러 예시

### 원본

```text
상품명: 3RSYS 라니 SF 360 ARGB
카테고리2: CPU쿨러
카테고리3: 수냉쿨러
상태값: 판매중
스펙: CPU쿨러 / 수랭 / 수랭팬개수 : 3(EA) / 팬 크기 : 120(mm)
```

### 정규화 결과

```text
normalized_group = core_part
normalized_part_type = COOLER_CPU_AIO
normalized_category_name = CPU 수랭쿨러
ai_candidate_yn = true
confidence = 0.97
```

---

## 21.7 시스템 팬 예시

### 원본

```text
상품명: 3RSYS Silence GI 120 ARGB
카테고리2: 시스템 쿨러
상태값: 판매중
```

### 정규화 결과

```text
normalized_group = peripheral
normalized_part_type = COOLER_SYSTEM
normalized_category_name = 시스템 쿨러
ai_candidate_yn = false
confidence = 0.95
```

주의:

```text
시스템 팬은 조립PC 기본 추천 후보에는 포함하지 않는다.
단, 추가 옵션 또는 감성 옵션 추천에서는 별도 사용 가능하다.
```

---

## 21.8 써멀구리스 예시

### 원본

```text
상품명: Thermal Grizzly Kryonaut 11.1g
카테고리2: 튜닝 용품
스펙: 써멀컴파운드
```

### 정규화 결과

```text
normalized_group = cable_accessory
normalized_part_type = COOLER_THERMAL
normalized_category_name = 써멀컴파운드
ai_candidate_yn = false
confidence = 0.96
```

---

## 21.9 조립비 예시

### 원본

```text
상품명: 컴퓨터 조립비+1년 전국 방문 출장 AS 1대분
카테고리1: 내부관리용
카테고리2: 조립관련
상태값: 판매중
```

### 정규화 결과

```text
normalized_group = service
normalized_part_type = ASSEMBLY_SERVICE
normalized_category_name = 조립/AS 서비스
ai_candidate_yn = false
confidence = 1.00
```

---

## 21.10 완제품/채굴기 예시

### 원본

```text
상품명: ALEO 채굴기 알레오코인 RTX3060 6WAY
카테고리1: 프리미엄 피씨
상태값: 품절
```

### 정규화 결과

```text
normalized_group = prebuilt_pc
normalized_part_type = PREBUILT_PC
normalized_category_name = 완제품/채굴기
ai_candidate_yn = false
confidence = 1.00
```

주의:

```text
상품명에 RTX3060, CPU, RAM이 포함되어 있어도 부품으로 분해하지 않는다.
완제품/채굴기 상품은 PREBUILT_PC로 분류한다.
```

---

# 22. 권장 정규화 SQL DDL

아래 DDL은 PostgreSQL 기준 예시다.

---

## 22.1 product_category_normalized

```sql
CREATE TABLE product_category_normalized (
  product_code BIGINT PRIMARY KEY REFERENCES products(product_code) ON DELETE CASCADE,

  normalized_group VARCHAR(50) NOT NULL,
  normalized_part_type VARCHAR(50) NOT NULL,
  normalized_category_name VARCHAR(100),

  ai_candidate_yn BOOLEAN NOT NULL DEFAULT false,

  source_rule VARCHAR(200),
  confidence NUMERIC(4,2) NOT NULL DEFAULT 0.00,

  reviewed_yn BOOLEAN NOT NULL DEFAULT false,
  reviewed_by VARCHAR(100),
  reviewed_at TIMESTAMP,

  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
```

---

## 22.2 category_alias_rules

```sql
CREATE TABLE category_alias_rules (
  rule_id BIGSERIAL PRIMARY KEY,

  priority INTEGER NOT NULL DEFAULT 100,
  match_field VARCHAR(50) NOT NULL,
  match_type VARCHAR(30) NOT NULL DEFAULT 'regex',
  pattern TEXT NOT NULL,

  normalized_group VARCHAR(50) NOT NULL,
  normalized_part_type VARCHAR(50) NOT NULL,
  normalized_category_name VARCHAR(100),

  ai_candidate_yn BOOLEAN NOT NULL DEFAULT false,
  confidence NUMERIC(4,2) NOT NULL DEFAULT 0.90,

  active BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
```

---

## 22.3 product_normalization_review_queue

자동 분류 신뢰도가 낮거나 충돌이 있는 상품을 관리자 검수 대상으로 분리한다.

```sql
CREATE TABLE product_normalization_review_queue (
  review_id BIGSERIAL PRIMARY KEY,

  product_code BIGINT NOT NULL REFERENCES products(product_code) ON DELETE CASCADE,

  detected_group VARCHAR(50),
  detected_part_type VARCHAR(50),
  detected_confidence NUMERIC(4,2),

  conflict_reason TEXT,
  review_status VARCHAR(30) NOT NULL DEFAULT '대기',

  assigned_to VARCHAR(100),
  reviewed_by VARCHAR(100),
  reviewed_at TIMESTAMP,

  created_at TIMESTAMP NOT NULL DEFAULT now()
);
```

`review_status` 표준값:

```text
대기
검수중
승인
수정
보류
제외
```

---

# 23. 권장 인덱스

```sql
CREATE INDEX idx_product_category_part_type
ON product_category_normalized (normalized_part_type);

CREATE INDEX idx_product_category_group
ON product_category_normalized (normalized_group);

CREATE INDEX idx_product_category_ai_candidate
ON product_category_normalized (ai_candidate_yn, normalized_part_type);

CREATE INDEX idx_product_category_confidence
ON product_category_normalized (confidence);

CREATE INDEX idx_product_review_status
ON product_normalization_review_queue (review_status, created_at DESC);

CREATE INDEX idx_category_alias_rules_active_priority
ON category_alias_rules (active, priority DESC);
```

추천 후보 조회 최적화용:

```sql
CREATE INDEX idx_product_recommend_candidate
ON product_category_normalized (normalized_part_type, ai_candidate_yn)
WHERE ai_candidate_yn = true;
```

---

# 24. category_alias_rules 초기 시드 예시

아래 룰은 초기 자동 분류용 최소 시드다.

```sql
INSERT INTO category_alias_rules
(priority, match_field, match_type, pattern, normalized_group, normalized_part_type, normalized_category_name, ai_candidate_yn, confidence)
VALUES
(100, 'product_name', 'regex', '라이젠|Ryzen|코어i|코어 i|셀러론|펜티엄|애슬론|스레드리퍼|Threadripper|EPYC', 'core_part', 'CPU', '프로세서', true, 0.98),

(100, 'product_name', 'regex', 'RTX|GTX|GT\s?[0-9]|지포스|GeForce|라데온|Radeon|RX\s?[0-9]|Quadro|쿼드로|VGA', 'core_part', 'GPU', '그래픽카드', true, 0.98),

(100, 'product_name', 'regex', '메인보드|M/B|B650|B550|A620|X670|X870|Z790|B760|H610|H310|H370|B360|Z490', 'core_part', 'MB', '메인보드', true, 0.95),

(100, 'product_name', 'regex', 'DDR3|DDR4|DDR5|PC3|PC4|PC5|메모리|RAM', 'core_part', 'RAM', '메모리', true, 0.96),

(100, 'product_name', 'regex', 'SSD|NVMe|M\\.2|M2|SATA SSD|고속저장', 'core_part', 'SSD', 'SSD', true, 0.96),

(100, 'product_name', 'regex', 'HDD|하드디스크|Barracuda|IronWolf|WD BLUE|WD BLACK', 'core_part', 'HDD', '하드디스크', true, 0.95),

(100, 'product_name', 'regex', '파워|POWER|파워서플라이|[0-9]{3,4}W|80PLUS|BRONZE|GOLD|PLATINUM|TITANIUM', 'core_part', 'POWER', '파워서플라이', true, 0.95),

(100, 'product_name', 'regex', '케이스|CASE|미들타워|미니타워|빅타워|랙마운트|슬림|강화유리', 'core_part', 'CASE', '본체 케이스', true, 0.94),

(100, 'product_name', 'regex', 'CPU쿨러|공랭쿨러|공랭', 'core_part', 'COOLER_CPU_AIR', 'CPU 공랭쿨러', true, 0.93),

(100, 'product_name', 'regex', '수랭|수냉|수냉쿨러|240|280|360|480', 'core_part', 'COOLER_CPU_AIO', 'CPU 수랭쿨러', true, 0.93),

(100, 'product_name', 'regex', '시스템 쿨러|시스템쿨러|120mm|140mm|팬|ARGB 팬', 'peripheral', 'COOLER_SYSTEM', '시스템 쿨러', false, 0.90),

(100, 'product_name', 'regex', '써멀|써멀구리스|컴파운드|Kryonaut|Hydronaut', 'cable_accessory', 'COOLER_THERMAL', '써멀컴파운드', false, 0.95),

(100, 'product_name', 'regex', '모니터|무결점|FHD|QHD|UHD|인치', 'peripheral', 'MONITOR', '모니터', false, 0.93),

(100, 'product_name', 'regex', '키보드', 'peripheral', 'KEYBOARD', '키보드', false, 0.93),

(100, 'product_name', 'regex', '마우스', 'peripheral', 'MOUSE', '마우스', false, 0.93),

(100, 'product_name', 'regex', '키보드\\+마우스|키보드마우스|유선세트|무선세트', 'peripheral', 'KEYBOARD_MOUSE_SET', '키보드+마우스 세트', false, 0.95),

(100, 'product_name', 'regex', '헤드셋|이어폰|헤드폰', 'peripheral', 'HEADSET', '헤드셋/이어폰', false, 0.93),

(100, 'product_name', 'regex', '스피커|사운드바', 'peripheral', 'SPEAKER', '스피커', false, 0.93),

(100, 'product_name', 'regex', '공유기|랜카드|스위칭허브|네트워크|무선랜', 'peripheral', 'NETWORK', '네트워크 장비', false, 0.93),

(100, 'product_name', 'regex', '케이블|젠더|HDMI|DP|DisplayPort|USB|Type-C|랜케이블', 'cable_accessory', 'CABLE', '케이블/젠더', false, 0.92),

(100, 'product_name', 'regex', '마우스패드|받침대|거치대|파우치|가방|브라켓|가이드', 'cable_accessory', 'ACCESSORY', '액세서리', false, 0.90),

(100, 'product_name', 'regex', '조립비|출장|A/S|AS|무상출장|택배서비스|제작 및 테스트|발포제', 'service', 'ASSEMBLY_SERVICE', '조립/AS 서비스', false, 1.00),

(100, 'product_name', 'regex', '채굴기|ALEO|알레오코인|프리미엄 피씨|완제PC|일체형', 'prebuilt_pc', 'PREBUILT_PC', '완제품/채굴기', false, 1.00),

(100, 'category1', 'regex', '내부관리용|장부관련|만상장부용|단품비노출', 'internal', 'INTERNAL', '내부관리', false, 1.00);
```

---

# 25. 자동 분류 의사코드

AI 또는 개발자는 아래 로직을 기준으로 구현한다.

```text
for each product in products:

  clean_text = clean(product_name + model_name + category1~4 + spec_raw)

  if status != '판매중':
      product can be normalized
      but recommendation query must exclude it

  matched_rules = []

  for each active rule ordered by priority desc:
      target_value = product[rule.match_field]
      if pattern matches target_value:
          matched_rules.append(rule)

  if no matched_rules:
      normalized_group = 'unknown'
      normalized_part_type = 'UNKNOWN'
      ai_candidate_yn = false
      confidence = 0.00
      add to review queue
      continue

  best_rule = highest priority + highest confidence

  apply best_rule result

  if conflict exists:
      reduce confidence
      add to review queue if confidence < 0.85

  extract product_specs fields by normalized_part_type

  save product_category_normalized
  save product_specs
```

---

# 26. 충돌 탐지 규칙

다음 상황은 충돌로 간주한다.

---

## 26.1 원본 카테고리와 상품명 충돌

예:

```text
category2 = 그래픽카드(VGA)
product_name = ADATA DDR5-6000 CL30
```

처리:

```text
normalized_part_type = RAM
confidence = 0.85 ~ 0.90
reviewed_yn = false
review_queue 등록
```

---

## 26.2 완제품 키워드와 부품 키워드 동시 존재

예:

```text
product_name = ALEO 채굴기 RTX3060 6WAY
```

처리:

```text
PREBUILT_PC 우선
부품으로 분해하지 않음
ai_candidate_yn = false
confidence = 1.00
```

---

## 26.3 내부관리용 + 판매중

예:

```text
category1 = 내부관리용
status = 판매중
product_name = 컴퓨터 조립비
```

처리:

```text
service 또는 internal로 분류
ai_candidate_yn = false
```

단, 다음과 같이 실제 부품이면 상품명/스펙 기준 재분류 가능:

```text
category1 = 삭제대기
status = 판매중
product_name = AMD 라이젠5 5600
```

처리:

```text
CPU로 분류
ai_candidate_yn = true
```

---

# 27. 정규화 후 관리자 검수 기준

관리자 화면 `adm-product-master`에서는 아래 필드를 노출한다.

```text
상품코드
상품명
원본 카테고리1~4
상태값
표준 그룹
표준 부품 타입
AI 추천 후보 여부
신뢰도
검수 여부
AI 연산 필드 상태
```

---

## 27.1 검수 필요 조건

아래 조건 중 하나라도 해당하면 검수 큐에 등록한다.

```text
confidence < 0.85
normalized_part_type = UNKNOWN
원본 카테고리와 자동 분류 결과가 충돌
AI 추천 후보인데 필수 product_specs 필드가 누락
상품명에 완제품/채굴기 키워드와 부품 키워드가 동시에 존재
동일 product_code 중복 입력 발생
```

---

## 27.2 관리자 검수 액션

관리자는 다음 작업을 수행할 수 있어야 한다.

```text
표준 그룹 수정
표준 부품 타입 수정
AI 추천 후보 여부 수정
AI 연산 필드 직접 입력
검수 완료 처리
추천 제외 처리
```

---

# 28. 부품별 필수 product_specs 필드

AI 추천 후보로 사용하려면 부품 타입별 필수 필드가 있어야 한다.

---

## 28.1 CPU 필수 필드

```text
part_type = CPU
socket
tdp_watt
```

권장 필드:

```text
core_count
thread_count
base_clock
boost_clock
```

---

## 28.2 GPU 필수 필드

```text
part_type = GPU
length_mm
tdp_watt 또는 required_power_watt
```

권장 필드:

```text
gpu_chipset
vram_gb
pcie_gen
```

---

## 28.3 MB 필수 필드

```text
part_type = MB
socket
chipset
mem_type
form_factor
```

---

## 28.4 RAM 필수 필드

```text
part_type = RAM
mem_type
capacity_gb
```

권장 필드:

```text
clock_mhz
module_count
```

---

## 28.5 SSD 필수 필드

```text
part_type = SSD
capacity_gb
interface
```

권장 필드:

```text
pcie_gen
form_factor
```

---

## 28.6 POWER 필수 필드

```text
part_type = POWER
rated_watt
```

권장 필드:

```text
efficiency
form_factor
modular
```

---

## 28.7 CASE 필수 필드

```text
part_type = CASE
gpu_max_mm
cooler_max_mm
```

권장 필드:

```text
case_type
form_factor_support
tag_white
tag_rgb
```

---

## 28.8 COOLER_CPU_AIR 필수 필드

```text
part_type = COOLER_CPU_AIR
cooler_tdp
height_mm
```

권장 필드:

```text
socket_support
fan_size_mm
```

---

## 28.9 COOLER_CPU_AIO 필수 필드

```text
part_type = COOLER_CPU_AIO
cooler_tdp 또는 radiator_size_mm
```

권장 필드:

```text
radiator_size_mm
fan_count
socket_support
```

---

# 29. 추천 후보 필수 필드 검증 규칙

AI 추천 후보(`ai_candidate_yn = true`)인데 필수 필드가 누락된 경우 다음처럼 처리한다.

```text
1. 상품은 정규화하되 추천 후보에서는 임시 제외
2. spec_validation_status = incomplete
3. 관리자 검수 큐에 등록
4. 관리자 보강 후 추천 후보로 복귀 가능
```

예:

```text
normalized_part_type = GPU
ai_candidate_yn = true
length_mm = null

처리:
ai_candidate_yn = false 또는 candidate_block_reason = 'GPU 길이 누락'
review_queue 등록
```

---

# 30. 추천 엔진 필터링 최종 규칙

추천 엔진은 아래 조건을 모두 만족하는 상품만 후보로 사용한다.

```text
products.status = '판매중'
product_category_normalized.ai_candidate_yn = true
product_category_normalized.normalized_group = 'core_part'
product_category_normalized.normalized_part_type IN 핵심 부품 목록
필수 product_specs 필드가 존재
```

핵심 부품 목록:

```text
CPU
GPU
MB
RAM
SSD
HDD
POWER
CASE
COOLER_CPU_AIR
COOLER_CPU_AIO
```

---

# 31. 부품 타입별 추천 사용처

| normalized_part_type | 초급자 추천 | 고급자 추천 | 부품 스왑 | 업셀링 | 비고 |
|----------------------|------------|------------|----------|--------|------|
| CPU | 사용 | 사용 | 사용 | 사용 | 소켓 필수 |
| GPU | 사용 | 사용 | 사용 | 사용 | 길이/전력 필수 |
| MB | 사용 | 사용 | 사용 | 사용 | 소켓/메모리 필수 |
| RAM | 사용 | 사용 | 사용 | 사용 | DDR 타입 필수 |
| SSD | 사용 | 사용 | 사용 | 사용 | 용량/인터페이스 필수 |
| HDD | 선택 | 선택 | 사용 | 사용 | 대용량 옵션 |
| POWER | 사용 | 사용 | 연쇄스왑 | 사용 | 정격 W 필수 |
| CASE | 사용 | 사용 | 사용 | 사용 | GPU/쿨러 한계 필수 |
| COOLER_CPU_AIR | 사용 | 사용 | 사용 | 사용 | TDP/높이 필수 |
| COOLER_CPU_AIO | 선택 | 사용 | 사용 | 사용 | 고급자 추천 우선 |
| MONITOR | 제외 | 제외 | 제외 | 주변기기 | 별도 추천 |
| KEYBOARD | 제외 | 제외 | 제외 | 주변기기 | 별도 추천 |
| MOUSE | 제외 | 제외 | 제외 | 주변기기 | 별도 추천 |
| ASSEMBLY_SERVICE | 제외 | 제외 | 장바구니 포함 | 제외 | 최종 페이로드용 |
| PREBUILT_PC | 제외 | 제외 | 제외 | 제외 | 완제품 전용 |

---

# 32. 카테고리 정규화 결과 저장 예시

## 32.1 CPU

```json
{
  "product_code": 101268,
  "normalized_group": "core_part",
  "normalized_part_type": "CPU",
  "normalized_category_name": "프로세서",
  "ai_candidate_yn": true,
  "source_rule": "product_name:라이젠 + spec_raw:소켓AM4",
  "confidence": 0.98,
  "reviewed_yn": false
}
```

---

## 32.2 GPU

```json
{
  "product_code": 99632,
  "normalized_group": "core_part",
  "normalized_part_type": "GPU",
  "normalized_category_name": "그래픽카드",
  "ai_candidate_yn": true,
  "source_rule": "product_name:GTX1060 + category2:그래픽카드(VGA)",
  "confidence": 0.98,
  "reviewed_yn": false
}
```

---

## 32.3 조립 서비스

```json
{
  "product_code": 68022,
  "normalized_group": "service",
  "normalized_part_type": "ASSEMBLY_SERVICE",
  "normalized_category_name": "조립/AS 서비스",
  "ai_candidate_yn": false,
  "source_rule": "product_name:조립비",
  "confidence": 1.00,
  "reviewed_yn": true
}
```

---

# 33. AI 작업 프롬프트 템플릿

아래 프롬프트는 AI에게 CSV 정규화 작업을 지시할 때 사용할 수 있다.

```text
너는 팝콘PC AI 조립PC 추천 시스템의 상품 카테고리 정규화 엔진이다.

입력으로 쇼핑몰 상품 CSV 행을 받는다.
원본 카테고리1~4는 절대 수정하지 말고, 별도의 정규화 결과를 생성해야 한다.

각 상품에 대해 다음 값을 산출하라.

1. normalized_group
2. normalized_part_type
3. normalized_category_name
4. ai_candidate_yn
5. source_rule
6. confidence
7. product_specs 추출값
8. review_required 여부
9. review_reason

분류 기준은 다음을 따른다.

- CPU, GPU, MB, RAM, SSD, HDD, POWER, CASE, COOLER_CPU_AIR, COOLER_CPU_AIO만 AI 조립PC 추천 후보가 될 수 있다.
- 상태값이 판매중이 아니면 최종 추천 후보에서는 제외한다.
- 내부관리용, 조립관련, 장부관련, 단품비노출은 추천 후보에서 제외한다.
- 채굴기, 완제품, 프리미엄 PC는 PREBUILT_PC로 분류하고 부품으로 분해하지 않는다.
- 상품명과 스펙이 원본 카테고리보다 우선한다.
- confidence가 0.85 미만이면 review_required = true로 설정한다.
- HTML 태그와 엔티티는 먼저 제거한다.

출력은 JSON으로만 한다.
```

---

# 34. AI 출력 JSON 스키마

```json
{
  "product_code": 0,
  "normalized_group": "core_part",
  "normalized_part_type": "CPU",
  "normalized_category_name": "프로세서",
  "ai_candidate_yn": true,
  "source_rule": "string",
  "confidence": 0.95,
  "review_required": false,
  "review_reason": null,
  "specs": {
    "part_type": "CPU",
    "socket": null,
    "chipset": null,
    "mem_type": null,
    "tdp_watt": null,
    "rated_watt": null,
    "length_mm": null,
    "gpu_max_mm": null,
    "cooler_tdp": null,
    "pcie_gen": null,
    "capacity_gb": null,
    "clock_mhz": null,
    "tag_white": false,
    "tag_rgb": false,
    "tag_silent": false
  }
}
```

---

# 35. 검수용 출력 예시

## 입력

```json
{
  "product_code": 101268,
  "product_name": "(AMD) 라이젠RYZEN R5 1400 /CPU",
  "maker": "AMD",
  "category1": "삭제대기",
  "category2": "8세대 커피레이크",
  "category3": "인텔 i3",
  "category4": "AMD라이젠",
  "status": "판매중",
  "spec_raw": "CPU / 제조회사 : AMD / 소켓 구분 : AMD(소켓AM4) / 설계전력 : 65 W"
}
```

## 출력

```json
{
  "product_code": 101268,
  "normalized_group": "core_part",
  "normalized_part_type": "CPU",
  "normalized_category_name": "프로세서",
  "ai_candidate_yn": true,
  "source_rule": "product_name contains 라이젠 and /CPU, spec_raw contains 소켓AM4 and 설계전력",
  "confidence": 0.98,
  "review_required": false,
  "review_reason": null,
  "specs": {
    "part_type": "CPU",
    "socket": "AM4",
    "tdp_watt": 65,
    "tag_white": false,
    "tag_rgb": false,
    "tag_silent": false
  }
}
```

---

# 36. 관리자 검수 큐 출력 예시

## 입력

```json
{
  "product_code": 105573,
  "product_name": "G.SKILL DDR4 16G PC4-30900 CL18 TRIDENT Z RGB 8Gx2",
  "category2": "그래픽카드(VGA)",
  "status": "품절",
  "spec_raw": "G.SKILL / 데스크탑 / DDR4 / DIMM / 용량 : 16(GB)"
}
```

## 출력

```json
{
  "product_code": 105573,
  "normalized_group": "core_part",
  "normalized_part_type": "RAM",
  "normalized_category_name": "메모리",
  "ai_candidate_yn": true,
  "source_rule": "product_name contains DDR4 and RAM capacity, but category2 says 그래픽카드(VGA)",
  "confidence": 0.86,
  "review_required": true,
  "review_reason": "원본 카테고리와 자동 분류 결과 충돌",
  "specs": {
    "part_type": "RAM",
    "mem_type": "DDR4",
    "capacity_gb": 16,
    "clock_mhz": 3866,
    "tag_rgb": true
  }
}
```

주의:

```text
status = 품절이므로 추천 쿼리에서는 제외된다.
하지만 정규화 결과는 RAM으로 저장한다.
```

---

# 37. 품절/단종 반영 규칙

상품 상태가 변경되면 정규화 결과와 관계없이 추천 후보군에서 즉시 제외한다.

```text
판매중 → 품절
판매중 → 단종
판매중 → 삭제대기
```

처리:

```text
1. products.status 업데이트
2. 추천 후보 캐시 무효화
3. 스왑 대안 캐시 무효화
4. 관리자 화면에 토스트 표시
5. 이후 추천 요청부터 제외
```

관리자 토스트 문구:

```text
추천 후보군에서 제외 완료
```

---

# 38. 정규화 완료 후 기대 효과

정규화가 완료되면 다음 기능이 안정적으로 동작한다.

```text
- AI 추천 후보군에서 품절/단종 상품 자동 제외
- CPU와 메인보드 소켓 호환성 검증
- 메인보드와 RAM DDR 규격 검증
- GPU 길이와 케이스 장착 한계 검증
- CPU 쿨러 높이와 케이스 장착 한계 검증
- 파워 정격 W와 전체 TDP 마진 검증
- 화이트/RGB/저소음 감성 옵션 매칭
- 부품 스왑 시 안전 대안 목록만 노출
- 연쇄 스왑 추천
```

---

# 39. 최종 체크리스트

정규화 작업 완료 전 아래 항목을 확인한다.

```text
- [ ] 원본 CSV 카테고리1~4를 수정하지 않았다.
- [ ] product_category_normalized가 생성되었다.
- [ ] normalized_group이 모든 상품에 부여되었다.
- [ ] normalized_part_type이 모든 상품에 부여되었다.
- [ ] ai_candidate_yn이 정확히 설정되었다.
- [ ] CPU/GPU/MB/RAM/SSD/HDD/POWER/CASE/COOLER 필수 필드를 추출했다.
- [ ] confidence가 0.85 미만인 상품은 검수 큐에 들어갔다.
- [ ] 내부관리용/조립비/장부관련은 추천 후보에서 제외했다.
- [ ] 완제품/채굴기는 PREBUILT_PC로 분류했다.
- [ ] 판매중 상품만 추천 후보 쿼리에 포함된다.
- [ ] 품절/단종 변경 시 추천 후보 캐시가 무효화된다.
```

---

# 40. 최종 요약

팝콘PC 상품 CSV 정규화의 최종 목표는 다음이다.

```text
쇼핑몰 운영용 원본 데이터는 보존하고,
AI 추천 시스템이 신뢰할 수 있는 표준 부품 카테고리와 호환성 필드를 별도로 구축한다.
```

최종 추천 후보는 반드시 아래 조건을 만족해야 한다.

```text
products.status = '판매중'
AND product_category_normalized.normalized_group = 'core_part'
AND product_category_normalized.ai_candidate_yn = true
AND product_category_normalized.normalized_part_type IN (
  CPU,
  GPU,
  MB,
  RAM,
  SSD,
  HDD,
  POWER,
  CASE,
  COOLER_CPU_AIR,
  COOLER_CPU_AIO
)
AND 필수 product_specs 필드가 존재
```

이 원칙을 따르면 기존 CSV의 오염된 카테고리 구조를 유지하면서도,  
AI 추천 엔진은 안정적이고 검증 가능한 상품 후보군만 사용할 수 있다.
```