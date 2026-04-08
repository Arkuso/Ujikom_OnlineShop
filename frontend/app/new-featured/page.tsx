"use client";

import ProductCard from "@/components/ProductCard";
import productService from "@/services/productService";
import { Product } from "@/types/product";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useToastStore } from "@/lib/useToaststore";

export default function NewFeaturedPage() {
  const { showToast } = useToastStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await productService.getFeatured();
        if (response.success) {
          setProducts(response.data || []);
        } else {
          showToast(response.message || "Failed to load featured products.", "error");
        }
      } catch {
        showToast("Connection failed. Check your network.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#F4F4F6] pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center pt-6 pb-10">
          <h1 className="font-hk-grotesk-wide text-4xl sm:text-5xl md:text-6xl font-semibold text-[#171717] tracking-tight">
            New Drop
          </h1>
          <div className="mt-2 mx-auto w-40 h-px bg-[#171717]/40" />
          <p className="mt-4 text-sm sm:text-base text-[#171717]/80 font-medium">
            True to our heritage. Always innovating. Don't miss what's new.
          </p>
        </div>

        <div className="flex items-center gap-2 pb-8 text-sm sm:text-base text-[#171717]/90 font-vercetti">
          <Link href="/" className="underline underline-offset-4 hover:text-black">
            Home
          </Link>
          <span>/</span>
          <span>New Drop</span>
        </div>

        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-black/10 border-t-black rounded-full animate-spin"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="mx-auto max-w-2xl rounded-3xl bg-white px-10 py-24 text-center shadow-sm border border-black/5">
            <h3 className="text-3xl sm:text-4xl font-semibold text-[#171717] mb-4">No featured products yet</h3>
            <p className="text-[#171717]/60 text-base sm:text-lg leading-relaxed max-w-md mx-auto">
              New releases will appear here when products are added.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}