import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "../server/db/pool.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appRoot = path.resolve(__dirname, "..");
const standardDir = path.join(appRoot, "db", "standardized");
const migrationPath = path.join(appRoot, "db", "migrations", "005_reset_products_standard_v1.sql");

const files = {
  products: path.join(standardDir, "products_standard_v1.csv"),
  specs: path.join(standardDir, "product_specs_standard_v1.csv"),
  reviews: path.join(standardDir, "product_upload_review_v1.csv"),
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
  if (!fs.existsSync(filePath)) throw new Error(`CSV not found: ${filePath}`);
  const parsed = parseCsv(fs.readFileSync(filePath, "utf8"));
  const headers = parsed[0].map((h) => h.replace(/^\uFEFF/, ""));
  return parsed.slice(1).map((values) => Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""])));
}

function value(v) {
  return v === undefined || v === "" ? null : v;
}

function bool(v) {
  return String(v).toLowerCase() === "true";
}

function int(v) {
  const parsed = Number.parseInt(String(v ?? "").replace(/,/g, ""), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function chunks(rows, size) {
  const out = [];
  for (let i = 0; i < rows.length; i += size) out.push(rows.slice(i, i + size));
  return out;
}

async function insertRows(client, sql, rows, mapper) {
  for (const batch of chunks(rows, 500)) {
    const mapped = batch.map(mapper);
    const width = mapped[0].length;
    const params = [];
    const placeholders = mapped.map((row, rowIndex) => {
      const cols = row.map((cell, colIndex) => {
        params.push(cell);
        return `$${rowIndex * width + colIndex + 1}`;
      });
      return `(${cols.join(", ")})`;
    });
    await client.query(sql.replace("__VALUES__", placeholders.join(", ")), params);
  }
}

async function main() {
  const products = readCsv(files.products).filter((row) => value(row.product_code));
  const specs = readCsv(files.specs).filter((row) => value(row.product_code));
  const reviews = readCsv(files.reviews).filter((row) => value(row.product_code));
  const migration = fs.readFileSync(migrationPath, "utf8");

  const client = await pool.connect();
  try {
    await client.query(migration);
    await client.query("BEGIN");

    await insertRows(client, `
      INSERT INTO products (
        product_code, product_name, maker, brand, model_name, part_type, category_group, status,
        ai_candidate_yn, purchase_price, sale_price, market_price, supplier, warranty_months,
        spec_source_text, review_required_yn, review_reason, created_at, updated_at
      )
      VALUES __VALUES__
    `, products, (row) => [
      int(row.product_code),
      value(row.product_name) || "(상품명 미입력)",
      value(row.maker),
      value(row.brand),
      value(row.model_name),
      value(row.part_type) || "UNKNOWN",
      value(row.category_group) || "unknown",
      value(row.status) || "삭제대기",
      bool(row.ai_candidate_yn),
      int(row.purchase_price),
      int(row.sale_price) ?? 0,
      int(row.market_price),
      value(row.supplier),
      int(row.warranty_months),
      value(row.spec_source_text),
      bool(row.review_required_yn),
      value(row.review_reason),
      new Date(),
      new Date(),
    ]);

    await insertRows(client, `
      INSERT INTO product_specs (
        product_code, part_type, socket, chipset, mem_type, capacity_gb, clock_mhz, tdp_watt,
        rated_watt, required_power_watt, length_mm, gpu_max_mm, cooler_height_mm, cooler_tdp,
        pcie_gen, form_factor, interface, tag_white, tag_rgb, tag_silent, updated_at
      )
      VALUES __VALUES__
    `, specs, (row) => [
      int(row.product_code),
      value(row.part_type) || "UNKNOWN",
      value(row.socket),
      value(row.chipset),
      value(row.mem_type),
      int(row.capacity_gb),
      int(row.clock_mhz),
      int(row.tdp_watt),
      int(row.rated_watt),
      int(row.required_power_watt),
      int(row.length_mm),
      int(row.gpu_max_mm),
      int(row.cooler_height_mm),
      int(row.cooler_tdp),
      value(row.pcie_gen),
      value(row.form_factor),
      value(row.interface),
      bool(row.tag_white),
      bool(row.tag_rgb),
      bool(row.tag_silent),
      new Date(),
    ]);

    await insertRows(client, `
      INSERT INTO product_upload_reviews (
        row_no, product_code, product_name, error_type, error_message, raw_category1,
        raw_category2, raw_category3, raw_spec, review_status, created_at
      )
      VALUES __VALUES__
    `, reviews, (row) => [
      int(row.row_no),
      int(row.product_code),
      value(row.product_name),
      value(row.error_type) || "review_required",
      value(row.error_message),
      value(row.raw_category1),
      value(row.raw_category2),
      value(row.raw_category3),
      value(row.raw_spec),
      "대기",
      new Date(),
    ]);

    const summary = await client.query(`
      SELECT 'products' AS name, COUNT(*)::int AS count FROM products
      UNION ALL
      SELECT 'product_specs', COUNT(*)::int FROM product_specs
      UNION ALL
      SELECT 'product_upload_reviews', COUNT(*)::int FROM product_upload_reviews
      UNION ALL
      SELECT 'ai_candidates', COUNT(*)::int FROM products WHERE ai_candidate_yn = true
      UNION ALL
      SELECT 'selling_products', COUNT(*)::int FROM products WHERE status = '판매중'
    `);

    await client.query("COMMIT");
    console.log(JSON.stringify(Object.fromEntries(summary.rows.map((row) => [row.name, row.count])), null, 2));
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
