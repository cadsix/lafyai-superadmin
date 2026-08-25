"use client";

/**
 * Thin client-side context that holds the pre-fetched session user
 * passed down from the server layout.  No token handling here — that
 * lives entirely in lib/auth.ts on the server.
 */

import { createContext, useContext } from "react";
import type { SessionUser } from "@/lib/auth";

const AuthContext = createContext<SessionUser | null>(null);

export function AuthProvider({
  user,
  children,
}: {
  user: SessionUser | null;
  children: React.ReactNode;
}) {
  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}

export function useSession(): SessionUser | null {
  return useContext(AuthContext);
}
