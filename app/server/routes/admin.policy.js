import { listMarginPolicies, saveMarginPolicies } from "../services/policy.service.js";

function success(data, status = 200) {
  return {
    status,
    body: {
      success: true,
      data,
    },
  };
}

function failure(status, code, message) {
  return {
    status,
    body: {
      success: false,
      error: {
        code,
        message,
      },
    },
  };
}

function handleError(error) {
  console.error("[admin-policy] DB request failed:", error);
  return failure(500, "DB_ERROR", "가격 정책 DB 요청에 실패했습니다.");
}

export async function handleGetMarginPolicies() {
  try {
    return success(await listMarginPolicies());
  } catch (error) {
    return handleError(error);
  }
}

export async function handlePutMarginPolicies(body) {
  try {
    if (!Array.isArray(body.items)) {
      return failure(400, "VALIDATION_ERROR", "items 배열이 필요합니다.");
    }

    return success(await saveMarginPolicies(body.items));
  } catch (error) {
    return handleError(error);
  }
}
