"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Category {
  id: number;
  name: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Add Stock
  const [quantityToAdd, setQuantityToAdd] = useState("");
  const [stockLoading, setStockLoading] = useState(false);

  useEffect(() => {
    fetchProduct();
    fetchCategories();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(
        `http://localhost:5055/api/Product/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await res.json();

      if (data.success) {
        const p = data.data;
        setName(p.name);
        setDescription(p.description || "");
        setPrice(p.price.toString());
        setStock(p.stock.toString());
        setCategoryId(p.categoryId?.toString() || "");
        setCategoryName(p.categoryName || "");
        setImageUrl(p.imageUrl || "");
      } else {
        setMessage("Product not found.");
      }
    } catch {
      setMessage("Cannot connect to server.");
    } finally {
      setFetching(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:5055/api/Category");
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Use FormData same as create
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("stock", stock);

      if (categoryId) {
        formData.append("categoryId", categoryId);
      }
      if (categoryName) {
        formData.append("categoryName", categoryName);
      }
      if (imageFile) {
        formData.append("imageFile", imageFile);
      }

      const res = await fetch(
        `http://localhost:5055/api/Product/${productId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        }
      );

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setMessage("Product updated successfully!");
        setTimeout(() => {
          router.push("/admin/products");
        }, 1500);
      } else {
        setSuccess(false);
        setMessage(`Failed: ${data.message}`);
      }
    } catch {
      setSuccess(false);
      setMessage("Cannot connect to server.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddStock = async () => {
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
          productId: parseInt(productId as string),
          quantityToAdd: parseInt(quantityToAdd),
        }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setMessage(`Stock updated! Added ${quantityToAdd} items.`);
        setStock((parseInt(stock) + parseInt(quantityToAdd)).toString());
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

  if (fetching) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading product data...</p>
      </div>
    );
  }

  const currentImageSrc = imagePreview
    ? imagePreview
    : imageUrl
    ? imageUrl.startsWith("http")
      ? imageUrl
      : `http://localhost:5055${imageUrl}`
    : "";

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/products"
          className="text-xs font-semibold text-gray-400 hover:text-black transition"
        >
          ← Back to Products
        </Link>
      </div>

      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-black">Edit Product</h2>
          <p className="text-gray-500 mt-2 text-sm">
            Update the product details below
          </p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 text-sm ${
              success
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white p-8 shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Product Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 tracking-wide mb-2">
                Product Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition"
                placeholder="Enter product name"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 tracking-wide mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition resize-none"
                placeholder="Describe the product"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 tracking-wide mb-2">
                Price (Rp)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min={0}
                className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition"
                placeholder="0"
              />
            </div>

            {/* Stock Display + Add Stock */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 tracking-wide mb-2">
                Current Stock
              </label>
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-2 text-sm font-semibold ${
                    parseInt(stock) === 0
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : parseInt(stock) < 10
                      ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                      : "bg-green-50 text-green-700 border border-green-200"
                  }`}
                >
                  {stock} items
                </span>
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="number"
                    value={quantityToAdd}
                    onChange={(e) => setQuantityToAdd(e.target.value)}
                    min={1}
                    placeholder="Add qty..."
                    className="flex-1 border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black transition"
                  />
                  <button
                    type="button"
                    onClick={handleAddStock}
                    disabled={stockLoading || !quantityToAdd}
                    className="bg-black text-white px-4 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-gray-800 disabled:bg-gray-400 transition"
                  >
                    {stockLoading ? "..." : "+ Add Stock"}
                  </button>
                </div>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 tracking-wide mb-2">
                Category
              </label>
              {categories.length > 0 ? (
                <select
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    const selected = categories.find(
                      (c) => c.id === parseInt(e.target.value)
                    );
                    setCategoryName(selected?.name || "");
                  }}
                  required
                  className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition bg-white"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  required
                  className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition"
                  placeholder="Enter category name"
                />
              )}
            </div>

            {/* Current Image */}
            {currentImageSrc && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 tracking-wide mb-2">
                  Current Image
                </label>
                <img
                  src={currentImageSrc}
                  alt={name}
                  className="w-24 h-24 object-cover border border-gray-200"
                />
              </div>
            )}

            {/* Image Upload */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 tracking-wide mb-2">
                Replace Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition
                  file:mr-4 file:py-1 file:px-3 file:border-0
                  file:text-xs file:font-semibold file:uppercase file:tracking-wide
                  file:bg-black file:text-white file:cursor-pointer"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 text-sm font-semibold uppercase tracking-wide hover:bg-gray-800 disabled:bg-gray-400 transition"
            >
              {loading ? "Updating product..." : "Update Product"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            Want to go back?{" "}
            <Link
              href="/admin/products"
              className="text-black font-semibold hover:underline"
            >
              Product List
            </Link>
          </p>
        </div>

        {/* Debug Info */}
        <div className="mt-4 text-xs text-gray-400 text-center">
          <p>API: PUT http://localhost:5055/api/Product/{productId}</p>
        </div>
      </div>
    </div>
  );
}
