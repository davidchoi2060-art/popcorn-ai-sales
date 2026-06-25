import crypto from "node:crypto";
import { pool } from "../db/pool.js";

const ROLES = new Set(["슈퍼관리자", "관리자", "MD", "분석담당", "읽기전용"]);
const STATUSES = new Set(["활성", "비활성", "초대중"]);

function base64url(input) {
  return Buffer.from(input).toString("base64url");
}

function sign(payload) {
  const secret = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || "popcorn-dev-admin-secret";
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored?.startsWith("scrypt:")) return false;
  const [, salt, expected] = stored.split(":");
  const actual = hashPassword(password, salt).split(":")[2];
  return crypto.timingSafeEqual(Buffer.from(actual, "hex"), Buffer.from(expected, "hex"));
}

function createJwt(operator) {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64url(JSON.stringify({
    sub: String(operator.operator_id),
    email: operator.email,
    role: operator.role,
    name: operator.name,
    typ: "admin",
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
  }));
  const unsigned = `${header}.${payload}`;
  return `${unsigned}.${sign(unsigned)}`;
}

function parseJwt(token) {
  const [header, payload, signature] = token.split(".");
  if (!header || !payload || !signature) return null;
  const unsigned = `${header}.${payload}`;
  if (signature !== sign(unsigned)) return null;
  const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  if (data.exp && data.exp < Math.floor(Date.now() / 1000)) return null;
  return data;
}

export async function verifyAdminToken(token) {
  const data = parseJwt(token || "");
  if (!data?.sub || data.typ !== "admin") return null;
  const { rows } = await pool.query(
    `SELECT operator_id, name, email, role, status
     FROM admin_operators
     WHERE operator_id = $1 AND status = '활성'`,
    [data.sub],
  );
  return rows[0] || null;
}

function mapOperator(row) {
  return {
    id: Number(row.operator_id),
    name: row.name,
    email: row.email,
    role: row.role,
    status: row.status,
    memo: row.memo || "",
    lastLogin: row.last_login_at ? new Date(row.last_login_at).toLocaleString("ko-KR") : "-",
    createdAt: row.created_at ? new Date(row.created_at).toISOString().slice(0, 10) : "",
    acceptedAt: row.accepted_at,
    inviteExpiresAt: row.invite_expires_at,
  };
}

function mapActivity(row) {
  return {
    id: Number(row.activity_id),
    operatorId: row.operator_id === null ? null : Number(row.operator_id),
    name: row.name || "시스템",
    action: row.action,
    detail: row.detail || "",
    ip: row.ip_masked || "",
    time: row.created_at ? new Date(row.created_at).toLocaleString("ko-KR") : "",
  };
}

function maskedIp(requestIp = "") {
  return String(requestIp).replace(/\d+$/, "***");
}

export async function logOperatorActivity({ operatorId = null, action, detail = "", ip = "" }) {
  await pool.query(
    `INSERT INTO admin_operator_activity_logs (operator_id, action, detail, ip_masked)
     VALUES ($1, $2, $3, $4)`,
    [operatorId, action, detail, maskedIp(ip)],
  );
}

export async function listOperators() {
  const { rows } = await pool.query(
    `SELECT operator_id, name, email, role, status, memo, last_login_at, created_at, accepted_at, invite_expires_at
     FROM admin_operators
     ORDER BY created_at DESC, operator_id DESC`,
  );
  return { items: rows.map(mapOperator) };
}

export async function listOperatorActivity() {
  const { rows } = await pool.query(
    `SELECT l.activity_id, l.operator_id, o.name, l.action, l.detail, l.ip_masked, l.created_at
     FROM admin_operator_activity_logs l
     LEFT JOIN admin_operators o ON o.operator_id = l.operator_id
     ORDER BY l.created_at DESC
     LIMIT 100`,
  );
  return { items: rows.map(mapActivity) };
}

