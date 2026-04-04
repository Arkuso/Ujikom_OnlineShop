"use client";

import authService from "@/services/authService";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await authService.register({ name, email, password });

      if (response.success) {
        setSuccess(true);
        setMessage("Membership created successfully. Redirecting...");
        setName("");
        setEmail("");
        setPassword("");
        
        setTimeout(() => {
           router.push("/login");
        }, 2000);
      } else {
        setSuccess(false);
        setMessage(`Error: ${response.message}`);
      }
    } catch {
      setSuccess(false);
      setMessage("Connection error. Check backend signal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#2E2F34] px-4 pt-20 pb-12 flex items-center justify-center">
      <div className="w-full max-w-md rounded-4xl bg-[#F4F5F8] px-5 py-7 sm:px-7 sm:py-9 shadow-2xl">
        <div className="text-center mb-7">
          <h1 className="font-hk-grotesk-wide text-[22px] sm:text-[26px] leading-none tracking-tight text-[#111111] uppercase">
            Gravity
          </h1>
        </div>

        <div className="mb-6">
          <h2 className="font-hk-grotesk-wide text-[28px] sm:text-[32px] leading-none text-[#111111] mb-2.5">
            Sign up
          </h2>
        </div>

        {message && (
          <div className={`mb-6 rounded-2xl border px-5 py-4 text-center font-vercetti text-xs font-medium uppercase tracking-widest ${success ? "border-emerald-100 bg-emerald-50 text-emerald-700" : "border-rose-100 bg-rose-50 text-rose-700"}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="space-y-2">
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 w-full rounded-xl border border-black/25 bg-white px-4 text-[15px] font-vercetti text-[#111111] outline-none transition-colors placeholder:text-[#111111]/60 focus:border-black/60"
              placeholder="Username"
            />
          </div>

          <div className="space-y-2">
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 w-full rounded-xl border border-black/25 bg-white px-4 text-[15px] font-vercetti text-[#111111] outline-none transition-colors placeholder:text-[#111111]/60 focus:border-black/60"
              placeholder="Email"
            />
          </div>

          <div className="space-y-2">
            <input
              required
              type="password"
              value={password}
              minLength={6}
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
              "Create account"
            )}
          </button>
        </form>

        <p className="mt-4 text-center font-vercetti text-[13px] text-[#111111]">
          Already have an account?{' '}
          <Link href="/login" className="underline underline-offset-4 hover:opacity-70">
            Sign in here
          </Link>
        </p>

        <p className="mt-2.5 text-center font-vercetti text-[13px] text-[#111111]/80">
          By continuing, you agree to our terms of service
        </p>
      </div>
    </div>
  );
}
