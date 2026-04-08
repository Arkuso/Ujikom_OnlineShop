"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import cartService from "@/services/cartService";
import orderService from "@/services/orderService";
import { useCartStore } from "@/lib/useCartstore";
import { useCallback } from "react";
import { getValidToken } from "@/lib/authSession";

interface CartItem {
  id: number;
  productId: number;
  productName: string;
  imageUrl: string;
  price: number;
  quantity: number;
  totalPrice: number;
}

interface OrderResult {
  id: number;
  orderDate: string;
  totalAmount: number;
  status: string;
  paymentUrl?: string;
}

import { useToastStore } from "@/lib/useToaststore";

export default function CheckoutPage() {
  const router = useRouter();
  const fetchGlobalCart = useCartStore((state) => state.fetchCart);
  const { showToast } = useToastStore();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null);

  const fetchCart = useCallback(async () => {
    try {
      const response = await cartService.getCart();
      if (response.success && response.data) {
        if (response.data.length === 0) {
          router.push("/cart");
          return;
        }
        setCartItems(response.data);
      } else {
        showToast(response.message || "Failed to load cart.", "error");
      }
    } catch {
      showToast("Cannot connect to server.", "error");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const token = getValidToken();
    if (!token) {
      router.push("/login");
      return;
    }
    fetchCart();
  }, [router, fetchCart]);

  const grandTotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      const response = await orderService.checkout();
      if (response.success && response.data) {
        await fetchGlobalCart();
        
        // Redirect to Xendit Payment Gateway
        if (response.data.paymentUrl && response.data.paymentUrl.startsWith("http")) {
          showToast("Order placed. Redirecting to payment...", "success");
          window.location.href = response.data.paymentUrl;
        } else {
          // Fallback if no payment url generated
          setOrderResult(response.data);
        }
      } else {
        showToast(response.message || "Checkout failed. Please try again.", "error");
      }
    } catch {
      showToast("Cannot connect to server.", "error");
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading checkout...</p>
      </div>
    );
  }

  /* ── Order Success ── */
  if (orderResult) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="bg-white border border-gray-200 shadow-sm p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-black flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-black mb-2">Order Placed!</h1>
          <p className="text-gray-500 text-sm mb-6">
            Thank you for your purchase. Your order has been confirmed.
          </p>
          <div className="bg-gray-50 border border-gray-200 p-4 text-left mb-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Order ID</span>
              <span className="font-semibold text-black">#{orderResult.id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Date</span>
              <span className="font-semibold text-black">
                {new Date(orderResult.orderDate).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total</span>
              <span className="font-bold text-black">
                Rp {orderResult.totalAmount.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Status</span>
              <span className="px-2 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-800 uppercase">
                {orderResult.status}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Link
              href="/profile"
              className="block w-full bg-black text-white py-3 text-sm font-semibold uppercase tracking-wide hover:bg-gray-800 transition text-center"
            >
              View Profile
            </Link>
            <Link
              href="/products"
              className="block w-full border border-gray-300 text-black py-3 text-sm font-semibold uppercase tracking-wide hover:bg-gray-50 transition text-center"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Checkout Form ── */
  return (
    <div className="min-h-[80vh] py-12 px-4">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/cart"
            className="text-xs font-semibold text-gray-500 hover:text-black transition"
          >
            ← Back to Cart
          </Link>
          <h1 className="text-3xl font-bold text-black mt-4">Checkout</h1>
          <p className="text-gray-500 text-sm mt-1">Review your order before confirming.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Item Review */}
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-gray-600 tracking-wide uppercase mb-3">
              Order Items ({cartItems.length})
            </h2>
            {cartItems.map((item) => {
              const imageSrc = item.imageUrl
                ? item.imageUrl.startsWith("http")
                  ? item.imageUrl
                  : `http://localhost:5055${item.imageUrl}`
                : "https://via.placeholder.com/80x80?text=No+Image";

              return (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 p-4 flex items-center gap-4 shadow-sm"
                >
                  <img
                    src={imageSrc}
                    alt={item.productName}
                    className="w-16 h-16 object-cover border border-gray-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-black truncate">{item.productName}</p>
                    <p className="text-xs text-gray-400 mt-1">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold text-black shrink-0">
                    Rp {item.totalPrice.toLocaleString("id-ID")}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Summary & Action */}
          <div>
            <div className="bg-white border border-gray-200 p-6 shadow-sm sticky top-6">
              <h2 className="text-xs font-semibold text-gray-600 tracking-wide uppercase mb-5">
                Payment Summary
              </h2>

              <div className="space-y-3 mb-5 pb-5 border-b border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-black font-medium">
                    Rp {grandTotal.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className="text-green-600 font-semibold">Free</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-semibold text-black uppercase tracking-wide">
                  Total
                </span>
                <span className="text-xl font-bold text-black">
                  Rp {grandTotal.toLocaleString("id-ID")}
                </span>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                className="w-full bg-black text-white py-3 text-sm font-semibold uppercase tracking-wide hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {placing ? "Processing..." : "Place Order"}
              </button>

              <p className="text-xs text-gray-400 text-center mt-4">
                By placing this order, you agree to our terms of service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
  
