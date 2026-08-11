"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Leaf, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Step = "signin" | "signup";

export default function AuthPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("signin");
  const [busy, setBusy] = useState(false);

  // Placeholder handlers — wire up to your API endpoint later
  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    // TODO: POST to your API: { email, password }
    console.log("Sign in", Object.fromEntries(form));
    await new Promise((r) => setTimeout(r, 600));
    setBusy(false);
    toast.success("Signed in (stub)");
    router.push("/admin/overview");
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") ?? "");
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setBusy(true);
    // TODO: POST to your API: { email, password, full_name, organisation }
    console.log("Sign up", Object.fromEntries(form));
    await new Promise((r) => setTimeout(r, 600));
    setBusy(false);
    toast.success("Account created — awaiting approval (stub)");
  };

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-10 md:py-16">
      <div className="mx-auto w-full max-w-xl space-y-8">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground grid place-items-center">
            <Leaf className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">lafyai</span>
        </div>

        <div className="space-y-6">
          {step !== "signin" && (
            <button
              type="button"
              onClick={() => setStep("signin")}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </button>
          )}

          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              {step === "signin" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-muted-foreground">
              Super admin console · National oversight
            </p>
          </header>

          {step === "signin" ? (
            <form onSubmit={handleSignIn} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="si-email">Email address</Label>
                <Input
                  id="si-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="si-password">Password</Label>
                <Input
                  id="si-password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="h-12"
                />
              </div>
              <Button type="submit" className="w-full h-12 text-base" disabled={busy}>
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                Continue
                {!busy && <ArrowRight className="h-4 w-4" />}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => setStep("signup")}
                  className="font-medium text-primary hover:underline"
                >
                  Sign up
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="su-name">Full name</Label>
                  <Input
                    id="su-name"
                    name="full_name"
                    required
                    maxLength={80}
                    placeholder="Ama Mensah"
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su-org">Organisation</Label>
                  <Input
                    id="su-org"
                    name="organisation"
                    maxLength={80}
                    placeholder="Optional"
                    className="h-12"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="su-email">Email address</Label>
                <Input
                  id="su-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="su-password">Password</Label>
                <Input
                  id="su-password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="h-12"
                />
                <p className="text-xs text-muted-foreground">At least 8 characters.</p>
              </div>
              <p className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                Super admin sign-ups are reviewed — an existing super admin approves access from
                the User management page.
              </p>
              <Button type="submit" className="w-full h-12 text-base" disabled={busy}>
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                Continue
                {!busy && <ArrowRight className="h-4 w-4" />}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setStep("signin")}
                  className="font-medium text-primary hover:underline"
                >
                  Sign in
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
