"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
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

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`http://localhost:5055/api/Product/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setMessage(`"${name}" has been deleted.`);
        setProducts(products.filter((p) => p.id !== id));
      } else {
        setSuccess(false);
        setMessage(`Delete failed: ${data.message}`);
      }
    } catch {
      setSuccess(false);
      setMessage("Cannot connect to server.");
    }

    setTimeout(() => setMessage(""), 3000);
  };

  const handleAddStock = async (productId: number) => {
    if (!quantityToAdd || parseInt(quantityToAdd) <= 0) return;

    setStockLoading(true);
    try {
      const res = await fetch("http://localhost:5055/api/Product/add-stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          productId,
          quantityToAdd: parseInt(quantityToAdd),
        }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setMessage(`Stock updated! Added ${quantityToAdd} items.`);
        setProducts(
          products.map((p) =>
            p.id === productId
              ? { ...p, stock: p.stock + parseInt(quantityToAdd) }
              : p
          )
        );
        setStockModal(null);
        setQuantityToAdd("");
      } else {
        setSuccess(false);
        setMessage(`Failed: ${data.message}`);
      }
    } catch {
      setSuccess(false);
      setMessage("Cannot connect to server.");
    } finally {
      setStockLoading(false);
    }

    setTimeout(() => setMessage(""), 3000);
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
    <div className="space-y-6">
      {/* Message */}
      {message && (
        <div
          className={`p-4 text-sm ${
            success
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message}
        </div>
      )}

      {/* Search & Actions */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or category..."
          className="flex-1 border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition"
        />
        <Link
          href="/admin/products/add"
          className="bg-black text-white px-6 py-3 text-sm font-semibold uppercase tracking-wide hover:bg-gray-800 transition whitespace-nowrap"
        >
          + Add Product
        </Link>
      </div>

      {/* Products Table */}
      <div className="bg-white shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 tracking-wide">
                Product
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 tracking-wide">
                Category
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 tracking-wide">
                Price
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 tracking-wide">
                Stock
              </th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-600 tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length > 0 ? (
              filtered.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {product.imageUrl && (
                        <img
                          src={
                            product.imageUrl.startsWith("http")
                              ? product.imageUrl
                              : `http://localhost:5055${product.imageUrl}`
                          }
                          alt={product.name}
                          className="w-10 h-10 object-cover border border-gray-200"
                        />
                      )}
                      <div>
                        <p className="text-sm font-medium text-black">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate max-w-[180px]">
                          {product.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {product.categoryName}
                  </td>
                  <td className="px-6 py-4 text-sm text-black">
                    Rp {product.price.toLocaleString("id-ID")}
                  </td>
                  <td className="px-6 py-4">
                    {stockModal === product.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={quantityToAdd}
                          onChange={(e) => setQuantityToAdd(e.target.value)}
                          min={1}
                          placeholder="Qty"
                          className="w-16 border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:border-black"
                        />
                        <button
                          onClick={() => handleAddStock(product.id)}
                          disabled={stockLoading}
                          className="text-xs font-semibold text-green-700 hover:underline"
                        >
                          {stockLoading ? "..." : "Add"}
                        </button>
                        <button
                          onClick={() => {
                            setStockModal(null);
                            setQuantityToAdd("");
                          }}
                          className="text-xs text-gray-400 hover:text-gray-600"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 text-xs font-semibold ${
                            product.stock === 0
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : product.stock < 10
                              ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                              : "bg-green-50 text-green-700 border border-green-200"
                          }`}
                        >
                          {product.stock}
                        </span>
                        <button
                          onClick={() => setStockModal(product.id)}
                          className="text-xs text-gray-400 hover:text-black transition"
                          title="Add stock"
                        >
                          + add
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-4">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-xs font-semibold text-black hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() =>
                          handleDelete(product.id, product.name)
                        }
                        className="text-xs font-semibold text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-sm text-gray-400"
                >
                  {search
                    ? "No products match your search."
                    : "No products yet. Click \"+ Add Product\" to get started."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer info */}
      <div className="text-xs text-gray-400 text-center">
        <p>
          Showing {filtered.length} of {products.length} products
        </p>
      </div>
    </div>
  );
}
