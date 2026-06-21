import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "../server/db/pool.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appRoot = path.resolve(__dirname, "..");
const normalizedDir = path.join(appRoot, "db", "normalized");
const migrationPath = path.join(appRoot, "db", "migrations", "004_create_product_normalization_tables.sql");

const files = {
  category: path.join(normalizedDir, "product_category_normalized.csv"),
  specs: path.join(normalizedDir, "product_specs.csv"),
  review: path.join(normalizedDir, "product_normalization_review_queue.csv"),
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
  if (!fs.existsSync(filePath)) {
    throw new Error(`Required normalized CSV not found: ${filePath}`);
  }
  const parsed = parseCsv(fs.readFileSync(filePath, "utf8"));
  const headers = parsed[0].map((h) => h.replace(/^\uFEFF/, ""));
  return parsed.slice(1).map((values) => Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""])));
}

function toDbValue(value) {
  return value === "" || value === undefined ? null : value;
}

function chunk(rows, size) {
  const chunks = [];
  for (let i = 0; i < rows.length; i += size) chunks.push(rows.slice(i, i + size));
  return chunks;
}

async function insertTempRows(client, table, columns, rows) {
  for (const batch of chunk(rows, 500)) {
    const values = [];
    const placeholders = batch.map((row, rowIndex) => {
      const params = columns.map((column, columnIndex) => {
        values.push(toDbValue(row[column]));
        return `$${rowIndex * columns.length + columnIndex + 1}`;
      });
      return `(${params.join(", ")})`;
    });
    await client.query(
      `INSERT INTO ${table} (${columns.join(", ")}) VALUES ${placeholders.join(", ")}`,
      values,
    );
  }
}

