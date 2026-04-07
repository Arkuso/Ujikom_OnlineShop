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
    <div className="flex flex-col sm:flex-row items-center gap-6 py-8 border-b border-gray-200">
      {/* Product Info */}
      <div className="flex-1 flex items-center gap-6 w-full">
        <div className="w-24 h-32 shrink-0 bg-[#F7F7F7] flex items-center justify-center overflow-hidden">
          <img
            src={imageSrc}
            alt={item.productName}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Link
            href={`/products/${item.productId}`}
            className="text-2xl font-hk-grotesk-wide text-[#171717] hover:opacity-70 transition-opacity"
          >
            {item.productName}
          </Link>
          <span className="text-lg font-vercetti text-[#171717]">
            Rp {item.price.toLocaleString("id-ID")}
          </span>
        </div>
      </div>

      {/* Quantity Control */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center bg-[#F1F3F4] rounded-full px-4 py-2">
          <button
            onClick={() => onUpdateQuantity(item, item.quantity - 1)}
            disabled={isUpdating || isRemoving}
            className="w-8 h-8 flex items-center justify-center text-xl disabled:opacity-30"
          >
            −
          </button>
          <div className="w-8 text-center text-lg font-vercetti">
            {item.quantity}
          </div>
          <button
            onClick={() => onUpdateQuantity(item, item.quantity + 1)}
            disabled={isUpdating || isRemoving}
            className="w-8 h-8 flex items-center justify-center text-xl disabled:opacity-30"
          >
            +
          </button>
        </div>
        <button
          onClick={() => onRemove(item.id)}
          disabled={isRemoving || isUpdating}
          className="text-xs font-vercetti text-[#171717] underline underline-offset-4 hover:opacity-60 transition-opacity"
        >
          {isRemoving ? "Removing..." : "Remove"}
        </button>
      </div>

      {/* Total */}
      <div className="min-w-[150px] text-right">
        <p className="text-xl font-vercetti text-[#171717]">
          Rp {item.totalPrice.toLocaleString("id-ID")}
        </p>
      </div>
    </div>
  );
}
