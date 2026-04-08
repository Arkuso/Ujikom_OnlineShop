"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import productService from "@/services/productService";
import { useToastStore } from "@/lib/useToaststore";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  categoryName: string;
}

export default function ProductsPage() {
  const { showToast } = useToastStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Add Stock state
  const [stockModal, setStockModal] = useState<number | null>(null);
  const [quantityToAdd, setQuantityToAdd] = useState("");
  const [stockLoading, setStockLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productService.getAll();
      if (response.success && response.data) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const response = await productService.delete(id);
      if (response.success) {
        showToast(`"${name}" has been deleted.`, "success");
        setProducts(products.filter((p) => p.id !== id));
      } else {
        showToast(`Delete failed: ${response.message}`, "error");
      }
    } catch {
      showToast("Cannot connect to server.", "error");
    }
  };

  const handleAddStock = async (productId: number) => {
    if (!quantityToAdd || parseInt(quantityToAdd) <= 0) return;

    setStockLoading(true);
    try {
      const qty = parseInt(quantityToAdd);
      const response = await productService.addStock(productId, qty);

      if (response.success) {
        showToast(`Stock updated! Added ${qty} items.`, "success");
        setProducts(
          products.map((p) =>
            p.id === productId
              ? { ...p, stock: p.stock + qty }
              : p
          )
        );
        setStockModal(null);
        setQuantityToAdd("");
      } else {
        showToast(`Failed: ${response.message}`, "error");
      }
    } catch {
      showToast("Cannot connect to server.", "error");
    } finally {
      setStockLoading(false);
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.categoryName.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-10 lg:py-14 px-4 sm:px-6">
      {/* 1. Kartu Atas (Kartu Statistik) */}
      <div className="bg-[#D9D9D9] p-8 md:p-10 rounded-[2rem]">
        <h1 className="text-4xl md:text-5xl font-hk-grotesk-wide mb-2 tracking-wide">
          <span className="text-[#0066FF]">Admin</span> <span className="text-black">Controll</span>
        </h1>
        <p className="text-gray-500 font-vercetti text-sm md:text-base mb-8">
          Administrative Sector <span className="mx-2">·</span> Authorized Stream
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-white p-6 md:p-8 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
            <p className="text-gray-500 text-sm font-vercetti mb-3">Product Available</p>
            <p className="text-3xl lg:text-[40px] leading-tight font-vercetti text-black">Qty {products.length}</p>
          </div>
          <div className="bg-white p-6 md:p-8 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
            <p className="text-gray-500 text-sm font-vercetti mb-3">Critical Stock</p>
            <p className="text-3xl lg:text-[40px] leading-tight font-vercetti text-black">{products.filter(p => p.stock > 0 && p.stock < 10).length}</p>
          </div>
          <div className="bg-white p-6 md:p-8 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
            <p className="text-gray-500 text-sm font-vercetti mb-3">Depleted Stock</p>
            <p className="text-3xl lg:text-[40px] leading-tight font-vercetti text-black">{products.filter(p => p.stock === 0).length}</p>
          </div>
        </div>
      </div>

      {/* 2. Kartu Bawah (Konten) */}
      <div className="bg-[#D9D9D9] p-8 md:p-10 rounded-[2rem]">
        {/* Menu Navigasi */}
        <div className="flex flex-wrap gap-2 md:gap-3 mb-8">
          <Link href="/admin" className="bg-white text-gray-500 font-vercetti px-6 py-3 rounded-xl text-sm hover:bg-gray-50 transition active:scale-95 shadow-sm">
            Overview
          </Link>
          <Link href="/admin/products" className="bg-black text-white font-vercetti px-6 py-3 rounded-xl text-sm transition active:scale-95 shadow-sm">
            Products
          </Link>
          <Link href="/admin/categories" className="bg-white text-gray-500 font-vercetti px-6 py-3 rounded-xl text-sm hover:bg-gray-50 transition active:scale-95 shadow-sm">
            Categories
          </Link>
          <Link href="/admin/orders" className="bg-white text-gray-500 font-vercetti px-6 py-3 rounded-xl text-sm hover:bg-gray-50 transition active:scale-95 shadow-sm">
            Orders
          </Link>
          <Link href="/admin/products/add" className="bg-white text-gray-500 font-vercetti px-6 py-3 rounded-xl text-sm hover:bg-gray-50 transition active:scale-95 shadow-sm">
            Add product
          </Link>
        </div>



        {/* Search & Add Button */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
          <div className="relative flex-1 w-full h-[52px]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or category..."
              className="w-full h-full bg-transparent border border-gray-400/50 rounded-full px-6 text-sm font-vercetti text-black placeholder:text-gray-500 focus:outline-none focus:border-black transition"
            />
            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-black">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </span>
          </div>
          <Link
            href="/admin/products/add"
            className="flex items-center justify-center bg-white border border-black text-black px-8 h-[52px] rounded-full text-sm font-vercetti hover:bg-gray-50 transition active:scale-95 shrink-0"
          >
            Add Product
          </Link>
        </div>

        {/* Products List */}
        <div className="space-y-4">
          {filtered.length > 0 ? (
            filtered.map((product) => (
              <div key={product.id} className="bg-white p-6 md:px-8 md:py-6 rounded-2xl shadow-sm overflow-x-auto">
                <div className="min-w-[700px]">
                  {/* Header Row */}
                  <div className="grid grid-cols-[3fr_2fr_2fr_1fr_80px] gap-4 mb-4">
                    <div className="text-[15px] font-vercetti text-black">Product</div>
                    <div className="text-[15px] font-vercetti text-black">Category</div>
                    <div className="text-[15px] font-vercetti text-black">Price</div>
                    <div className="text-[15px] font-vercetti text-black text-center">Stock</div>
                    <div className="text-[15px] font-vercetti text-black"></div>
                  </div>

                  {/* Content Row */}
                  <div className="grid grid-cols-[3fr_2fr_2fr_1fr_80px] gap-4 items-center">
                    <div className="flex items-center gap-4">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl.startsWith("http") ? product.imageUrl : `http://localhost:5055${product.imageUrl}`}
                          alt={product.name}
                          className="w-[40px] h-[50px] object-cover rounded shadow-sm bg-gray-100 shrink-0"
                        />
                      ) : (
                        <div className="w-[40px] h-[50px] bg-gray-200 rounded shrink-0"></div>
                      )}
                      <div>
                        <p className="text-[15px] text-black font-vercetti leading-tight">{product.name}</p>
                        {/* Nama fallback atau deskripsi singkat apabila dibutuhkan (seperti gambar) */}
                        <p className="text-sm text-black font-vercetti mt-0.5">{product.name.split(' ')[0]}</p>
                      </div>
                    </div>

                    <div className="text-[15px] font-vercetti text-gray-500">
                      {product.categoryName}
                    </div>

                    <div className="text-[15px] font-vercetti text-black">
                      Rp {product.price.toLocaleString("id-ID")}
                    </div>

                    <div className="flex flex-col items-center">
                      <div className={`px-4 flex items-center justify-center h-8 rounded text-sm font-vercetti text-black min-w-[50px] ${product.stock === 0 ? "bg-red-200 text-red-800" : "bg-[#90EE90]"}`}>
                         {product.stock}
                      </div>
                      <button onClick={() => setStockModal(product.id)} className="text-sm font-vercetti text-black mt-1 hover:opacity-70 leading-none">
                        +
                      </button>
                    </div>

                    <div className="flex flex-col items-center justify-center">
                      <Link href={`/admin/products/${product.id}`} className="text-sm font-vercetti text-black hover:opacity-70 pb-0.5 w-full text-center border-b border-black">
                         Edit
                      </Link>
                      <button onClick={() => handleDelete(product.id, product.name)} className="text-sm font-vercetti text-red-600 hover:opacity-70 pt-0.5 w-full text-center">
                         Delete
                      </button>
                    </div>
                  </div>
                </div>

                {/* Add Stock Inline Input */}
                {stockModal === product.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">
                    <input
                      type="number"
                      value={quantityToAdd}
                      onChange={(e) => setQuantityToAdd(e.target.value)}
                      min={1}
                      placeholder="Quantity to add..."
                      className="flex-1 bg-white border border-gray-300 px-4 py-2 rounded-xl text-sm font-vercetti focus:outline-none"
                    />
                    <button onClick={() => handleAddStock(product.id)} disabled={stockLoading} className="bg-black text-white px-6 py-2 rounded-xl text-sm font-vercetti">{stockLoading ? "..." : "Confirm"}</button>
                    <button onClick={() => setStockModal(null)} className="text-gray-500 text-sm font-vercetti hover:text-black">Cancel</button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white p-10 rounded-2xl shadow-sm text-center text-gray-500 font-vercetti">
              No products found matching your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
