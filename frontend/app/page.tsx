"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import categoryService from "@/services/categoryService";
import { Category } from "@/types/category";

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Map category names to their respective images in public/categories
  const categoryImages: { [key: string]: string } = {
    "Headphones": "/categories/headphones.jpg",
    "Computers": "/categories/computers.jpg",
    "Smartphones": "/categories/smartphones.jpg",
    "Smart Phones": "/categories/smartphones.jpg",
    "Speakers": "/categories/speakers.jpg",
    "Accessories": "/categories/accessories.jpg",
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getAll();
        if (response.success) {
          setCategories(response.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch categories", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="flex flex-col gap-14 md:gap-16 pb-20 bg-[#f4f4f0] min-h-screen">
      {/* Hero Section */}
      <section className="mt-20 relative min-h-[520px] lg:min-h-[560px] bg-[#6B4F3A] overflow-hidden group flex items-center">
        {/* Layout Container */}
        <div className="relative z-10 w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-8 lg:gap-10 px-6 lg:px-12">
          {/* Text Side */}
            <div className="max-w-2xl py-10 lg:py-12">
               <h1 className="font-obrazec2 text-6xl md:text-8xl font-black text-[#C9A15B] tracking-[0.02em] [word-spacing:0.12em] leading-[0.98] mb-10">
                 Discover your <br />
                 favorite gadget<br />
                 here.
               </h1>
               
               <p className="font-vercetti text-white/70 text-lg md:text-xl font-medium max-w-xl mb-12 leading-relaxed">
                 Shop curated electronics with trusted quality, competitive prices, and fast checkout. From headphones and smartphones to computers and accessories, everything you need is in one place.
               </p>
            </div>

            {/* Image Side */}
            <div className="relative h-full py-10 lg:py-16 flex items-center justify-center lg:justify-end">
               <div className="relative w-full aspect-[4/3] max-w-[600px] overflow-hidden rounded-[2rem]">
                  <img 
                    src="/Woman.jpg" 
                    alt="System Preview"
                    className="w-full h-full object-cover"
                  />
               </div>
            </div>
          </div>
        </section>

      {/* Categories Grid - KURSIKU Inspired */}
      <section className="px-6 lg:px-12 max-w-360 mx-auto w-full -mt-6 md:-mt-8">
         <div className="text-center mb-16">
            <h2 className="font-obrazec2 text-4xl md:text-5xl font-black text-[#C9A15B] mb-6 tracking-[0.02em] [word-spacing:0.12em]">Exclusive Categories</h2>
            <p className="font-vercetti text-[#0E0E12] max-w-2xl mx-auto font-medium">
              Check out this week&apos;s selection of popular modules that might catch your eye, and don&apos;t miss our global inventory updates.
            </p>
         </div>

         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 lg:gap-14">
            {loading ? (
              [1, 2, 3, 4, 5].map(i => <div key={i} className="aspect-square bg-white/10 rounded-full animate-pulse"></div>)
            ) : (
              categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.id}`}
                  className="group relative flex flex-col items-center justify-center aspect-square"
                >
                  <div className="w-full h-full relative rounded-full overflow-hidden bg-white shadow-sm border border-black/5 hover:shadow-2xl transition-all duration-500">
                    <img
                      src={categoryImages[cat.name] || "/categories/accessories.jpg"}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-110 group-hover:brightness-50 transition-all duration-700"
                    />
                    {/* Hover Text */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                      <p className="font-vercetti text-white text-xl md:text-2xl font-bold tracking-tight text-center px-4">
                        {cat.name}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
         </div>
      </section>

      {/* CTA Section - Minimal Coffee */}
      <section className="px-6 lg:px-12 max-w-360 mx-auto w-full text-center py-20 bg-white/40 rounded-3xl border border-white/50 backdrop-blur-sm">
         <h2 className="text-5xl font-bold text-[#171717] mb-8 tracking-tight">Elevate your digital space.</h2>
         <p className="text-[#171717]/60 max-w-xl mx-auto mb-12 text-lg">
           Join the community of professionals who trust Gravity for their refined toolsets and equipment.
         </p>
         <Link
            href="/products"
            className="inline-block bg-[#7A3E2D] text-white px-16 py-6 text-sm font-bold rounded-2xl hover:bg-[#5C2D21] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-[#7A3E2D]/20"
         >
            Explore Full Catalog
         </Link>
      </section>
    </div>
  );
}
