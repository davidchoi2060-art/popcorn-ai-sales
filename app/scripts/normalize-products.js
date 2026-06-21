import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appRoot = path.resolve(__dirname, "..");

const INPUT_CSV = path.join(appRoot, "db", "팝콘PC_상품_2026-06-10기준(통합).csv");
const OUTPUT_DIR = path.join(appRoot, "db", "normalized");

const AI_PART_TYPES = new Set([
  "CPU",
  "GPU",
  "MB",
  "RAM",
  "SSD",
  "HDD",
  "POWER",
  "CASE",
  "COOLER_CPU_AIR",
  "COOLER_CPU_AIO",
]);

const CATEGORY_NAMES = {
  CPU: "프로세서",
  GPU: "그래픽카드",
  MB: "메인보드",
  RAM: "메모리",
  SSD: "SSD",
  HDD: "하드디스크",
  POWER: "파워서플라이",
  CASE: "본체 케이스",
  COOLER_CPU_AIR: "CPU 공랭쿨러",
  COOLER_CPU_AIO: "CPU 수랭쿨러",
  COOLER_SYSTEM: "시스템 쿨러",
  COOLER_THERMAL: "써멀컴파운드",
  MONITOR: "모니터",
  KEYBOARD: "키보드",
  MOUSE: "마우스",
  KEYBOARD_MOUSE_SET: "키보드+마우스 세트",
  HEADSET: "헤드셋/이어폰",
  SPEAKER: "스피커",
  NETWORK: "네트워크 장비",
  CABLE: "케이블/젠더",
  ACCESSORY: "액세서리",
  ASSEMBLY_SERVICE: "조립/AS 서비스",
  PREBUILT_PC: "완제품/채굴기",
  SOFTWARE: "소프트웨어",
  INTERNAL: "내부관리",
  UNKNOWN: "미분류",
};

