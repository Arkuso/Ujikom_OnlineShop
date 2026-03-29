"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface NavbarSearchProps {
  isMinimal? : boolean;
}

export default function NavbarSearch({ isMinimal }: NavbarSearchProps) {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const value = keyword.trim();
    if (!value) {
      router.push("/products");
      return;
    }
    router.push(`/products?search=${encodeURIComponent(value)}`);
  };

  return (
    <form onSubmit={handleSubmit} className={`relative flex items-center h-12 px-6 rounded-full border transition-all duration-500 w-full md:w-64 lg:w-80 ${
        isMinimal 
          ? "bg-gray-50 border-[#0E0E12]" 
          : "bg-white border-[#0E0E12] shadow-sm hover:shadow-md"
      }`}>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search modules..."
          className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest placeholder:text-gray-300 text-[#171717] w-full"
        />
        <button 
          type="submit"
          className="ml-3 text-[#6C8CA3] hover:scale-110 transition-transform"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </button>
      </form>
  );
}
