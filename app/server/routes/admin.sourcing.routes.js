import { resolveRequestIdentity } from "../middlewares/auth.js";
import { parseSourcingWithLlm } from "../llm/sourcing-parser.js";
import { maskPii } from "../middlewares/pii-mask.js";
import { checkCostGuard } from "../services/cost-guard.js";
import { checkRateLimit } from "../services/rate-limiter.js";
import { parseMockSourcingText, validateParsedSourcing } from "../services/sourcing-parser.service.js";
import { createSourcingBatch, deleteSourcingItem, listSourcingItems, saveSourcingItems, updateSourcingItem } from "../services/sourcing.service.js";
import { enrichSourcingItemsWithMaster, listSourcingCandidates, updateSourcingMatch } from "../services/sourcing-match.service.js";

function success(data, status = 200) {
  return { status, body: { success: true, data } };
}

function failure(status, code, message) {
  return { status, body: { success: false, error: { code, message } } };
}

function guardExternalCost(request) {
  const rate = checkRateLimit(resolveRequestIdentity(request));
  if (!rate.allowed) return failure(429, rate.code, rate.message);

  const cost = checkCostGuard();
  if (!cost.allowed) return failure(503, cost.code, cost.message);

  return null;
}

export async function handleAdminSourcingList(requestUrl) {
  return success(await listSourcingItems({
    vendor: requestUrl.searchParams.get("vendor") || "",
    category: requestUrl.searchParams.get("category") || "",
    keyword: requestUrl.searchParams.get("keyword") || "",
    matchStatus: requestUrl.searchParams.get("match_status") || "",
    page: requestUrl.searchParams.get("page") || "1",
  }));
}

export async function handleAdminSourcingParse(request, body) {
  const guarded = guardExternalCost(request);
  if (guarded) return guarded;

  if (!body || typeof body.raw_text !== "string" || !body.raw_text.trim()) {
    return failure(400, "VALIDATION_ERROR", "원문 텍스트가 필요합니다.");
  }

  if (body.use_mock === false) {
    const provider = body.provider === "gemini" ? "gemini" : "openai";
    const llmResult = await parseSourcingWithLlm(maskPii(body.raw_text), provider);
    if (!llmResult.success) {
      return failure(502, llmResult.error.code, llmResult.error.message);
    }
    const validated = validateParsedSourcing(llmResult.data);
    if (!validated.valid) {
      return failure(400, validated.code, validated.message);
    }
    const rawTextMasked = maskPii(body.raw_text);
    const batch = await createSourcingBatch({
      rawText: body.raw_text,
      rawTextMasked,
      parserMode: "real",
    });

    return success({
      batch,
      items: await enrichSourcingItemsWithMaster(llmResult.data.items),
      warnings: llmResult.data.warnings,
    });
  }

  const parsed = parseMockSourcingText(body.raw_text);
  const validated = validateParsedSourcing(parsed);
  if (!validated.valid) {
    return failure(400, validated.code, validated.message);
  }
  const rawTextMasked = maskPii(body.raw_text);
  const batch = await createSourcingBatch({
    rawText: body.raw_text,
    rawTextMasked,
    parserMode: "mock",
  });

  return success({
    batch,
    items: await enrichSourcingItemsWithMaster(parsed.items),
    warnings: parsed.warnings,
  });
}

export async function handleAdminSourcingConfirm(body) {
  if (!body || typeof body.batch_id !== "string" || !Array.isArray(body.items)) {
    return failure(400, "VALIDATION_ERROR", "확정 저장할 소싱 항목이 필요합니다.");
  }

  const validated = validateParsedSourcing({ items: body.items });
  if (!validated.valid) {
    return failure(400, validated.code, validated.message);
  }

  return success(await saveSourcingItems(body.batch_id, body.items));
}

export async function handleAdminSourcingCandidates(id) {
  const data = await listSourcingCandidates(id);
  if (!data) return failure(404, "SOURCING_NOT_FOUND", "소싱 항목을 찾을 수 없습니다.");
  return success(data);
}

export async function handleAdminSourcingMatch(id, body) {
  if (!body || !body.product_code) {
    return failure(400, "VALIDATION_ERROR", "매칭할 상품 코드가 필요합니다.");
  }

  const data = await updateSourcingMatch(id, body.product_code);
  if (!data) return failure(404, "SOURCING_NOT_FOUND", "소싱 항목을 찾을 수 없습니다.");
  return success(data);
}

export async function handleAdminSourcingUpdate(id, body) {
  if (!body || typeof body !== "object") {
    return failure(400, "VALIDATION_ERROR", "수정할 소싱 항목이 필요합니다.");
  }

  const data = await updateSourcingItem(id, body);
  if (!data) return failure(404, "SOURCING_NOT_FOUND", "소싱 항목을 찾을 수 없습니다.");
  return success(data);
}

export async function handleAdminSourcingDelete(id) {
  const deleted = await deleteSourcingItem(id);
  if (!deleted) return failure(404, "SOURCING_NOT_FOUND", "소싱 항목을 찾을 수 없습니다.");
  return success({ deleted: true });
}
