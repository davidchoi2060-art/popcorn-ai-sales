import pg from "pg";

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.PGHOST || "100.123.164.85",
  port: Number(process.env.PGPORT || 5433),
  database: process.env.PGDATABASE || "popcorn_pc",
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "",
  max: Number(process.env.PGPOOL_MAX || 5),
  connectionTimeoutMillis: Number(process.env.PGCONNECT_TIMEOUT_MS || 5000),
  idleTimeoutMillis: Number(process.env.PGIDLE_TIMEOUT_MS || 10000),
});
