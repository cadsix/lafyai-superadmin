"use client";

import { useActionState, useState } from "react";
import { ArrowRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction } from "@/lib/auth";

export default function AuthPage() {
  const [state, formAction, pending] = useActionState(loginAction, null);
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel — branding ─────────────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[52%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #0f3d33 0%, #185547 50%, #1e6b5a 100%)" }}
      >
        {/* Decorative circles */}
        <div
          className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: "#CEEBA2" }}
        />
        <div
          className="absolute -bottom-40 -left-20 w-[420px] h-[420px] rounded-full opacity-8"
          style={{ background: "#CEEBA2" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full opacity-5"
          style={{ background: "#CEEBA2" }}
        />

        {/* Logo — lafy-name.png: 642×258 */}
        <div className="relative z-10">
          <Image
            src="/icons/lafy-name.png"
            alt="LafyAI"
            width={100}
            height={50}
            priority
          />
        </div>

        {/* Headline */}
        <div className="relative z-10 space-y-6">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold tracking-widest uppercase"
            style={{ background: "rgba(206,235,162,0.15)", color: "#CEEBA2", border: "1px solid rgba(206,235,162,0.25)" }}
          >
            Super Admin Console
          </div>
          <h1 className="text-4xl font-bold leading-tight text-white">
            National immunisation
            <br />
            oversight for Ghana
          </h1>
          <p style={{ color: "rgba(255,255,255,0.65)" }} className="text-base leading-relaxed max-w-sm">
            Monitor coverage across every region, implementor, and facility —
            in a single unified dashboard.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { value: "16", label: "Regions" },
              { value: "1,200+", label: "Health workers" },
              { value: "21k+", label: "Children enrolled" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl p-4"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <div className="text-2xl font-bold text-white tabular-nums">{s.value}</div>
                <div className="mt-0.5 text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer quote */}
        <div className="relative z-10">
          <p className="text-xs italic" style={{ color: "rgba(255,255,255,0.4)" }}>
            "Vaccine adherence, powered by WhatsApp"
          </p>
        </div>
      </div>

      {/* ── Right panel — form ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 bg-white">
        <div className="mx-auto w-full max-w-md space-y-8">

          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center">
            <Image
              src="/icons/lafy-name.png"
              alt="LafyAI"
              width={200}
              height={80}
              priority
            />
          </div>

          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight" style={{ color: "#0f3d33" }}>
              Welcome back
            </h2>
            <p className="text-sm" style={{ color: "#6b7280" }}>
              Sign in to your super admin account to continue
            </p>
          </div>

          {/* Error banner */}
          {state?.error && (
            <div
              className="flex items-start gap-3 rounded-xl px-4 py-3.5 text-sm"
              style={{
                background: "oklch(0.98 0.008 27)",
                border: "1px solid oklch(0.88 0.06 27)",
                color: "oklch(0.45 0.18 27)",
              }}
            >
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          {/* Form */}
          <form action={formAction} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="si-email"
                className="text-sm font-medium"
                style={{ color: "#185547" }}
              >
                Email address
              </Label>
              <Input
                id="si-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@lafyai.org"
                className="h-12 rounded-xl transition-all focus-visible:ring-2"
                style={
                  {
                    borderColor: "#d1e8e3",
                    "--tw-ring-color": "#185547",
                  } as React.CSSProperties
                }
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="si-password"
                  className="text-sm font-medium"
                  style={{ color: "#185547" }}
                >
                  Password
                </Label>
              </div>
              <Input
                id="si-password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="h-12 rounded-xl transition-all focus-visible:ring-2"
                style={
                  {
                    borderColor: "#d1e8e3",
                    "--tw-ring-color": "#185547",
                  } as React.CSSProperties
                }
              />
            </div>

            <Button
              type="submit"
              disabled={pending}
              className="w-full h-12 rounded-xl text-base font-semibold transition-all shadow-sm hover:shadow-md"
              style={{
                background: pending
                  ? "#1e6b5a"
                  : "linear-gradient(135deg, #185547 0%, #1e6b5a 100%)",
                color: "#fff",
                border: "none",
              }}
            >
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2">Signing in…</span>
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Help link */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowInfo((v) => !v)}
              className="text-sm transition-colors hover:underline"
              style={{ color: "#185547" }}
            >
              Need access? Contact your platform admin
            </button>

            {showInfo && (
              <div
                className="mt-4 flex items-start gap-3 rounded-xl px-4 py-3.5 text-left text-sm"
                style={{
                  background: "#f0f7f5",
                  border: "1px solid #c2ddd7",
                  color: "#185547",
                }}
              >
                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "#185547" }} />
                <span>
                  Super admin accounts are provisioned by an existing administrator
                  from the <strong>User management</strong> page. Reach out to your
                  organisation&apos;s LafyAI admin to get credentials.
                </span>
              </div>
            )}
          </div>

          {/* Footer */}
          <p className="text-center text-xs" style={{ color: "#9ca3af" }}>
            © {new Date().getFullYear()} LafyAI · WhatsApp-native vaccine adherence for Ghana
          </p>
        </div>
      </div>
    </div>
  );
}
