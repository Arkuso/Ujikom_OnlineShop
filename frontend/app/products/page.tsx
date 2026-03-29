"use client";

import productService from "@/services/productService";
import categoryService from "@/services/categoryService";
import { Product } from "@/types/product";
import { Category } from "@/types/category";
import { useEffect, useState, Suspense } from "react";
import ProductCard from "@/components/ProductCard";
import { useSearchParams, useRouter } from "next/navigation";

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearchQuery = searchParams.get("search")?.trim() || "";
  const initialCategoryId = Number(searchParams.get("category"));
  const selectedCategory = Number.isFinite(initialCategoryId) && initialCategoryId > 0
    ? initialCategoryId
    : null;
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const normalizeText = (value: string) =>
    value.toLowerCase().replace(/[^a-z0-9]/g, "");

  const normalizedQuery = normalizeText(initialSearchQuery);
  
  const filteredProducts = products.filter((product) => {
    // Search Filter
    const matchesSearch = !normalizedQuery || (
      normalizeText(product.categoryName || "").includes(normalizedQuery) ||
      normalizeText(product.name || "").includes(normalizedQuery) ||
      normalizeText(product.description || "").includes(normalizedQuery)
    );
    
    // Category Filter
    const matchesCategory = !selectedCategory || product.categoryId === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodResponse, catResponse] = await Promise.all([
          productService.getAll(),
          categoryService.getAll()
        ]);
        
        if (prodResponse.success) {
          setProducts(prodResponse.data || []);
        } else {
          setMessage(prodResponse.message || "Failed to load products.");
        }
        
        if (catResponse.success) {
          setCategories(catResponse.data || []);
        }
      } catch {
        setMessage("Connection failed. Check your network.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-[#E6D3B1] min-h-screen pt-32 pb-24">
      <div className="max-w-360 mx-auto px-6 lg:px-12">
        {/* Header Section */}
        <div className="mb-20 px-4">
          <h1 className="text-5xl md:text-6xl font-black text-[#171717] uppercase tracking-tighter leading-none mb-12 animate-in fade-in slide-in-from-left duration-1000">
            Product <span className="text-[#7A3E2D]">Catalog</span>
          </h1>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 py-8 border-y border-black/5 italic">
            <div className="flex flex-wrap gap-4">
               <button 
                 onClick={() => router.push('/products')}
                 className={`px-8 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-300 ${!selectedCategory ? 'bg-[#1A1A1A] text-white shadow-xl' : 'bg-white text-[#171717]/60 border border-black/5 hover:border-[#7A3E2D]'}`}
               >
                 All Designs
               </button>
               {categories.map(cat => (
                 <button 
                   key={cat.id}
                   onClick={() => router.push(`/products?category=${cat.id}`)}
                   className={`px-8 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-300 ${selectedCategory === cat.id ? 'bg-[#1A1A1A] text-white shadow-xl' : 'bg-white text-[#171717]/60 border border-black/5 hover:border-[#7A3E2D]'}`}
                 >
                   {cat.name}
                 </button>
               ))}
            </div>
            
            <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-[#171717]/30">
               <span>Collection size: {filteredProducts.length}</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="min-h-[40vh] flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-white/20 border-t-[#7A3E2D] rounded-full animate-spin"></div>
          </div>
        ) : message ? (
          <div className="mx-auto max-w-xl border border-rose-100 bg-rose-50 px-10 py-8 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-rose-600 text-center">
            {message}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="mx-auto max-w-2xl bg-white px-10 py-32 text-center rounded-[3rem] shadow-xl border border-black/5">
            <h3 className="text-4xl font-bold text-[#171717] mb-6 tracking-tight">No pieces found</h3>
            <p className="text-[#171717]/60 text-lg font-medium leading-relaxed mb-12 max-w-sm mx-auto">
              Your specific search query or category selection returned no results.
            </p>
            <button 
              onClick={() => {
                router.push('/products');
              }}
              className="bg-[#1A1A1A] text-white py-5 px-16 text-sm font-bold rounded-xl hover:bg-black transition-all active:scale-95 shadow-xl"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-10">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        
        {/* Footer Detail */}
        <div className="mt-48 pt-16 border-t border-black/5 flex justify-between items-center opacity-30 italic">
           <span className="text-[10px] font-bold uppercase tracking-widest text-[#171717]/40">Gravity Collection Stream</span>
           <span className="text-[10px] font-bold uppercase tracking-widest text-[#171717]/40">EOL Sequence</span>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#E6D3B1]">
        <div className="w-10 h-10 border-4 border-white/20 border-t-[#7A3E2D] rounded-full animate-spin"></div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
