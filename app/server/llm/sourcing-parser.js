import { readProviderError } from "./http-error.js";

const SOURCING_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["items", "warnings"],
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "product_name_raw",
          "product_name_normalized",
          "normalized_part_type",
          "requested_qty",
          "available_qty",
          "unit_price",
          "bundle_price",
          "bundle_qty",
          "vat_included",
          "vendor_name",
          "contact_name",
          "recorded_at",
          "match_status",
          "confidence",
        ],
        properties: {
          product_name_raw: { type: "string" },
          product_name_normalized: { type: "string" },
          normalized_part_type: { type: "string", enum: ["CPU", "GPU", "MB", "RAM", "SSD", "POWER", "CASE", "COOLER", "UNKNOWN"] },
          requested_qty: { type: "integer" },
          available_qty: { type: "integer" },
          unit_price: { type: "integer" },
          bundle_price: { type: "integer" },
          bundle_qty: { type: "integer" },
          vat_included: { type: "string", enum: ["included", "excluded", "unknown"] },
          vendor_name: { type: "string" },
          contact_name: { type: "string" },
          recorded_at: { type: "string" },
          match_status: { type: "string", enum: ["매칭필요", "검토필요"] },
          confidence: { type: "number" },
        },
      },
    },
    warnings: {
      type: "array",
      items: { type: "string" },
    },
  },
};

function buildPrompt(rawText) {
  return [
    "너는 팝콘PC 관리자 제품 소싱 정제 엔진이다.",
    "거래처 메신저, 문자, 이메일 원문에서 제품 소싱 항목을 추출한다.",
    "반드시 스키마에 맞는 JSON만 반환한다.",
    "JSON 최상위는 items 배열과 warnings 배열만 가진다.",
    "items 각 항목은 product_name_raw, product_name_normalized, normalized_part_type, requested_qty, available_qty, unit_price, bundle_price, bundle_qty, vat_included, vendor_name, contact_name, recorded_at, match_status, confidence를 가진다.",
    "숫자 필드는 알 수 없으면 0을 넣고, 문자열 필드는 알 수 없으면 빈 문자열을 넣는다.",
    "VAT는 포함이면 included, 별도면 excluded, 불명확하면 unknown이다.",
    "recorded_at은 원문에 시간이 있으면 그 시간, 없으면 현재 한국시간 기준 ISO 유사 문자열로 둔다.",
    "상품 마스터 매칭은 서버가 별도로 수행하므로 match_status는 매칭필요 또는 검토필요만 사용한다.",
    "",
    "[원문]",
    rawText,
  ].join("\n");
}

function buildGeminiPrompt(rawText) {
  return [
    "Extract PC sourcing rows from the text.",
    "Return minified JSON only. Top keys: items,warnings.",
    "Item keys exactly: product_name_raw,product_name_normalized,normalized_part_type,requested_qty,available_qty,unit_price,bundle_price,bundle_qty,vat_included,vendor_name,contact_name,recorded_at,match_status,confidence.",
    "Rules: EA count is quantity. Prices after product lines map in order. If unknown use 0 or ''. B760M=MB. M.2 NVMe=SSD. VAT unknown unless stated. match_status='매칭필요'.",
    "Text:",
    rawText,
  ].join("\n");
}

function extractOutputText(payload) {
  if (payload.output_text) return payload.output_text;
  return payload.output?.flatMap((item) => item.content || []).map((part) => part.text || "").join("") || "";
}

function normalizePartType(value) {
  const normalized = String(value || "").trim().toUpperCase();
  const aliases = {
    MAINBOARD: "MB",
    MOTHERBOARD: "MB",
    BOARD: "MB",
    VGA: "GPU",
    GRAPHIC: "GPU",
    MEMORY: "RAM",
    NVME: "SSD",
    LAN: "UNKNOWN",
    NETWORK: "UNKNOWN",
    "랜카드": "UNKNOWN",
  };
  const candidate = aliases[normalized] || aliases[String(value || "").trim()] || normalized;
  return ["CPU", "GPU", "MB", "RAM", "SSD", "POWER", "CASE", "COOLER", "UNKNOWN"].includes(candidate)
    ? candidate
    : "UNKNOWN";
}

function toClientItem(item, index) {
  return {
    id: `src-${Date.now()}-${index}`,
    recordedAt: item.recorded_at || new Date().toISOString().slice(0, 16).replace("T", " "),
    productNameRaw: item.product_name_raw || "",
    productNameNormalized: item.product_name_normalized || item.product_name_raw || "",
    normalizedPartType: normalizePartType(item.normalized_part_type),
    requestedQty: Number(item.requested_qty || 0),
    availableQty: Number(item.available_qty || 0),
    unitPrice: Number(item.unit_price || 0),
    bundlePrice: Number(item.bundle_price || 0),
    bundleQty: Number(item.bundle_qty || 0),
    vatIncluded: item.vat_included || "unknown",
    vendorName: item.vendor_name || "",
    contactName: item.contact_name || "",
    matchStatus: item.match_status || "매칭필요",
    matchedProductCode: null,
    matchCandidates: [],
    confidence: Number(item.confidence || 0),
  };
}

async function callOpenAISourcing(rawText, signal) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_SOURCING_MODEL || "gpt-5.4-mini",
      input: buildPrompt(rawText),
      text: {
        format: {
          type: "json_schema",
          name: "product_sourcing_parse",
          strict: true,
          schema: SOURCING_SCHEMA,
        },
      },
      store: false,
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(await readProviderError(response, "OpenAI"));
  }

  const payload = await response.json();
  const parsed = JSON.parse(extractOutputText(payload));
  return {
    batch: {
      id: `batch-${Date.now()}`,
      parsedAt: new Date().toISOString(),
      mode: "real",
    },
    items: (parsed.items || []).map(toClientItem),
    warnings: parsed.warnings || [],
  };
}

async function callGeminiSourcing(rawText, signal, model) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: {
      "x-goog-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: buildGeminiPrompt(rawText) },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(await readProviderError(response, "Gemini"));
  }

  const payload = await response.json();
  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("") || "";
  const parsed = JSON.parse(text);
  return {
    batch: {
      id: `batch-${Date.now()}`,
      parsedAt: new Date().toISOString(),
      mode: "real",
    },
    items: (parsed.items || []).map(toClientItem),
    warnings: parsed.warnings || [],
  };
}

export async function parseSourcingWithLlm(rawText, provider = "openai") {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);

  try {
    const geminiModel = process.env.GEMINI_SOURCING_MODEL || process.env.GEMINI_MODEL || "gemini-3.5-flash";
    const geminiFallbackModel = process.env.GEMINI_SOURCING_FALLBACK_MODEL || "gemini-3.1-flash-lite";
    const calls = provider === "gemini"
      ? [
          [`gemini:${geminiModel}`, callGeminiSourcing(rawText, controller.signal, geminiModel)],
          ...(geminiFallbackModel && geminiFallbackModel !== geminiModel
            ? [[`gemini:${geminiFallbackModel}`, callGeminiSourcing(rawText, controller.signal, geminiFallbackModel)]]
            : []),
        ]
      : [["openai", callOpenAISourcing(rawText, controller.signal)]];
    const results = await Promise.allSettled(calls.map(([, promise]) => promise));

    for (const result of results) {
      if (result.status === "fulfilled") {
        return {
          success: true,
          data: result.value,
        };
      }
    }

    return {
      success: false,
      error: {
        code: "LLM_ALL_FAILED",
        message: results[0]?.reason?.message || "제품 소싱 AI 정제에 실패했습니다.",
      },
    };
  } finally {
    clearTimeout(timeout);
  }
}
