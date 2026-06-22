import { pool } from "../db/pool.js";
import { findSourcingItem, updateSourcingItem } from "./sourcing.service.js";

function normalizeKeyword(text = "") {
  return String(text)
    .replace(/[()[\],._/-]+/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3)
    .slice(0, 8);
}

export async function findMasterCandidatesForSourcingItem(item) {
  const tokens = normalizeKeyword(`${item.productNameNormalized} ${item.productNameRaw}`);
  const values = [];
  const where = ["p.status <> '삭제대기'"];

  if (item.normalizedPartType && item.normalizedPartType !== "UNKNOWN") {
    values.push(item.normalizedPartType);
    where.push(`p.part_type = $${values.length}`);
  }

  if (tokens.length > 0) {
    const tokenConditions = tokens.map((token) => {
      values.push(`%${token}%`);
      return `(p.product_name ILIKE $${values.length} OR p.model_name ILIKE $${values.length})`;
    });
    where.push(`(${tokenConditions.join(" OR ")})`);
  }

  const exactText = `%${item.productNameNormalized || item.productNameRaw || ""}%`;
  const result = await pool.query(
    `
      SELECT
        p.product_code,
        p.product_name,
        p.model_name,
        p.maker,
        p.part_type,
        (
          CASE WHEN p.product_name ILIKE $${values.length + 1} THEN 0.55 ELSE 0 END +
          CASE WHEN p.model_name ILIKE $${values.length + 1} THEN 0.45 ELSE 0 END +
          CASE WHEN p.part_type = $${values.length + 2} THEN 0.20 ELSE 0 END
        ) AS score
      FROM products p
      WHERE ${where.join(" AND ")}
      ORDER BY score DESC, p.updated_at DESC, p.product_code DESC
      LIMIT 5
    `,
    [...values, exactText, item.normalizedPartType || "UNKNOWN"],
  );

  return result.rows.map((row) => ({
    productCode: String(row.product_code),
    productName: row.product_name || row.model_name || "",
    maker: row.maker || "",
    partType: row.part_type || "UNKNOWN",
    score: Number(row.score || 0),
  }));
}

export async function enrichSourcingItemsWithMaster(items = []) {
  const enriched = [];

  for (const item of items) {
    const candidates = await findMasterCandidatesForSourcingItem(item);
    const top = candidates[0];

    if (!top) {
      enriched.push({
        ...item,
        matchStatus: "매칭필요",
        matchCandidates: [],
      });
      continue;
    }

    const strongMatch = top.score >= 0.75;
    enriched.push({
      ...item,
      productNameNormalized: strongMatch ? top.productName : item.productNameNormalized,
      normalizedPartType: strongMatch ? top.partType : item.normalizedPartType || "UNKNOWN",
      matchedProductCode: strongMatch ? top.productCode : null,
      matchStatus: strongMatch ? "매칭완료" : candidates.length > 1 ? "후보복수" : "검토필요",
      matchCandidates: candidates,
    });
  }

  return enriched;
}

export async function updateSourcingMatch(id, productCode) {
  const item = await findSourcingItem(id);
  if (!item) return null;

  const candidate = item.matchCandidates.find(c => c.productCode === String(productCode));
  const product = await pool.query(
    "SELECT product_code, product_name, maker, part_type FROM products WHERE product_code = $1",
    [productCode],
  );
  const productRow = product.rows[0];
  const nextItem = {
    ...item,
    matchedProductCode: String(productCode),
    productNameNormalized: productRow?.product_name || candidate?.productName || item.productNameNormalized,
    normalizedPartType: productRow?.part_type || candidate?.partType || item.normalizedPartType,
    matchStatus: "매칭완료",
    matchCandidates: candidate ? [candidate] : item.matchCandidates,
  };

  return updateSourcingItem(id, nextItem);
}

export async function listSourcingCandidates(id) {
  const item = await findSourcingItem(id);
  return item ? { items: item.matchCandidates } : null;
}
