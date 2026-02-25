"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Category {
  id: number;
  name: string;
}

export default function AddProductPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

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
      // Backend uses [FromForm] so we send FormData
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

      const res = await fetch("http://localhost:5055/api/Product", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setMessage("Product created successfully!");
        setTimeout(() => {
          router.push("/admin/products");
        }, 1500);
      } else {
        setSuccess(false);
        setMessage(`Failed: ${data.message}`);
      }
    } catch {
      setSuccess(false);
      setMessage(
        "Cannot connect to server. Make sure backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

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
          <h2 className="text-2xl font-bold text-black">Add New Product</h2>
          <p className="text-gray-500 mt-2 text-sm">
            Fill in the details below to add a new product
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

            {/* Price & Stock */}
            <div className="grid grid-cols-2 gap-4">
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
              <div>
                <label className="block text-xs font-semibold text-gray-600 tracking-wide mb-2">
                  Stock
                </label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                  min={0}
                  className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition"
                  placeholder="0"
                />
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

            {/* Image Upload */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 tracking-wide mb-2">
                Product Image
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
              {imagePreview && (
                <div className="mt-3">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-24 h-24 object-cover border border-gray-200"
                  />
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 text-sm font-semibold uppercase tracking-wide hover:bg-gray-800 disabled:bg-gray-400 transition"
            >
              {loading ? "Creating product..." : "Create Product"}
            </button>
          </form>
        </div>

        {/* Debug Info */}
        <div className="mt-4 text-xs text-gray-400 text-center">
          <p>API: POST http://localhost:5055/api/Product (FormData)</p>
        </div>
      </div>
    </div>
  );
}
