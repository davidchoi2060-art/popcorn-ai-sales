import { resolveRequestIdentity } from "../middlewares/auth.js";
import { maskPii } from "../middlewares/pii-mask.js";
import { checkRateLimit } from "../services/rate-limiter.js";
import { checkCostGuard } from "../services/cost-guard.js";
import { orchestrateRecommendation } from "../services/orchestrator.js";
import { validateRecommendationPayload } from "../services/validator.js";
import { getMockRecommendation } from "../llm/mock.js";

function failure(code, message) {
  return {
    status: code === "RATE_LIMIT_EXCEEDED" ? 429 : code === "COST_CIRCUIT_OPEN" ? 503 : code === "LLM_ALL_FAILED" ? 502 : 400,
    body: {
      success: false,
      error: { code, message },
    },
  };
}

export async function handleRecommend(request, body) {
  const identity = resolveRequestIdentity(request);
  const rate = checkRateLimit(identity);
  if (!rate.allowed) {
    return failure(rate.code, rate.message);
  }

  const cost = checkCostGuard();
  if (!cost.allowed) {
    return failure(cost.code, cost.message);
  }

  if (!body || (body.mode !== "beginner" && body.mode !== "expert") || typeof body.raw_text !== "string") {
    return failure("VALIDATION_ERROR", "필수값이 누락되었습니다.");
  }

  if (body.use_mock !== false) {
    return {
      status: 200,
      body: {
        success: true,
        data: getMockRecommendation({ mode: body.mode }),
      },
    };
  }

  const maskedText = maskPii(body.raw_text);
  const orchestrated = await orchestrateRecommendation({
    mode: body.mode,
    rawText: maskedText,
    constraints: body.constraints,
  });

  if (!orchestrated.success) {
    return failure(orchestrated.error.code, orchestrated.error.message);
  }

  const validated = validateRecommendationPayload(orchestrated.data);
  if (!validated.valid) {
    if (validated.code === "NO_CANDIDATE") {
      return {
        status: 200,
        body: {
          success: true,
          data: {
            sets: [],
            suggestion: "예산을 10만원 상향하면 후보가 생깁니다.",
          },
        },
      };
    }
    return failure(validated.code, validated.message);
  }

  return {
    status: 200,
    body: {
      success: true,
      data: validated.data,
    },
  };
}
