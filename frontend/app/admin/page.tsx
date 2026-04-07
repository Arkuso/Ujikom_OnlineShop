"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import productService from "@/services/productService";

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
      const response = await productService.getAll();
      if (response.success && response.data) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalProductsCount = products.length;
  const criticalStockItems = products.filter((p) => p.stock > 0 && p.stock < 10);
  const depletedStockItems = products.filter((p) => p.stock === 0);

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-10 lg:py-14 px-4 sm:px-6">
      {/* 1. Kartu Atas (Kartu Statistik) */}
      <div className="bg-[#D9D9D9] p-8 md:p-10 rounded-[2rem]">
        <h1 className="text-4xl md:text-5xl font-hk-grotesk-wide mb-2 tracking-wide">
          <span className="text-[#0066FF]">Admin</span> <span className="text-black">Controll</span>
        </h1>
        <p className="text-gray-500 font-vercetti text-sm md:text-base mb-8">
          Administrative Sector <span className="mx-2">·</span> Authorized Stream
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-white p-6 md:p-8 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
            <p className="text-gray-500 text-sm font-vercetti mb-3">Product Available</p>
            <p className="text-3xl lg:text-[40px] leading-tight font-vercetti text-black">Qty {totalProductsCount}</p>
          </div>
          <div className="bg-white p-6 md:p-8 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
            <p className="text-gray-500 text-sm font-vercetti mb-3">Critical Stock</p>
            <p className="text-3xl lg:text-[40px] leading-tight font-vercetti text-black">{criticalStockItems.length}</p>
          </div>
          <div className="bg-white p-6 md:p-8 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
            <p className="text-gray-500 text-sm font-vercetti mb-3">Depleted Stock</p>
            <p className="text-3xl lg:text-[40px] leading-tight font-vercetti text-black">{depletedStockItems.length}</p>
          </div>
        </div>
      </div>

      {/* 2. Kartu Bawah (Konten & Peringatan) */}
      <div className="bg-[#D9D9D9] p-8 md:p-10 rounded-[2rem]">
        {/* Menu Navigasi */}
        <div className="flex flex-wrap gap-2 md:gap-3 mb-8">
          <Link href="/admin" className="bg-black text-white font-vercetti px-6 py-3 rounded-xl text-sm transition active:scale-95 shadow-sm">
            Overview
          </Link>
          <Link href="/admin/products" className="bg-white text-gray-500 font-vercetti px-6 py-3 rounded-xl text-sm hover:bg-gray-50 transition active:scale-95 shadow-sm">
            Products
          </Link>
          <Link href="/admin/categories" className="bg-white text-gray-500 font-vercetti px-6 py-3 rounded-xl text-sm hover:bg-gray-50 transition active:scale-95 shadow-sm">
            Categories
          </Link>
          <Link href="/admin/orders" className="bg-white text-gray-500 font-vercetti px-6 py-3 rounded-xl text-sm hover:bg-gray-50 transition active:scale-95 shadow-sm">
            Orders
          </Link>
          <Link href="/admin/products/add" className="bg-white text-gray-500 font-vercetti px-6 py-3 rounded-xl text-sm hover:bg-gray-50 transition active:scale-95 shadow-sm">
            Add product
          </Link>
        </div>

        {/* Daftar Peringatan Stok (Stock Warnings) */}
        <div className="space-y-4">
          {[...depletedStockItems, ...criticalStockItems].length > 0 ? (
            [...depletedStockItems, ...criticalStockItems].map((product) => (
              <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-[15px] text-black font-hk-grotesk-wide tracking-wider">Stock Warnings</h3>
                </div>
                <div className="px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-base text-black font-vercetti mb-1.5">{product.name}</p>
                    <p className="text-sm text-black font-vercetti">Categories : {product.categoryName}</p>
                  </div>
                  <div className="bg-[#D9D9D9] px-5 py-2.5 rounded-full flex items-center justify-center shrink-0">
                    <p className="text-sm text-black font-vercetti whitespace-nowrap">
                      <span className="text-red-600 font-vercetti text-base mr-1">{product.stock}</span> Units Left
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-10 rounded-2xl shadow-sm text-center text-gray-500 font-vercetti">
              No stock warnings at the moment.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
