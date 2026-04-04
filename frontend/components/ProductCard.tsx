"use client";

import Link from "next/link";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    imageUrl: string;
    categoryName?: string;
    category?: {
      name: string;
    };
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const imageSrc = product.imageUrl
    ? product.imageUrl.startsWith("http")
      ? product.imageUrl
      : `http://localhost:5055${product.imageUrl}`
    : "https://via.placeholder.com/800x1000?text=Product";

  return (
    <div className="group flex h-full flex-col gap-4">
      <div className="relative h-60 sm:h-70 lg:h-75 overflow-hidden bg-transparent">
        <Link href={`/products/${product.id}`} className="block h-full">
           <img
             src={imageSrc}
             alt={product.name}
             className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-[1.02]"
           />
        </Link>
      </div>

      <div className="px-1 flex min-h-30.5 flex-col gap-2">
        <Link href={`/products/${product.id}`} className="block">
          <h3 className="font-newake text-[26px] sm:text-[30px] text-[#171717] leading-[1.05] transition-colors group-hover:text-black line-clamp-2 min-h-15.5">
            {product.name}
          </h3>
        </Link>
        <p className="font-vercetti text-[20px] sm:text-[24px] text-[#171717] tracking-tight mt-auto">
          Rp {product.price.toLocaleString("id-ID")}
        </p>
      </div>
    </div>
  );
}
