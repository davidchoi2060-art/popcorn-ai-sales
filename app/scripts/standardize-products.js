import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appRoot = path.resolve(__dirname, "..");

const SOURCE_CSV = path.join(appRoot, "db", "팝콘PC_상품_2026-06-10기준(통합).csv");
const NORMALIZED_DIR = path.join(appRoot, "db", "normalized");
const OUTPUT_DIR = path.join(appRoot, "db", "standardized");

const PRODUCTS_HEADERS = [
  "product_code",
  "product_name",
  "maker",
  "brand",
  "model_name",
  "part_type",
  "category_group",
  "status",
  "ai_candidate_yn",
  "purchase_price",
  "sale_price",
  "market_price",
  "supplier",
  "warranty_months",
  "spec_source_text",
  "review_required_yn",
  "review_reason",
];

const SPECS_HEADERS = [
  "product_code",
  "part_type",
  "socket",
  "chipset",
  "mem_type",
  "capacity_gb",
  "clock_mhz",
  "tdp_watt",
  "rated_watt",
  "required_power_watt",
  "length_mm",
  "gpu_max_mm",
  "cooler_height_mm",
  "cooler_tdp",
  "pcie_gen",
  "form_factor",
  "interface",
  "tag_white",
  "tag_rgb",
  "tag_silent",
];

const REVIEW_HEADERS = [
  "row_no",
  "product_code",
  "product_name",
  "error_type",
  "error_message",
  "raw_category1",
  "raw_category2",
  "raw_category3",
  "raw_spec",
];

const AI_REQUIRED = {
  CPU: [["socket"], ["tdp_watt"]],
  GPU: [["length_mm"], ["tdp_watt", "required_power_watt"]],
  MB: [["socket"], ["chipset"], ["mem_type"], ["form_factor"]],
  RAM: [["mem_type"], ["capacity_gb"]],
  SSD: [["capacity_gb"], ["interface"]],
  POWER: [["rated_watt"]],
  CASE: [["gpu_max_mm"], ["cooler_height_mm"]],
  COOLER_CPU_AIR: [["cooler_tdp"], ["cooler_height_mm"]],
  COOLER_CPU_AIO: [["cooler_tdp"]],
};

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

function readCsv(filePath) {
  const parsed = parseCsv(fs.readFileSync(filePath, "utf8"));
  const headers = parsed[0].map((h) => cleanText(h));
  return parsed.slice(1).map((values, index) => ({
    row_no: index + 2,
    ...Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""])),
  }));
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
    .replace(/<~>/g, " ")
    .replace(/(?:OOO|ㅇㅇㅇ)/gi, " ")
    .replace(/(^|[\s,/|()[\]{}])([ㄱ-ㅎ])(?=($|[\s,/|()[\]{}]))/g, "$1")
    .replace(/[|/]\s*[|/]+/g, " / ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeStatus(value) {
  const status = cleanText(value);
  return ["판매중", "품절", "단종", "삭제대기"].includes(status) ? status : "삭제대기";
}

