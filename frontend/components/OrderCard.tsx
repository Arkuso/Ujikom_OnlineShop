"use client";

import { useState } from "react";

interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  orderDate: string;
  totalAmount: number;
  status: string;
  items: OrderItem[];
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  pending: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
  processing: { bg: "bg-[#7A3E2D]/5", text: "text-[#7A3E2D]", dot: "bg-[#7A3E2D]" },
  completed: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  cancelled: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
};

export default function OrderCard({ order }: { order: Order }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const statusKey = order.status?.toLowerCase() || "pending";
  const { bg, text, dot } = STATUS_CONFIG[statusKey] || { bg: "bg-gray-50", text: "text-gray-400", dot: "bg-gray-300" };

  return (
    <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-black/5 flex flex-col gap-8 transition-all hover:shadow-md">
      {/* Order Identity Header */}
      <div className="flex flex-wrap items-center justify-between gap-10">
        <div className="flex-1 min-w-40">
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-2">Order Tracking ID</p>
          <h3 className="text-xl font-bold text-[#171717]">#{order.id}</h3>
        </div>
        
        <div className="flex-1 min-w-40">
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-2">Transaction Date</p>
          <p className="text-sm text-[#171717] font-bold">
            {new Date(order.orderDate).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="flex-1 min-w-40">
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-2">Protocol Status</p>
          <div className={`${bg} ${text} inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-black/5 shadow-sm`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dot} mr-2.5 shadow-sm animate-pulse`}></span>
            {order.status}
          </div>
        </div>

        <div className="flex-1 min-w-40 text-center md:text-right">
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-2">Total Yield</p>
          <p className="text-2xl font-bold text-[#7A3E2D]">
            Rp{order.totalAmount.toLocaleString("id-ID")}
          </p>
        </div>

        <div className="w-full md:w-auto mt-4 md:mt-0 pt-6 md:pt-0 border-t md:border-t-0 border-gray-100 text-right">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest px-8 py-4 rounded-xl transition-all duration-300 ${
                isExpanded 
                  ? 'bg-[#1A1A1A] text-white shadow-xl' 
                  : 'bg-gray-50 text-[#171717] border border-black/5 hover:border-[#7A3E2D] hover:text-[#7A3E2D]'
              }`}
            >
              {isExpanded ? "Minimize Stream" : "View Collection Map"}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={3}
                stroke="currentColor"
                className={`w-3 h-3 transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
        </div>
      </div>

      {/* Expandable Module Sub-Index */}
      {isExpanded && (
        <div className="pt-10 border-t border-gray-100 flex flex-col gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <h4 className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Integrated Module Units</h4>
          <div className="space-y-4">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-[#F7F7F7] p-6 rounded-2xl border border-black/5 group/item">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#171717] uppercase group-hover/item:text-[#7A3E2D] transition-colors">{item.productName}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">
                    Intensity: {item.quantity} &nbsp;·&nbsp; Unit Price: Rp{item.price.toLocaleString("id-ID")}
                  </p>
                </div>
                <p className="text-xl font-bold text-[#171717] mt-4 sm:mt-0 text-right">
                  Rp{(item.price * item.quantity).toLocaleString("id-ID")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
