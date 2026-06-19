import { apiPost, type ApiEnvelope } from "./client";

export type RecommendMode = "beginner" | "expert";

export type RecommendRequest = {
  mode: RecommendMode;
  raw_text: string;
  budget?: {
    min: number;
    max: number;
  };
  constraints?: Record<string, string | number | boolean>;
  use_mock: boolean;
};

export type RecommendSet = {
  type: "value" | "recommend" | "highend";
  total_price: number;
  ai_engine: "Gemini" | "ChatGPT" | "Claude" | string;
  components: Record<string, { code?: number; name?: string; price?: number }>;
  chart?: {
    fps?: Record<string, number>;
    price_ratio?: Record<string, number>;
  };
  mentoring_reason?: string;
};

export type RecommendResponse = {
  recommendation_id?: number;
  sets: RecommendSet[];
  suggestion?: string;
  meta?: {
    responded_models: string[];
    dropped_models: string[];
    elapsed_ms: number;
  };
};

export async function requestRecommendation(
  request: RecommendRequest,
): Promise<ApiEnvelope<RecommendResponse>> {
  return apiPost<RecommendResponse, RecommendRequest>("/api/recommend", request, { timeoutMs: 7000 });
}
