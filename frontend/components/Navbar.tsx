"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useCartStore } from "@/lib/useCartstore";
import { useAuthStore } from "@/lib/useAuthstore";

export default function Navbar() {
  const pathname = usePathname();
  const itemCount = useCartStore((state) => state.itemCount);
  const { isAuthenticated, syncFromStorage } = useAuthStore();

  useEffect(() => {
    syncFromStorage();
  }, [syncFromStorage]);

  return (
    <header className="absolute top-0 left-0 w-full z-50 bg-white border-y border-black/10">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between">
        <Link href="/" className="text-black text-[30px] sm:text-[34px] leading-none tracking-tight uppercase font-hk-grotesk-wide">
          Gravity
        </Link>

        <nav className="hidden md:flex items-center gap-7 lg:gap-12 xl:gap-14">
          {[
            { label: "NEW & FEATURED", href: "/new-featured" },
            { label: "SALE", href: "/sale" },
          ].map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`text-[15px] lg:text-[18px] uppercase tracking-wide transition-opacity font-vercetti ${
                pathname === link.href ? "text-black" : "text-black/90 hover:text-black"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4 sm:gap-5 lg:gap-6">
          <Link href="/products" aria-label="Search" className="block hover:opacity-70 transition-opacity">
            <Image src="/noun-search-4547030.png" alt="Search" width={36} height={36} className="w-7 h-7 lg:w-8 lg:h-8" />
          </Link>

          <Link href={isAuthenticated ? "/profile" : "/login"} aria-label="Profile" className="block hover:opacity-70 transition-opacity">
            <Image src="/noun-profile-7986550.png" alt="Profile" width={36} height={36} className="w-7 h-7 lg:w-8 lg:h-8" />
          </Link>

          <Link href="/cart" aria-label="Cart" className="relative block hover:opacity-70 transition-opacity">
            <Image src="/noun-cart-8350272%20(1).png" alt="Cart" width={36} height={36} className="w-7 h-7 lg:w-8 lg:h-8" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-black text-white text-[9px] font-bold flex items-center justify-center rounded-full">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
