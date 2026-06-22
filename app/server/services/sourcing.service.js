import crypto from "node:crypto";
import { pool } from "../db/pool.js";

function toNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toDate(value) {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function mapCandidate(row) {
  return {
    productCode: row.product_code === null || row.product_code === undefined ? "" : String(row.product_code),
    productName: row.product_name || "",
    maker: row.maker || "",
    score: Number(row.score || 0),
  };
}

function mapQuote(row) {
  return {
    id: String(row.quote_id),
    recordedAt: row.recorded_at ? new Date(row.recorded_at).toISOString().slice(0, 16).replace("T", " ") : "",
    productNameRaw: row.product_name_raw || "",
    productNameNormalized: row.product_name_normalized || "",
    normalizedPartType: row.normalized_part_type || "",
    requestedQty: Number(row.requested_qty || 0),
    availableQty: row.available_qty === null ? null : Number(row.available_qty),
    unitPrice: row.unit_price === null ? null : Number(row.unit_price),
    bundlePrice: row.bundle_price === null ? null : Number(row.bundle_price),
    bundleQty: row.bundle_qty === null ? null : Number(row.bundle_qty),
    vatIncluded: row.vat_included || "unknown",
    vendorName: row.vendor_name || "",
    contactName: row.contact_name || "",
    matchStatus: row.match_status || "매칭필요",
    matchedProductCode: row.matched_product_code === null || row.matched_product_code === undefined ? null : String(row.matched_product_code),
    matchCandidates: Array.isArray(row.match_candidates) ? row.match_candidates.map(mapCandidate) : [],
    confidence: Number(row.confidence || 0),
  };
}

function buildFilters(query) {
  const where = ["q.deleted_at IS NULL"];
  const values = [];

  const add = (sql, value) => {
    values.push(value);
    where.push(sql.replace("?", `$${values.length}`));
  };

  if (query.vendor) {
    add("q.vendor_name ILIKE ?", `%${String(query.vendor).trim()}%`);
  }

  if (query.category) {
    add("q.normalized_part_type = ?", String(query.category).trim());
  }

  if (query.keyword) {
    values.push(`%${String(query.keyword).trim()}%`);
    const param = `$${values.length}`;
    where.push(`(q.product_name_raw ILIKE ${param} OR q.product_name_normalized ILIKE ${param})`);
  }

  if (query.matchStatus) {
    add("q.match_status = ?", String(query.matchStatus).trim());
  }

  return { clause: `WHERE ${where.join(" AND ")}`, values };
}

export async function listSourcingItems({ vendor = "", category = "", keyword = "", matchStatus = "", page = "1" }) {
  const pageNumber = Math.max(1, Number(page) || 1);
  const limit = 50;
  const offset = (pageNumber - 1) * limit;
  const filters = buildFilters({ vendor, category, keyword, matchStatus });
  const limitParam = `$${filters.values.length + 1}`;
  const offsetParam = `$${filters.values.length + 2}`;

  const [itemsResult, countResult] = await Promise.all([
    pool.query(
      `
        SELECT
          q.*,
          COALESCE(
            json_agg(
              json_build_object(
                'product_code', c.product_code,
                'product_name', c.product_name,
                'maker', c.maker,
                'score', c.score
              )
              ORDER BY c.score DESC
            ) FILTER (WHERE c.candidate_id IS NOT NULL),
            '[]'::json
          ) AS match_candidates
        FROM product_sourcing_quotes q
        LEFT JOIN product_sourcing_match_candidates c ON c.quote_id = q.quote_id
        ${filters.clause}
        GROUP BY q.quote_id
        ORDER BY q.recorded_at DESC, q.quote_id DESC
        LIMIT ${limitParam} OFFSET ${offsetParam}
      `,
      [...filters.values, limit, offset],
    ),
    pool.query(
      `
        SELECT COUNT(*)::integer AS total
        FROM product_sourcing_quotes q
        ${filters.clause}
      `,
      filters.values,
    ),
  ]);

  return {
    items: itemsResult.rows.map(mapQuote),
    total: countResult.rows[0]?.total ?? 0,
    page: pageNumber,
  };
}

export async function createSourcingBatch({ rawText, rawTextMasked, parserMode = "mock", createdBy = "" }) {
  const rawTextHash = crypto.createHash("sha256").update(rawText || "").digest("hex");
  const result = await pool.query(
    `
      INSERT INTO sourcing_batches (raw_text, raw_text_masked, raw_text_hash, parser_mode, parse_status, created_by)
      VALUES ($1, $2, $3, $4, 'parsed', $5)
      RETURNING batch_id, raw_text_masked, parser_mode, parse_status, created_at
    `,
    [rawText || "", rawTextMasked || "", rawTextHash, parserMode, createdBy || null],
  );

  return {
    id: String(result.rows[0].batch_id),
    rawTextMasked: result.rows[0].raw_text_masked,
    parsedAt: result.rows[0].created_at,
    mode: result.rows[0].parser_mode,
  };
}

export async function saveSourcingItems(batchId, items = []) {
  const client = await pool.connect();
  let inserted = 0;
  let updated = 0;

  try {
    await client.query("BEGIN");

    for (const item of items) {
      const existingId = Number(item.id);
      const matchedProductCode = toNumber(item.matchedProductCode);
      const matchedProductExists = matchedProductCode
        ? await client.query("SELECT 1 FROM products WHERE product_code = $1", [matchedProductCode])
        : null;
      const quoteValues = [
        Number(batchId) || null,
        item.productNameRaw,
        item.productNameNormalized,
        item.normalizedPartType || "UNKNOWN",
        Math.max(1, Number(item.requestedQty) || 1),
        toNumber(item.availableQty),
        toNumber(item.unitPrice),
        toNumber(item.bundlePrice),
        toNumber(item.bundleQty),
        item.vatIncluded || "unknown",
        item.vendorName || null,
        item.contactName || null,
        toDate(item.recordedAt),
        item.matchStatus || "매칭필요",
        matchedProductExists?.rowCount ? matchedProductCode : null,
        toNumber(item.confidence),
      ];

      let quoteId = existingId;
      if (existingId) {
        const result = await client.query(
          `
            UPDATE product_sourcing_quotes
            SET
              batch_id = $1,
              product_name_raw = $2,
              product_name_normalized = $3,
              normalized_part_type = $4,
              requested_qty = $5,
              available_qty = $6,
              unit_price = $7,
              bundle_price = $8,
              bundle_qty = $9,
              vat_included = $10,
              vendor_name = $11,
              contact_name = $12,
              recorded_at = $13,
              match_status = $14,
              matched_product_code = $15,
              confidence = $16,
              updated_at = now()
            WHERE quote_id = $17
            RETURNING quote_id
          `,
          [...quoteValues, existingId],
        );

        if (result.rowCount > 0) {
          updated += 1;
          quoteId = Number(result.rows[0].quote_id);
        }
      }

      if (!quoteId || !existingId) {
        const result = await client.query(
          `
            INSERT INTO product_sourcing_quotes (
              batch_id, product_name_raw, product_name_normalized, normalized_part_type,
              requested_qty, available_qty, unit_price, bundle_price, bundle_qty,
              vat_included, vendor_name, contact_name, recorded_at, match_status,
              matched_product_code, confidence
            )
            VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8,
              $9, $10, $11, $12, $13, $14, $15, $16
            )
            RETURNING quote_id
          `,
          quoteValues,
        );
        inserted += 1;
        quoteId = Number(result.rows[0].quote_id);
      }

      await client.query("DELETE FROM product_sourcing_match_candidates WHERE quote_id = $1", [quoteId]);

      for (const candidate of item.matchCandidates || []) {
        const candidateCode = toNumber(candidate.productCode);
        const candidateExists = candidateCode
          ? await client.query("SELECT 1 FROM products WHERE product_code = $1", [candidateCode])
          : null;
        await client.query(
          `
            INSERT INTO product_sourcing_match_candidates (quote_id, product_code, product_name, maker, score)
            VALUES ($1, $2, $3, $4, $5)
          `,
          [
            quoteId,
            candidateExists?.rowCount ? candidateCode : null,
            candidate.productName || "",
            candidate.maker || null,
            toNumber(candidate.score) || 0,
          ],
        );
      }
    }

    if (batchId) {
      await client.query("UPDATE sourcing_batches SET parse_status = 'confirmed' WHERE batch_id = $1", [batchId]);
    }

    await client.query("COMMIT");
    return { inserted, updated, skipped: 0 };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function findSourcingItem(id) {
  const result = await pool.query(
    `
      SELECT
        q.*,
        COALESCE(
          json_agg(
            json_build_object(
              'product_code', c.product_code,
              'product_name', c.product_name,
              'maker', c.maker,
              'score', c.score
            )
            ORDER BY c.score DESC
          ) FILTER (WHERE c.candidate_id IS NOT NULL),
          '[]'::json
        ) AS match_candidates
      FROM product_sourcing_quotes q
      LEFT JOIN product_sourcing_match_candidates c ON c.quote_id = q.quote_id
      WHERE q.quote_id = $1 AND q.deleted_at IS NULL
      GROUP BY q.quote_id
    `,
    [id],
  );

  return result.rows[0] ? mapQuote(result.rows[0]) : null;
}

export async function updateSourcingItem(id, patch = {}) {
  const current = await findSourcingItem(id);
  if (!current) return null;

  await saveSourcingItems(null, [{ ...current, ...patch, id }]);
  return findSourcingItem(id);
}

export async function deleteSourcingItem(id) {
  const result = await pool.query(
    "UPDATE product_sourcing_quotes SET deleted_at = now(), updated_at = now() WHERE quote_id = $1 AND deleted_at IS NULL",
    [id],
  );

  return result.rowCount > 0;
}
