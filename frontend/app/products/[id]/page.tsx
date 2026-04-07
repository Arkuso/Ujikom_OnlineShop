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
  const [selectedSize, setSelectedSize] = useState("42");
  const [selectedColor, setSelectedColor] = useState("dark");

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

  const [activeImage, setActiveImage] = useState<string>("");

  useEffect(() => {
    if (product) {
       const imageSrc = product.imageUrl
         ? product.imageUrl.startsWith("http")
           ? product.imageUrl
           : `http://localhost:5055${product.imageUrl}`
         : "https://via.placeholder.com/1000x1200?text=Product";
       setActiveImage(imageSrc);
    }
  }, [product]);

  const handleAddToCart = async () => {
    if (!product) return;

    const token = getValidToken();
    if (!token) {
      setSuccess(false);
      setMessage("Please login to add items to your cart.");
      router.push("/login");
      return;
    }

    setAddingToCart(true);
    try {
      const response = await cartService.addToCart({ productId: product.id, quantity: 1 });
      if (response.success) {
        setSuccess(true);
        setMessage("Added to your cart successfully.");
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

  const handleBuyNow = async () => {
     await handleAddToCart();
     if(isAuthenticated && product?.stock && product.stock > 0) {
        router.push("/cart");
     }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#F2F3F5]">
        <div className="w-10 h-10 border-4 border-black/20 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center bg-[#F2F3F5]">
        <h2 className="text-4xl font-hk-grotesk-wide font-bold text-black mb-4 uppercase">ITEM NOT FOUND</h2>
        <Link href="/sale" className="text-black font-vercetti underline hover:text-gray-600 transition">Return to Shop</Link>
      </div>
    );
  }

  const getFullUrl = (path?: string) => {
    if (!path) return null;
    return path.startsWith("http") ? path : `http://localhost:5055${path}`;
  };

  const mainImageFallback = getFullUrl(product.imageUrl) || "https://via.placeholder.com/1000x1200?text=Product";
  
  // Compile all available images
  const thumbnailsRaw = [product.imageUrl, product.imageUrl2, product.imageUrl3, product.imageUrl4]
     .map(getFullUrl)
     .filter(Boolean) as string[];
  
  const thumbnails = thumbnailsRaw.length > 0 ? thumbnailsRaw : [mainImageFallback];

  // Parse specifications
  let specs: {name: string, value: string}[] = [];
  try {
     if (product.specifications) {
        specs = JSON.parse(product.specifications);
     }
  } catch(e) {
     console.error("Failed to parse specifications", e);
  }

  const sizes = ["42", "46", "48", "50", "52", "54"];
  const colors = [
    { id: "dark", hex: "#171717" },
    { id: "light", hex: "#E6D3B1" },
  ];

  return (
    <div className="bg-[#F2F3F5] min-h-screen pt-32 pb-24">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Breadcrumb */}
        <div className="mb-10">
          <Link href="/sale" className="text-sm font-vercetti text-gray-500 hover:text-black transition-colors flex items-center gap-2">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
               <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
             </svg>
             Overview
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Sisi Kiri: Galeri Foto Detail */}
          <div className="lg:col-span-7 flex flex-col gap-6">
             {/* Main Display Container */}
             <div className="bg-white p-3 rounded-[3rem] shadow-sm">
                <div className="aspect-[4/5] bg-[#F8F9FA] rounded-[2.5rem] overflow-hidden flex items-center justify-center">
                  <img
                    src={activeImage || mainImageFallback}
                    alt={product.name}
                    className="w-full h-full object-contain mix-blend-multiply transition-opacity duration-300"
                  />
                </div>
             </div>
             
             {/* Thumbnail Grid Container */}
             <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
               {thumbnails.map((thumb, idx) => (
                 <div 
                   key={idx} 
                   onClick={() => setActiveImage(thumb)}
                   className={`shrink-0 w-28 bg-white p-2 rounded-3xl cursor-pointer hover:shadow-md transition-all group ${activeImage === thumb ? "ring-2 ring-black ring-offset-1" : "shadow-sm border border-transparent"}`}
                 >
                    <div className="aspect-square bg-[#F8F9FA] rounded-2xl overflow-hidden flex items-center justify-center relative">
                      <img 
                        src={thumb} 
                        alt={`Thumbnail ${idx}`} 
                        className="w-[85%] h-[85%] object-contain mix-blend-multiply transition-transform group-hover:scale-105" 
                      />
                    </div>
                 </div>
               ))}
             </div>
          </div>

          {/* Sisi Kanan: Informasi Produk & Interaksi */}
          <div className="lg:col-span-5 flex flex-col pt-4 lg:pt-8 bg-transparent">
              <div className="mb-10">                 
                 <h1 className="text-4xl md:text-[50px] font-hk-grotesk-wide font-bold text-black uppercase leading-[1.05] tracking-tight mb-8">
                   {product.name}
                 </h1>
                 
                 <p className="text-2xl font-vercetti font-bold text-black">
                    Rp {product.price.toLocaleString("id-ID")}
                 </p>
              </div>

              <div className="space-y-12">
                 {/* Deskripsi */}
                 <div className="max-w-md">
                    <p className="text-black/70 text-[16px] font-vercetti leading-[1.8]">
                      {product.description || "Premium crafted quality. A perfect blend of classic style and modern precision."}
                    </p>
                 </div>

                 {/* Spesifikasi Atribut (Dynamic Details) */}
                 <div className="flex flex-col gap-4 max-w-sm">
                    {specs.length > 0 ? (
                       specs.map((spec, index) => (
                          <div key={index} className="grid grid-cols-3 items-center gap-4">
                             <span className="font-vercetti font-semibold text-black text-[15px]">{spec.name}</span>
                             <span className="col-span-2 font-vercetti text-black/70 text-[15px]">: {spec.value}</span>
                          </div>
                       ))
                    ) : (
                       <p className="text-sm text-gray-500 font-vercetti italic">No specific details available.</p>
                    )}
                 </div>

                 {/* Purchase Options */}
                 <div className="space-y-10 pt-4">
                    
                    {/* Color Swatches */}
                    <div>
                      <h4 className="text-[13px] font-vercetti font-semibold text-black uppercase tracking-widest mb-4">Color :</h4>
                      <div className="flex gap-4">
                         {colors.map(c => (
                           <button 
                             key={c.id} 
                             onClick={() => setSelectedColor(c.id)}
                             className={`w-9 h-9 rounded-full border border-gray-300 p-1 transition-all ${selectedColor === c.id ? "ring-2 ring-black ring-offset-2" : "hover:border-black/50"}`}
                           >
                             <div className="w-full h-full rounded-full shadow-inner" style={{ backgroundColor: c.hex }}></div>
                           </button>
                         ))}
                      </div>
                    </div>

                    {/* Size Guide */}
                    <div>
                      <div className="flex flex-wrap items-center gap-6">
                        <span className="text-[13px] font-vercetti font-semibold text-black uppercase tracking-widest shrink-0">Size Guide :</span>
                        <div className="flex flex-wrap gap-5">
                          {sizes.map(size => (
                            <button
                              key={size}
                              onClick={() => setSelectedSize(size)}
                              className={`text-[16px] font-vercetti transition-all ${selectedSize === size ? "text-black font-bold" : "text-gray-400 hover:text-black"}`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-5 pt-6">
                       <button
                         onClick={handleBuyNow}
                         disabled={product.stock <= 0 || addingToCart}
                         className="flex-1 h-14 bg-[#111111] text-white text-[13px] font-vercetti font-bold rounded-2xl hover:bg-black disabled:bg-gray-300 transition-all uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95"
                       >
                         {addingToCart ? (
                           <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                         ) : "Buy Product"}
                       </button>

                       <button
                         onClick={handleAddToCart}
                         disabled={product.stock <= 0 || addingToCart}
                         className="flex-1 h-14 bg-transparent border-2 border-gray-200 text-black text-[13px] font-vercetti font-bold rounded-2xl hover:border-black disabled:border-gray-200 disabled:text-gray-400 transition-all uppercase tracking-widest flex items-center justify-center active:scale-95"
                       >
                         Add to Cart
                       </button>
                    </div>

                    {message && (
                      <div className={`mt-2 text-[14px] font-vercetti font-medium ${success ? 'text-green-600' : 'text-red-600'}`}>
                        {message}
                      </div>
                    )}
                 </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
