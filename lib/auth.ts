"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { loginRequest, api } from "@/lib/api";

const COOKIE = "getvaxxed_token";
const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 8, // 8 hours
};

// ─── Token helpers ────────────────────────────────────────────────────────────

export async function getToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE)?.value ?? cookieStore.get("lafy_token")?.value;
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getToken();
  return Boolean(token);
}

// ─── Session data (GET /auth/me) ──────────────────────────────────────────────

export type SessionUser = {
  id: string;
  name: string;
  role: string;
  facility_name: string | null;
  facility_type: string | null;
  facility_id: string | null;
};

export async function getSession(): Promise<SessionUser | null> {
  const token = await getToken();
  if (!token) return null;
  try {
    return await api.get<SessionUser>("/auth/me");
  } catch {
    return null;
  }
}

// ─── Server Actions ───────────────────────────────────────────────────────────

export async function loginAction(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  try {
    const data = await loginRequest(email, password);

    // This portal is super admin only — block all other roles immediately
    if (data.role !== "super_admin") {
      return {
        error:
          "Access denied. This portal is restricted to super admins only.",
      };
    }

    const cookieStore = await cookies();
    cookieStore.set(COOKIE, data.access_token, COOKIE_OPTS);
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Login failed. Please try again.";
    return { error: msg };
  }

  redirect("/admin/overview");
}

export async function logoutAction(): Promise<void> {
  // Best-effort server-side logout
  try {
    await api.post("/auth/logout");
  } catch {
    // ignore — we clear the cookie regardless
  }
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE);
  cookieStore.delete("lafy_token");
  redirect("/auth");
}
