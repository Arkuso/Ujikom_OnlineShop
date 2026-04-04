"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import authService from "@/services/authService";
import { useAuthStore } from "@/lib/useAuthstore";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authService.login({ email, password });
      if (response.success && response.data) {
        login(response.data.user, response.data.token);
        window.dispatchEvent(new Event('storage')); // Force profile update
        router.push("/");
      } else {
        setError(response.message || "Invalid credentials.");
      }
    } catch {
      setError("Cannot connect to server. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#2E2F34] px-4 pt-20 pb-12 flex items-center justify-center">
      <div className="w-full max-w-sm rounded-3xl bg-[#F4F5F8] px-5 py-7 sm:px-7 sm:py-9 shadow-2xl">
        <div className="text-center mb-7">
          <h1 className="font-hk-grotesk-wide text-[22px] sm:text-[26px] leading-none tracking-tight text-[#111111] uppercase">
            Gravity
          </h1>
        </div>

        <div className="mb-6">
          <h2 className="font-hk-grotesk-wide text-[28px] sm:text-[32px] leading-none text-[#111111] mb-2.5">
            Sign in
          </h2>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-rose-100 bg-rose-50 px-5 py-4 text-center font-vercetti text-xs font-medium uppercase tracking-widest text-rose-600">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 w-full rounded-xl border border-black/25 bg-white px-4 text-[15px] font-vercetti text-[#111111] outline-none transition-colors placeholder:text-[#111111]/60 focus:border-black/60"
              placeholder="Email"
            />
          </div>

          <div className="space-y-2">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 w-full rounded-xl border border-black/25 bg-white px-4 text-[15px] font-vercetti text-[#111111] outline-none transition-colors placeholder:text-[#111111]/60 focus:border-black/60"
              placeholder="Password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-1.5 h-11 w-full rounded-xl bg-[#6E7178] text-[15px] font-vercetti text-white transition-colors hover:bg-[#5e6168] active:scale-[0.99] disabled:opacity-70"
          >
            {loading ? (
              <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              "Continue"
            )}
          </button>
        </form>

        <p className="mt-4 text-center font-vercetti text-[13px] text-[#111111]">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="underline underline-offset-4 hover:opacity-70">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