export async function inviteOperator({ email, role, memo }, { ip = "", origin = "" } = {}) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    const error = new Error("VALIDATION_ERROR");
    error.status = 400;
    error.message = "유효한 이메일 주소를 입력해 주세요.";
    throw error;
  }
  if (!ROLES.has(role) || role === "슈퍼관리자") {
    const error = new Error("VALIDATION_ERROR");
    error.status = 400;
    error.message = "초대할 수 없는 역할입니다.";
    throw error;
  }

  const token = crypto.randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
  const name = "(초대중)";
  const { rows } = await pool.query(
    `INSERT INTO admin_operators (name, email, role, status, memo, invite_token_hash, invite_expires_at, updated_at)
     VALUES ($1, $2, $3, '초대중', $4, $5, $6, now())
     ON CONFLICT (email) DO UPDATE SET
       role = EXCLUDED.role,
       status = '초대중',
       memo = EXCLUDED.memo,
       invite_token_hash = EXCLUDED.invite_token_hash,
       invite_expires_at = EXCLUDED.invite_expires_at,
       updated_at = now()
     RETURNING operator_id, name, email, role, status, memo, last_login_at, created_at, accepted_at, invite_expires_at`,
    [name, cleanEmail, role, memo || null, tokenHash, expires],
  );
  await logOperatorActivity({ operatorId: rows[0].operator_id, action: "운영자 초대", detail: cleanEmail, ip });
  const inviteUrl = `${origin || "http://127.0.0.1:5173"}/?operator_invite=${encodeURIComponent(token)}`;
  return { operator: mapOperator(rows[0]), inviteUrl, expiresAt: expires.toISOString() };
}

export async function acceptOperatorInvite({ token, password, name }) {
  const cleanToken = String(token || "").trim();
  const cleanPassword = String(password || "");
  const cleanName = String(name || "").trim() || "운영자";
  if (!cleanToken || cleanPassword.length < 8) {
    const error = new Error("VALIDATION_ERROR");
    error.status = 400;
    error.message = "초대 토큰과 8자 이상 비밀번호가 필요합니다.";
    throw error;
  }
  const { rows } = await pool.query(
    `UPDATE admin_operators
     SET name = $1,
         status = '활성',
         password_hash = $2,
         invite_token_hash = NULL,
         invite_expires_at = NULL,
         accepted_at = now(),
         updated_at = now()
     WHERE invite_token_hash = $3
       AND status = '초대중'
       AND invite_expires_at > now()
     RETURNING operator_id, name, email, role, status, memo, last_login_at, created_at, accepted_at, invite_expires_at`,
    [cleanName, hashPassword(cleanPassword), hashToken(cleanToken)],
  );
  if (!rows[0]) {
    const error = new Error("INVALID_INVITE");
    error.status = 400;
    error.message = "초대 링크가 만료되었거나 유효하지 않습니다.";
    throw error;
  }
  await logOperatorActivity({ operatorId: rows[0].operator_id, action: "초대 수락", detail: rows[0].email });
  const tokenValue = createJwt(rows[0]);
  return { operator: mapOperator(rows[0]), token: tokenValue };
}

export async function loginOperator({ email, password }, { ip = "" } = {}) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  const cleanPassword = String(password || "");
  const { rows } = await pool.query(
    `SELECT operator_id, name, email, role, status, password_hash
     FROM admin_operators
     WHERE email = $1`,
    [cleanEmail],
  );
  let row = rows[0];
  if (!row) {
    const countResult = await pool.query(`SELECT COUNT(*)::int AS count FROM admin_operators`);
    if (countResult.rows[0]?.count === 0 && cleanEmail && cleanPassword.length >= 8) {
      const created = await pool.query(
        `INSERT INTO admin_operators (name, email, role, status, password_hash, accepted_at, updated_at)
         VALUES ($1, $2, '슈퍼관리자', '활성', $3, now(), now())
         RETURNING operator_id, name, email, role, status, password_hash`,
        ["초기 관리자", cleanEmail, hashPassword(cleanPassword)],
      );
      row = created.rows[0];
      await logOperatorActivity({ operatorId: row.operator_id, action: "초기 슈퍼관리자 생성", detail: row.email, ip });
    }
  }
  if (!row || row.status !== "활성" || !verifyPassword(String(password || ""), row.password_hash)) {
    const error = new Error("UNAUTHORIZED");
    error.status = 401;
    error.message = "운영자 로그인 정보가 올바르지 않습니다.";
    throw error;
  }
  await pool.query(`UPDATE admin_operators SET last_login_at = now(), updated_at = now() WHERE operator_id = $1`, [row.operator_id]);
  await logOperatorActivity({ operatorId: row.operator_id, action: "운영자 로그인", detail: row.email, ip });
  return { operator: mapOperator({ ...row, last_login_at: new Date(), memo: "", created_at: new Date() }), token: createJwt(row) };
}

