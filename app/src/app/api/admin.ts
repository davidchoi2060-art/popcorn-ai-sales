import { apiGet, apiPost, apiPut } from "./client";

export type AdminProductRow = {
  code: string;
  name: string;
  cat: string;
  catCode?: string;
  maker: string;
  status: string;
  price: string;
  aiField: string;
};

export type AdminProductsResponse = {
  items: AdminProductRow[];
  total: number;
  page: number;
  limit: number;
};

export type AdminProductCategoryOption = {
  value: string;
  label: string;
  group: string;
  groupLabel: string;
  count: number;
};

export type AdminProductMakerOption = {
  value: string;
  label: string;
  count: number;
};

export type AdminProductSpec = {
  socket: string;
  chipset: string;
  mem_type: string;
  capacity_gb: number | string;
  clock_mhz: number | string;
  tdp_watt: number | string;
  rated_watt: number | string;
  required_power_watt: number | string;
  length_mm: number | string;
  gpu_max_mm: number | string;
  cooler_height_mm: number | string;
  cooler_tdp: number | string;
  pcie_gen: string;
  form_factor: string;
  interface: string;
  tag_white: boolean;
  tag_rgb: boolean;
  tag_silent: boolean;
};

export type AdminProductDetail = {
  code: string;
  model_name: string;
  product_name: string;
  maker: string;
  brand: string;
  status: string;
  sale_price: number | string;
  part_type: string;
  category_group: string;
  ai_candidate_yn: boolean;
  review_required_yn: boolean;
  review_reason: string;
  spec: AdminProductSpec;
};

export type AdminProductUpdatePayload = Omit<AdminProductDetail, "code">;

export type AdminMarginPolicyRow = {
  category: string;
  categoryLabel: string;
  categoryGroup: string;
  productCount: number;
  sellingCount: number;
  purchaseCount: number;
  saleCount: number;
  zeroSaleCount: number;
  negativeSaleCount: number;
  avgPurchasePrice: number | null;
  avgMarketPrice: number | null;
  avgSalePrice: number | null;
  avgMarkupRate: number | null;
  baseMarginRate: number;
  extraMarginRate: number;
  targetMarginRate: number;
  suggestedSalePrice: number | null;
  previewDeltaRate: number | null;
  active: boolean;
  quality: string;
  updatedAt: string | null;
};

export type AdminMarginPoliciesResponse = {
  items: AdminMarginPolicyRow[];
  summary: {
    productCount: number;
    purchaseCount: number;
    saleCount: number;
    warningCount: number;
    purchaseCoverageRate: number;
    saleCoverageRate: number;
  };
};

export type DevHealthResponse = {
  ok: boolean;
  api: {
    ok: boolean;
    node: string;
    port: number;
    mockMode: "mock" | "real";
    devToolsEnabled: boolean;
  };
  db: {
    ok: boolean;
    latencyMs: number;
    host: string;
    port: number;
    database: string;
    error: string | null;
  };
  products: {
    ok: boolean;
    latencyMs: number;
    data?: {
      total: number;
      categories: number;
      unknown: number;
      review_required: number;
    };
    error?: string;
  };
  policies: {
    ok: boolean;
    latencyMs: number;
    data?: {
      margin_policy_count: number;
    };
    error?: string;
  };
};

export type AdminSourcingStatus = "매칭완료" | "후보복수" | "매칭필요" | "검토필요";

export type AdminSourcingCandidate = {
  productCode: string;
  productName: string;
  maker: string;
  partType?: string;
  score: number;
};

export type AdminSourcingItem = {
  id: string;
  recordedAt: string;
  productNameRaw: string;
  productNameNormalized: string;
  normalizedPartType: string;
  requestedQty: number;
  availableQty: number | null;
  unitPrice: number | null;
  bundlePrice: number | null;
  bundleQty: number | null;
  vatIncluded: "included" | "excluded" | "unknown";
  vendorName: string;
  contactName: string;
  matchStatus: AdminSourcingStatus;
  matchedProductCode: string | null;
  matchCandidates: AdminSourcingCandidate[];
  confidence: number;
};

