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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#D9D9D9]">
        <div className="w-10 h-10 border-4 border-black/20 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-[#D9D9D9]">
        <h2 className="text-4xl font-['HKGroteskWide'] font-semibold text-[#171717] mb-6">Cart</h2>
        <p className="text-[#171717]/60 text-lg mb-12 max-w-sm mx-auto font-['Vercetti-Regular']">
          Your collection is empty.
        </p>
        <Link
          href="/products"
          className="bg-[#1A1A1A] text-white py-5 px-16 text-sm font-['Vercetti-Regular'] rounded-xl hover:bg-black transition-all active:scale-95"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#D9D9D9] min-h-screen pt-32 pb-24">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-['HKGroteskWide'] font-semibold text-[#171717]">
            Cart
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Cart List */}
          <div className="lg:col-span-8">
            {/* Table Headers */}
            <div className="flex justify-between items-center pb-4 border-b border-gray-400 font-['Vercetti-Regular'] text-xl mb-4">
              <span className="flex-1">Product</span>
              <span className="w-[120px] text-center">Quantity</span>
              <span className="min-w-[150px] text-right">Total</span>
            </div>

            <div className="space-y-0">
              {message && (
                <div className={`p-4 text-center text-sm font-['Vercetti-Regular'] mb-4 ${success ? 'text-emerald-600' : 'text-rose-600'}`}>
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
          </div>

          {/* Checkout Area */}
          <div className="lg:col-span-4">
            <div className="bg-[#F8F9FA] p-10 rounded-lg sticky top-32 border border-gray-200">
              <div className="flex justify-between items-baseline mb-12">
                <span className="text-2xl font-['Vercetti-Regular'] text-[#171717]">Subtotal</span>
                <span className="text-2xl font-['Vercetti-Regular'] text-[#171717]">Rp {grandTotal.toLocaleString("id-ID")}</span>
              </div>

              <div className="mb-12">
                <span className="block text-lg font-['Vercetti-Regular'] text-[#171717]/50 mb-2">Total Amount</span>
                <span className="text-5xl font-['Vercetti-Regular'] text-[#171717]">Rp {grandTotal.toLocaleString("id-ID")}</span>
                <p className="text-xs font-['Vercetti-Regular'] text-[#171717]/50 mt-4 leading-relaxed">
                  Tax included. Shipping calculated at checkout.
                </p>
              </div>

              <button
                onClick={() => router.push("/checkout")}
                className="block w-full text-white py-5 text-xl font-['Vercetti-Regular'] bg-[#5E6266] hover:bg-[#4E5256] transition-all active:scale-95 text-center"
              >
                CHECKOUT
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
