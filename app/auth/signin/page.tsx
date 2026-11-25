"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Wind, Lock, Mail, ArrowRight, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const { data: session, status } = useSession();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // If already authenticated, redirect
  React.useEffect(() => {
    if (status === "authenticated") {
      router.push(callbackUrl);
    }
  }, [status, callbackUrl, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (res?.error) {
        setErrorMessage(res.error);
        setIsLoading(false);
      } else {
        router.push(callbackUrl);
      }
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setEmail(demoEmail);

    try {
      const res = await signIn("credentials", {
        email: demoEmail,
        password: "demo-password-123",
        redirect: false,
      });

      if (res?.error) {
        setErrorMessage(res.error);
        setIsLoading(false);
      } else {
        router.push(callbackUrl);
      }
    } catch {
      setErrorMessage("Demo sign-in failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FAF7] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Header */}
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-mint text-brand-forest-900 shadow-sm mb-4">
          <Wind className="h-8 w-8 stroke-[2.5]" />
        </div>
        <h1 className="text-3xl font-black text-brand-forest-900 tracking-tight">
          Welcome to AirAware
        </h1>
        <p className="mt-1.5 text-sm text-brand-forest-700/80 font-medium">
          Breathe smarter. Live better. Protect your family from urban smog.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm rounded-3xl border border-brand-forest-700/10 sm:px-10">
          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 flex items-start gap-3 rounded-2xl bg-red-50 p-4 border border-red-200 text-red-800 text-xs font-semibold">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Sign In Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-brand-forest-900 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 pl-10 text-sm text-brand-forest-900 placeholder:text-slate-400 focus:border-brand-mint-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-mint-200 transition-all"
                />
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-forest-900 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 pl-10 text-sm text-brand-forest-900 placeholder:text-slate-400 focus:border-brand-mint-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-mint-200 transition-all"
                />
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-brand-forest-900 text-white font-bold py-2.5 hover:bg-brand-forest-800 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Quick Demo Logins Section */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-brand-forest-700/60">
                1-Click Demo Profiles
              </span>
              <Badge variant="mint" className="text-[10px] gap-1 font-bold">
                <Sparkles className="h-3 w-3" /> Demo Ready
              </Badge>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleDemoLogin("priya.sharma@example.com")}
                disabled={isLoading}
                className="w-full flex items-center justify-between p-2.5 rounded-2xl border border-brand-mint-200 bg-[#F0FAF5] hover:bg-brand-mint-100/70 transition-all text-left text-xs font-semibold text-brand-forest-900"
              >
                <div>
                  <div className="font-bold">Priya Sharma</div>
                  <div className="text-[11px] text-brand-forest-700/60">South Delhi • 2 Kids • Asthma Shield</div>
                </div>
                <CheckCircle2 className="h-4 w-4 text-brand-forest-700 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin("rajesh.patel@example.com")}
                disabled={isLoading}
                className="w-full flex items-center justify-between p-2.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all text-left text-xs font-semibold text-slate-800"
              >
                <div>
                  <div className="font-bold">Rajesh Patel</div>
                  <div className="text-[11px] text-slate-500">Noida Sector 62 • Elderly Care • Metro</div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin("ananya.verma@example.com")}
                disabled={isLoading}
                className="w-full flex items-center justify-between p-2.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all text-left text-xs font-semibold text-slate-800"
              >
                <div>
                  <div className="font-bold">Ananya Verma</div>
                  <div className="text-[11px] text-slate-500">Gurugram • Infant Nursery Shield</div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
              </button>
            </div>
          </div>

          {/* Sign Up Redirect Link */}
          <div className="mt-6 text-center text-xs text-brand-forest-700/70 font-medium">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="font-bold text-brand-forest-900 underline hover:text-brand-forest-700"
            >
              Create free account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-[85vh] flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-mint-400 border-t-transparent" />
        </div>
      }
    >
      <SignInForm />
    </React.Suspense>
  );
}
