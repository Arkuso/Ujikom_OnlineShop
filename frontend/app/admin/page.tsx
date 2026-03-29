"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  categoryName: string;
}

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:5055/api/Product", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalProducts = products.length;
  const lowStockItems = products.filter((p) => p.stock < 10);
  const outOfStockItems = products.filter((p) => p.stock === 0);

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#7A3E2D]/20 border-t-[#7A3E2D] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Overview Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#F7F7F7] p-8 rounded-2xl border border-black/5">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
            Active Catalog
          </p>
          <p className="text-4xl font-bold text-[#171717]">{totalProducts}</p>
          <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">Total Articles</p>
        </div>
        <div className="bg-[#F7F7F7] p-8 rounded-2xl border border-black/5">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
            Critical Stock
          </p>
          <p className="text-4xl font-bold text-[#7A3E2D]">
            {lowStockItems.length}
          </p>
          <p className="text-[10px] text-gray-300 mt-2 font-bold uppercase tracking-widest">Under 10 Threshold</p>
        </div>
        <div className="bg-[#F7F7F7] p-8 rounded-2xl border border-black/5">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
            Depleted
          </p>
          <p className="text-4xl font-bold text-rose-500">
            {outOfStockItems.length}
          </p>
          <p className="text-[10px] text-gray-300 mt-2 font-bold uppercase tracking-widest">Restock Required</p>
        </div>
      </div>

      {/* Critical Alerts */}
      {lowStockItems.length > 0 && (
        <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
          <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-[#F7F7F7]/50">
            <h3 className="text-[10px] font-bold text-[#171717] uppercase tracking-widest">
              Stock Warnings
            </h3>
            <Link
              href="/admin/products"
              className="text-[10px] font-bold text-[#7A3E2D] hover:underline uppercase tracking-widest"
            >
              Full Analytics →
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {lowStockItems.slice(0, 5).map((product) => (
              <div
                key={product.id}
                className="px-8 py-5 flex items-center justify-between group hover:bg-[#F7F7F7] transition-colors"
              >
                <div>
                  <p className="text-sm font-bold text-[#171717]">
                    {product.name}
                  </p>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1.5">{product.categoryName}</p>
                </div>
                <span
                  className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full ${
                    product.stock === 0
                      ? "bg-rose-50 text-rose-600 border border-rose-100"
                      : "bg-amber-50 text-amber-600 border border-amber-100"
                  }`}
                >
                  {product.stock === 0
                    ? "Depleted"
                    : `${product.stock} units`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
        <div className="px-8 py-5 border-b border-gray-100 bg-[#F7F7F7]/50">
          <h3 className="text-[10px] font-bold text-[#171717] uppercase tracking-widest">
            Module Stream
          </h3>
        </div>
        <div className="divide-y divide-gray-100">
          {products.length > 0 ? (
            products.slice(0, 5).map((product) => (
              <div
                key={product.id}
                className="px-8 py-5 flex items-center justify-between group hover:bg-[#F7F7F7] transition-colors"
              >
                <div>
                  <p className="text-sm font-bold text-[#171717]">
                    {product.name}
                  </p>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1.5">
                    {product.categoryName} · Rp{" "}
                    {product.price.toLocaleString("id-ID")}
                  </p>
                </div>
                <Link
                  href={`/admin/products/${product.id}`}
                  className="text-[10px] font-bold text-[#7A3E2D] hover:underline uppercase tracking-widest"
                >
                  Edit Unit
                </Link>
              </div>
            ))
          ) : (
            <div className="px-8 py-16 text-center">
              <p className="text-sm text-gray-400 font-bold mb-4">Catalog stream is inactive.</p>
              <Link
                href="/admin/products/add"
                className="inline-block bg-[#1A1A1A] text-white px-8 py-3 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-black transition-all"
              >
                Initialize New Asset
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
