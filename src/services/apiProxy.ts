import { fetchWithRetry } from "./httpClient";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const PROXY_TOKEN = process.env.EXPO_PUBLIC_PROXY_TOKEN;

function getProxyBaseUrl(): string {
  if (!API_BASE_URL?.trim()) {
    throw new Error("API 프록시 URL이 설정되지 않았습니다. EXPO_PUBLIC_API_BASE_URL을 확인해주세요.");
  }
  return API_BASE_URL.replace(/\/+$/, "");
}

export async function proxyPost<T>(
  path: string,
  body: unknown,
  timeoutMs = 25000,
): Promise<T> {
  const baseUrl = getProxyBaseUrl();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (PROXY_TOKEN?.trim()) {
    headers["x-proxy-token"] = PROXY_TOKEN;
  }
  const response = await fetchWithRetry(
    `${baseUrl}${path}`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    },
    { timeoutMs, retryCount: 0 },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`프록시 요청 실패 (${response.status}): ${text || "응답 없음"}`);
  }
  return (await response.json()) as T;
}

export async function proxyGet<T>(path: string): Promise<T> {
  const baseUrl = getProxyBaseUrl();
  const headers: Record<string, string> = {};
  if (PROXY_TOKEN?.trim()) {
    headers["x-proxy-token"] = PROXY_TOKEN;
  }
  const response = await fetchWithRetry(
    `${baseUrl}${path}`,
    { method: "GET", headers },
    { timeoutMs: 12000, retryCount: 1, retryDelayMs: 600 },
  );
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`프록시 요청 실패 (${response.status}): ${text || "응답 없음"}`);
  }
  return (await response.json()) as T;
}
