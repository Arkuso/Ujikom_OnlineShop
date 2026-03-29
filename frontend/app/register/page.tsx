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
    <div className="min-h-screen flex items-center justify-center bg-[#E6D3B1] px-6 py-24 relative overflow-hidden">
      {/* Abstract Elements */}
      <div className="absolute top-[-5%] right-[-5%] w-[400px] h-[400px] bg-[#7A3E2D]/5 blur-[100px] rounded-full"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[350px] h-[350px] bg-[#7A3E2D]/5 blur-[80px] rounded-full"></div>

      <div className="w-full max-w-lg relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="bg-white p-12 md:p-16 rounded-3xl shadow-2xl border border-white">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-[#171717] tracking-tight mb-4">Join Gravity</h1>
            <p className="text-[#171717]/40 text-sm font-medium">Create your unique profile for a refined experience.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Full Identity</label>
              <input 
                required 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="w-full h-16 px-8 bg-[#F7F7F7] border border-black/5 focus:border-[#7A3E2D]/30 focus:bg-white focus:ring-4 focus:ring-[#7A3E2D]/5 outline-none text-sm font-bold text-[#171717] transition-all rounded-2xl placeholder:text-gray-300" 
                placeholder="John Doe" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Email Channel</label>
              <input 
                required 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full h-16 px-8 bg-[#F7F7F7] border border-black/5 focus:border-[#7A3E2D]/30 focus:bg-white focus:ring-4 focus:ring-[#7A3E2D]/5 outline-none text-sm font-bold text-[#171717] transition-all rounded-2xl placeholder:text-gray-300" 
                placeholder="name@example.com" 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Access Pass</label>
              <input 
                required 
                type="password" 
                value={password} 
                minLength={6}
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full h-16 px-8 bg-[#F7F7F7] border border-black/5 focus:border-[#7A3E2D]/30 focus:bg-white focus:ring-4 focus:ring-[#7A3E2D]/5 outline-none text-sm font-bold text-[#171717] transition-all rounded-2xl placeholder:text-gray-300" 
                placeholder="Min. 6 characters" 
              />
            </div>

            {message && (
              <div className={`p-6 text-xs font-bold uppercase tracking-widest leading-relaxed rounded-2xl border animate-in fade-in duration-500 ${success ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-700 border-rose-100"}`}>
                {message}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full h-16 bg-[#1A1A1A] text-white text-sm font-bold rounded-xl hover:bg-black transition-all active:scale-95 shadow-xl shadow-black/10 flex items-center justify-center gap-4 mt-8"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                "Initialize Membership"
              )}
            </button>
          </form>

          <p className="mt-12 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
            Existing Member? <br />
            <Link href="/login" className="text-[#7A3E2D] hover:opacity-70 transition-opacity underline block mt-4">Authorize Now</Link>
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
