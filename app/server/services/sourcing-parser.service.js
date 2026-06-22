export function parseMockSourcingText(rawText = "") {
  const now = new Date();
  const recordedAt = now.toISOString().slice(0, 16).replace("T", " ");
  const lower = String(rawText).toLowerCase();
  const isMemory = lower.includes("ddr") || lower.includes("ram") || lower.includes("메모리");
  const isCpu = lower.includes("cpu") || lower.includes("ryzen") || lower.includes("라이젠") || lower.includes("i5");

  const item = isMemory
    ? {
        productNameRaw: "삼성 DDR5 16G 2장",
        productNameNormalized: "Samsung DDR5 32GB Kit",
        normalizedPartType: "RAM",
        requestedQty: 20,
        availableQty: 20,
        unitPrice: 118000,
        bundlePrice: 118000,
        bundleQty: 2,
        vatIncluded: "included",
        vendorName: "메모리월드",
        contactName: "박팀장",
        matchStatus: "매칭완료",
        matchedProductCode: "305112",
        matchCandidates: [
          { productCode: "305112", productName: "Samsung DDR5 16GB PC5-44800 x2", maker: "Samsung", score: 0.96 },
        ],
        confidence: 0.94,
      }
    : isCpu
      ? {
          productNameRaw: "라이젠 7500F 벌크",
          productNameNormalized: "AMD Ryzen 5 7500F",
          normalizedPartType: "CPU",
          requestedQty: 8,
          availableQty: 5,
          unitPrice: 188000,
          bundlePrice: null,
          bundleQty: null,
          vatIncluded: "unknown",
          vendorName: "CPU코리아",
          contactName: "이과장",
          matchStatus: "매칭필요",
          matchedProductCode: null,
          matchCandidates: [],
          confidence: 0.82,
        }
      : {
          productNameRaw: "RTX4070 super 갤럭시 3팬",
          productNameNormalized: "GALAX RTX 4070 SUPER 3FAN",
          normalizedPartType: "GPU",
          requestedQty: 10,
          availableQty: 6,
          unitPrice: 748000,
          bundlePrice: null,
          bundleQty: null,
          vatIncluded: "excluded",
          vendorName: "컴포유통",
          contactName: "김대리",
          matchStatus: "후보복수",
          matchedProductCode: null,
          matchCandidates: [
            { productCode: "204455", productName: "GALAX RTX 4070 SUPER EX GAMER", maker: "GALAX", score: 0.92 },
            { productCode: "204456", productName: "GALAX RTX 4070 SUPER 2X", maker: "GALAX", score: 0.84 },
          ],
          confidence: 0.91,
        };

  return {
    batch: {
      id: `batch-${Date.now()}`,
      parsedAt: now.toISOString(),
      mode: "mock",
    },
    items: [
      {
        id: `src-${Date.now()}`,
        recordedAt,
        ...item,
      },
    ],
    warnings: ["Mock Mode ON: 외부 LLM을 호출하지 않았습니다."],
  };
}

export function validateParsedSourcing(payload) {
  const items = Array.isArray(payload?.items) ? payload.items : [];
  const valid = items.every(item =>
    item.productNameRaw &&
    item.productNameNormalized &&
    item.recordedAt
  );

  return {
    valid,
    code: valid ? "" : "VALIDATION_ERROR",
    message: valid ? "" : "제품명 또는 기록일시가 누락되었습니다.",
  };
}
