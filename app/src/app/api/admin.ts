import { apiGet } from "./client";

export type AdminProductRow = {
  code: string;
  name: string;
  cat: string;
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