const RULES = [
  rule(120, "product_name", "채굴기|ALEO|알레오코인|프리미엄 피씨|완제PC|일체형", "prebuilt_pc", "PREBUILT_PC", false, 1.0),
  rule(120, "category1", "내부관리용|장부관련|만상장부용|단품비노출", "internal", "INTERNAL", false, 1.0),
  rule(115, "product_name", "조립비|출장|A/S|AS|무상출장|택배서비스|제작 및 테스트|발포제", "service", "ASSEMBLY_SERVICE", false, 1.0),
  rule(110, "product_name", "Windows|Office|오피스|한글과컴퓨터|한컴", "software", "SOFTWARE", false, 0.95),
  rule(108, "product_name", "브라켓|가이드|거치대|받침대|마운트|파우치|가방", "cable_accessory", "ACCESSORY", false, 0.92),
  rule(106, "product_name", "수랭|수냉|수냉쿨러|240|280|360|480", "core_part", "COOLER_CPU_AIO", true, 0.93),
  rule(105, "product_name", "CPU쿨러|공랭쿨러|공랭", "core_part", "COOLER_CPU_AIR", true, 0.93),
  rule(100, "product_name", "라이젠|Ryzen|코어\\s?i|Core\\s?i|셀러론|펜티엄|애슬론|스레드리퍼|Threadripper|EPYC", "core_part", "CPU", true, 0.98),
  rule(100, "product_name", "RTX|GTX|GT\\s?[0-9]|지포스|GeForce|라데온|Radeon|RX\\s?[0-9]|Quadro|쿼드로|VGA", "core_part", "GPU", true, 0.98),
  rule(100, "product_name", "메인보드|M/B|B650|B550|A620|X670|X870|Z790|B760|H610|H310|H370|B360|Z490", "core_part", "MB", true, 0.95),
  rule(100, "product_name", "DDR3|DDR4|DDR5|PC3|PC4|PC5|메모리|RAM", "core_part", "RAM", true, 0.96),
  rule(100, "product_name", "SSD|NVMe|M\\.2|M2|SATA SSD|고속저장", "core_part", "SSD", true, 0.96),
  rule(100, "product_name", "HDD|하드디스크|Barracuda|IronWolf|WD BLUE|WD BLACK|WD Red|씨게이트|Seagate", "core_part", "HDD", true, 0.95),
  rule(100, "product_name", "파워|POWER|파워서플라이|[0-9]{3,4}W|80PLUS|BRONZE|GOLD|PLATINUM|TITANIUM", "core_part", "POWER", true, 0.95),
  rule(100, "product_name", "케이스|CASE|미들타워|미니타워|빅타워|랙마운트|슬림|강화유리", "core_part", "CASE", true, 0.94),
  rule(98, "category2", "CPU쿨러|수냉쿨러|수랭쿨러", "core_part", "COOLER_CPU_AIO", true, 0.94),
  rule(95, "category2", "프로세서\\(CPU\\)", "core_part", "CPU", true, 0.95),
  rule(95, "category2", "그래픽카드\\(VGA\\)|그래픽카드|VGA", "core_part", "GPU", true, 0.95),
  rule(95, "category2", "메인보드\\(M/B\\)|메인보드", "core_part", "MB", true, 0.95),
  rule(95, "category2", "메모리\\(RAM\\)|메모리", "core_part", "RAM", true, 0.94),
  rule(95, "category2", "SSD", "core_part", "SSD", true, 0.94),
  rule(95, "category2", "하드디스크|HDD", "core_part", "HDD", true, 0.94),
  rule(95, "category2", "파워|파워서플라이", "core_part", "POWER", true, 0.94),
  rule(95, "category2", "케이스\\(CASE\\)|케이스", "core_part", "CASE", true, 0.94),
  rule(90, "spec_raw", "CPU 소켓|세부 칩셋|폼팩터", "core_part", "MB", true, 0.9),
  rule(90, "spec_raw", "정격\\s?출력|정격\\s?[0-9]{3,4}\\s?W|80PLUS|ATX 파워", "core_part", "POWER", true, 0.9),
  rule(90, "spec_raw", "VGA장착길이|그래픽카드 장착|CPU쿨러 장착|PC용 케이스", "core_part", "CASE", true, 0.9),
  rule(100, "product_name", "시스템 쿨러|시스템쿨러|120mm|140mm|팬|ARGB 팬", "peripheral", "COOLER_SYSTEM", false, 0.9),
  rule(100, "product_name", "써멀|써멀구리스|컴파운드|Kryonaut|Hydronaut", "cable_accessory", "COOLER_THERMAL", false, 0.95),
  rule(100, "product_name", "모니터|무결점|FHD|QHD|UHD|인치", "peripheral", "MONITOR", false, 0.93),
  rule(100, "product_name", "키보드\\+마우스|키보드마우스|유선세트|무선세트", "peripheral", "KEYBOARD_MOUSE_SET", false, 0.95),
  rule(100, "product_name", "키보드", "peripheral", "KEYBOARD", false, 0.93),
  rule(100, "product_name", "마우스", "peripheral", "MOUSE", false, 0.93),
  rule(100, "product_name", "헤드셋|이어폰|헤드폰", "peripheral", "HEADSET", false, 0.93),
  rule(100, "product_name", "스피커|사운드바", "peripheral", "SPEAKER", false, 0.93),
  rule(100, "product_name", "공유기|랜카드|스위칭허브|네트워크|무선랜", "peripheral", "NETWORK", false, 0.93),
  rule(100, "product_name", "케이블|젠더|HDMI|DP|DisplayPort|USB|Type-C|랜케이블", "cable_accessory", "CABLE", false, 0.92),
  rule(100, "product_name", "마우스패드|받침대|거치대|파우치|가방|브라켓|가이드", "cable_accessory", "ACCESSORY", false, 0.9),
];

const OUTPUTS = {
  category: {
    name: "product_category_normalized.csv",
    headers: ["product_code", "normalized_group", "normalized_part_type", "normalized_category_name", "ai_candidate_yn", "source_rule", "confidence", "reviewed_yn"],
  },
  specs: {
    name: "product_specs.csv",
    headers: [
      "product_code", "part_type", "socket", "chipset", "mem_type", "tdp_watt", "rated_watt",
      "length_mm", "gpu_max_mm", "cooler_tdp", "height_mm", "capacity_gb", "gpu_chipset",
      "vram_gb", "required_power_watt", "pcie_gen", "form_factor", "interface", "tag_white",
      "tag_rgb", "tag_silent",
    ],
  },
  review: {
    name: "product_normalization_review_queue.csv",
    headers: ["product_code", "detected_group", "detected_part_type", "detected_confidence", "conflict_reason", "review_status"],
  },
};

function rule(priority, matchField, pattern, group, partType, aiCandidate, confidence) {
  return {
    priority,
    matchField,
    pattern,
    regex: new RegExp(pattern, "i"),
    group,
    partType,
    categoryName: CATEGORY_NAMES[partType] ?? "미분류",
    aiCandidate,
    confidence,
  };
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];

    if (ch === "\"") {
      if (inQuotes && next === "\"") {
        cell += "\"";
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && next === "\n") i += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += ch;
  }

  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }

  return rows.filter((r) => r.some((v) => v !== ""));
}

