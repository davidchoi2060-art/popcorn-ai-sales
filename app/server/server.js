import http from "node:http";
import {
  handleAdminProductCategories,
  handleAdminProductDetail,
  handleAdminProducts,
  handleAdminProductMakers,
  handleAdminProductStatus,
  handleAdminProductUpdate,
} from "./routes/admin.products.js";
import {
  handleAdminSourcingCandidates,
  handleAdminSourcingConfirm,
  handleAdminSourcingDelete,
  handleAdminSourcingList,
  handleAdminSourcingMatch,
  handleAdminSourcingParse,
  handleAdminSourcingUpdate,
} from "./routes/admin.sourcing.routes.js";
import {
  handleAdminOperatorAcceptInvite,
  handleAdminOperatorActivity,
  handleAdminOperatorInvite,
  handleAdminOperatorInviteCancel,
  handleAdminOperatorInviteResend,
  handleAdminOperatorLogin,
  handleAdminOperators,
  handleAdminOperatorStatus,
  handleAdminOperatorUpdate,
} from "./routes/admin.operators.routes.js";
import {
  handleAdminChangeRequestCreate,
  handleAdminChangeRequests,
  handleAdminChangeRequestStatus,
} from "./routes/admin.change-requests.routes.js";
import { handleGetMarginPolicies, handlePutMarginPolicies } from "./routes/admin.policy.js";
import { handleRecommend } from "./routes/recommend.js";
import { getDevHealth } from "./services/dev.service.js";

const PORT = Number(process.env.PORT || 3000);

function sendJson(response, status, body) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": process.env.CORS_ORIGIN || "http://127.0.0.1:5174",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Guest-UID",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  });
  response.end(JSON.stringify(body));
}

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

