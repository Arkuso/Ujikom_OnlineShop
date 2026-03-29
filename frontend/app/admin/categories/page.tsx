"use client";

import { useEffect, useState, useCallback } from "react";
import categoryService from "@/services/categoryService";

type Category = {
  id: number;
  name: string;
  description: string;
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const fetchCategories = useCallback(async () => {
    try {
      const response = await categoryService.getAll();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch {
      setSuccess(false);
      setMessage("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

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
        setSuccess(true);
        setMessage("Category created successfully.");
        resetForm();
        await fetchCategories();
      } else {
        setSuccess(false);
        setMessage(response.message || "Failed to create category.");
      }
    } catch {
      setSuccess(false);
      setMessage("Cannot connect to server.");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 3000);
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
        setSuccess(true);
        setMessage("Category updated successfully.");
        cancelEdit();
        await fetchCategories();
      } else {
        setSuccess(false);
        setMessage(response.message || "Failed to update category.");
      }
    } catch {
      setSuccess(false);
      setMessage("Cannot connect to server.");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleDelete = async (id: number, categoryName: string) => {
    if (!confirm(`Delete category \"${categoryName}\"?`)) return;

    setSaving(true);
    try {
      const response = await categoryService.delete(id);

      if (response.success) {
        setSuccess(true);
        setMessage("Category deleted successfully.");
        await fetchCategories();
      } else {
        setSuccess(false);
        setMessage(response.message || "Failed to delete category.");
      }
    } catch {
      setSuccess(false);
      setMessage("Cannot connect to server.");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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

      <div className="bg-white border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-black mb-4">Add Category</h2>
        <form onSubmit={handleCreate} className="grid md:grid-cols-3 gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name"
            required
            className="border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black"
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black"
          />
          <button
            type="submit"
            disabled={saving}
            className="bg-black text-white text-sm font-semibold px-4 py-3 hover:bg-gray-800 disabled:bg-gray-400"
          >
            {saving ? "Saving..." : "Create"}
          </button>
        </form>
      </div>

      <div className="bg-white border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <p className="text-xs font-semibold text-gray-600 tracking-wide uppercase">
            Category List
          </p>
        </div>
        <div className="divide-y divide-gray-100">
          {categories.length === 0 ? (
            <p className="px-6 py-8 text-sm text-gray-400 text-center">No categories found.</p>
          ) : (
            categories.map((category) => (
              <div key={category.id} className="px-6 py-4">
                {editingId === category.id ? (
                  <div className="grid md:grid-cols-3 gap-3 items-center">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
                    />
                    <input
                      type="text"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
                    />
                    <div className="flex gap-3 md:justify-end">
                      <button
                        onClick={() => handleUpdate(category.id)}
                        disabled={saving}
                        className="text-xs font-semibold text-black hover:underline"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-xs font-semibold text-gray-500 hover:underline"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-black">{category.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{category.description || "-"}</p>
                    </div>
                    <div className="flex gap-4">
                      <button
                        onClick={() => startEdit(category)}
                        className="text-xs font-semibold text-black hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(category.id, category.name)}
                        className="text-xs font-semibold text-red-600 hover:underline"
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
  );
}
