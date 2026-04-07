"use client";

import { Order } from "../types/order";

const STATUS_CONFIG: Record<string, { bg: string; text: string }> = {
  pending: { bg: "bg-[#333333]", text: "text-[#9ca3af]" },
  processing: { bg: "bg-blue-900/30", text: "text-blue-400" },
  completed: { bg: "bg-[#064e4b]/40", text: "text-[#10e981]" },
  cancelled: { bg: "bg-rose-900/30", text: "text-rose-400" },
};

export default function OrderCard({ order }: { order: Order }) {
  const statusKey = order.status?.toLowerCase() || "pending";
  const { bg, text } = STATUS_CONFIG[statusKey] || { bg: "bg-gray-800", text: "text-gray-400" };

  // Base URL for images if not absolute
  const getImageUrl = (url?: string) => {
    if (!url) return "/placeholder-product.png";
    if (url.startsWith("http")) return url;
    return `http://localhost:5055${url}`;
  };

  return (
    <div className="bg-[#1C1C1E] rounded-[2.5rem] p-8 md:p-10 text-white shadow-xl transition-all hover:scale-[1.01] hover:shadow-2xl">
      {/* Top Header Row */}
      <div className="flex items-center justify-between mb-8">
        <span className="text-[12px] font-black uppercase tracking-[0.2em] text-[#4d4d4d]">
          Order #{order.id}
        </span>
        <div className={`${bg} ${text} px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest`}>
          {order.status}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-10 items-start md:items-center">
        {/* Items Section */}
        <div className="flex-1 space-y-8">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-6 group">
              {/* Product Image Container */}
              <div className="w-20 h-20 bg-[#2C2C2E] rounded-2xl overflow-hidden flex-shrink-0 border border-white/5 p-2">
                <img
                  src={getImageUrl(item.imageUrl)}
                  alt={item.productName}
                  className="w-full h-full object-contain transition-transform group-hover:scale-110"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `http://localhost:5055/api/Product/${item.productId}/image`;
                  }}
                />
              </div>

              {/* Product Details */}
              <div className="min-w-0">
                <h4 className="text-lg md:text-xl font-bold tracking-tight text-white mb-1 truncate">
                  {item.productName}
                </h4>
                <p className="text-sm font-medium text-[#8E8E93]">
                  {item.quantity} Unit · Rp {item.price.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Total & Date Row (Right or Bottom) */}
        <div className="w-full md:w-auto flex flex-col md:items-end gap-1 md:text-right border-t md:border-t-0 border-white/5 pt-6 md:pt-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#4d4d4d]">
            Total Assessment
          </p>
          <p className="text-3xl md:text-[40px] font-black text-white leading-tight">
            Rp {order.totalAmount.toLocaleString("id-ID")}
          </p>
          <p className="text-[10px] font-bold text-[#4d4d4d] mt-2">
            {new Date(order.orderDate).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