export async function updateOperator(operatorId, { role, memo }, actor = {}) {
  if (!ROLES.has(role) || role === "슈퍼관리자") {
    const error = new Error("VALIDATION_ERROR");
    error.status = 400;
    error.message = "변경할 수 없는 역할입니다.";
    throw error;
  }
  const { rows } = await pool.query(
    `UPDATE admin_operators
     SET role = $1, memo = $2, updated_at = now()
     WHERE operator_id = $3 AND role <> '슈퍼관리자'
     RETURNING operator_id, name, email, role, status, memo, last_login_at, created_at, accepted_at, invite_expires_at`,
    [role, memo || null, operatorId],
  );
  if (!rows[0]) return null;
  await logOperatorActivity({ operatorId: actor.operator_id || null, action: "권한 변경", detail: `${rows[0].email} → ${role}`, ip: actor.ip || "" });
  return mapOperator(rows[0]);
}

export async function updateOperatorStatus(operatorId, status, actor = {}) {
  if (!STATUSES.has(status) || status === "초대중") {
    const error = new Error("VALIDATION_ERROR");
    error.status = 400;
    error.message = "변경할 수 없는 상태입니다.";
    throw error;
  }
  const { rows } = await pool.query(
    `UPDATE admin_operators
     SET status = $1, updated_at = now()
     WHERE operator_id = $2 AND role <> '슈퍼관리자'
     RETURNING operator_id, name, email, role, status, memo, last_login_at, created_at, accepted_at, invite_expires_at`,
    [status, operatorId],
  );
  if (!rows[0]) return null;
  await logOperatorActivity({ operatorId: actor.operator_id || null, action: "운영자 상태 변경", detail: `${rows[0].email} → ${status}`, ip: actor.ip || "" });
  return mapOperator(rows[0]);
}

export async function cancelOperatorInvite(operatorId, actor = {}) {
  // 한 번도 가입하지 않은 초대 레코드이므로 행을 삭제한다.
  // 활동 로그의 operator_id 는 ON DELETE SET NULL 로 보존되며, 취소 자체는 관리자(actor) 명의로 기록한다.
  const { rows } = await pool.query(
    `DELETE FROM admin_operators
     WHERE operator_id = $1
       AND status = '초대중'
       AND role <> '슈퍼관리자'
     RETURNING operator_id, name, email, role, status, memo, last_login_at, created_at, accepted_at, invite_expires_at`,
    [operatorId],
  );
  if (!rows[0]) return null;
  await logOperatorActivity({ operatorId: actor.operator_id || null, action: "운영자 초대 취소", detail: rows[0].email, ip: actor.ip || "" });
  return mapOperator(rows[0]);
}

export async function resendOperatorInvite(operatorId, { ip = "", origin = "" } = {}) {
  const token = crypto.randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
  const { rows } = await pool.query(
    `UPDATE admin_operators
     SET invite_token_hash = $1,
         invite_expires_at = $2,
         updated_at = now()
     WHERE operator_id = $3
       AND status = '초대중'
       AND role <> '슈퍼관리자'
     RETURNING operator_id, name, email, role, status, memo, last_login_at, created_at, accepted_at, invite_expires_at`,
    [tokenHash, expires, operatorId],
  );
  if (!rows[0]) return null;
  await logOperatorActivity({ operatorId: rows[0].operator_id, action: "운영자 초대 재발송", detail: rows[0].email, ip });
  const inviteUrl = `${origin || "http://127.0.0.1:5173"}/?operator_invite=${encodeURIComponent(token)}`;
  return { operator: mapOperator(rows[0]), inviteUrl, expiresAt: expires.toISOString() };
}
