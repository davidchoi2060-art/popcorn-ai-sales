import { pool } from "../db/pool.js";

const VALID_LIMITS = new Set([10, 20, 50, 100]);

const PART_TYPE_LABELS = {
  CPU: "CPU",
  GPU: "그래픽카드",
  MB: "메인보드",
  RAM: "메모리",
  SSD: "SSD",
  HDD: "하드디스크",
  POWER: "파워",
  CASE: "케이스",
  COOLER_CPU_AIR: "CPU 공랭쿨러",
  COOLER_CPU_AIO: "CPU 수랭쿨러",
  COOLER_SYSTEM: "시스템 쿨러",
  COOLER_THERMAL: "써멀/쿨링소모품",
  MONITOR: "모니터",
  KEYBOARD: "키보드",
  MOUSE: "마우스",
  KEYBOARD_MOUSE_SET: "키보드+마우스 세트",
  HEADSET: "헤드셋",
  SPEAKER: "스피커",
  NETWORK: "네트워크",
  CABLE: "케이블/젠더",
  ACCESSORY: "액세서리",
  ASSEMBLY_SERVICE: "조립/AS 서비스",
  PREBUILT_PC: "완제품 PC",
  SOFTWARE: "소프트웨어",
  INTERNAL: "내부관리",
  UNKNOWN: "식별불가",
};

const CATEGORY_GROUP_LABELS = {
  core_part: "핵심부품",
  peripheral: "주변기기",
  cable_accessory: "케이블/액세서리",
  service: "서비스",
  prebuilt_pc: "완제품",
  software: "소프트웨어",
  internal: "내부관리",
  unknown: "식별불가",
};

const GROUP_ORDER = {
  core_part: 1,
  peripheral: 2,
  cable_accessory: 3,
  service: 4,
  prebuilt_pc: 5,
  software: 6,
  internal: 7,
  unknown: 8,
};

function toPositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function toNullableText(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const text = String(value).trim();
  return text ? text : null;
}

