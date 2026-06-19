export function extractJsonObject(text) {
  const raw = String(text || "").trim();
  if (!raw) {
    throw new Error("Empty LLM response.");
  }

  try {
    return JSON.parse(raw);
  } catch {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
      throw new Error("LLM response does not contain JSON.");
    }
    return JSON.parse(raw.slice(start, end + 1));
  }
}
