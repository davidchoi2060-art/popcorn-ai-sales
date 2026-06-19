import { extractJsonObject } from "./json.js";
import { readProviderError } from "./http-error.js";

export async function callOpenAI({ prompt, signal }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-5.2",
      input: [
        {
          role: "system",
          content: "Return only a JSON object matching the requested PC recommendation schema.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(await readProviderError(response, "OpenAI"));
  }

  const payload = await response.json();
  const text = payload.output_text || payload.output?.flatMap((item) => item.content || []).map((part) => part.text || "").join("") || "";
  return {
    ai_engine: "ChatGPT",
    ...extractJsonObject(text),
  };
}
