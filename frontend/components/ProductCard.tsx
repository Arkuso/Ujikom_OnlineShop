"use client";

import Link from "next/link";
import { useCartStore } from "@/lib/useCartstore";
import { useAuthStore } from "@/lib/useAuthstore";
import { getValidToken } from "@/lib/authSession";
import cartService from "@/services/cartService";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    imageUrl: string;
    categoryName?: string;
    category?: {
      name: string;
    };
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");
  const fetchCart = useCartStore((state) => state.fetchCart);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const imageSrc = product.imageUrl
    ? product.imageUrl.startsWith("http")
      ? product.imageUrl
      : `http://localhost:5055${product.imageUrl}`
    : "https://via.placeholder.com/800x1000?text=Product";

  const categoryLabel = product.categoryName || product.category?.name || "Product";

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const token = getValidToken();
    if (!token) {
      setMessage("Please sign in to add items");
        setTimeout(() => setMessage(""), 3000);
      router.push("/login");
        return;
    }

    setAdding(true);
    try {
      const resp = await cartService.addToCart({ productId: product.id, quantity: 1 });
      if (resp.success) {
        await fetchCart();
        setMessage("Added to bag");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (err) {
      console.error(err);
      setMessage("Error adding");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="group flex flex-col gap-5 bg-white p-4 rounded-4xl border border-black/5 hover:shadow-xl transition-all duration-500 h-full">
      {/* Visual Sector */}
      <div className="relative aspect-4/5 overflow-hidden rounded-3xl bg-[#F7F7F7]">
        <Link href={`/products/${product.id}`} className="block h-full">
           <img
             src={imageSrc}
             alt={product.name}
             className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
           />
        </Link>
        
        {/* Category Chip */}
        <div className="absolute top-4 left-4">
           <span className="bg-white/90 backdrop-blur-md text-[#171717] text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full shadow-sm">
             {categoryLabel}
           </span>
        </div>

        {/* Action Overlay */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
           <button 
             onClick={handleQuickAdd}
             disabled={adding || product.stock <= 0}
             className="w-full h-12 bg-[#1A1A1A] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-3 shadow-xl hover:bg-black transition-all active:scale-95 disabled:bg-gray-300"
           >
              {adding ? (
                 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  {isAuthenticated ? "Add to bag" : "Sign in to add"}
                </>
              )}
           </button>
        </div>
      </div>

      {/* Detail Sector */}
      <div className="px-2 flex flex-col gap-2 grow">
         <div className="flex justify-between items-start gap-4">
            <Link href={`/products/${product.id}`} className="flex-1">
              <h3 className="text-lg font-bold text-[#171717] leading-tight hover:text-[#7A3E2D] transition-colors line-clamp-2">
                {product.name}
              </h3>
            </Link>
            <p className="text-xl font-bold text-[#7A3E2D] whitespace-nowrap">
              Rp{product.price.toLocaleString("id-ID")}
            </p>
         </div>

         {message && (
            <p className="text-[10px] font-bold uppercase text-[#7A3E2D] tracking-widest animate-pulse">
               {message}
            </p>
         )}

         <div className="mt-auto flex items-center justify-between pt-4">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${product.stock > 0 ? 'text-gray-400' : 'text-rose-500'}`}>
              {product.stock > 0 ? `${product.stock} available` : 'Sold out'}
            </span>
            <Link href={`/products/${product.id}`} className="text-[10px] font-bold uppercase tracking-widest text-[#171717]/40 hover:text-[#7A3E2D] transition-colors">
               Detail →
            </Link>
         </div>
      </div>
    </div>
  );
}