async function main() {
  const categoryRows = readCsv(files.category);
  const specRows = readCsv(files.specs);
  const reviewRows = readCsv(files.review);
  const migrationSql = fs.readFileSync(migrationPath, "utf8");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(migrationSql);

    const productCount = await client.query("SELECT COUNT(*)::integer AS count FROM products");
    if ((productCount.rows[0]?.count ?? 0) === 0) {
      throw new Error("products table is empty. Import products before applying normalization.");
    }

    await client.query(`
      CREATE TEMP TABLE temp_product_category_normalized (
        product_code TEXT,
        normalized_group TEXT,
        normalized_part_type TEXT,
        normalized_category_name TEXT,
        ai_candidate_yn TEXT,
        source_rule TEXT,
        confidence TEXT,
        reviewed_yn TEXT
      ) ON COMMIT DROP
    `);
    await client.query(`
      CREATE TEMP TABLE temp_product_specs (
        product_code TEXT,
        part_type TEXT,
        socket TEXT,
        chipset TEXT,
        mem_type TEXT,
        tdp_watt TEXT,
        rated_watt TEXT,
        length_mm TEXT,
        gpu_max_mm TEXT,
        cooler_tdp TEXT,
        height_mm TEXT,
        capacity_gb TEXT,
        gpu_chipset TEXT,
        vram_gb TEXT,
        required_power_watt TEXT,
        pcie_gen TEXT,
        form_factor TEXT,
        interface TEXT,
        tag_white TEXT,
        tag_rgb TEXT,
        tag_silent TEXT
      ) ON COMMIT DROP
    `);
    await client.query(`
      CREATE TEMP TABLE temp_product_normalization_review_queue (
        product_code TEXT,
        detected_group TEXT,
        detected_part_type TEXT,
        detected_confidence TEXT,
        conflict_reason TEXT,
        review_status TEXT
      ) ON COMMIT DROP
    `);

    await insertTempRows(client, "temp_product_category_normalized", [
      "product_code", "normalized_group", "normalized_part_type", "normalized_category_name",
      "ai_candidate_yn", "source_rule", "confidence", "reviewed_yn",
    ], categoryRows);
    await insertTempRows(client, "temp_product_specs", [
      "product_code", "part_type", "socket", "chipset", "mem_type", "tdp_watt", "rated_watt",
      "length_mm", "gpu_max_mm", "cooler_tdp", "height_mm", "capacity_gb", "gpu_chipset",
      "vram_gb", "required_power_watt", "pcie_gen", "form_factor", "interface", "tag_white",
      "tag_rgb", "tag_silent",
    ], specRows);
    await insertTempRows(client, "temp_product_normalization_review_queue", [
      "product_code", "detected_group", "detected_part_type", "detected_confidence", "conflict_reason", "review_status",
    ], reviewRows);

    await client.query(`
      INSERT INTO product_category_normalized (
        product_code,
        normalized_group,
        normalized_part_type,
        normalized_category_name,
        ai_candidate_yn,
        source_rule,
        confidence,
        reviewed_yn,
        updated_at
      )
      SELECT
        t.product_code::BIGINT,
        t.normalized_group,
        t.normalized_part_type,
        t.normalized_category_name,
        lower(t.ai_candidate_yn) IN ('true', 't', '1', 'yes'),
        t.source_rule,
        COALESCE(NULLIF(t.confidence, '')::NUMERIC, 0),
        lower(t.reviewed_yn) IN ('true', 't', '1', 'yes'),
        now()
      FROM temp_product_category_normalized t
      JOIN products p ON p.product_code = t.product_code::BIGINT
      ON CONFLICT (product_code) DO UPDATE SET
        normalized_group = EXCLUDED.normalized_group,
        normalized_part_type = EXCLUDED.normalized_part_type,
        normalized_category_name = EXCLUDED.normalized_category_name,
        ai_candidate_yn = EXCLUDED.ai_candidate_yn,
        source_rule = EXCLUDED.source_rule,
        confidence = EXCLUDED.confidence,
        reviewed_yn = EXCLUDED.reviewed_yn,
        updated_at = now()
    `);

    await client.query(`
      INSERT INTO product_specs (
        product_code,
        part_type,
        socket,
        chipset,
        mem_type,
        tdp_watt,
        rated_watt,
        length_mm,
        gpu_max_mm,
        cooler_tdp,
        pcie_gen,
        tag_white,
        tag_rgb,
        tag_silent,
        height_mm,
        capacity_gb,
        gpu_chipset,
        vram_gb,
        required_power_watt,
        form_factor,
        interface,
        updated_at
      )
      SELECT
        t.product_code::BIGINT,
        NULLIF(t.part_type, ''),
        NULLIF(t.socket, ''),
        NULLIF(t.chipset, ''),
        NULLIF(t.mem_type, ''),
        NULLIF(t.tdp_watt, '')::INTEGER,
        NULLIF(t.rated_watt, '')::INTEGER,
        NULLIF(t.length_mm, '')::INTEGER,
        NULLIF(t.gpu_max_mm, '')::INTEGER,
        NULLIF(t.cooler_tdp, '')::INTEGER,
        NULLIF(t.pcie_gen, ''),
        lower(t.tag_white) IN ('true', 't', '1', 'yes'),
        lower(t.tag_rgb) IN ('true', 't', '1', 'yes'),
        lower(t.tag_silent) IN ('true', 't', '1', 'yes'),
        NULLIF(t.height_mm, '')::INTEGER,
        NULLIF(t.capacity_gb, '')::INTEGER,
        NULLIF(t.gpu_chipset, ''),
        NULLIF(t.vram_gb, '')::INTEGER,
        NULLIF(t.required_power_watt, '')::INTEGER,
        NULLIF(t.form_factor, ''),
        NULLIF(t.interface, ''),
        now()
      FROM temp_product_specs t
      JOIN products p ON p.product_code = t.product_code::BIGINT
      ON CONFLICT (product_code) DO UPDATE SET
        part_type = EXCLUDED.part_type,
        socket = EXCLUDED.socket,
        chipset = EXCLUDED.chipset,
        mem_type = EXCLUDED.mem_type,
        tdp_watt = EXCLUDED.tdp_watt,
        rated_watt = EXCLUDED.rated_watt,
        length_mm = EXCLUDED.length_mm,
        gpu_max_mm = EXCLUDED.gpu_max_mm,
        cooler_tdp = EXCLUDED.cooler_tdp,
        pcie_gen = EXCLUDED.pcie_gen,
        tag_white = EXCLUDED.tag_white,
        tag_rgb = EXCLUDED.tag_rgb,
        tag_silent = EXCLUDED.tag_silent,
        height_mm = EXCLUDED.height_mm,
        capacity_gb = EXCLUDED.capacity_gb,
        gpu_chipset = EXCLUDED.gpu_chipset,
        vram_gb = EXCLUDED.vram_gb,
        required_power_watt = EXCLUDED.required_power_watt,
        form_factor = EXCLUDED.form_factor,
        interface = EXCLUDED.interface,
        updated_at = now()
    `);

    await client.query("TRUNCATE product_normalization_review_queue");
    await client.query(`
      INSERT INTO product_normalization_review_queue (
        product_code,
        detected_group,
        detected_part_type,
        detected_confidence,
        conflict_reason,
        review_status
      )
      SELECT
        t.product_code::BIGINT,
        NULLIF(t.detected_group, ''),
        NULLIF(t.detected_part_type, ''),
        NULLIF(t.detected_confidence, '')::NUMERIC,
        NULLIF(t.conflict_reason, ''),
        COALESCE(NULLIF(t.review_status, ''), '대기')
      FROM temp_product_normalization_review_queue t
      JOIN products p ON p.product_code = t.product_code::BIGINT
    `);

    const summary = await client.query(`
      SELECT 'products' AS name, COUNT(*)::INTEGER AS count FROM products
      UNION ALL
      SELECT 'product_category_normalized', COUNT(*)::INTEGER FROM product_category_normalized
      UNION ALL
      SELECT 'product_specs', COUNT(*)::INTEGER FROM product_specs
      UNION ALL
      SELECT 'product_normalization_review_queue', COUNT(*)::INTEGER FROM product_normalization_review_queue
      UNION ALL
      SELECT 'recommend_ready', COUNT(*)::INTEGER
      FROM products p
      JOIN product_category_normalized pc ON pc.product_code = p.product_code
      JOIN product_specs ps ON ps.product_code = p.product_code
      WHERE p.status = '판매중'
        AND pc.normalized_group = 'core_part'
        AND pc.ai_candidate_yn = true
        AND pc.normalized_part_type IN ('CPU','GPU','MB','RAM','SSD','HDD','POWER','CASE','COOLER_CPU_AIR','COOLER_CPU_AIO')
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
