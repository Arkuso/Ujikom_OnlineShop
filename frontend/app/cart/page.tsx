"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import cartService from "@/services/cartService";
import { useCartStore } from "@/lib/useCartstore";
import { getValidToken } from "@/lib/authSession";
import CartItem from "@/components/CartItem";
import { CartItem as CartItemType } from "@/types/cart";

export default function CartPage() {
  const router = useRouter();
  const fetchGlobalCart = useCartStore((state) => state.fetchCart);
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    const token = getValidToken();
    if (!token) {
      router.push("/login");
      return;
    }
    fetchCart();
  }, [router]);

  const fetchCart = async () => {
    try {
      const response = await cartService.getCart();
      if (response.success && response.data) {
        setCartItems(response.data);
      } else {
        setMessage(response.message || "Failed to load collection.");
      }
    } catch {
      setMessage("Connection lost. Resetting index stream.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: number) => {
    setRemovingId(id);
    try {
      const response = await cartService.removeItem(id);
      if (response.success) {
        setCartItems((prev) => prev.filter((item) => item.id !== id));
        setSuccess(true);
        setMessage("Item removed successfully.");
        setTimeout(() => setMessage(""), 2500);
        await fetchGlobalCart();
      } else {
        setSuccess(false);
        setMessage(response.message || "Removal failure.");
      }
    } catch {
      setSuccess(false);
      setMessage("Error communicating with integration engine.");
    } finally {
      setRemovingId(null);
    }
  };

  const handleChangeQuantity = async (item: CartItemType, nextQuantity: number) => {
    setUpdatingId(item.id);
    try {
      if (nextQuantity <= 0) {
        await handleRemove(item.id);
        return;
      }

      const response = await cartService.updateQuantity(item.id, nextQuantity);
      if (response.success && response.data) {
        setCartItems(response.data);
        setSuccess(true);
        setMessage("Quantity updated.");
        setTimeout(() => setMessage(""), 1500);
        await fetchGlobalCart();
      } else {
        setSuccess(false);
        setMessage(response.message || "Update skipped.");
      }
    } catch {
      setSuccess(false);
      setMessage("Link failed.");
    } finally {
      setUpdatingId(null);
    }
  };

  const grandTotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#E6D3B1]">
        <div className="w-10 h-10 border-4 border-white/20 border-t-[#7A3E2D] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center bg-[#E6D3B1]">
        <h2 className="text-4xl font-bold text-[#171717] mb-6 tracking-tight">Your collection is empty</h2>
        <p className="text-[#171717]/60 text-lg mb-12 max-w-sm mx-auto leading-relaxed">
          Looks like you haven&apos;t added any pieces to your workspace or living module yet.
        </p>
        <Link
          href="/products"
          className="bg-[#1A1A1A] text-white py-5 px-16 text-sm font-bold rounded-xl hover:bg-black transition-all active:scale-95 shadow-xl"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#E6D3B1] min-h-screen pt-32 pb-24">
      <div className="max-w-360 mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-16 px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div>
              <h1 className="text-5xl md:text-6xl font-black text-[#171717] uppercase tracking-tighter leading-none mb-6">
                Your <span className="text-[#7A3E2D]">Bag</span>
              </h1>
              <p className="text-[#171717]/40 text-xs font-bold uppercase tracking-widest">
                Optimizing Content: {cartItems.length} {cartItems.length === 1 ? "Item" : "Items"}
              </p>
            </div>
            
            <Link
              href="/products"
              className="text-sm font-bold text-[#171717] hover:text-[#7A3E2D] transition-colors flex items-center gap-2 group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 group-hover:-translate-x-1 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
              Continue Selected Search
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          {/* Cart List */}
          <div className="lg:col-span-8 space-y-6">
            {message && (
               <div className={`p-6 rounded-3xl border text-xs font-bold uppercase tracking-widest text-center mb-8 animate-in fade-in duration-500 ${success ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                  {message}
               </div>
            )}
            {cartItems.map((item) => (
              <CartItem 
                key={item.id}
                item={item}
                onRemove={handleRemove}
                onUpdateQuantity={handleChangeQuantity}
                isRemoving={removingId === item.id}
                isUpdating={updatingId === item.id}
              />
            ))}
          </div>

          {/* Checkout Logic */}
          <div className="lg:col-span-4">
            <div className="bg-white p-10 md:p-12 rounded-[3rem] shadow-xl border border-black/5 sticky top-32">
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#171717]/40 mb-10 pb-6 border-b border-gray-100">
                Summary Yield
              </h2>

              <div className="space-y-8 mb-12">
                <div className="flex justify-between items-center text-sm font-bold text-[#171717]/60 uppercase">
                  <span>Sub-Assessment</span>
                  <span className="text-[#171717]">Rp {grandTotal.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-[#171717]/60 uppercase">
                  <span>Global Logistics</span>
                  <span className="text-[#7A3E2D] italic">Standard Delivery</span>
                </div>
              </div>

              <div className="pt-10 mb-12 flex justify-between items-end border-t border-gray-100">
                 <div>
                   <span className="block text-xs font-bold uppercase tracking-widest text-[#171717]/40 mb-2">Total Amount</span>
                   <span className="text-4xl font-bold text-[#171717] tracking-tight">Rp {grandTotal.toLocaleString("id-ID")}</span>
                 </div>
              </div>

              <button
                onClick={() => router.push("/checkout")}
                className="block w-full text-white py-6 text-sm font-bold uppercase tracking-widest bg-black/90 hover:bg-black transition-all active:scale-95 rounded-xl text-center shadow-xl shadow-black/10"
              >
                Start Checkout →
              </button>
              
              <div className="mt-12 text-[10px] text-gray-400 text-center font-bold tracking-widest uppercase leading-loose">
                <p>Digital Rights Guaranteed &middot; Gravity Protocol</p>
                <Link href="#" className="hover:text-[#7A3E2D] underline">Legal Disclosure</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
