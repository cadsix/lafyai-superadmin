/**
 * Server-side API client.
 * All functions run in Server Components / Server Actions — never in the browser.
 * Token is read from the 'getvaxxed_token' cookie via next/headers.
 */

import { cookies } from "next/headers";

const BASE = process.env.API_URL ?? "https://queme-staging-4ca6.up.railway.app/api/v1";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function getHeaders(): Promise<HeadersInit> {
  const cookieStore = await cookies();
  const token = cookieStore.get("getvaxxed_token")?.value ?? cookieStore.get("lafy_token")?.value;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = await getHeaders();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { ...headers, ...(init.headers ?? {}) },
    // No caching by default — always fresh data
    cache: "no-store",
  });

  if (!res.ok) {
    let msg = res.statusText;
    try {
      const body = await res.json();
      msg = body?.detail ?? body?.message ?? msg;
    } catch {
      // ignore parse errors
    }
    throw new ApiError(res.status, msg);
  }

  // Some endpoints return 204 / empty body
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

// ─── Convenience wrappers ────────────────────────────────────────────────────

export const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),

  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

// ─── Public login (no auth header needed) ────────────────────────────────────

export async function loginRequest(email: string, password: string) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  if (!res.ok) {
    let msg = "Invalid email or password";
    try {
      const body = await res.json();
      msg = body?.detail ?? body?.message ?? msg;
    } catch {
      // ignore
    }
    throw new ApiError(res.status, msg);
  }

  return res.json() as Promise<{
    access_token: string;
    token_type: string;
    role: string;
    user_id: string;
    facility_id: string | null;
    region_id: string | null;
  }>;
}
