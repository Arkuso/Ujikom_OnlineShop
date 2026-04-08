"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import cartService from "@/services/cartService";
import { useCartStore } from "@/lib/useCartstore";
import { useToastStore } from "@/lib/useToaststore";
import { getValidToken } from "@/lib/authSession";
import CartItem from "@/components/CartItem";
import { CartItem as CartItemType } from "@/types/cart";

export default function CartPage() {
  const router = useRouter();
  const fetchGlobalCart = useCartStore((state) => state.fetchCart);
  const { showToast } = useToastStore();
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [loading, setLoading] = useState(true);
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
        showToast(response.message || "Failed to load collection.", "error");
      }
    } catch {
      showToast("Connection lost. Resetting index stream.", "error");
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
        showToast("Item removed successfully.", "success");
        await fetchGlobalCart();
      } else {
        showToast(response.message || "Removal failure.", "error");
      }
    } catch {
      showToast("Error communicating with integration engine.", "error");
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
        showToast("Quantity updated.", "success");
        await fetchGlobalCart();
      } else {
        showToast(response.message || "Update skipped.", "error");
      }
    } catch {
      showToast("Link failed.", "error");
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
        <p className="text-[#171717]/60 text-lg mb-12 max-w-sm mx-auto font-vercetti">
          Your collection is empty.
        </p>
        <Link
          href="/products"
          className="bg-[#1A1A1A] text-white py-5 px-16 text-sm font-vercetti rounded-xl hover:bg-black transition-all active:scale-95"
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
            <div className="flex justify-between items-center pb-4 border-b border-gray-400 font-vercetti text-xl mb-4">
              <span className="flex-1">Product</span>
              <span className="w-[120px] text-center">Quantity</span>
              <span className="min-w-[150px] text-right">Total</span>
            </div>

            <div className="space-y-0">
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
            <div className="bg-[#F8F9FA] p-8 sm:p-10 rounded-xl sticky top-32 border border-gray-200 max-w-md ml-auto">
              <div className="flex items-center justify-between gap-4 pb-6 border-b border-gray-300">
                <span className="text-xl font-vercetti text-[#171717]/70">Subtotal</span>
                <span className="text-xl sm:text-2xl font-vercetti text-[#171717] leading-none tabular-nums whitespace-nowrap text-right">
                  Rp {grandTotal.toLocaleString("id-ID")}
                </span>
              </div>

              <div className="pt-8">
                <span className="block text-lg font-vercetti text-[#171717]/50 leading-none mb-3">
                  Total Amount
                </span>
                <span className="inline-flex items-baseline gap-2 text-xl sm:text-2xl font-vercetti text-[#171717] leading-none tabular-nums whitespace-nowrap">
                  Rp {grandTotal.toLocaleString("id-ID")}
                </span>
              </div>

              <p className="text-sm font-vercetti text-[#171717]/60 mt-6 leading-relaxed">
                Tax included. Shipping calculated at checkout.
              </p>

              <button
                onClick={() => router.push("/checkout")}
                className="mt-8 block w-full text-white py-4 text-xl font-vercetti bg-[#555558] hover:bg-[#47474A] transition-all active:scale-95 text-center"
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