const server = http.createServer(async (request, response) => {
  try {
    if (request.method === "OPTIONS") {
      sendJson(response, 204, {});
      return;
    }

    const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);

    if (request.method === "GET" && url.pathname === "/api/dev/health") {
      const data = await getDevHealth();
      sendJson(response, 200, { success: true, data });
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/admin/products") {
      const result = await handleAdminProducts(url);
      sendJson(response, result.status, result.body);
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/admin/auth/login") {
      const body = await readJson(request);
      const result = await handleAdminOperatorLogin(request, body);
      sendJson(response, result.status, result.body);
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/admin/operators/invite/accept") {
      const body = await readJson(request);
      const result = await handleAdminOperatorAcceptInvite(body);
      sendJson(response, result.status, result.body);
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/admin/operators") {
      const result = await handleAdminOperators(request);
      sendJson(response, result.status, result.body);
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/admin/operators/activity") {
      const result = await handleAdminOperatorActivity(request);
      sendJson(response, result.status, result.body);
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/admin/operators/invite") {
      const body = await readJson(request);
      const result = await handleAdminOperatorInvite(request, body);
      sendJson(response, result.status, result.body);
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/admin/change-requests") {
      const result = await handleAdminChangeRequests(request);
      sendJson(response, result.status, result.body);
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/admin/change-requests") {
      const body = await readJson(request);
      const result = await handleAdminChangeRequestCreate(request, body);
      sendJson(response, result.status, result.body);
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/admin/sourcing") {
      const result = await handleAdminSourcingList(url);
      sendJson(response, result.status, result.body);
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/admin/sourcing/parse") {
      const body = await readJson(request);
      const result = await handleAdminSourcingParse(request, body);
      sendJson(response, result.status, result.body);
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/admin/sourcing/confirm") {
      const body = await readJson(request);
      const result = await handleAdminSourcingConfirm(body);
      sendJson(response, result.status, result.body);
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/admin/policy/margin") {
      const result = await handleGetMarginPolicies();
      sendJson(response, result.status, result.body);
      return;
    }

    if (request.method === "PUT" && url.pathname === "/api/admin/policy/margin") {
      const body = await readJson(request);
      const result = await handlePutMarginPolicies(body);
      sendJson(response, result.status, result.body);
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/admin/products/categories") {
      const result = await handleAdminProductCategories();
      sendJson(response, result.status, result.body);
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/admin/products/makers") {
      const result = await handleAdminProductMakers();
      sendJson(response, result.status, result.body);
      return;
    }

    const productMatch = url.pathname.match(/^\/api\/admin\/products\/([^/]+)$/);
    const productStatusMatch = url.pathname.match(/^\/api\/admin\/products\/([^/]+)\/status$/);
    const operatorMatch = url.pathname.match(/^\/api\/admin\/operators\/([^/]+)$/);
    const operatorStatusMatch = url.pathname.match(/^\/api\/admin\/operators\/([^/]+)\/status$/);
    const operatorInviteCancelMatch = url.pathname.match(/^\/api\/admin\/operators\/([^/]+)\/invite\/cancel$/);
    const operatorInviteResendMatch = url.pathname.match(/^\/api\/admin\/operators\/([^/]+)\/invite\/resend$/);
    const changeRequestStatusMatch = url.pathname.match(/^\/api\/admin\/change-requests\/([^/]+)\/status$/);
    const sourcingItemMatch = url.pathname.match(/^\/api\/admin\/sourcing\/([^/]+)$/);
    const sourcingCandidatesMatch = url.pathname.match(/^\/api\/admin\/sourcing\/([^/]+)\/candidates$/);
    const sourcingMatch = url.pathname.match(/^\/api\/admin\/sourcing\/([^/]+)\/match$/);

    if (request.method === "GET" && productMatch) {
      const result = await handleAdminProductDetail(decodeURIComponent(productMatch[1]));
      sendJson(response, result.status, result.body);
      return;
    }

    if (request.method === "PUT" && productMatch) {
      const body = await readJson(request);
      const result = await handleAdminProductUpdate(decodeURIComponent(productMatch[1]), body);
      sendJson(response, result.status, result.body);
      return;
    }

    if (request.method === "PUT" && productStatusMatch) {
      const body = await readJson(request);
      const result = await handleAdminProductStatus(decodeURIComponent(productStatusMatch[1]), body);
      sendJson(response, result.status, result.body);
      return;
    }

    if (request.method === "PUT" && operatorMatch) {
      const body = await readJson(request);
      const result = await handleAdminOperatorUpdate(request, decodeURIComponent(operatorMatch[1]), body);
      sendJson(response, result.status, result.body);
      return;
    }

    if (request.method === "PUT" && operatorStatusMatch) {
      const body = await readJson(request);
      const result = await handleAdminOperatorStatus(request, decodeURIComponent(operatorStatusMatch[1]), body);
      sendJson(response, result.status, result.body);
      return;
    }

    if (request.method === "PUT" && operatorInviteCancelMatch) {
      const result = await handleAdminOperatorInviteCancel(request, decodeURIComponent(operatorInviteCancelMatch[1]));
      sendJson(response, result.status, result.body);
      return;
    }

    if (request.method === "PUT" && operatorInviteResendMatch) {
      const result = await handleAdminOperatorInviteResend(request, decodeURIComponent(operatorInviteResendMatch[1]));
      sendJson(response, result.status, result.body);
      return;
    }

    if (request.method === "PUT" && changeRequestStatusMatch) {
      const body = await readJson(request);
      const result = await handleAdminChangeRequestStatus(request, decodeURIComponent(changeRequestStatusMatch[1]), body);
      sendJson(response, result.status, result.body);
      return;
    }

    if (request.method === "GET" && sourcingCandidatesMatch) {
      const result = await handleAdminSourcingCandidates(decodeURIComponent(sourcingCandidatesMatch[1]));
      sendJson(response, result.status, result.body);
      return;
    }

    if (request.method === "PUT" && sourcingMatch) {
      const body = await readJson(request);
      const result = await handleAdminSourcingMatch(decodeURIComponent(sourcingMatch[1]), body);
      sendJson(response, result.status, result.body);
      return;
    }

    if (request.method === "PUT" && sourcingItemMatch) {
      const body = await readJson(request);
      const result = await handleAdminSourcingUpdate(decodeURIComponent(sourcingItemMatch[1]), body);
      sendJson(response, result.status, result.body);
      return;
    }

    if (request.method === "DELETE" && sourcingItemMatch) {
      const result = await handleAdminSourcingDelete(decodeURIComponent(sourcingItemMatch[1]));
      sendJson(response, result.status, result.body);
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/recommend") {
      const body = await readJson(request);
      const result = await handleRecommend(request, body);
      sendJson(response, result.status, result.body);
      return;
    }

    sendJson(response, 404, {
      success: false,
      error: {
        code: "NOT_FOUND",
        message: "API route not found.",
      },
    });
  } catch (error) {
    console.error("[api] request failed:", error);
    sendJson(response, 500, {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Internal server error.",
      },
    });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.error(`popcorn-api listening on http://127.0.0.1:${PORT}`);
});
