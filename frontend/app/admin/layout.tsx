"use client";

import { useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const authState = useMemo(() => {
    if (typeof window === "undefined") {
      return { checked: false, authorized: false, hasToken: false };
    }

    const token = localStorage.getItem("token");
    if (!token) {
      return { checked: true, authorized: false, hasToken: false };
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const role =
        payload.role ||
        payload[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ];

      return { checked: true, authorized: role === "Admin", hasToken: true };
    } catch {
      return { checked: true, authorized: false, hasToken: true };
    }
  }, []);

  useEffect(() => {
    if (!authState.checked || authState.authorized) {
      return;
    }

    if (authState.hasToken) {
      router.replace("/");
      return;
    }

    router.replace("/login");
  }, [authState, router]);

  if (!authState.checked || !authState.authorized) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#E6D3B1]">
        <div className="w-10 h-10 border-4 border-white/20 border-t-[#7A3E2D] rounded-full animate-spin mb-6"></div>
      </div>
    );
  }

  const navItems = [
    { label: "Overview", href: "/admin" },
    { label: "Products", href: "/admin/products" },
    { label: "Categories", href: "/admin/categories" },
    { label: "Orders", href: "/admin/orders" },
    { label: "Add Asset", href: "/admin/products/add" },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <div className="bg-[#E6D3B1] min-h-screen pt-32 pb-24">
      <div className="max-w-360 mx-auto px-6 lg:px-12">
        {/* Admin Header - Kursiku Style */}
        <div className="mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-12">
            <div>
              <h1 className="text-5xl font-black text-[#171717] uppercase tracking-tighter leading-none">
                Station <span className="text-[#7A3E2D]">Control</span>
              </h1>
              <p className="text-[#171717]/40 text-[10px] font-bold uppercase tracking-widest mt-6">
                Administrative Sector &nbsp;·&nbsp; Authorized Stream
              </p>
            </div>
            
            <div className="flex items-center gap-8">
               <Link href="/" className="text-xs font-bold text-[#171717]/40 hover:text-[#7A3E2D] uppercase tracking-widest transition-colors">Site Preview</Link>
               <button
                 onClick={() => {
                   localStorage.removeItem("token");
                   router.push("/login");
                 }}
                 className="text-[10px] font-bold text-rose-500 hover:bg-rose-50 px-6 py-3 border border-rose-100 uppercase tracking-widest transition-all rounded-xl"
               >
                 Terminate Session
               </button>
            </div>
          </div>

          {/* Navigation - Kursiku Minimalist Tabs */}
          <div className="flex flex-wrap gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-8 py-4 text-xs font-bold uppercase tracking-widest transition-all rounded-xl border border-black/5 ${
                  isActive(item.href)
                    ? "bg-[#1A1A1A] text-white shadow-xl"
                    : "bg-white/50 text-[#171717]/40 hover:text-[#7A3E2D] hover:bg-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white p-10 md:p-12 rounded-[3rem] shadow-xl border border-black/5 animate-in fade-in duration-700">
          {children}
        </div>
        
        {/* Footer Polish */}
        <div className="mt-24 pt-10 border-t border-black/5 flex justify-between items-center opacity-30 italic">
           <span className="text-[10px] font-bold uppercase tracking-widest text-[#171717]/40">Gravity Administrative Protocol v3.x-SEC</span>
           <span className="text-[10px] font-bold uppercase tracking-widest text-[#171717]/40">Channel Secure</span>
        </div>
      </div>
    </div>
  );
}