function numeric(value) {
  const parsed = Number.parseInt(cleanText(value).replace(/,/g, ""), 10);
  return Number.isFinite(parsed) ? String(parsed) : "";
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

function mapByCode(rows, codeKey = "product_code") {
  const map = new Map();
  for (const row of rows) {
    const code = cleanText(row[codeKey]);
    if (code && !map.has(code)) map.set(code, row);
  }
  return map;
}

function missingRequired(partType, specRow) {
  const required = AI_REQUIRED[partType];
  if (!required) return [];
  return required
    .filter((group) => !group.some((key) => cleanText(specRow[key])))
    .map((group) => group.join("|"));
}

function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const sourceRows = readCsv(SOURCE_CSV);
  const categoryRows = readCsv(path.join(NORMALIZED_DIR, "product_category_normalized.csv"));
  const specRows = readCsv(path.join(NORMALIZED_DIR, "product_specs.csv"));
  const reviewRows = readCsv(path.join(NORMALIZED_DIR, "product_normalization_review_queue.csv"));
  const categoryByCode = mapByCode(categoryRows);
  const specByCode = mapByCode(specRows);
  const reviewByCode = new Map();

  for (const row of reviewRows) {
    const code = cleanText(row.product_code);
    if (!code) continue;
    const current = reviewByCode.get(code);
    reviewByCode.set(code, current ? `${current} / ${cleanText(row.conflict_reason)}` : cleanText(row.conflict_reason));
  }

  const products = [];
  const specs = [];
  const reviews = [];
  const report = {
    generated_at: new Date().toISOString(),
    source_file: "db/팝콘PC_상품_2026-06-10기준(통합).csv",
    total_rows: sourceRows.length,
    product_rows: 0,
    spec_rows: 0,
    review_rows: 0,
    ai_candidate_rows: 0,
    status_counts: {},
    part_type_counts: {},
  };

  for (const source of sourceRows) {
    const productCode = cleanText(source["자체상품코드"]) || cleanText(source["통합상품코드"]);
    if (!productCode) {
      reviews.push({
        row_no: source.row_no,
        product_code: "",
        product_name: cleanText(source["상품명"] || source["장부상품명"]),
        error_type: "missing_product_code",
        error_message: "상품코드가 없어 표준 상품 CSV에서 제외됨",
        raw_category1: cleanText(source["카테고리1"]),
        raw_category2: cleanText(source["카테고리2"]),
        raw_category3: cleanText(source["카테고리3"]),
        raw_spec: cleanText(source["스펙"]),
      });
      continue;
    }

    const category = categoryByCode.get(productCode) ?? {};
    const spec = specByCode.get(productCode) ?? {};
    const partType = cleanText(category.normalized_part_type) || "UNKNOWN";
    const categoryGroup = cleanText(category.normalized_group) || "unknown";
    const aiCandidate = cleanText(category.ai_candidate_yn).toLowerCase() === "true";
    const status = normalizeStatus(source["상태값"]);
    const reviewReasonParts = [];

    if (partType === "UNKNOWN") reviewReasonParts.push("part_type 미분류");
    if (reviewByCode.has(productCode)) reviewReasonParts.push(reviewByCode.get(productCode));
    if (aiCandidate) {
      const missing = missingRequired(partType, {
        ...spec,
        cooler_height_mm: spec.height_mm,
      });
      if (missing.length) reviewReasonParts.push(`AI 추천 필수 스펙 누락: ${missing.join(", ")}`);
    }

    const reviewReason = [...new Set(reviewReasonParts.filter(Boolean))].join(" / ");
    const productName = cleanText(source["상품명"] || source["장부상품명"]);

    products.push({
      product_code: productCode,
      product_name: productName,
      maker: cleanText(source["제조사"]),
      brand: cleanText(source["제조사"]),
      model_name: cleanText(source["모델명"]),
      part_type: partType,
      category_group: categoryGroup,
      status,
      ai_candidate_yn: aiCandidate ? "true" : "false",
      purchase_price: numeric(source["매입가"]),
      sale_price: numeric(source["일반회원"]),
      market_price: numeric(source["시중가"]),
      supplier: cleanText(source["공급처"]),
      warranty_months: "",
      spec_source_text: cleanText(source["스펙"]),
      review_required_yn: reviewReason ? "true" : "false",
      review_reason: reviewReason,
    });

    specs.push({
      product_code: productCode,
      part_type: partType,
      socket: cleanText(spec.socket),
      chipset: cleanText(spec.chipset),
      mem_type: cleanText(spec.mem_type),
      capacity_gb: cleanText(spec.capacity_gb),
      clock_mhz: "",
      tdp_watt: cleanText(spec.tdp_watt),
      rated_watt: cleanText(spec.rated_watt),
      required_power_watt: cleanText(spec.required_power_watt),
      length_mm: cleanText(spec.length_mm),
      gpu_max_mm: cleanText(spec.gpu_max_mm),
      cooler_height_mm: cleanText(spec.height_mm),
      cooler_tdp: cleanText(spec.cooler_tdp),
      pcie_gen: cleanText(spec.pcie_gen),
      form_factor: cleanText(spec.form_factor),
      interface: cleanText(spec.interface),
      tag_white: cleanText(spec.tag_white) || "false",
      tag_rgb: cleanText(spec.tag_rgb) || "false",
      tag_silent: cleanText(spec.tag_silent) || "false",
    });

    if (reviewReason) {
      reviews.push({
        row_no: source.row_no,
        product_code: productCode,
        product_name: productName,
        error_type: partType === "UNKNOWN" ? "unknown_part_type" : "review_required",
        error_message: reviewReason,
        raw_category1: cleanText(source["카테고리1"]),
        raw_category2: cleanText(source["카테고리2"]),
        raw_category3: cleanText(source["카테고리3"]),
        raw_spec: cleanText(source["스펙"]),
      });
    }

    report.status_counts[status] = (report.status_counts[status] ?? 0) + 1;
    report.part_type_counts[partType] = (report.part_type_counts[partType] ?? 0) + 1;
    if (aiCandidate) report.ai_candidate_rows += 1;
  }

  report.product_rows = products.length;
  report.spec_rows = specs.length;
  report.review_rows = reviews.length;

  writeCsv(path.join(OUTPUT_DIR, "products_standard_v1.csv"), PRODUCTS_HEADERS, products);
  writeCsv(path.join(OUTPUT_DIR, "product_specs_standard_v1.csv"), SPECS_HEADERS, specs);
  writeCsv(path.join(OUTPUT_DIR, "product_upload_review_v1.csv"), REVIEW_HEADERS, reviews);
  writeCsv(path.join(OUTPUT_DIR, "product_upload_template_v1.csv"), PRODUCTS_HEADERS, []);
  fs.writeFileSync(path.join(OUTPUT_DIR, "standardization_report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(JSON.stringify({
    product_rows: report.product_rows,
    spec_rows: report.spec_rows,
    review_rows: report.review_rows,
    ai_candidate_rows: report.ai_candidate_rows,
    output_dir: path.relative(appRoot, OUTPUT_DIR).replace(/\\/g, "/"),
  }, null, 2));
}

main();
