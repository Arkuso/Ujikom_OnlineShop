"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import categoryService from "@/services/categoryService";
import productService from "@/services/productService";
import { useToastStore } from "@/lib/useToaststore";

type Category = {
  id: number;
  name: string;
  description: string;
};

export default function AdminCategoriesPage() {
  const { showToast } = useToastStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [criticalStock, setCriticalStock] = useState(0);
  const [depletedStock, setDepletedStock] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [catRes, prodRes] = await Promise.all([
        categoryService.getAll(),
        productService.getAll()
      ]);

      if (catRes.success && catRes.data) {
        setCategories(catRes.data);
      }

      if (prodRes.success && prodRes.data) {
        const prods = prodRes.data;
        setTotalProducts(prods.length);
        setCriticalStock(prods.filter((p: any) => p.stock > 0 && p.stock < 10).length);
        setDepletedStock(prods.filter((p: any) => p.stock === 0).length);
      }
    } catch {
      showToast("Failed to load data.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setName("");
    setDescription("");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      const response = await categoryService.create({ name: name.trim(), description: description.trim() });

      if (response.success) {
        showToast("Category created successfully.", "success");
        resetForm();
        await fetchData();
      } else {
        showToast(response.message || "Failed to create category.", "error");
      }
    } catch {
      showToast("Cannot connect to server.", "error");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setEditName(category.name);
    setEditDescription(category.description || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditDescription("");
  };

  const handleUpdate = async (id: number) => {
    if (!editName.trim()) return;

    setSaving(true);
    try {
      const response = await categoryService.update(id, { name: editName.trim(), description: editDescription.trim() });

      if (response.success) {
        showToast("Category updated successfully.", "success");
        cancelEdit();
        await fetchData();
      } else {
        showToast(response.message || "Failed to update category.", "error");
      }
    } catch {
      showToast("Cannot connect to server.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, categoryName: string) => {
    if (!confirm(`Delete category "${categoryName}"?`)) return;

    setSaving(true);
    try {
      const response = await categoryService.delete(id);

      if (response.success) {
        showToast("Category deleted successfully.", "success");
        await fetchData();
      } else {
        showToast(response.message || "Failed to delete category.", "error");
      }
    } catch {
      showToast("Cannot connect to server.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
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
            <p className="text-3xl lg:text-[40px] leading-tight font-vercetti text-black">Qty {totalProducts}</p>
          </div>
          <div className="bg-white p-6 md:p-8 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
            <p className="text-gray-500 text-sm font-vercetti mb-3">Critical Stock</p>
            <p className="text-3xl lg:text-[40px] leading-tight font-vercetti text-black">{criticalStock}</p>
          </div>
          <div className="bg-white p-6 md:p-8 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
            <p className="text-gray-500 text-sm font-vercetti mb-3">Depleted Stock</p>
            <p className="text-3xl lg:text-[40px] leading-tight font-vercetti text-black">{depletedStock}</p>
          </div>
        </div>
      </div>

      {/* 2. Kartu Bawah (Konten) */}
      <div className="bg-[#D9D9D9] p-8 md:p-10 rounded-[2rem]">
        {/* Menu Navigasi */}
        <div className="flex flex-wrap gap-2 md:gap-3 mb-10">
          <Link href="/admin" className="bg-white text-gray-500 font-vercetti px-6 py-3 rounded-xl text-sm hover:bg-gray-50 transition active:scale-95 shadow-sm">
            Overview
          </Link>
          <Link href="/admin/products" className="bg-white text-gray-500 font-vercetti px-6 py-3 rounded-xl text-sm hover:bg-gray-50 transition active:scale-95 shadow-sm">
            Products
          </Link>
          <Link href="/admin/categories" className="bg-black text-white font-vercetti px-6 py-3 rounded-xl text-sm transition active:scale-95 shadow-sm">
            Categories
          </Link>
          <Link href="/admin/orders" className="bg-white text-gray-500 font-vercetti px-6 py-3 rounded-xl text-sm hover:bg-gray-50 transition active:scale-95 shadow-sm">
            Orders
          </Link>
          <Link href="/admin/products/add" className="bg-white text-gray-500 font-vercetti px-6 py-3 rounded-xl text-sm hover:bg-gray-50 transition active:scale-95 shadow-sm">
            Add product
          </Link>
        </div>



        {/* Add Category Section */}
        <div className="mb-10">
          <h2 className="text-3xl md:text-4xl text-black text-center font-hk-grotesk-wide mb-6 tracking-wide uppercase">Add Category</h2>
          <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-4 items-center">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Category name"
              required
              className="flex-1 w-full bg-[#f1f3f9] border border-gray-400 px-6 h-[52px] rounded-full text-sm font-vercetti text-black placeholder:text-gray-500 focus:outline-none focus:border-black transition"
            />
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (Optional)"
              className="flex-1 w-full bg-[#f1f3f9] border border-gray-400 px-6 h-[52px] rounded-full text-sm font-vercetti text-black placeholder:text-gray-500 focus:outline-none focus:border-black transition"
            />
            <button
              type="submit"
              disabled={saving}
              className="bg-[#f1f3f9] border border-black text-black px-10 h-[52px] rounded-full text-sm font-vercetti hover:bg-white transition active:scale-95 shrink-0"
            >
              {saving ? "..." : "Create"}
            </button>
          </form>
        </div>

        {/* Category List Section */}
        <div className="bg-[#f1f3f9] rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-[#6C6C6C]">
            <p className="text-[15px] font-vercetti text-white tracking-wide">
              Category list
            </p>
          </div>
          <div className="divide-y divide-gray-300 border-x border-b border-gray-300 rounded-b-2xl">
            {categories.length === 0 ? (
              <p className="px-8 py-10 text-sm font-vercetti text-gray-500 text-center italic">No categories found.</p>
            ) : (
              categories.map((category) => (
                <div key={category.id} className="px-6 py-5 bg-transparent hover:bg-white/50 transition">
                  {editingId === category.id ? (
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 w-full bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-vercetti focus:outline-none focus:border-black"
                      />
                      <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="flex-1 w-full bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-vercetti focus:outline-none focus:border-black"
                      />
                      <div className="flex gap-4">
                        <button
                          onClick={() => handleUpdate(category.id)}
                          disabled={saving}
                          className="text-sm font-vercetti text-black hover:underline"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="text-sm font-vercetti text-gray-500 hover:text-black"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex-1">
                        <p className="text-xl font-bold font-vercetti text-black">{category.name}</p>
                        <p className="text-[15px] font-vercetti text-gray-500 mt-0.5">{category.description || "No description provided."}</p>
                      </div>
                      <div className="flex flex-col items-center justify-center gap-0.5 min-w-[60px]">
                        <button
                          onClick={() => startEdit(category)}
                          className="text-[15px] font-vercetti text-black hover:underline w-full text-right"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(category.id, category.name)}
                          className="text-[15px] font-vercetti text-red-600 hover:opacity-70 w-full text-right"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
