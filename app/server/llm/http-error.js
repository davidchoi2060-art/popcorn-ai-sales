function redactSecrets(text) {
  return String(text)
    .replace(/sk-ant-[A-Za-z0-9_-]+/g, "sk-ant-***")
    .replace(/sk-proj-[A-Za-z0-9_-]+/g, "sk-proj-***")
    .replace(/sk-[A-Za-z0-9_-]{20,}/g, "sk-***")
    .replace(/AIza[A-Za-z0-9_-]+/g, "AIza***");
}

export async function readProviderError(response, provider) {
  const text = await response.text().catch(() => "");
  if (!text) {
    return `${provider} request failed: ${response.status}`;
  }

  try {
    const payload = JSON.parse(text);
    const message =
      payload.error?.message ||
      payload.error?.status ||
      payload.message ||
      text.slice(0, 300);
    return redactSecrets(`${provider} request failed: ${response.status} ${message}`);
  } catch {
    return redactSecrets(`${provider} request failed: ${response.status} ${text.slice(0, 300)}`);
  }
}