export type AdminSourcingListResponse = {
  items: AdminSourcingItem[];
  total: number;
  page: number;
};

export type AdminSourcingParseResponse = {
  batch: {
    id: string;
    rawTextMasked: string;
    parsedAt: string;
    mode: "mock" | "real";
  };
  items: AdminSourcingItem[];
  warnings: string[];
};

export type AdminSourcingConfirmResponse = {
  inserted: number;
  updated: number;
  skipped: number;
};

export function fetchAdminProducts(params: {
  category?: string;
  status?: string;
  maker?: string;
  keyword?: string;
  page?: string;
  limit?: string;
}) {
  return apiGet<AdminProductsResponse>("/api/admin/products", {
    category: params.category || "",
    status: params.status || "",
    maker: params.maker || "",
    keyword: params.keyword || "",
    page: params.page || "1",
    limit: params.limit || "50",
  });
}

export function fetchAdminProductCategories() {
  return apiGet<{ items: AdminProductCategoryOption[] }>("/api/admin/products/categories");
}

export function fetchAdminProductMakers() {
  return apiGet<{ items: AdminProductMakerOption[] }>("/api/admin/products/makers");
}

export function fetchAdminProductDetail(code: string) {
  return apiGet<AdminProductDetail>(`/api/admin/products/${encodeURIComponent(code)}`);
}

export function updateAdminProduct(code: string, body: AdminProductUpdatePayload) {
  return apiPut<AdminProductDetail, AdminProductUpdatePayload>(`/api/admin/products/${encodeURIComponent(code)}`, body);
}

export function updateAdminProductStatus(code: string, status: string) {
  return apiPut<AdminProductDetail, { status: string }>(`/api/admin/products/${encodeURIComponent(code)}/status`, { status });
}

export function fetchAdminMarginPolicies() {
  return apiGet<AdminMarginPoliciesResponse>("/api/admin/policy/margin");
}

export function fetchAdminSourcing(params: {
  vendor?: string;
  category?: string;
  keyword?: string;
  matchStatus?: string;
  page?: string;
}) {
  return apiGet<AdminSourcingListResponse>("/api/admin/sourcing", {
    vendor: params.vendor || "",
    category: params.category || "",
    keyword: params.keyword || "",
    match_status: params.matchStatus || "",
    page: params.page || "1",
  });
}

export type AdminSourcingAiProvider = "openai" | "gemini";

export function parseAdminSourcing(rawText: string, options: { useMock?: boolean; provider?: AdminSourcingAiProvider } = {}) {
  const useMock = options.useMock ?? true;
  return apiPost<AdminSourcingParseResponse, { raw_text: string; use_mock: boolean; provider?: AdminSourcingAiProvider }>(
    "/api/admin/sourcing/parse",
    { raw_text: rawText, use_mock: useMock, provider: options.provider },
    { timeoutMs: 20000 },
  );
}

export function confirmAdminSourcing(batchId: string, items: AdminSourcingItem[]) {
  return apiPost<AdminSourcingConfirmResponse, { batch_id: string; items: AdminSourcingItem[] }>(
    "/api/admin/sourcing/confirm",
    { batch_id: batchId, items },
  );
}

export function updateAdminSourcingMatch(id: string, productCode: string) {
  return apiPut<AdminSourcingItem, { product_code: string; match_status: "matched" }>(
    `/api/admin/sourcing/${encodeURIComponent(id)}/match`,
    { product_code: productCode, match_status: "matched" },
  );
}

export function updateAdminMarginPolicies(items: Array<{
  category: string;
  baseMarginRate: number;
  extraMarginRate: number;
  active: boolean;
}>) {
  return apiPut<AdminMarginPoliciesResponse, { items: typeof items }>("/api/admin/policy/margin", { items });
}

export function fetchDevHealth() {
  return apiGet<DevHealthResponse>("/api/dev/health", {}, { timeoutMs: 5000 });
}