function cleanText(value) {
  return String(value ?? "")
    .replace(/^\uFEFF/, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, "\"")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeStatus(value) {
  const status = cleanText(value);
  if (["판매중", "품절", "단종", "삭제대기"].includes(status)) return status;
  return status || "UNKNOWN";
}

function toNumber(value) {
  const normalized = cleanText(value).replace(/,/g, "");
  if (!normalized) return "";
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : "";
}

function pick(row, key) {
  return cleanText(row[key]);
}

function classify(row) {
  const matched = [];
  for (const r of RULES) {
    const value = row[r.matchField] ?? "";
    if (r.regex.test(value)) matched.push(r);
  }

  if (!matched.length) {
    return {
      normalized_group: "unknown",
      normalized_part_type: "UNKNOWN",
      normalized_category_name: CATEGORY_NAMES.UNKNOWN,
      ai_candidate_yn: false,
      source_rule: "no_match",
      confidence: 0,
      conflictReasons: ["normalized_part_type = UNKNOWN"],
    };
  }

  matched.sort((a, b) => b.priority - a.priority || b.confidence - a.confidence);
  const best = matched[0];
  const categoryHints = matched.filter((m) => m.matchField.startsWith("category") && m.partType !== best.partType);
  const partNameHints = matched.filter((m) => m.matchField === "product_name" && AI_PART_TYPES.has(m.partType));
  const conflictReasons = [];
  let confidence = best.confidence;

  if (categoryHints.length && best.matchField === "product_name") {
    confidence = Math.min(confidence, 0.88);
    conflictReasons.push(`원본 카테고리와 상품명 분류 충돌: ${categoryHints.map((m) => m.partType).join("/")}`);
  }

  if (best.partType === "PREBUILT_PC" && partNameHints.some((m) => m.partType !== "PREBUILT_PC")) {
    conflictReasons.push("완제품/채굴기 키워드와 부품 키워드 동시 존재");
  }

  return {
    normalized_group: best.group,
    normalized_part_type: best.partType,
    normalized_category_name: best.categoryName,
    ai_candidate_yn: best.aiCandidate,
    source_rule: `${best.matchField}:${best.pattern}`,
    confidence,
    conflictReasons,
  };
}

function extractSpecs(row, partType) {
  const text = `${row.product_name} ${row.model_name} ${row.spec_raw} ${row.category2} ${row.category3}`.replace(/\s+/g, " ");
  const specs = {
    product_code: row.product_code,
    part_type: partType,
    socket: "",
    chipset: "",
    mem_type: "",
    tdp_watt: "",
    rated_watt: "",
    length_mm: "",
    gpu_max_mm: "",
    cooler_tdp: "",
    height_mm: "",
    capacity_gb: "",
    gpu_chipset: "",
    vram_gb: "",
    required_power_watt: "",
    pcie_gen: "",
    form_factor: "",
    interface: "",
    tag_white: /화이트|white/i.test(text) ? "true" : "false",
    tag_rgb: /RGB|ARGB|LED/i.test(text) ? "true" : "false",
    tag_silent: /저소음|무소음|silent/i.test(text) ? "true" : "false",
  };

  specs.socket = firstMatch(text, /(AM4|AM5|LGA\s?\d{4,5}v?\d*|소켓\s?\d{4,5}v?\d*)/i, (v) => v.replace(/소켓\s?/i, "LGA").replace(/\s+/g, ""));
  specs.tdp_watt = firstMatch(text, /(?:TDP|설계전력|소비전력)\s*:?\s*(\d{2,4})\s?W/i);
  specs.rated_watt = firstMatch(text, /(?:정격|정격출력)?\s*(\d{3,4})\s?W/i);
  specs.length_mm = firstMatch(text, /(?:길이|제품 길이|VGA 길이)\s*:?\s*(\d{2,4})\s?mm/i);
  specs.gpu_max_mm = firstMatch(text, /(?:VGA장착길이|그래픽카드 장착|그래픽카드)\D{0,20}(\d{2,4})\s?mm/i);
  specs.height_mm = firstMatch(text, /(?:높이|CPU쿨러 장착)\D{0,20}(\d{2,4})\s?mm/i);
  specs.cooler_tdp = firstMatch(text, /(?:TDP|쿨링)\D{0,10}(\d{2,4})\s?W/i);
  specs.required_power_watt = firstMatch(text, /(?:권장 파워|권장파워|파워 권장)\D{0,20}(\d{3,4})\s?W/i);
  specs.chipset = firstMatch(text, /\b(X870|X670|B650|B550|A620|Z790|Z690|B760|B660|H610|H510|H370|H310|B360)\b/i, (v) => v.toUpperCase());
  specs.mem_type = firstMatch(text, /\b(DDR3|DDR4|DDR5)\b/i, (v) => v.toUpperCase());
  specs.gpu_chipset = firstMatch(text, /\b(RTX\s?\d{4}|GTX\s?\d{3,4}|GT\s?\d{3,4}|RX\s?\d{3,4}|RX\s?\d{4}\s?XT?)\b/i, (v) => v.replace(/\s+/, " ").toUpperCase());
  specs.vram_gb = firstMatch(text, /(?:D5|D6|GDDR\dX?)?\s?(\d{1,2})\s?GB/i);
  specs.pcie_gen = firstMatch(text, /PCIe\s?([345]\.0|[345])/i, (v) => `PCIe ${v.includes(".") ? v : `${v}.0`}`);
  specs.form_factor = firstMatch(text, /(Mini-ITX|M-ATX|mATX|Micro-ATX|ATX|E-ATX|SFX|TFX)/i, normalizeFormFactor);
  specs.interface = firstMatch(text, /(NVMe|SATA3?|PCIe\s?[345]\.0|M\.2)/i, (v) => v.toUpperCase().replace("SATA3", "SATA"));

  const capacity = firstCapacityGb(text);
  if (capacity) specs.capacity_gb = capacity;

  if (partType === "COOLER_CPU_AIR" && !specs.cooler_tdp && specs.tdp_watt) specs.cooler_tdp = specs.tdp_watt;
  if (partType === "COOLER_CPU_AIO" && !specs.cooler_tdp && specs.tdp_watt) specs.cooler_tdp = specs.tdp_watt;

  return specs;
}

function firstMatch(text, regex, transform = (v) => v) {
  const match = text.match(regex);
  if (!match) return "";
  return transform(match[1] ?? match[0]);
}

function firstCapacityGb(text) {
  const tb = text.match(/(\d+(?:\.\d+)?)\s?TB/i);
  if (tb) return String(Math.round(Number.parseFloat(tb[1]) * 1000));
  const gb = text.match(/(\d{1,5})\s?GB/i);
  return gb ? gb[1] : "";
}

function normalizeFormFactor(value) {
  const text = value.toUpperCase();
  if (text.includes("MINI")) return "Mini-ITX";
  if (text.includes("MICRO") || text.includes("M-ATX") || text.includes("MATX")) return "M-ATX";
  if (text.includes("E-ATX")) return "E-ATX";
  if (text.includes("SFX")) return "SFX";
  if (text.includes("TFX")) return "TFX";
  return "ATX";
}

function missingRequiredSpecs(partType, specs) {
  const required = {
    CPU: [["socket"], ["tdp_watt"]],
    GPU: [["length_mm"], ["tdp_watt", "required_power_watt"]],
    MB: [["socket"], ["chipset"], ["mem_type"], ["form_factor"]],
    RAM: [["mem_type"], ["capacity_gb"]],
    SSD: [["capacity_gb"], ["interface"]],
    POWER: [["rated_watt"]],
    CASE: [["gpu_max_mm"], ["height_mm"]],
    COOLER_CPU_AIR: [["cooler_tdp"], ["height_mm"]],
    COOLER_CPU_AIO: [["cooler_tdp"]],
  }[partType];

  if (!required) return [];
  return required
    .filter((group) => !group.some((key) => specs[key] !== ""))
    .map((group) => group.join("|"));
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\r\n]/.test(text)) return `"${text.replace(/"/g, "\"\"")}"`;
  return text;
}

