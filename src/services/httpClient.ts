export interface RetryRequestOptions {
  timeoutMs?: number;
  retryCount?: number;
  retryDelayMs?: number;
}

const DEFAULT_TIMEOUT_MS = 15000;
const DEFAULT_RETRY_COUNT = 1;
const DEFAULT_RETRY_DELAY_MS = 600;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function isRetryableStatus(status: number): boolean {
  return status >= 500 || status === 429;
}

export async function fetchWithRetry(
  input: RequestInfo | URL,
  init: RequestInit,
  options?: RetryRequestOptions,
): Promise<Response> {
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const retryCount = options?.retryCount ?? DEFAULT_RETRY_COUNT;
  const retryDelayMs = options?.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS;

  for (let attempt = 0; attempt <= retryCount; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(input, {
        ...init,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (response.ok || attempt === retryCount || !isRetryableStatus(response.status)) {
        return response;
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (attempt === retryCount) {
        throw error;
      }
    }

    await wait(retryDelayMs * (attempt + 1));
  }

  throw new Error("네트워크 요청에 실패했습니다.");
}
