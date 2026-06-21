import { pool } from "../db/pool.js";

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

const DEFAULT_BASE_MARGIN = {
  GPU: 8,
  CPU: 8,
  MB: 12,
  RAM: 10,
  SSD: 10,
  HDD: 10,
  POWER: 15,
  CASE: 15,
  COOLER_CPU_AIR: 15,
  COOLER_CPU_AIO: 15,
  COOLER_SYSTEM: 18,
  COOLER_THERMAL: 18,
  MONITOR: 10,
  KEYBOARD: 18,
  MOUSE: 18,
  KEYBOARD_MOUSE_SET: 18,
  HEADSET: 18,
  SPEAKER: 18,
  NETWORK: 15,
  CABLE: 20,
  ACCESSORY: 20,
  ASSEMBLY_SERVICE: 0,
  PREBUILT_PC: 5,
  SOFTWARE: 0,
  INTERNAL: 0,
  UNKNOWN: 0,
};

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toInt(value) {
  return Number.parseInt(String(value ?? 0), 10) || 0;
}

function roundToHundred(value) {
  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }

  return Math.round(value / 100) * 100;
}

function labelFor(partType) {
  return PART_TYPE_LABELS[partType] || partType || "식별불가";
}

function qualityLabel(row) {
  const productCount = toInt(row.product_count);
  const purchaseCount = toInt(row.purchase_count);
  const saleCount = toInt(row.sale_count);
  const negativeSaleCount = toInt(row.negative_sale_count);

  if (row.part_type === "UNKNOWN") {
    return "검수필요";
  }

  if (productCount === 0 || saleCount === 0) {
    return "가격부족";
  }

  if (negativeSaleCount > 0) {
    return "이상치";
  }

  if (purchaseCount / productCount >= 0.7) {
    return "원가기준";
  }

  return "판매가기준";
}

function mapPolicyRow(row) {
  const avgPurchase = row.avg_purchase_price === null ? null : Number(row.avg_purchase_price);
  const avgSale = row.avg_sale_price === null ? null : Number(row.avg_sale_price);
  const baseMarginRate = toNumber(row.base_margin_rate ?? DEFAULT_BASE_MARGIN[row.part_type]);
  const extraMarginRate = toNumber(row.extra_margin_rate);
  const targetMarginRate = baseMarginRate + extraMarginRate;
  const suggestedSalePrice = avgPurchase === null ? null : roundToHundred(avgPurchase * (1 + targetMarginRate / 100));
  const avgMarkupRate = avgPurchase && avgSale
    ? Number((((avgSale - avgPurchase) / avgPurchase) * 100).toFixed(1))
    : null;
  const previewDeltaRate = avgSale && suggestedSalePrice
    ? Number((((suggestedSalePrice - avgSale) / avgSale) * 100).toFixed(1))
    : null;

  return {
    category: row.part_type,
    categoryLabel: labelFor(row.part_type),
    categoryGroup: row.category_group,
    productCount: toInt(row.product_count),
    sellingCount: toInt(row.selling_count),
    purchaseCount: toInt(row.purchase_count),
    saleCount: toInt(row.sale_count),
    zeroSaleCount: toInt(row.zero_sale_count),
    negativeSaleCount: toInt(row.negative_sale_count),
    avgPurchasePrice: avgPurchase,
    avgMarketPrice: row.avg_market_price === null ? null : Number(row.avg_market_price),
    avgSalePrice: avgSale,
    avgMarkupRate,
    baseMarginRate,
    extraMarginRate,
    targetMarginRate,
    suggestedSalePrice,
    previewDeltaRate,
    active: row.active ?? row.part_type !== "UNKNOWN",
    quality: qualityLabel(row),
    updatedAt: row.updated_at,
  };
}

export async function listMarginPolicies() {
  const result = await pool.query(`
    WITH product_summary AS (
      SELECT
        COALESCE(part_type, 'UNKNOWN') AS part_type,
        COALESCE(category_group, 'unknown') AS category_group,
        COUNT(*)::integer AS product_count,
        COUNT(*) FILTER (WHERE status = '판매중')::integer AS selling_count,
        COUNT(*) FILTER (WHERE purchase_price IS NOT NULL AND purchase_price > 0)::integer AS purchase_count,
        COUNT(*) FILTER (WHERE sale_price IS NOT NULL AND sale_price > 0)::integer AS sale_count,
        COUNT(*) FILTER (WHERE sale_price = 0)::integer AS zero_sale_count,
        COUNT(*) FILTER (WHERE sale_price < 0)::integer AS negative_sale_count,
        ROUND(AVG(NULLIF(purchase_price, 0)))::bigint AS avg_purchase_price,
        ROUND(AVG(NULLIF(market_price, 0)))::bigint AS avg_market_price,
        ROUND(AVG(NULLIF(sale_price, 0)))::bigint AS avg_sale_price
      FROM products
      GROUP BY COALESCE(part_type, 'UNKNOWN'), COALESCE(category_group, 'unknown')
    )
    SELECT
      ps.*,
      cmp.base_margin_rate,
      cmp.extra_margin_rate,
      cmp.active,
      cmp.updated_at
    FROM product_summary ps
    LEFT JOIN category_margin_policies cmp ON cmp.category2 = ps.part_type
    ORDER BY
      CASE ps.category_group
        WHEN 'core_part' THEN 1
        WHEN 'peripheral' THEN 2
        WHEN 'cable_accessory' THEN 3
        WHEN 'service' THEN 4
        WHEN 'prebuilt_pc' THEN 5
        WHEN 'software' THEN 6
        WHEN 'internal' THEN 7
        WHEN 'unknown' THEN 8
        ELSE 99
      END,
      ps.product_count DESC,
      ps.part_type ASC
  `);

  const items = result.rows.map(mapPolicyRow);
  const totals = items.reduce(
    (acc, item) => ({
      productCount: acc.productCount + item.productCount,
      purchaseCount: acc.purchaseCount + item.purchaseCount,
      saleCount: acc.saleCount + item.saleCount,
      warningCount: acc.warningCount + (item.quality === "원가기준" || item.quality === "판매가기준" ? 0 : 1),
    }),
    { productCount: 0, purchaseCount: 0, saleCount: 0, warningCount: 0 },
  );

  return {
    items,
    summary: {
      ...totals,
      purchaseCoverageRate: totals.productCount ? Number(((totals.purchaseCount / totals.productCount) * 100).toFixed(1)) : 0,
      saleCoverageRate: totals.productCount ? Number(((totals.saleCount / totals.productCount) * 100).toFixed(1)) : 0,
    },
  };
}

export async function saveMarginPolicies(items) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    for (const item of items) {
      const category = String(item.category || "").trim();
      if (!category) {
        continue;
      }

      await client.query(
        `
          INSERT INTO category_margin_policies (
            category2,
            base_margin_rate,
            extra_margin_rate,
            active,
            updated_at
          )
          VALUES ($1, $2, $3, $4, NOW())
          ON CONFLICT (category2) DO UPDATE
          SET
            base_margin_rate = EXCLUDED.base_margin_rate,
            extra_margin_rate = EXCLUDED.extra_margin_rate,
            active = EXCLUDED.active,
            updated_at = NOW()
        `,
        [
          category,
          toNumber(item.baseMarginRate, DEFAULT_BASE_MARGIN[category] || 0),
          toNumber(item.extraMarginRate, 0),
          Boolean(item.active),
        ],
      );
    }

    await client.query("COMMIT");
    return listMarginPolicies();
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
