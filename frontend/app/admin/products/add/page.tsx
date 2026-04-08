"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import productService from "@/services/productService";
import categoryService from "@/services/categoryService";
import { useToastStore } from "@/lib/useToaststore";

interface Category {
  id: number;
  name: string;
}

export default function AddProductPage() {
  const router = useRouter();
  const { showToast } = useToastStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categoryName, setCategoryName] = useState("");
  
  // Multiple images state
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  // Dynamic Specifications
  const [specs, setSpecs] = useState<{name: string, value: string}[]>([
    {name: "Camera", value: ""},
    {name: "Processor", value: ""},
    {name: "Storage", value: ""}
  ]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  // Layout stats state
  const [totalProducts, setTotalProducts] = useState(0);
  const [criticalStock, setCriticalStock] = useState(0);
  const [depletedStock, setDepletedStock] = useState(0);

  const fetchInitialData = useCallback(async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        productService.getAll(),
        categoryService.getAll(),
      ]);

      if (prodRes.success && prodRes.data) {
        const prods = prodRes.data;
        setTotalProducts(prods.length);
        setCriticalStock(prods.filter((p: any) => p.stock > 0 && p.stock < 10).length);
        setDepletedStock(prods.filter((p: any) => p.stock === 0).length);
      }

      if (catRes.success && catRes.data) {
        setCategories(catRes.data);
      }
    } catch (error) {
      console.error("Failed to fetch initial data:", error);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).slice(0, 4); // Max 4 images
      setImageFiles(filesArray);
      
      const previewsArray = filesArray.map(file => URL.createObjectURL(file));
      setImagePreviews(previewsArray);
    }
  };

  const handleSpecChange = (index: number, field: 'name'|'value', val: string) => {
     const newSpecs = [...specs];
     newSpecs[index][field] = val;
     setSpecs(newSpecs);
  };

  const addSpecField = () => {
     setSpecs([...specs, {name: "", value: ""}]);
  };
  
  const removeSpecField = (index: number) => {
     const newSpecs = [...specs];
     newSpecs.splice(index, 1);
     setSpecs(newSpecs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Filter out empty spec rows
      const validSpecs = specs.filter(s => s.name.trim() !== "" && s.value.trim() !== "");
      
      const response = await productService.create({
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        categoryId: Number(categoryId),
        imageFiles: imageFiles.length > 0 ? imageFiles : undefined,
        specifications: validSpecs.length > 0 ? JSON.stringify(validSpecs) : undefined
      });

      if (response.success) {
        showToast("Product created successfully!", "success");
        router.push("/admin/products");
      } else {
        showToast(`Failed: ${response.message}`, "error");
      }
    } catch {
      showToast("Cannot connect to server. Make sure backend is running.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-10 lg:py-14 px-4 sm:px-6">
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

      {/* 2. Menu Navigasi - Lebar Penuh Sama Seperti Card Atas */}
      <div className="bg-[#D9D9D9] p-4 rounded-3xl flex flex-wrap gap-3 w-full items-center">
        <Link href="/admin" className="bg-white text-gray-500 font-vercetti px-6 py-3.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition shadow-sm">
          Overview
        </Link>
        <Link href="/admin/products" className="bg-white text-gray-500 font-vercetti px-6 py-3.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition shadow-sm">
          Products
        </Link>
        <Link href="/admin/categories" className="bg-white text-gray-500 font-vercetti px-6 py-3.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition shadow-sm">
          Categories
        </Link>
        <Link href="/admin/orders" className="bg-white text-gray-500 font-vercetti px-6 py-3.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition shadow-sm">
          Orders
        </Link>
        <Link href="/admin/products/add" className="bg-black text-white font-vercetti px-6 py-3.5 rounded-xl text-sm font-medium shadow-sm transition">
          Add product
        </Link>
      </div>

      {/* 3. Area Judul */}
      <div className="pt-8 pb-4 text-center">
        <h2 className="text-3xl md:text-[34px] text-black font-hk-grotesk-wide tracking-wide uppercase">
          Add New Product
        </h2>
      </div>



      {/* 4. & 5. Area Form - Menggunakan Grid Per Baris */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* ROW 1: General Info & Upload Image */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          
          {/* General Information */}
          <div className="bg-[#D9D9D9] p-8 rounded-[2.5rem] flex flex-col">
            <h3 className="text-xl md:text-2xl font-hk-grotesk-wide font-bold text-black mb-6">General Information</h3>
            
            <div className="flex flex-col flex-1 gap-5">
              <div>
                <label className="block text-sm font-vercetti text-black mb-2">Name Product</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full border-none px-5 py-3 h-[52px] rounded-2xl text-sm font-vercetti text-black focus:outline-none focus:ring-1 focus:ring-black bg-white"
                />
              </div>

              <div className="flex flex-col flex-1">
                <label className="block text-sm font-vercetti text-black mb-2">Description Product</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border-none px-5 py-4 rounded-2xl text-sm font-vercetti text-black focus:outline-none focus:ring-1 focus:ring-black bg-white resize-none flex-1 min-h-[140px]"
                />
              </div>
            </div>
          </div>

          {/* Upload Image */}
          <div className="bg-[#D9D9D9] p-8 rounded-[2.5rem] flex flex-col">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl md:text-2xl font-hk-grotesk-wide font-bold text-black">Images (Max 4)</h3>
            </div>
            
            <div className="w-full bg-white rounded-[2rem] p-6 flex flex-1 flex-col items-center justify-center relative cursor-pointer group shadow-sm border border-white hover:border-gray-300 transition-all min-h-[220px]">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              
              {imagePreviews.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 w-full h-full relative z-0 pointer-events-none p-2">
                   {imagePreviews.map((preview, i) => (
                      <div key={i} className="aspect-square bg-gray-50 rounded-xl overflow-hidden shadow-sm">
                         <img src={preview} alt={`preview ${i}`} className="w-full h-full object-cover" />
                      </div>
                   ))}
                </div>
              ) : (
                <div className="text-center flex flex-col items-center justify-center pointer-events-none relative z-0">
                  <div className="relative">
                     {/* SVG Picture Icon */}
                    <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    {/* Plus sign */}
                    <span className="absolute -bottom-2 right-6 text-3xl text-gray-400 font-hk-grotesk-wide leading-none">+</span>
                  </div>
                  <p className="mt-4 text-sm font-vercetti text-gray-400">Select multiple files</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ROW 2: Specs */}
        <div className="bg-[#D9D9D9] p-8 rounded-[2.5rem] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl md:text-2xl font-hk-grotesk-wide font-bold text-black">Product Details (Specifications)</h3>
                <button type="button" onClick={addSpecField} className="bg-white text-black px-4 py-2 font-vercetti text-sm rounded-xl hover:bg-gray-100 transition shadow-sm font-semibold">+ Add Field</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {specs.map((spec, index) => (
                  <div key={index} className="flex gap-2">
                     <input
                       type="text"
                       value={spec.name}
                       onChange={(e) => handleSpecChange(index, 'name', e.target.value)}
                       placeholder="e.g. Lens, Cloth, CPU..."
                       className="w-1/3 border-none px-5 py-3 h-[52px] rounded-2xl text-sm font-vercetti text-black focus:outline-none focus:ring-1 focus:ring-black bg-white"
                     />
                     <input
                       type="text"
                       value={spec.value}
                       onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                       placeholder="Detail value..."
                       className="flex-1 border-none px-5 py-3 h-[52px] rounded-2xl text-sm font-vercetti text-black focus:outline-none focus:ring-1 focus:ring-black bg-white"
                     />
                     <button type="button" onClick={() => removeSpecField(index)} className="w-12 h-[52px] flex items-center justify-center bg-white rounded-2xl text-red-500 hover:bg-red-50 transition shadow-sm shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                     </button>
                  </div>
               ))}
            </div>
        </div>

        {/* ROW 3: Price & Stock & Category */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          
          {/* Price and Stock */}
          <div className="bg-[#D9D9D9] p-8 rounded-[2.5rem] flex flex-col justify-center">
            <h3 className="text-xl md:text-2xl font-hk-grotesk-wide font-bold text-black mb-6">Price and Stock</h3>
            
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-vercetti text-black mb-2">Price (Rp)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  min={0}
                  className="w-full border-none px-5 py-3 h-[52px] rounded-2xl text-sm font-vercetti text-black focus:outline-none focus:ring-1 focus:ring-black bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-vercetti text-black mb-2">Stock</label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                  min={0}
                  className="w-full border-none px-5 py-3 h-[52px] rounded-2xl text-sm font-vercetti text-black focus:outline-none focus:ring-1 focus:ring-black bg-white"
                />
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="bg-[#D9D9D9] p-8 rounded-[2.5rem] flex flex-col justify-center relative">
            <h3 className="text-xl md:text-2xl font-hk-grotesk-wide font-bold text-black mb-6">Category</h3>
            
            <div>
              <label className="block text-sm font-vercetti text-black mb-2">Product Category</label>
              {categories.length > 0 ? (
                <div className="relative">
                  <select
                    value={categoryId}
                    onChange={(e) => {
                      setCategoryId(e.target.value);
                      const selected = categories.find((c) => c.id === parseInt(e.target.value));
                      setCategoryName(selected?.name || "");
                    }}
                    required
                    className="w-full border-none px-5 py-3 h-[52px] rounded-2xl text-sm font-vercetti text-black focus:outline-none focus:ring-1 focus:ring-black bg-white appearance-none cursor-pointer pr-10 shadow-sm"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                     <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1.5L6 6.5L11 1.5" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                     </svg>
                  </div>
                </div>
              ) : (
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  required
                  className="w-full border-none px-5 py-3 h-[52px] rounded-2xl text-sm font-vercetti text-black focus:outline-none focus:ring-1 focus:ring-black bg-white shadow-sm"
                  placeholder="Enter category name"
                />
              )}
            </div>
          </div>
        </div>

        {/* ROW 4: Tombol Aksi - Save Product */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#002f5a] text-white px-10 py-4 h-[52px] rounded-2xl text-[15px] font-vercetti hover:bg-[#001f3f] disabled:bg-gray-400 transition active:scale-95 flex items-center justify-center whitespace-nowrap shadow-md tracking-wide"
          >
            {loading ? "..." : "Save Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
