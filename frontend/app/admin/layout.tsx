"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [authState, setAuthState] = useState({ checked: false, authorized: false, hasToken: false });

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("token");
    if (!token) {
      setAuthState({ checked: true, authorized: false, hasToken: false });
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const role =
        payload.role ||
        payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

      setAuthState({ checked: true, authorized: role === "Admin", hasToken: true });
    } catch {
      setAuthState({ checked: true, authorized: false, hasToken: true });
    }
  }, []);

  useEffect(() => {
    if (!authState.checked || authState.authorized) {
      return;
    }
    if (authState.hasToken) {
      router.replace("/");
    } else {
      router.replace("/login");
    }
  }, [authState, router]);

  // Fix hydration mismatch: ensure client matches server up to first mount.
  if (!mounted || !authState.checked || !authState.authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E1D4B8]">
        <div className="w-10 h-10 border-4 border-black/10 border-t-[#8E4A35] rounded-full animate-spin"></div>
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
    <div className="bg-[#f4f4f0] min-h-screen pt-10 pb-24 font-sans text-[#1C1C1E]">
      <div className="max-w-[1300px] mx-auto px-6 lg:px-12">
        {children}
      </div>
    </div>
  );
}
