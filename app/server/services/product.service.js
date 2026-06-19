import { pool } from "../db/pool.js";

const VALID_LIMITS = new Set([10, 20, 50, 100]);

function toPositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function buildProductFilters(query) {
  const where = [];
  const values = [];

  const add = (sql, value) => {
    values.push(value);
    where.push(sql.replace("?", `$${values.length}`));
  };

  if (query.category) {
    add("p.category2 = ?", query.category);
  }

  if (query.status) {
    add("p.status = ?", query.status);
  }

  if (query.maker) {
    add("p.maker = ?", query.maker);
  }

  if (query.keyword) {
    values.push(`%${query.keyword}%`);
    const param = `$${values.length}`;
    where.push(`(p.product_name ILIKE ${param} OR p.product_code::text ILIKE ${param})`);
  }

  return {
    clause: where.length ? `WHERE ${where.join(" AND ")}` : "",
    values,
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
          p.category2,
          p.maker,
          p.status,
          p.member_price,
          ps.part_type,
          ps.socket,
          ps.chipset,
          ps.tdp_watt,
          ps.rated_watt,
          ps.length_mm
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
      cat: row.category2 || "",
      maker: row.maker || "",
      status: row.status || "",
      price: row.member_price === null ? "" : `${Number(row.member_price).toLocaleString("ko-KR")}원`,
      aiField: row.part_type ? "완료" : "일부누락",
    })),
    total: countResult.rows[0]?.total ?? 0,
    page,
    limit,
  };
}
