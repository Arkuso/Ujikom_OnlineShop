"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/useCartstore";
import { useAuthStore } from "@/lib/useAuthstore";
import NavbarSearch from "./NavbarSearch";

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const itemCount = useCartStore((state) => state.itemCount);
  const { isAuthenticated, user, syncFromStorage } = useAuthStore();

  useEffect(() => {
    syncFromStorage();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [syncFromStorage]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-transparent py-4" : "bg-transparent py-6"
      }`}
    >
      <div className={`max-w-360 mx-auto px-6 lg:px-12 flex items-center ${isScrolled ? "justify-center" : "justify-between"}`}>
        {/* Logo - Gravity */}
        {!isScrolled && (
          <Link href="/" className="font-obrazec2 text-4xl md:text-5xl leading-none tracking-wide text-[#C6A75E]">
            GRAVITY
          </Link>
        )}

        {/* Navigation - Centered */}
        <div className={`hidden md:flex items-center gap-10 ${isScrolled ? "bg-[#F4F6FA]/50 px-8 py-3 rounded-full shadow-sm" : ""}`}>
          {[
            { label: "Home", href: "/", hideOnScroll: false },
            { label: "Products", href: "/products", hideOnScroll: false },
            { label: "Newsfeed", href: "#", hideOnScroll: true },
            { label: "Promo", href: "#", hideOnScroll: true },
          ].map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`text-sm font-bold transition-all ${
                isScrolled
                  ? "hover:text-[#F4F6FA]"
                  : "hover:text-[#0E0E12]"
              } ${
                isScrolled
                  ? pathname === link.href
                    ? "text-[#0E0E12]"
                    : "text-[#171717]/80"
                  : pathname === link.href
                    ? "text-[#0E0E12]"
                    : "text-[#171717]/60"
              } ${isScrolled && link.hideOnScroll ? "hidden" : ""} ${
                link.label === "Home" || link.label === "Products" ? "font-vercetti" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
          
          {/* Show search inside this block when scrolled */}
          {isScrolled && (
            <div className="ml-4">
              <NavbarSearch isMinimal={true} />
            </div>
          )}
        </div>

        {/* Actions - Right */}
        {!isScrolled && (
          <div className="flex items-center gap-6">
            <div className="hidden sm:block">
              <NavbarSearch isMinimal={true} />
            </div>

            <Link href="/cart" className="relative text-[#171717] hover:text-[#7A3E2D] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.119-1.243l1.263-12c.056-.53.505-.933 1.039-.933h14.225c.534 0 .983.404 1.039.933ZM16.5 10.5V18m-9-7.5V18" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#7A3E2D] text-white text-[9px] font-bold flex items-center justify-center rounded-full">
                  {itemCount}
                </span>
              )}
            </Link>

            <span className="h-6 w-px bg-gray-200 mx-2 hidden lg:block"></span>

            {isAuthenticated ? (
              <Link href="/profile" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white text-xs font-bold uppercase transition-all group-hover:bg-black group-hover:scale-105 border border-white/10 ring-4 ring-[#7A3E2D]/5">
                  {user?.name?.charAt(0).toUpperCase() || "G"}
                </div>
                <div className="hidden lg:flex flex-col items-start -space-y-1">
                  <span className="text-[10px] font-bold text-[#7A3E2D] uppercase tracking-widest">Profile</span>
                  <span className="text-sm font-black text-[#171717] group-hover:text-[#7A3E2D] transition-colors uppercase">
                    {user?.name?.split(" ")[0]}
                  </span>
                </div>
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="bg-[#1A1A1A] text-white px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-xl shadow-black/10"
                >
                  Sign In
                </Link>
                <Link 
                  href="/register" 
                  className="hidden sm:block text-[10px] font-bold text-[#171717]/40 hover:text-[#7A3E2D] uppercase tracking-widest transition-colors px-2"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
