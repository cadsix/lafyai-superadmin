"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { loginAction } from "@/lib/auth";

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const features = [
  "Track Vaccine Coverage",
  "Track Patient History",
  "Behaviour-Change Nudge Messages",
  "AEFI Alerts",
  "Audio Messages In Preferred Language",
];

export default function AuthPage() {
  const [state, formAction, pending] = useActionState(loginAction, null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });
  const [showPassword, setShowPassword] = useState(false);

  const emailError =
    touched.email && !validateEmail(email)
      ? email.length === 0
        ? "Email is required"
        : "Enter a valid email address"
      : null;

  const passwordError =
    touched.password && password.length === 0 ? "Password is required" : null;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ── Left panel ───────────────────────────────────────────────── */}
      <div className="relative hidden lg:flex flex-col justify-between w-[500px] xl:w-[560px] flex-shrink-0 bg-[#185547] overflow-hidden px-12 py-10">
        {/* Decorative circles */}
        <div className="absolute top-[-80px] right-[-80px] w-[320px] h-[320px] rounded-full bg-white/5" />
        <div className="absolute top-[60px] right-[30px] w-[180px] h-[180px] rounded-full bg-white/5" />
        <div className="absolute bottom-[-60px] left-[-60px] w-[260px] h-[260px] rounded-full bg-white/5" />
        <div className="absolute bottom-[120px] left-[80px] w-[120px] h-[120px] rounded-full bg-white/5" />

        <div className="relative z-10">
          {/* Logo */}
          <div className="mb-12">
            <Image
              src="/images/logos/getvaxxed-logoN.PNG"
              alt="GetVaxxed"
              width={140}
              height={44}
              style={{ width: "140px", height: "auto" }}
              className="brightness-0 invert"
              priority
            />
          </div>

          {/* Headline */}
          <h1 className="text-[34px] xl:text-[38px] font-bold text-white leading-tight mb-5">
            Adapt GetVaxxed to your programme&apos;s needs with flexible operations.
          </h1>

          {/* Body */}
          <p className="text-[15.5px] text-white/70 leading-relaxed mb-10">
            Let&apos;s make sure every child finishes what they started. Reliable and
            extensible infrastructure for immunization programmes and facilities.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2.5">
            {features.map((f) => (
              <div
                key={f}
                className="flex items-center gap-2 bg-[#CEEBA2]/15 border border-[#CEEBA2]/30 rounded-full px-3.5 py-2"
              >
                <span className="w-4 h-4 rounded-full bg-[#CEEBA2] flex items-center justify-center flex-shrink-0">
                  <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                    <path
                      d="M2 5.5L4 7.5L8 3"
                      stroke="#185547"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="text-[12px] text-white font-medium whitespace-nowrap">
                  {f}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10" />
      </div>

      {/* ── Right panel ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center px-6 pt-6 pb-2">
          <Image
            src="/images/logos/getvaxxed-logoN.PNG"
            alt="GetVaxxed"
            width={120}
            height={40}
            style={{ width: "120px", height: "auto" }}
            priority
          />
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-10 sm:px-12">
          <div className="w-full max-w-[420px]">

            {/* Heading */}
            <h2 className="text-[28px] font-bold text-slate-900 tracking-tight mb-1">
              Welcome back
            </h2>
            <p className="text-[13px] text-slate-400 mb-8">
              Sign in to your super admin account
            </p>

            {/* Server / role error */}
            {state?.error && (
              <div className="mb-5 flex items-start gap-2 px-3.5 py-3 bg-red-50 border border-red-200 rounded-xl">
                <svg
                  width="14" height="14" viewBox="0 0 12 12" fill="none"
                  className="flex-shrink-0 mt-0.5 text-red-500"
                >
                  <circle cx="6" cy="6" r="5.5" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M6 4v2.5M6 8h.01" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                <p className="text-[12px] text-red-600">{state.error}</p>
              </div>
            )}

            <form action={formAction} noValidate className="flex flex-col gap-5">
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-[13px] font-medium text-slate-700">
                  Work Email<span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@getvaxxed.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  className={`w-full rounded-lg border px-4 py-3 text-[14px] text-slate-900 placeholder-slate-300 outline-none transition-all
                    ${emailError
                      ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-100"
                      : "border-slate-200 bg-white focus:border-[#185547] focus:ring-2 focus:ring-[#185547]/10"
                    }`}
                />
                {emailError && (
                  <p className="text-[11px] text-red-500 flex items-center gap-1">
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" className="flex-shrink-0">
                      <circle cx="6" cy="6" r="5.5" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M6 4v2.5M6 8h.01" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                    {emailError}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-[13px] font-medium text-slate-700">
                    Password<span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                    className={`w-full rounded-lg border px-4 py-3 pr-11 text-[14px] text-slate-900 placeholder-slate-300 outline-none transition-all
                      ${passwordError
                        ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-100"
                        : "border-slate-200 bg-white focus:border-[#185547] focus:ring-2 focus:ring-[#185547]/10"
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M3 3l18 18M10.5 10.5A3 3 0 0013.5 13.5M6.3 6.3A9.77 9.77 0 003 12c1.6 4.1 5.6 7 9.5 7a9.6 9.6 0 005.2-1.5M9 5.1A9.4 9.4 0 0112 5c4 0 8 2.9 9.5 7a10 10 0 01-2.1 3.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M1.5 12C3.1 7.9 7.1 5 12 5s8.9 2.9 10.5 7c-1.6 4.1-5.6 7-10.5 7S3.1 16.1 1.5 12z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
                      </svg>
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-[11px] text-red-500 flex items-center gap-1">
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" className="flex-shrink-0">
                      <circle cx="6" cy="6" r="5.5" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M6 4v2.5M6 8h.01" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                    {passwordError}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={pending}
                className={`mt-1 w-full flex items-center justify-center gap-2 py-3.5 rounded-lg text-[14px] font-semibold transition-all
                  ${pending
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-[#185547] text-white hover:bg-[#145a4a] active:scale-[0.99]"
                  }`}
              >
                {pending ? (
                  <>
                    <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.25" />
                      <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                    Signing in…
                  </>
                ) : (
                  "Continue"
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="flex items-center gap-3 mt-6">
              <div className="flex-1 h-px bg-slate-100" />
              <p className="text-[13px] text-slate-400 whitespace-nowrap">
                © {new Date().getFullYear()} GetVaxxed · Super Admin
              </p>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
