import { listAdminProducts } from "../services/product.service.js";

export async function handleAdminProducts(requestUrl) {
  try {
    const data = await listAdminProducts({
      category: requestUrl.searchParams.get("category") || "",
      status: requestUrl.searchParams.get("status") || "",
      maker: requestUrl.searchParams.get("maker") || "",
      keyword: requestUrl.searchParams.get("keyword") || "",
      page: requestUrl.searchParams.get("page") || "1",
      limit: requestUrl.searchParams.get("limit") || "50",
    });

    return {
      status: 200,
      body: {
        success: true,
        data,
      },
    };
  } catch (error) {
    console.error("[admin-products] DB request failed:", error);
    return {
      status: 500,
      body: {
        success: false,
        error: {
          code: "DB_ERROR",
          message: "상품 DB 연결에 실패했습니다. PostgreSQL 접속 정보를 확인해주세요.",
        },
      },
    };
  }
}
