import { pool } from "../db/pool.js";

async function measure(name, fn) {
  const startedAt = Date.now();
  try {
    const data = await fn();
    return {
      name,
      ok: true,
      latencyMs: Date.now() - startedAt,
      data,
    };
  } catch (error) {
    return {
      name,
      ok: false,
      latencyMs: Date.now() - startedAt,
      error: error.message,
    };
  }
}

export async function getDevHealth() {
  const [db, products, policies] = await Promise.all([
    measure("db", async () => {
      const result = await pool.query("SELECT NOW() AS now");
      return { now: result.rows[0]?.now };
    }),
    measure("products", async () => {
      const result = await pool.query(`
        SELECT
          COUNT(*)::integer AS total,
          COUNT(DISTINCT COALESCE(part_type, 'UNKNOWN'))::integer AS categories,
          COUNT(*) FILTER (WHERE COALESCE(part_type, 'UNKNOWN') = 'UNKNOWN')::integer AS unknown,
          COUNT(*) FILTER (WHERE review_required_yn = true)::integer AS review_required
        FROM products
      `);
      return result.rows[0];
    }),
    measure("policies", async () => {
      const result = await pool.query(`
        SELECT COUNT(*)::integer AS margin_policy_count
        FROM category_margin_policies
        WHERE active = true
      `);
      return result.rows[0];
    }),
  ]);

  return {
    ok: db.ok,
    api: {
      ok: true,
      node: process.version,
      port: Number(process.env.PORT || 3000),
      mockMode: process.env.USE_MOCK === "false" ? "real" : "mock",
      devToolsEnabled: process.env.DEV_TOOLS_ENABLED === "true",
    },
    db: {
      ok: db.ok,
      latencyMs: db.latencyMs,
      host: process.env.PGHOST || "100.123.164.85",
      port: Number(process.env.PGPORT || 5433),
      database: process.env.PGDATABASE || "popcorn_pc",
      error: db.ok ? null : db.error,
    },
    products,
    policies,
  };
}
