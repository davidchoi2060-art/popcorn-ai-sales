import { extractJsonObject } from "./json.js";
import { readProviderError } from "./http-error.js";

export async function callClaude({ prompt, signal }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured.");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6",
      max_tokens: 1200,
      system: "Return only a JSON object matching the requested PC recommendation schema.",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(await readProviderError(response, "Claude"));
  }

  const payload = await response.json();
  const text = payload.content?.map((part) => part.text || "").join("") || "";
  return {
    ai_engine: "Claude",
    ...extractJsonObject(text),
  };
}
