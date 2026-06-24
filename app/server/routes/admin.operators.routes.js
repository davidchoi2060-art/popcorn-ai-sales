import {
  acceptOperatorInvite,
  inviteOperator,
  listOperatorActivity,
  listOperators,
  loginOperator,
  updateOperator,
  updateOperatorStatus,
  verifyAdminToken,
} from "../services/operator.service.js";

function success(data, status = 200) {
  return { status, body: { success: true, data } };
}

function failure(status, code, message) {
  return { status, body: { success: false, error: { code, message } } };
}

function authToken(request) {
  const header = request.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice(7) : "";
}

async function requireAdmin(request) {
  const operator = await verifyAdminToken(authToken(request));
  if (!operator) {
    const error = new Error("UNAUTHORIZED");
    error.status = 401;
    error.message = "운영자 로그인이 필요합니다.";
    throw error;
  }
  return { ...operator, ip: request.socket?.remoteAddress || "" };
}

function handleError(error) {
  if (error.status) {
    return failure(error.status, error.message === "운영자 로그인이 필요합니다." ? "UNAUTHORIZED" : error.message === "초대 링크가 만료되었거나 유효하지 않습니다." ? "INVALID_INVITE" : "VALIDATION_ERROR", error.message);
  }
  console.error("[admin-operators] request failed:", error);
  return failure(500, "DB_ERROR", "운영자 DB 요청에 실패했습니다.");
}

export async function handleAdminOperatorLogin(request, body) {
  try {
    return success(await loginOperator(body, { ip: request.socket?.remoteAddress || "" }));
  } catch (error) {
    return handleError(error);
  }
}

export async function handleAdminOperatorAcceptInvite(body) {
  try {
    return success(await acceptOperatorInvite(body));
  } catch (error) {
    return handleError(error);
  }
}

export async function handleAdminOperators(request) {
  try {
    await requireAdmin(request);
    return success(await listOperators());
  } catch (error) {
    return handleError(error);
  }
}

export async function handleAdminOperatorActivity(request) {
  try {
    await requireAdmin(request);
    return success(await listOperatorActivity());
  } catch (error) {
    return handleError(error);
  }
}

export async function handleAdminOperatorInvite(request, body) {
  try {
    const actor = await requireAdmin(request);
    const origin = request.headers.origin || request.headers.referer?.replace(/\/[^/]*$/, "") || "";
    return success(await inviteOperator(body, { ip: actor.ip, origin }), 201);
  } catch (error) {
    return handleError(error);
  }
}

export async function handleAdminOperatorUpdate(request, operatorId, body) {
  try {
    const actor = await requireAdmin(request);
    const data = await updateOperator(operatorId, body, actor);
    return data ? success(data) : failure(404, "OPERATOR_NOT_FOUND", "운영자를 찾을 수 없습니다.");
  } catch (error) {
    return handleError(error);
  }
}

export async function handleAdminOperatorStatus(request, operatorId, body) {
  try {
    const actor = await requireAdmin(request);
    const data = await updateOperatorStatus(operatorId, body.status, actor);
    return data ? success(data) : failure(404, "OPERATOR_NOT_FOUND", "운영자를 찾을 수 없습니다.");
  } catch (error) {
    return handleError(error);
  }
}
