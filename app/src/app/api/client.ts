export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiFailure = {
  success: false;
  error: {
    code: string;
    message: string;
  };
};

export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;

export async function apiGet<TData>(
  path: string,
  params: Record<string, string> = {},
  options: { timeoutMs?: number } = {},
): Promise<ApiEnvelope<TData>> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), options.timeoutMs ?? 7000);
  const url = new URL(path, window.location.origin);

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });

  try {
    const response = await fetch(`${url.pathname}${url.search}`, {
      method: "GET",
      signal: controller.signal,
    });

    const payload = await response.json().catch(() => null);

    if (payload?.success === true || payload?.success === false) {
      return payload as ApiEnvelope<TData>;
    }

    return {
      success: false,
      error: {
        code: response.ok ? "INVALID_RESPONSE" : `HTTP_${response.status}`,
        message: "API response format is invalid.",
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: error instanceof DOMException && error.name === "AbortError" ? "TIMEOUT" : "NETWORK_ERROR",
        message: "API server is not reachable.",
      },
    };
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function apiPost<TData, TBody>(
  path: string,
  body: TBody,
  options: { timeoutMs?: number } = {},
): Promise<ApiEnvelope<TData>> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), options.timeoutMs ?? 7000);

  try {
    const response = await fetch(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const payload = await response.json().catch(() => null);

    if (payload?.success === true || payload?.success === false) {
      return payload as ApiEnvelope<TData>;
    }

    return {
      success: false,
      error: {
        code: response.ok ? "INVALID_RESPONSE" : `HTTP_${response.status}`,
        message: "API response format is invalid.",
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: error instanceof DOMException && error.name === "AbortError" ? "TIMEOUT" : "NETWORK_ERROR",
        message: "API server is not reachable.",
      },
    };
  } finally {
    window.clearTimeout(timeout);
  }
}
