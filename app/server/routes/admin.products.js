import {
  getAdminProduct,
  listAdminProducts,
  listProductCategories,
  listProductMakers,
  updateAdminProduct,
  updateAdminProductStatus,
} from "../services/product.service.js";

function success(data, status = 200) {
  return {
    status,
    body: {
      success: true,
      data,
    },
  };
}

function failure(status, code, message) {
  return {
    status,
    body: {
      success: false,
      error: {
        code,
        message,
      },
    },
  };
}

function handleError(error) {
  console.error("[admin-products] DB request failed:", error);
  return failure(500, "DB_ERROR", "상품 DB 요청에 실패했습니다. PostgreSQL 연결 정보를 확인해주세요.");
}

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

    return success(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function handleAdminProductCategories() {
  try {
    return success(await listProductCategories());
  } catch (error) {
    return handleError(error);
  }
}

export async function handleAdminProductMakers() {
  try {
    return success(await listProductMakers());
  } catch (error) {
    return handleError(error);
  }
}

export async function handleAdminProductDetail(productCode) {
  try {
    const data = await getAdminProduct(productCode);

    if (!data) {
      return failure(404, "PRODUCT_NOT_FOUND", "상품을 찾을 수 없습니다.");
    }

    return success(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function handleAdminProductUpdate(productCode, body) {
  try {
    const data = await updateAdminProduct(productCode, body);

    if (!data) {
      return failure(404, "PRODUCT_NOT_FOUND", "상품을 찾을 수 없습니다.");
    }

    return success(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function handleAdminProductStatus(productCode, body) {
  try {
    const data = await updateAdminProductStatus(productCode, body.status);

    if (!data) {
      return failure(404, "PRODUCT_NOT_FOUND", "상품을 찾을 수 없습니다.");
    }

    return success(data);
  } catch (error) {
    return handleError(error);
  }
}
