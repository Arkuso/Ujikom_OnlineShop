"use client";

import productService from "@/services/productService";
import cartService from "@/services/cartService";
import { Product } from "@/types/product";
import { useCartStore } from "@/lib/useCartstore";
import { useAuthStore } from "@/lib/useAuthstore";
import { getValidToken } from "@/lib/authSession";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id;
  const fetchCart = useCartStore((state) => state.fetchCart);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const fetchProduct = useCallback(async () => {
    try {
      const response = await productService.getById(Number(productId));
      if (response.success && response.data) {
        setProduct(response.data);
      } else {
        setMessage(response.message || "Product not found.");
      }
    } catch {
      setMessage("Connection failed. Check your network.");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId, fetchProduct]);

  const handleAddToCart = async () => {
    if (!product) return;

    const token = getValidToken();
    if (!token) {
      setSuccess(false);
      setMessage("Please login to add items to your bag.");
      router.push("/login");
      return;
    }

    setAddingToCart(true);
    try {
      const response = await cartService.addToCart({ productId: product.id, quantity: 1 });
      if (response.success) {
        setSuccess(true);
        setMessage("Added to your bag successfully.");
        await fetchCart();
      } else {
        setSuccess(false);
        setMessage(response.message || "Failed to add item.");
      }
    } catch {
      setSuccess(false);
      setMessage("Error communicating with server.");
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#E6D3B1]">
        <div className="w-10 h-10 border-4 border-white/20 border-t-[#7A3E2D] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center bg-[#E6D3B1]">
        <h2 className="text-4xl font-black text-[#171717] mb-4">ITEM NOT FOUND</h2>
        <Link href="/products" className="text-[#7A3E2D] font-bold underline">Return to Shop</Link>
      </div>
    );
  }

  const imageSrc = product.imageUrl
    ? product.imageUrl.startsWith("http")
      ? product.imageUrl
      : `http://localhost:5055${product.imageUrl}`
    : "https://via.placeholder.com/1000x1200?text=Product";

  return (
    <div className="bg-[#E6D3B1] min-h-screen pt-32 pb-24">
      <div className="max-w-360 mx-auto px-6 lg:px-12">
        {/* Breadcrumb */}
        <div className="mb-12">
          <Link href="/products" className="text-sm font-bold text-[#171717]/40 hover:text-[#7A3E2D] transition-colors flex items-center gap-2">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
               <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
             </svg>
             Back to Collection
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
          {/* Main Display Sector */}
          <div className="lg:col-span-7">
             <div className="aspect-4/5 bg-white rounded-3xl overflow-hidden border border-black/5 shadow-sm">
                <img
                  src={imageSrc}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
             </div>
          </div>

          {/* Configuration Sector */}
          <div className="lg:col-span-5 flex flex-col pt-4">
              <div className="mb-12">
                 <span className="inline-block px-4 py-1.5 bg-white rounded-full text-[10px] font-bold uppercase tracking-widest text-[#7A3E2D] mb-6 shadow-sm">
                   {product.categoryName || "Official Collection"}
                 </span>
                 
                 <h1 className="text-5xl md:text-6xl font-bold text-[#171717] leading-[1.1] mb-8 tracking-tight">
                   {product.name}
                 </h1>
                 
                 <p className="text-3xl font-bold text-[#7A3E2D]">
                    Rp {product.price.toLocaleString("id-ID")}
                 </p>
              </div>

              <div className="space-y-12">
                 <div className="max-w-md">
                    <h3 className="text-xs font-bold text-[#171717]/40 uppercase tracking-widest mb-4">Description</h3>
                    <p className="text-[#171717]/70 text-lg leading-relaxed font-medium">
                      {product.description || "Elegant and timeless product designed for the modern lifestyle. Quality materials and craftsmanship in every detail."}
                    </p>
                 </div>

                 {/* Purchase Actions */}
                 <div className="p-8 bg-white rounded-4xl border border-black/5 shadow-sm">
                    <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-100">
                       <span className="text-sm font-bold text-[#171717]/40">Availability Source</span>
                       <span className={`text-sm font-bold ${product.stock > 0 ? "text-emerald-600" : "text-rose-500"}`}>
                         {product.stock > 0 ? `${product.stock} units in global stock` : "Out of stock"}
                       </span>
                    </div>
                    
                    <button
                      onClick={handleAddToCart}
                      disabled={product.stock <= 0 || addingToCart}
                      className="w-full h-16 bg-[#1A1A1A] text-white text-sm font-bold rounded-xl hover:bg-black disabled:bg-gray-200 transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                      {addingToCart ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.119-1.243l1.263-12c.056-.53.505-.933 1.039-.933h14.225c.534 0 .983.404 1.039.933ZM16.5 10.5V18m-9-7.5V18" />
                          </svg>
                          {isAuthenticated ? "Add to collection bag" : "Sign in to add to bag"}
                        </>
                      )}
                    </button>
                    
                    {message && (
                      <div className={`mt-6 text-center text-xs font-bold uppercase tracking-widest ${success ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {message}
                      </div>
                    )}
                 </div>

                 {/* Premium Details */}
                 <div className="grid grid-cols-2 gap-8 pt-8 border-t border-black/10">
                    <div>
                       <span className="block text-[10px] font-bold text-[#171717]/40 uppercase tracking-widest mb-2">Warranty</span>
                       <span className="text-sm font-bold text-[#171717]">2 Year Limited</span>
                    </div>
                    <div>
                       <span className="block text-[10px] font-bold text-[#171717]/40 uppercase tracking-widest mb-2">Shipping</span>
                       <span className="text-sm font-bold text-[#171717]">Global Priority</span>
                    </div>
                 </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
