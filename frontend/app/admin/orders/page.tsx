"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import orderService from "@/services/orderService";
import productService from "@/services/productService";

type OrderItem = {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
};

type Order = {
  id: number;
  userId: number;
  userEmail: string;
  orderDate: string;
  totalAmount: number;
  status: string;
  items: OrderItem[];
};

const STATUS_OPTIONS = ["Pending", "Processing", "Shipped", "Completed", "Cancelled"] as const;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  // Layout stats state
  const [totalProducts, setTotalProducts] = useState(0);
  const [criticalStock, setCriticalStock] = useState(0);
  const [depletedStock, setDepletedStock] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      const [orderRes, prodRes] = await Promise.all([
        orderService.getAllOrders(),
        productService.getAll()
      ]);

      if (orderRes.success && orderRes.data) {
        setOrders(orderRes.data);
      } else {
        setSuccess(false);
        setMessage(orderRes.message || "Failed to load orders.");
      }

      if (prodRes.success && prodRes.data) {
        const prods = prodRes.data;
        setTotalProducts(prods.length);
        setCriticalStock(prods.filter((p: any) => p.stock > 0 && p.stock < 10).length);
        setDepletedStock(prods.filter((p: any) => p.stock === 0).length);
      }
    } catch {
      setSuccess(false);
      setMessage("Cannot connect to server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateStatus = async (orderId: number, status: string) => {
    setUpdatingId(orderId);
    try {
      const response = await orderService.updateStatus(orderId, status);

      if (response.success && response.data) {
        setSuccess(true);
        setMessage("Order status updated.");
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, status: response.data!.status } : order
          )
        );
      } else {
        setSuccess(false);
        setMessage(response.message || "Failed to update status.");
      }
    } catch {
      setSuccess(false);
      setMessage("Cannot connect to server.");
    } finally {
      setUpdatingId(null);
      setTimeout(() => setMessage(""), 3000);
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
          <Link href="/admin/categories" className="bg-white text-gray-500 font-vercetti px-6 py-3 rounded-xl text-sm hover:bg-gray-50 transition active:scale-95 shadow-sm">
            Categories
          </Link>
          <Link href="/admin/orders" className="bg-black text-white font-vercetti px-6 py-3 rounded-xl text-sm transition active:scale-95 shadow-sm">
            Orders
          </Link>
          <Link href="/admin/products/add" className="bg-white text-gray-500 font-vercetti px-6 py-3 rounded-xl text-sm hover:bg-gray-50 transition active:scale-95 shadow-sm">
            Add product
          </Link>
        </div>

        {message && (
          <div className={`p-4 mb-8 rounded-xl text-sm font-vercetti ${success ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            {message}
          </div>
        )}

        {/* Order Management Section */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
          <div className="py-6 border-b border-gray-100 flex items-center justify-center">
            <h2 className="text-3xl text-black font-hk-grotesk-wide tracking-wide uppercase">
              Order Management
            </h2>
          </div>

          <div className="bg-[#D9D9D9] p-6 lg:p-10">
            {orders.length === 0 ? (
              <p className="py-10 text-sm font-vercetti text-gray-500 text-center italic opacity-80">No orders found.</p>
            ) : (
              <div className="space-y-10">
                {orders.map((order) => (
                  <div key={order.id} className="space-y-4">
                    {/* Order Info */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="font-vercetti text-black leading-tight space-y-1">
                        <p className="text-[15px]">Order #{order.id}</p>
                        <p className="text-[15px]">{new Date(order.orderDate).toLocaleDateString("id-ID")} {new Date(order.orderDate).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}</p>
                        <p className="text-[15px]">Total : {order.totalAmount.toLocaleString("id-ID")}</p>
                      </div>

                      {/* Status Dropdown */}
                      <div className="flex items-center gap-2 mt-2 sm:mt-0">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          disabled={updatingId === order.id}
                          className="bg-white border border-gray-400/50 px-4 py-2 rounded-xl text-sm font-vercetti focus:outline-none focus:border-black cursor-pointer shadow-sm"
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Order Items Table */}
                    <div className="bg-white rounded-t-xl overflow-hidden shadow-sm border border-white">
                      <div className="px-6 py-3 border-b border-gray-100">
                        <p className="text-[15px] font-vercetti text-black">
                          Items
                        </p>
                      </div>
                      <div className="">
                        {order.items.map((item, index) => (
                          <div key={`${order.id}-${item.productId}-${index}`} className="px-6 py-4 flex justify-between items-center gap-4">
                            <p className="text-[15px] font-vercetti text-black">
                              {item.productName} {item.quantity > 1 && <span className="text-gray-500 ml-1">x{item.quantity}</span>}
                            </p>
                            <p className="text-[15px] text-right font-vercetti text-black whitespace-nowrap">
                              Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
