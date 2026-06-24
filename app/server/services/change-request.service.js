import { pool } from "../db/pool.js";
import { logOperatorActivity } from "./operator.service.js";

const STATUSES = new Set(["등록", "접수", "처리중", "완료", "보류", "폐기"]);

function validationError(message) {
  const error = new Error("VALIDATION_ERROR");
  error.status = 400;
  error.message = message;
  return error;
}

function mapRequest(row) {
  return {
    id: Number(row.request_id),
    content: row.content,
    status: row.status,
    registrantName: row.created_by_name,
    registrantEmail: row.created_by_email,
    createdAt: row.created_at ? new Date(row.created_at).toLocaleString("ko-KR") : "",
    updatedAt: row.updated_at ? new Date(row.updated_at).toLocaleString("ko-KR") : "",
  };
}

export async function listChangeRequests() {
  const { rows } = await pool.query(
    `SELECT request_id, content, status, created_by_name, created_by_email, created_at, updated_at
     FROM admin_change_requests
     ORDER BY created_at DESC, request_id DESC
     LIMIT 200`,
  );
  return { items: rows.map(mapRequest) };
}

export async function createChangeRequest({ content }, actor) {
  const cleanContent = String(content || "").trim();
  if (cleanContent.length < 5) {
    throw validationError("변경요청사항을 5자 이상 입력해주세요.");
  }
  if (cleanContent.length > 2000) {
    throw validationError("변경요청사항은 2000자 이하로 입력해주세요.");
  }

  const { rows } = await pool.query(
    `INSERT INTO admin_change_requests (
       content, status, created_by_operator_id, created_by_name, created_by_email, updated_at
     )
     VALUES ($1, '등록', $2, $3, $4, now())
     RETURNING request_id, content, status, created_by_name, created_by_email, created_at, updated_at`,
    [cleanContent, actor.operator_id, actor.name, actor.email],
  );
  await logOperatorActivity({
    operatorId: actor.operator_id,
    action: "변경요청 등록",
    detail: cleanContent.slice(0, 80),
    ip: actor.ip || "",
  });
  return mapRequest(rows[0]);
}

export async function updateChangeRequestStatus(requestId, status, actor) {
  if (!STATUSES.has(status)) {
    throw validationError("변경할 수 없는 처리상태입니다.");
  }

  const { rows } = await pool.query(
    `UPDATE admin_change_requests
     SET status = $1, updated_at = now()
     WHERE request_id = $2
     RETURNING request_id, content, status, created_by_name, created_by_email, created_at, updated_at`,
    [status, requestId],
  );
  if (!rows[0]) return null;

  await logOperatorActivity({
    operatorId: actor.operator_id,
    action: "변경요청 상태 변경",
    detail: `#${requestId} → ${status}`,
    ip: actor.ip || "",
  });
  return mapRequest(rows[0]);
}
