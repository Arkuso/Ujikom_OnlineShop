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
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Decode JWT to check role
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const role =
        payload.role ||
        payload[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ];
      if (role !== "Admin") {
        router.push("/");
        return;
      }
      setAuthorized(true);
    } catch {
      router.push("/login");
    }
  }, [router]);

  if (!authorized) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-sm text-gray-400">Checking authorization...</p>
      </div>
    );
  }

  const navItems = [
    { label: "Dashboard", href: "/admin" },
    { label: "Products", href: "/admin/products" },
    { label: "Add Product", href: "/admin/products/add" },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <div>
      {/* Admin Navigation */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-black">Admin Panel</h1>
            <p className="text-gray-500 mt-2 text-sm">
              Manage your store products and inventory
            </p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              router.push("/login");
            }}
            className="text-xs font-semibold text-gray-500 hover:text-red-600 transition"
          >
            Logout
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 border-b border-gray-200">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-3 text-sm font-semibold transition border-b-2 -mb-px ${
                isActive(item.href)
                  ? "text-black border-black"
                  : "text-gray-400 border-transparent hover:text-gray-600 hover:border-gray-300"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Page Content */}
      {children}
    </div>
  );
}
