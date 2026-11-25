"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Wind, Lock, Mail, User, MapPin, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SignUpPage() {
  const router = useRouter();

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [city, setCity] = React.useState("New Delhi");
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          city: city.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error?.message || "Registration failed. Please try again.");
        setIsLoading(false);
        return;
      }

      // Automatically sign in the new user
      const loginRes = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (loginRes?.ok) {
        router.push("/onboarding");
      } else {
        router.push("/auth/signin");
      }
    } catch {
      setErrorMessage("An unexpected network error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FAF7] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Icon */}
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-mint text-brand-forest-900 shadow-sm mb-4">
          <Wind className="h-8 w-8 stroke-[2.5]" />
        </div>
        <h1 className="text-3xl font-black text-brand-forest-900 tracking-tight">
          Create Your AirAware Shield
        </h1>
        <p className="mt-1.5 text-sm text-brand-forest-700/80 font-medium">
          Set up customized air protection for your family in minutes.
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

          {/* Registration Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-brand-forest-900 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 pl-10 text-sm text-brand-forest-900 placeholder:text-slate-400 focus:border-brand-mint-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-mint-200 transition-all"
                />
                <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              </div>
            </div>

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
                Primary City
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. New Delhi, Noida, Gurugram"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 pl-10 text-sm text-brand-forest-900 placeholder:text-slate-400 focus:border-brand-mint-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-mint-200 transition-all"
                />
                <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-forest-900 mb-1.5">
                Password (min. 6 characters)
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 pl-10 text-sm text-brand-forest-900 placeholder:text-slate-400 focus:border-brand-mint-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-mint-200 transition-all"
                />
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-forest-900 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 pl-10 text-sm text-brand-forest-900 placeholder:text-slate-400 focus:border-brand-mint-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-mint-200 transition-all"
                />
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-brand-forest-900 text-white font-bold py-2.5 hover:bg-brand-forest-800 transition-all flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <span>Create Account & Continue</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center text-xs text-brand-forest-700/70 font-medium">
            Already have an account?{" "}
            <Link
              href="/auth/signin"
              className="font-bold text-brand-forest-900 underline hover:text-brand-forest-700"
            >
              Sign In here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
