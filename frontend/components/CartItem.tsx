"use client";

import Link from "next/link";
import { CartItem as CartItemType } from "@/types/cart";

interface CartItemProps {
  item: CartItemType;
  onRemove: (id: number) => void;
  onUpdateQuantity: (item: CartItemType, quantity: number) => void;
  isRemoving: boolean;
  isUpdating: boolean;
}

export default function CartItem({
  item,
  onRemove,
  onUpdateQuantity,
  isRemoving,
  isUpdating,
}: CartItemProps) {
  const imageSrc = item.imageUrl
    ? item.imageUrl.startsWith("http")
      ? item.imageUrl
      : `http://localhost:5055${item.imageUrl}`
    : "https://via.placeholder.com/100x100?text=No+Image";

  return (
    <div className="group bg-white p-6 md:p-8 rounded-3xl flex flex-col sm:flex-row items-center gap-8 shadow-sm hover:shadow-md transition-all duration-500 border border-black/5">
      {/* Image Container */}
      <div className="relative w-32 h-32 shrink-0 overflow-hidden bg-[#F7F7F7] rounded-2xl border border-black/5">
        <img
          src={imageSrc}
          alt={item.productName}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      </div>

      {/* Identity Sector */}
      <div className="flex-1 min-w-0 text-center sm:text-left">
        <div className="flex flex-col gap-1">
           <Link
             href={`/products/${item.productId}`}
             className="text-xl font-bold text-[#171717] hover:text-[#7A3E2D] transition-colors leading-tight"
           >
             {item.productName}
           </Link>
           <span className="text-xs text-gray-400 font-medium uppercase tracking-widest">Article ID: {item.productId}</span>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-4 justify-center sm:justify-start">
           <p className="text-sm font-bold text-[#7A3E2D]">
              Rp {item.price.toLocaleString("id-ID")}
           </p>
        </div>
      </div>

      {/* Control Module */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center bg-[#F7F7F7] rounded-xl p-1 border border-black/5">
          <button
            onClick={() => onUpdateQuantity(item, item.quantity - 1)}
            disabled={isUpdating || isRemoving}
            className="w-10 h-10 flex items-center justify-center text-[#171717] hover:text-[#7A3E2D] transition-all disabled:opacity-30 font-bold text-xl"
          >
            −
          </button>
          <div className="w-10 text-center text-sm font-bold text-[#171717]">
            {item.quantity}
          </div>
          <button
            onClick={() => onUpdateQuantity(item, item.quantity + 1)}
            disabled={isUpdating || isRemoving}
            className="w-10 h-10 flex items-center justify-center text-[#171717] hover:text-[#7A3E2D] transition-all disabled:opacity-30 font-bold text-xl"
          >
            +
          </button>
        </div>
        
        <button
          onClick={() => onRemove(item.id)}
          disabled={isRemoving || isUpdating}
          className="text-[10px] font-bold text-gray-400 hover:text-rose-600 uppercase tracking-widest transition-colors"
        >
          {isRemoving ? "REMOVING..." : "DISCARD ITEM"}
        </button>
      </div>

      {/* Yield Assessment */}
      <div className="min-w-40 text-center sm:text-right pt-4 sm:pt-0 sm:border-l border-gray-100 sm:pl-8">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Total Yield</p>
        <p className="text-2xl font-bold text-[#171717] tracking-tight">
          Rp {item.totalPrice.toLocaleString("id-ID")}
        </p>
      </div>
    </div>
  );
}
