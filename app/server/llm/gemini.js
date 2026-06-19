import { extractJsonObject } from "./json.js";
import { readProviderError } from "./http-error.js";

export async function callGemini({ prompt, signal }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash";
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: {
      "x-goog-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `Return only a JSON object matching the requested PC recommendation schema.\n\n${prompt}`,
            },
          ],
        },
      ],
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(await readProviderError(response, "Gemini"));
  }

  const payload = await response.json();
  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("") || "";
  return {
    ai_engine: "Gemini",
    ...extractJsonObject(text),
  };
}
