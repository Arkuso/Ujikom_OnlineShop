"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";

type UserRole = "Admin" | "Customer" | null;

export default function ProfilePage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [auth, setAuth] = useState<{
    isLoggedIn: boolean;
    role: UserRole;
    email: string;
    name: string;
  }>({
    isLoggedIn: false,
    role: null,
    email: "",
    name: "",
  });

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      if (token && token.includes('.')) {
        try {
          const parts = token.split(".");
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            const userRole =
              payload.role ||
              payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

            setAuth({
              isLoggedIn: true,
              role: (userRole === "Admin" ? "Admin" : "Customer") as UserRole,
              email: payload.email || payload.unique_name || "",
              name: payload.name || payload.unique_name?.split("@")[0] || "User",
            });
          }
        } catch (error) {
          console.error("Token parsing failed", error);
        }
      }
      setIsLoaded(true);
    };

    checkAuth();
    
    // Add event listener to handle storage changes (e.g. login in another tab)
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const membershipId = useMemo(() => {
    if (!auth.name) return "GRV-GUEST-000";
    const seed = auth.name.length + auth.email.length;
    const randomPart = Math.floor(((seed * 1234.567) % 1) * 900) + 100;
    return `GRV-${auth.role?.toUpperCase() || "USER"}-00${randomPart}`;
  }, [auth.role, auth.name, auth.email]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event('storage')); // Notify other components
    router.replace("/login");
  };

  if (!isLoaded) {
    return <div className="min-h-screen bg-[#E6D3B1] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-[#7A3E2D]/20 border-t-[#7A3E2D] rounded-full animate-spin"></div>
    </div>;
  }

  if (!auth.isLoggedIn) {
     return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center bg-[#E6D3B1]">
           <h2 className="text-4xl font-bold text-[#171717] mb-6 tracking-tight">No Account detect!</h2>
           <p className="text-[#171717]/60 text-lg mb-12 max-w-sm mx-auto leading-relaxed">
             Please identify yourself with log in or sign up if you dont have account yet.
           </p>
           <div className="flex flex-wrap gap-6 justify-center">
              <Link href="/login" className="bg-[#1A1A1A] text-white py-5 px-16 text-sm font-bold rounded-xl hover:bg-black transition-all shadow-xl">Sign In</Link>
              <Link href="/register" className="bg-white text-[#171717] py-5 px-16 text-sm font-bold rounded-xl border border-black/5 hover:bg-gray-50 transition-all">Sign up</Link>
           </div>
        </div>
     );
  }

  return (
    <div className="bg-[#E6D3B1] min-h-screen pt-32 pb-24">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          {/* Identity Sector */}
          <div className="lg:col-span-4">
            <div className="bg-white p-12 rounded-3xl shadow-xl border border-black/5 sticky top-32 text-center md:text-left">
               <div className="w-24 h-24 bg-[#7A3E2D] rounded-2xl flex items-center justify-center text-4xl font-bold text-white mb-10 mx-auto md:mx-0 shadow-2xl shadow-[#7A3E2D]/20">
                 {auth.name.slice(0, 1).toUpperCase()}
               </div>
               <h1 className="text-4xl font-bold text-[#171717] leading-none mb-6">{auth.name}</h1>
               <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#7A3E2D]/5 rounded-full mb-12 border border-[#7A3E2D]/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7A3E2D] animate-pulse"></span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#7A3E2D]">{auth.role} Access</span>
               </div>
               
               <div className="space-y-8 pt-10 border-t border-gray-100 text-left">
                  <div>
                     <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Registered Email</span>
                     <span className="text-sm font-bold text-[#171717]">{auth.email}</span>
                  </div>
                  <div>
                     <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Membership ID</span>
                     <span className="text-sm font-bold text-[#171717]">{membershipId}</span>
                  </div>
               </div>

               <button 
                 onClick={handleLogout}
                 className="w-full mt-16 py-6 bg-[#1A1A1A] text-white hover:bg-black text-[10px] font-bold uppercase tracking-widest transition-all rounded-2xl shadow-xl shadow-black/10"
               >
                 Terminate Session
               </button>
            </div>
          </div>

          {/* Control Sector */}
          <div className="lg:col-span-8">
             <div className="mb-16 px-4">
                <h2 className="text-5xl md:text-6xl font-black text-[#171717] uppercase tracking-tighter leading-none mb-6">User <span className="text-[#7A3E2D]">Dashboard</span></h2>
                <p className="text-[#171717]/40 text-xs font-bold uppercase tracking-widest">Manage your active collection streams</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Link href="/orders" className="group bg-white p-12 rounded-[3rem] shadow-sm hover:shadow-xl transition-all border border-black/5">
                   <div className="w-16 h-16 bg-[#F7F7F7] flex items-center justify-center mb-8 rounded-2xl group-hover:bg-[#7A3E2D] group-hover:text-white group-hover:-translate-y-2 transition-all duration-500 font-bold text-2xl">OR</div>
                   <h3 className="text-2xl font-bold text-[#171717] mb-4">Past Orders</h3>
                   <p className="text-sm text-[#171717]/40 leading-relaxed font-bold uppercase tracking-widest text-xs">Review your transaction history.</p>
                </Link>
                
                <Link href="/cart" className="group bg-white p-12 rounded-[3rem] shadow-sm hover:shadow-xl transition-all border border-black/5">
                   <div className="w-16 h-16 bg-[#F7F7F7] flex items-center justify-center mb-8 rounded-2xl group-hover:bg-[#7A3E2D] group-hover:text-white group-hover:-translate-y-2 transition-all duration-500 font-bold text-2xl">BG</div>
                   <h3 className="text-2xl font-bold text-[#171717] mb-4">Bag Details</h3>
                   <p className="text-sm text-[#171717]/40 leading-relaxed font-bold uppercase tracking-widest text-xs">Verify your current selection.</p>
                </Link>

                {auth.role === "Admin" && (
                  <Link href="/admin" className="md:col-span-2 group bg-[#1A1A1A] p-12 md:p-16 rounded-[4rem] hover:bg-black transition-all text-white shadow-2xl shadow-black/10 relative overflow-hidden">
                     <div className="absolute right-[-2%] top-[-2%] text-[12rem] font-bold opacity-5 pointer-events-none select-none tracking-tighter">ADMIN</div>
                     <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                        <div>
                          <h3 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-4 leading-none">System <br /> Control</h3>
                          <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Elevated access: Manage catalog and users</p>
                        </div>
                        <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-md border border-white/10 font-bold text-xs uppercase tracking-widest">
                           Access Admin Panel →
                        </div>
                     </div>
                  </Link>
                )}

                <div className="md:col-span-2 bg-white/30 border-2 border-dashed border-[#171717]/5 p-20 text-center rounded-[3rem]">
                   <p className="text-[10px] font-bold text-[#171717]/20 uppercase tracking-[0.5em] mb-4">Gravity Protocol v3.x</p>
                   <p className="text-[#171717]/30 text-sm font-bold uppercase tracking-widest">Integrated loyalty & modules in simulation.</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}