function writeCsv(filePath, headers, rows) {
  const body = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => csvEscape(row[h])).join(",")),
  ].join("\n");
  fs.writeFileSync(filePath, `\uFEFF${body}\n`, "utf8");
}

function increment(map, key) {
  map[key] = (map[key] ?? 0) + 1;
}

function makeProduct(row, indexByHeader) {
  const productCode = pick(row, "자체상품코드") || pick(row, "통합상품코드");
  return {
    product_code: productCode,
    model_name: pick(row, "모델명"),
    product_name: pick(row, "상품명") || pick(row, "장부상품명"),
    maker: pick(row, "제조사"),
    category1: pick(row, "카테고리1"),
    category2: pick(row, "카테고리2"),
    category3: pick(row, "카테고리3"),
    category4: pick(row, "카테고리4"),
    status: normalizeStatus(pick(row, "상태값")),
    member_price: toNumber(row["일반회원"]),
    spec_raw: cleanText(row["스펙"]),
  };
}

function main() {
  if (!fs.existsSync(INPUT_CSV)) {
    throw new Error(`Input CSV not found: ${INPUT_CSV}`);
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const parsed = parseCsv(fs.readFileSync(INPUT_CSV, "utf8"));
  const headers = parsed[0].map((h) => cleanText(h));
  const rows = parsed.slice(1).map((values) => Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""])));

  const categoryRows = [];
  const specRows = [];
  const reviewRows = [];
  const seenCodes = new Set();
  const report = {
    input_file: path.relative(appRoot, INPUT_CSV).replace(/\\/g, "/"),
    generated_at: new Date().toISOString(),
    total_rows: rows.length,
    duplicate_product_codes: 0,
    status_counts: {},
    normalized_group_counts: {},
    normalized_part_type_counts: {},
    ai_candidate_rows: 0,
    recommend_ready_rows: 0,
    unknown_rows: 0,
    review_queue_rows: 0,
    missing_required_specs_counts: {},
  };

  for (const raw of rows) {
    const product = makeProduct(raw);
    if (!product.product_code) continue;

    const duplicate = seenCodes.has(product.product_code);
    seenCodes.add(product.product_code);

    const classification = classify(product);
    const specs = extractSpecs(product, classification.normalized_part_type);
    const missingSpecs = classification.ai_candidate_yn ? missingRequiredSpecs(classification.normalized_part_type, specs) : [];
    const conflictReasons = [...classification.conflictReasons];
    if (duplicate) conflictReasons.push("동일 product_code 중복 입력 발생");
    if (classification.confidence < 0.85) conflictReasons.push("confidence < 0.85");
    if (missingSpecs.length) conflictReasons.push(`AI 추천 후보 필수 product_specs 누락: ${missingSpecs.join(", ")}`);

    const recommendReady = product.status === "판매중"
      && classification.normalized_group === "core_part"
      && classification.ai_candidate_yn
      && AI_PART_TYPES.has(classification.normalized_part_type)
      && missingSpecs.length === 0;

    categoryRows.push({
      product_code: product.product_code,
      normalized_group: classification.normalized_group,
      normalized_part_type: classification.normalized_part_type,
      normalized_category_name: classification.normalized_category_name,
      ai_candidate_yn: String(classification.ai_candidate_yn),
      source_rule: classification.source_rule,
      confidence: classification.confidence.toFixed(2),
      reviewed_yn: "false",
    });

    specRows.push(specs);

    if (conflictReasons.length) {
      reviewRows.push({
        product_code: product.product_code,
        detected_group: classification.normalized_group,
        detected_part_type: classification.normalized_part_type,
        detected_confidence: classification.confidence.toFixed(2),
        conflict_reason: conflictReasons.join(" / "),
        review_status: "대기",
      });
    }

    increment(report.status_counts, product.status);
    increment(report.normalized_group_counts, classification.normalized_group);
    increment(report.normalized_part_type_counts, classification.normalized_part_type);
    if (duplicate) report.duplicate_product_codes += 1;
    if (classification.ai_candidate_yn) report.ai_candidate_rows += 1;
    if (recommendReady) report.recommend_ready_rows += 1;
    if (classification.normalized_part_type === "UNKNOWN") report.unknown_rows += 1;
    for (const missing of missingSpecs) increment(report.missing_required_specs_counts, `${classification.normalized_part_type}.${missing}`);
  }

  report.review_queue_rows = reviewRows.length;
  report.output_files = Object.fromEntries(Object.values(OUTPUTS).map((o) => [o.name, path.posix.join("db/normalized", o.name)]));

  writeCsv(path.join(OUTPUT_DIR, OUTPUTS.category.name), OUTPUTS.category.headers, categoryRows);
  writeCsv(path.join(OUTPUT_DIR, OUTPUTS.specs.name), OUTPUTS.specs.headers, specRows);
  writeCsv(path.join(OUTPUT_DIR, OUTPUTS.review.name), OUTPUTS.review.headers, reviewRows);
  fs.writeFileSync(path.join(OUTPUT_DIR, "normalization_report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(JSON.stringify({
    total_rows: report.total_rows,
    ai_candidate_rows: report.ai_candidate_rows,
    recommend_ready_rows: report.recommend_ready_rows,
    unknown_rows: report.unknown_rows,
    review_queue_rows: report.review_queue_rows,
    output_dir: path.relative(appRoot, OUTPUT_DIR).replace(/\\/g, "/"),
  }, null, 2));
}

main();
