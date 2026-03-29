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
    <div className="min-h-screen flex items-center justify-center bg-[#E6D3B1] px-6 py-24 relative overflow-hidden">
      {/* Abstract Elements */}
      <div className="absolute top-[-10%] left-[-5%] w-100 h-100 bg-[#7A3E2D]/5 blur-[100px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-75 h-75 bg-[#7A3E2D]/5 blur-[80px] rounded-full"></div>

      <div className="w-full max-w-lg relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="bg-white p-12 md:p-16 rounded-[4rem] shadow-2xl border border-white">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-[#171717] tracking-tight mb-4">Welcome Back</h1>
            <p className="text-[#171717]/40 text-sm font-medium">Access your personal collection and history.</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-rose-50 border border-rose-100 text-xs font-bold text-rose-600 uppercase tracking-widest rounded-2xl text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Email Channel</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-16 px-8 bg-[#F7F7F7] border border-black/5 focus:border-[#7A3E2D]/30 focus:bg-white focus:ring-4 focus:ring-[#7A3E2D]/5 outline-none text-sm font-bold text-[#171717] transition-all rounded-2xl placeholder:text-gray-300" 
                placeholder="name@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Access Key</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-16 px-8 bg-[#F7F7F7] border border-black/5 focus:border-[#7A3E2D]/30 focus:bg-white focus:ring-4 focus:ring-[#7A3E2D]/5 outline-none text-sm font-bold text-[#171717] transition-all rounded-2xl placeholder:text-gray-300" 
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-16 bg-[#1A1A1A] text-white text-sm font-bold rounded-xl hover:bg-black transition-all active:scale-95 shadow-xl shadow-black/10 flex items-center justify-center gap-4 mt-10"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                "Authenticate Access"
              )}
            </button>
          </form>

          <p className="mt-12 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
            New to Gravity? <br />
            <Link href="/register" className="text-[#7A3E2D] hover:opacity-70 transition-opacity underline block mt-4">Create Membership</Link>
          </p>
        </div>

        <div className="mt-12 text-center">
           <Link href="/" className="text-[10px] font-bold text-[#171717]/20 hover:text-[#7A3E2D] uppercase tracking-widest transition-colors italic">
              ← Return Home
           </Link>
        </div>
      </div>
    </div>
  );
}
