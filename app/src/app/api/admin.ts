import { apiGet, apiPut } from "./client";

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

export function updateAdminMarginPolicies(items: Array<{
  category: string;
  baseMarginRate: number;
  extraMarginRate: number;
  active: boolean;
}>) {
  return apiPut<AdminMarginPoliciesResponse, { items: typeof items }>("/api/admin/policy/margin", { items });
}
