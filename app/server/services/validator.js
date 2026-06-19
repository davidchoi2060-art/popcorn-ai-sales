const VALID_SET_TYPES = new Set(["value", "recommend", "highend"]);

export function validateRecommendationPayload(payload) {
  if (!payload || !Array.isArray(payload.sets)) {
    return { valid: false, code: "VALIDATION_ERROR", message: "추천 응답 구조가 올바르지 않습니다." };
  }

  const validSets = payload.sets.filter((set) => (
    set &&
    VALID_SET_TYPES.has(set.type) &&
    Number.isFinite(set.total_price) &&
    set.components &&
    typeof set.components === "object"
  ));

  if (validSets.length === 0) {
    return { valid: false, code: "NO_CANDIDATE", message: "추천 후보가 없습니다." };
  }

  return {
    valid: true,
    data: {
      ...payload,
      sets: validSets,
    },
  };
}
