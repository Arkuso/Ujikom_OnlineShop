"use client";

import ProductCard from "@/components/ProductCard";
import categoryService from "@/services/categoryService";
import productService from "@/services/productService";
import { Category } from "@/types/category";
import { Product } from "@/types/product";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function SalePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productResponse = await productService.getSale();
        if (productResponse.success) {
          setProducts(productResponse.data || []);
        } else {
          setMessage(productResponse.message || "Failed to load products.");
        }
      } catch {
        setMessage("Connection failed. Check your network.");
      }

      try {
        const categoryResponse = await categoryService.getAll();
        if (categoryResponse.success) {
          setCategories(categoryResponse.data || []);
        }
      } catch {
        // Categories are optional for the Sale page; keep products visible.
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!activeCategoryId) return products;
    return products.filter((product) => product.categoryId === activeCategoryId);
  }, [products, activeCategoryId]);

  const activeCategoryName = activeCategoryId
    ? categories.find((category) => category.id === activeCategoryId)?.name
    : "Sale";

  return (
    <div className="min-h-screen bg-[#F4F4F6] pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center pt-6 pb-10">
          <h1 className="font-hk-grotesk-wide text-4xl sm:text-5xl md:text-6xl font-semibold text-[#171717] tracking-tight">
            Sale
          </h1>
          <div className="mt-2 mx-auto w-20 h-px bg-[#171717]/40" />
          <p className="mt-4 text-sm sm:text-base text-[#171717]/80 font-medium">
            Get in on these deals before they&apos;re gone.
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 pb-8 font-vercetti">
          <div className="text-sm sm:text-base text-[#171717]/90">
            <Link href="/" className="underline underline-offset-4 hover:text-black">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span>{activeCategoryName}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowFilters((current) => !current)}
            className="inline-flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-[#171717] shadow-sm hover:shadow transition-shadow"
          >
            <span className="inline-flex h-5 w-5 items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="9" cy="6" r="2" stroke="currentColor" strokeWidth="2" />
                <circle cx="15" cy="12" r="2" stroke="currentColor" strokeWidth="2" />
                <circle cx="13" cy="18" r="2" stroke="currentColor" strokeWidth="2" />
              </svg>
            </span>
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="mb-8 rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setActiveCategoryId(null)}
                className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                  !activeCategoryId ? "bg-black text-white" : "bg-[#F4F4F6] text-[#171717]"
                }`}
              >
                All Products
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setActiveCategoryId(category.id)}
                  className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                    activeCategoryId === category.id ? "bg-black text-white" : "bg-[#F4F4F6] text-[#171717]"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-black/10 border-t-black rounded-full animate-spin"></div>
          </div>
        ) : message ? (
          <div className="mx-auto max-w-xl rounded-2xl border border-rose-100 bg-rose-50 px-10 py-8 text-center text-[10px] font-bold uppercase tracking-widest text-rose-600">
            {message}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="mx-auto max-w-2xl rounded-3xl bg-white px-10 py-24 text-center shadow-sm border border-black/5">
            <h3 className="text-3xl sm:text-4xl font-semibold text-[#171717] mb-4">No products found</h3>
            <p className="text-[#171717]/60 text-base sm:text-lg leading-relaxed mb-10 max-w-md mx-auto">
              The selected filter does not have any products right now.
            </p>
            <button
              type="button"
              onClick={() => setActiveCategoryId(null)}
              className="rounded-xl bg-black px-8 py-4 text-sm font-bold text-white hover:bg-black/90 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}