function toNullableNumber(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsed = Number.parseInt(String(value).replace(/,/g, ""), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function toBoolean(value, fallback = false) {
  if (typeof value === "boolean") {
    return value;
  }

  if (value === "true" || value === "Y" || value === "1") {
    return true;
  }

  if (value === "false" || value === "N" || value === "0") {
    return false;
  }

  return fallback;
}

function categoryLabel(partType, categoryGroup) {
  const code = partType || categoryGroup || "UNKNOWN";
  return PART_TYPE_LABELS[code] || CATEGORY_GROUP_LABELS[code] || code || "식별불가";
}

function buildProductFilters(query) {
  const where = [];
  const values = [];

  const add = (sql, value) => {
    values.push(value);
    where.push(sql.replace("?", `$${values.length}`));
  };

  if (query.category) {
    const value = String(query.category).trim();
    values.push(value, value);
    where.push(`(p.part_type = $${values.length - 1} OR p.category_group = $${values.length})`);
  }

  if (query.status) {
    add("p.status = ?", query.status);
  }

  if (query.maker) {
    add("p.maker = ?", query.maker);
  }

  if (query.keyword) {
    values.push(`%${String(query.keyword).trim()}%`);
    const param = `$${values.length}`;
    where.push(`(p.product_name ILIKE ${param} OR p.model_name ILIKE ${param} OR p.product_code::text ILIKE ${param})`);
  }

  return {
    clause: where.length ? `WHERE ${where.join(" AND ")}` : "",
    values,
  };
}

function mapDetailRow(row) {
  if (!row) {
    return null;
  }

  return {
    code: String(row.product_code),
    model_name: row.model_name || "",
    product_name: row.product_name || "",
    maker: row.maker || "",
    brand: row.brand || "",
    status: row.status || "",
    sale_price: row.sale_price === null ? "" : Number(row.sale_price),
    part_type: row.part_type || "UNKNOWN",
    category_group: row.category_group || "unknown",
    ai_candidate_yn: Boolean(row.ai_candidate_yn),
    review_required_yn: Boolean(row.review_required_yn),
    review_reason: row.review_reason || "",
    spec: {
      socket: row.socket || "",
      chipset: row.chipset || "",
      mem_type: row.mem_type || "",
      capacity_gb: row.capacity_gb ?? "",
      clock_mhz: row.clock_mhz ?? "",
      tdp_watt: row.tdp_watt ?? "",
      rated_watt: row.rated_watt ?? "",
      required_power_watt: row.required_power_watt ?? "",
      length_mm: row.length_mm ?? "",
      gpu_max_mm: row.gpu_max_mm ?? "",
      cooler_height_mm: row.cooler_height_mm ?? "",
      cooler_tdp: row.cooler_tdp ?? "",
      pcie_gen: row.pcie_gen || "",
      form_factor: row.form_factor || "",
      interface: row.interface || "",
      tag_white: Boolean(row.tag_white),
      tag_rgb: Boolean(row.tag_rgb),
      tag_silent: Boolean(row.tag_silent),
    },
  };
}

export async function listProductCategories() {
  const result = await pool.query(`
    SELECT
      COALESCE(part_type, 'UNKNOWN') AS part_type,
      COALESCE(category_group, 'unknown') AS category_group,
      COUNT(*)::integer AS count
    FROM products
    GROUP BY COALESCE(part_type, 'UNKNOWN'), COALESCE(category_group, 'unknown')
  `);

  return {
    items: result.rows
      .map((row) => ({
        value: row.part_type,
        label: categoryLabel(row.part_type, row.category_group),
        group: row.category_group,
        groupLabel: CATEGORY_GROUP_LABELS[row.category_group] || row.category_group,
        count: row.count,
      }))
      .sort((a, b) => {
        const groupDiff = (GROUP_ORDER[a.group] || 99) - (GROUP_ORDER[b.group] || 99);
        return groupDiff || a.label.localeCompare(b.label, "ko-KR");
      }),
  };
}

export async function listProductMakers() {
  const result = await pool.query(`
    SELECT maker, COUNT(*)::integer AS count
    FROM products
    WHERE maker IS NOT NULL AND maker <> ''
    GROUP BY maker
    ORDER BY COUNT(*) DESC, maker ASC
    LIMIT 300
  `);

  return {
    items: result.rows.map((row) => ({
      value: row.maker,
      label: row.maker,
      count: row.count,
    })),
  };
}

export async function listAdminProducts(query) {
  const page = toPositiveInt(query.page, 1);
  const requestedLimit = toPositiveInt(query.limit, 50);
  const limit = VALID_LIMITS.has(requestedLimit) ? requestedLimit : 50;
  const offset = (page - 1) * limit;
  const filters = buildProductFilters(query);

  const listValues = [...filters.values, limit, offset];
  const limitParam = `$${filters.values.length + 1}`;
  const offsetParam = `$${filters.values.length + 2}`;

  const [itemsResult, countResult] = await Promise.all([
    pool.query(
      `
        SELECT
          p.product_code,
          p.product_name,
          p.part_type,
          p.category_group,
          p.maker,
          p.status,
          p.sale_price,
          p.review_required_yn,
          ps.part_type AS spec_part_type
        FROM products p
        LEFT JOIN product_specs ps ON ps.product_code = p.product_code
        ${filters.clause}
        ORDER BY p.updated_at DESC, p.product_code DESC
        LIMIT ${limitParam} OFFSET ${offsetParam}
      `,
      listValues,
    ),
    pool.query(
      `
        SELECT COUNT(*)::integer AS total
        FROM products p
        ${filters.clause}
      `,
      filters.values,
    ),
  ]);

  return {
    items: itemsResult.rows.map((row) => ({
      code: String(row.product_code),
      name: row.product_name || "",
      cat: categoryLabel(row.part_type, row.category_group),
      catCode: row.part_type || row.category_group || "UNKNOWN",
      maker: row.maker || "",
      status: row.status || "",
      price: row.sale_price === null ? "" : `${Number(row.sale_price).toLocaleString("ko-KR")}원`,
      aiField: row.review_required_yn ? "검수필요" : row.spec_part_type ? "완료" : "일부누락",
    })),
    total: countResult.rows[0]?.total ?? 0,
    page,
    limit,
  };
}

export async function getAdminProduct(productCode) {
  const result = await pool.query(
    `
      SELECT
        p.product_code,
        p.model_name,
        p.product_name,
        p.maker,
        p.brand,
        p.status,
        p.sale_price,
        p.part_type,
        p.category_group,
        p.ai_candidate_yn,
        p.review_required_yn,
        p.review_reason,
        ps.socket,
        ps.chipset,
        ps.mem_type,
        ps.capacity_gb,
        ps.clock_mhz,
        ps.tdp_watt,
        ps.rated_watt,
        ps.required_power_watt,
        ps.length_mm,
        ps.gpu_max_mm,
        ps.cooler_height_mm,
        ps.cooler_tdp,
        ps.pcie_gen,
        ps.form_factor,
        ps.interface,
        ps.tag_white,
        ps.tag_rgb,
        ps.tag_silent
      FROM products p
      LEFT JOIN product_specs ps ON ps.product_code = p.product_code
      WHERE p.product_code = $1
    `,
    [productCode],
  );

  return mapDetailRow(result.rows[0]);
}

export async function updateAdminProduct(productCode, body) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const current = await client.query(
      "SELECT product_code FROM products WHERE product_code = $1 FOR UPDATE",
      [productCode],
    );

    if (current.rowCount === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    const productName = toNullableText(body.product_name);
    const partType = toNullableText(body.part_type) || "UNKNOWN";
    const categoryGroup = toNullableText(body.category_group) || "unknown";
    const spec = body.spec || {};

    await client.query(
      `
        UPDATE products
        SET
          product_name = $2,
          model_name = $3,
          maker = $4,
          brand = $5,
          status = $6,
          sale_price = $7,
          part_type = $8,
          category_group = $9,
          ai_candidate_yn = $10,
          review_required_yn = $11,
          review_reason = $12,
          updated_at = NOW()
        WHERE product_code = $1
      `,
      [
        productCode,
        productName,
        toNullableText(body.model_name),
        toNullableText(body.maker),
        toNullableText(body.brand),
        toNullableText(body.status) || "판매중",
        toNullableNumber(body.sale_price),
        partType,
        categoryGroup,
        toBoolean(body.ai_candidate_yn, true),
        toBoolean(body.review_required_yn, false),
        toNullableText(body.review_reason),
      ],
    );

    await client.query(
      `
        INSERT INTO product_specs (
          product_code,
          part_type,
          socket,
          chipset,
          mem_type,
          capacity_gb,
          clock_mhz,
          tdp_watt,
          rated_watt,
          required_power_watt,
          length_mm,
          gpu_max_mm,
          cooler_height_mm,
          cooler_tdp,
          pcie_gen,
          form_factor,
          interface,
          tag_white,
          tag_rgb,
          tag_silent,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, NOW())
        ON CONFLICT (product_code) DO UPDATE
        SET
          part_type = EXCLUDED.part_type,
          socket = EXCLUDED.socket,
          chipset = EXCLUDED.chipset,
          mem_type = EXCLUDED.mem_type,
          capacity_gb = EXCLUDED.capacity_gb,
          clock_mhz = EXCLUDED.clock_mhz,
          tdp_watt = EXCLUDED.tdp_watt,
          rated_watt = EXCLUDED.rated_watt,
          required_power_watt = EXCLUDED.required_power_watt,
          length_mm = EXCLUDED.length_mm,
          gpu_max_mm = EXCLUDED.gpu_max_mm,
          cooler_height_mm = EXCLUDED.cooler_height_mm,
          cooler_tdp = EXCLUDED.cooler_tdp,
          pcie_gen = EXCLUDED.pcie_gen,
          form_factor = EXCLUDED.form_factor,
          interface = EXCLUDED.interface,
          tag_white = EXCLUDED.tag_white,
          tag_rgb = EXCLUDED.tag_rgb,
          tag_silent = EXCLUDED.tag_silent,
          updated_at = NOW()
      `,
      [
        productCode,
        partType,
        toNullableText(spec.socket),
        toNullableText(spec.chipset),
        toNullableText(spec.mem_type),
        toNullableNumber(spec.capacity_gb),
        toNullableNumber(spec.clock_mhz),
        toNullableNumber(spec.tdp_watt),
        toNullableNumber(spec.rated_watt),
        toNullableNumber(spec.required_power_watt),
        toNullableNumber(spec.length_mm),
        toNullableNumber(spec.gpu_max_mm),
        toNullableNumber(spec.cooler_height_mm),
        toNullableNumber(spec.cooler_tdp),
        toNullableText(spec.pcie_gen),
        toNullableText(spec.form_factor),
        toNullableText(spec.interface),
        toBoolean(spec.tag_white, false),
        toBoolean(spec.tag_rgb, false),
        toBoolean(spec.tag_silent, false),
      ],
    );

    await client.query("COMMIT");
    return getAdminProduct(productCode);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function updateAdminProductStatus(productCode, status) {
  const result = await pool.query(
    `
      UPDATE products
      SET status = $2, updated_at = NOW()
      WHERE product_code = $1
      RETURNING product_code
    `,
    [productCode, toNullableText(status) || "품절"],
  );

  if (result.rowCount === 0) {
    return null;
  }

  return getAdminProduct(productCode);
}
