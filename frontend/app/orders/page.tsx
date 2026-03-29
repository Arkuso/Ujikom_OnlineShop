"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import orderService from "@/services/orderService";
import OrderCard from "@/components/OrderCard";
import { Order } from "@/types/order";

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    if (!token) {
      router.push("/login");
      return;
    }
    fetchOrders();
  }, [router]);

  const fetchOrders = async () => {
    try {
      const response = await orderService.getMyOrders();
      if (response.success && response.data) {
        setOrders(response.data);
      } else {
        setError(response.message || "Failed to load order history.");
      }
    } catch {
      setError("Cannot connect to server. Verify network signal.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#E6D3B1]">
        <div className="w-10 h-10 border-4 border-white/20 border-t-[#7A3E2D] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center bg-[#E6D3B1]">
        <h2 className="text-4xl font-bold text-[#171717] mb-6 tracking-tight">No orders yet</h2>
        <p className="text-[#171717]/60 text-lg mb-12 max-w-sm mx-auto leading-relaxed">
           Your acquisition history is currently empty. Start building your refined collection today.
        </p>
        <Link
          href="/products"
          className="bg-[#1A1A1A] text-white py-5 px-16 text-sm font-bold rounded-xl hover:bg-black transition-all shadow-xl"
        >
          View Collection
        </Link>
      </div>
    );
  }

  /* sort by latest first */
  const sortedOrders = [...orders].sort(
    (a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
  );

  return (
    <div className="bg-[#E6D3B1] min-h-screen pt-32 pb-24">
      <div className="max-w-360 mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-16 px-4">
          <h1 className="text-5xl md:text-6xl font-black text-[#171717] uppercase tracking-tighter leading-none mb-6">
            Order <span className="text-[#7A3E2D]">History</span>
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
             <p className="text-[#171717]/40 text-xs font-bold uppercase tracking-widest">
               Tracking Summary: {orders.length} Acquisition {orders.length === 1 ? "Record" : "Records"}
             </p>
             <button 
               onClick={fetchOrders}
               className="text-sm font-bold text-[#171717] hover:text-[#7A3E2D] transition-colors border-b border-current pb-0.5 italic w-fit"
             >
               Refresh Stream
             </button>
          </div>
        </div>

        {error && (
          <div className="mb-12 p-8 bg-rose-50 border border-rose-100 text-[10px] font-bold text-rose-600 uppercase tracking-widest rounded-2xl text-center">
            {error}
          </div>
        )}

        {/* Orders Grid */}
        <div className="space-y-6">
          {sortedOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>

        {/* Footer Polish */}
        <div className="mt-32 pt-16 border-t border-black/5 text-center opacity-30 italic">
          <p className="text-[#171717]/40 text-[10px] font-bold uppercase tracking-widest mb-4">Gravity Internal Protocol v3.x</p>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#171717]/20">EndOfTransactionSequence</span>
        </div>
      </div>
    </div>
  );
}
