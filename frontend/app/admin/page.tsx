"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  categoryName: string;
}

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:5055/api/Product", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalProducts = products.length;
  const lowStockItems = products.filter((p) => p.stock < 10);
  const outOfStockItems = products.filter((p) => p.stock === 0);

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 shadow-sm border border-gray-200">
          <p className="text-xs font-semibold text-gray-600 tracking-wide mb-2">
            Total Products
          </p>
          <p className="text-3xl font-bold text-black">{totalProducts}</p>
        </div>
        <div className="bg-white p-6 shadow-sm border border-gray-200">
          <p className="text-xs font-semibold text-gray-600 tracking-wide mb-2">
            Low Stock
          </p>
          <p className="text-3xl font-bold text-yellow-600">
            {lowStockItems.length}
          </p>
          <p className="text-xs text-gray-400 mt-1">Less than 10 items</p>
        </div>
        <div className="bg-white p-6 shadow-sm border border-gray-200">
          <p className="text-xs font-semibold text-gray-600 tracking-wide mb-2">
            Out of Stock
          </p>
          <p className="text-3xl font-bold text-red-600">
            {outOfStockItems.length}
          </p>
          <p className="text-xs text-gray-400 mt-1">Needs restocking</p>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <div className="bg-white shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-600 tracking-wide uppercase">
              Low Stock Alerts
            </p>
            <Link
              href="/admin/products"
              className="text-xs font-semibold text-black hover:underline"
            >
              View All Products →
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {lowStockItems.slice(0, 5).map((product) => (
              <div
                key={product.id}
                className="px-6 py-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-black">
                    {product.name}
                  </p>
                  <p className="text-xs text-gray-400">{product.categoryName}</p>
                </div>
                <span
                  className={`px-3 py-1 text-xs font-semibold ${
                    product.stock === 0
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                  }`}
                >
                  {product.stock === 0
                    ? "Out of stock"
                    : `${product.stock} left`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Products */}
      <div className="bg-white shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <p className="text-xs font-semibold text-gray-600 tracking-wide uppercase">
            Recent Products
          </p>
        </div>
        <div className="divide-y divide-gray-100">
          {products.length > 0 ? (
            products.slice(0, 5).map((product) => (
              <div
                key={product.id}
                className="px-6 py-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-black">
                    {product.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {product.categoryName} · Rp{" "}
                    {product.price.toLocaleString("id-ID")}
                  </p>
                </div>
                <Link
                  href={`/admin/products/${product.id}`}
                  className="text-xs font-semibold text-black hover:underline"
                >
                  Edit
                </Link>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center">
              <p className="text-sm text-gray-400">No products yet</p>
              <Link
                href="/admin/products/add"
                className="text-sm text-black font-semibold hover:underline mt-2 inline-block"
              >
                Add your first product →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
