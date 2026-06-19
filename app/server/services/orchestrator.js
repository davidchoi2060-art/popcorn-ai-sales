import { callGemini } from "../llm/gemini.js";
import { callOpenAI } from "../llm/openai.js";
import { callClaude } from "../llm/claude.js";

function normalizeSet(result, type) {
  return {
    type,
    total_price: Number(result.total_estimated_price || result.total_price || 0),
    ai_engine: result.ai_engine || "Unknown",
    components: {
      cpu: { name: result.recommended_components?.cpu || result.components?.cpu?.name || "" },
      gpu: { name: result.recommended_components?.gpu || result.components?.gpu?.name || "" },
      ram: { name: result.recommended_components?.ram || result.components?.ram?.name || "" },
      ssd: { name: result.recommended_components?.ssd || result.components?.ssd?.name || "" },
      mb: result.components?.mb || {},
      power: result.components?.power || {},
      case: result.components?.case || {},
    },
    chart: result.chart || {
      fps: { fhd: 144, qhd: 90 },
      price_ratio: { cpu_gpu: 55, mem_storage: 20, etc: 25 },
    },
    mentoring_reason: result.ai_mentoring_reason || result.mentoring_reason || "",
  };
}

function buildPrompt({ mode, rawText, constraints }) {
  return [
    `mode: ${mode}`,
    `user_request: ${rawText}`,
    `constraints: ${JSON.stringify(constraints || {})}`,
    "Return JSON only with fields: ai_engine, recommended_components, total_estimated_price, ai_mentoring_reason.",
  ].join("\n");
}

export async function orchestrateRecommendation({ mode, rawText, constraints }) {
  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);
  const prompt = buildPrompt({ mode, rawText, constraints });

  try {
    const calls = [
      ["gemini", callGemini({ prompt, signal: controller.signal })],
      ["chatgpt", callOpenAI({ prompt, signal: controller.signal })],
      ["claude", callClaude({ prompt, signal: controller.signal })],
    ];

    const results = await Promise.allSettled(calls.map(([, promise]) => promise));
    const responded = [];
    const dropped = [];
    const sets = [];

    results.forEach((result, index) => {
      const modelName = calls[index][0];
      if (result.status === "fulfilled") {
        try {
          sets.push(normalizeSet(result.value, index === 0 ? "value" : index === 1 ? "highend" : "recommend"));
          responded.push(modelName);
        } catch {
          dropped.push(modelName);
        }
      } else {
        console.error(`[recommend] ${modelName} dropped: ${result.reason?.message || "unknown error"}`);
        dropped.push(modelName);
      }
    });

    if (sets.length === 0) {
      return {
        success: false,
        error: {
          code: "LLM_ALL_FAILED",
          message: "잠시 후 다시 시도해 주세요.",
        },
      };
    }

    return {
      success: true,
      data: {
        recommendation_id: Date.now(),
        sets,
        meta: {
          responded_models: responded,
          dropped_models: dropped,
          elapsed_ms: Date.now() - startedAt,
        },
      },
    };
  } finally {
    clearTimeout(timeout);
  }
}
