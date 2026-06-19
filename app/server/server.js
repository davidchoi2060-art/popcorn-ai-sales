import http from "node:http";
import { handleAdminProducts } from "./routes/admin.products.js";
import { handleRecommend } from "./routes/recommend.js";

const PORT = Number(process.env.PORT || 3000);

function sendJson(response, status, body) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": process.env.CORS_ORIGIN || "http://127.0.0.1:5174",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Guest-UID",
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
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
      sendJson(response, 200, { success: true, data: { ok: true } });
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/admin/products") {
      const result = await handleAdminProducts(url);
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
