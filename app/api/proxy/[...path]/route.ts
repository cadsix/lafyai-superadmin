/**
 * Generic API proxy — all client-side mutations go through here.
 * Next.js can read the httpOnly cookie; the browser cannot.
 *
 * Usage: fetch('/api/proxy/admin/users/123/status', { method: 'PATCH', body: ... })
 */

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.API_URL ?? "https://queme-staging-4ca6.up.railway.app/api/v1";

async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const upstream = `${API_BASE}/${path.join("/")}`;

  const cookieStore = await cookies();
  const token = cookieStore.get("lafy_token")?.value;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const body = req.method !== "GET" && req.method !== "HEAD"
    ? await req.text()
    : undefined;

  const res = await fetch(upstream, {
    method: req.method,
    headers,
    body,
    cache: "no-store",
  });

  const text = await res.text();

  return new NextResponse(text || null, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}

export const GET    = handler;
export const POST   = handler;
export const PATCH  = handler;
export const PUT    = handler;
export const DELETE = handler;
