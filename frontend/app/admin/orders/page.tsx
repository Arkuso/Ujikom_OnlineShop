"use client";

import { useEffect, useState, useCallback } from "react";
import orderService from "@/services/orderService";

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

  const fetchOrders = useCallback(async () => {
    try {
      const response = await orderService.getAllOrders();
      if (response.success && response.data) {
        setOrders(response.data);
      } else {
        setSuccess(false);
        setMessage(response.message || "Failed to load orders.");
      }
    } catch {
      setSuccess(false);
      setMessage("Cannot connect to server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

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
        <p className="text-sm text-gray-400">Loading orders...</p>
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

      <div className="bg-white border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <p className="text-xs font-semibold text-gray-600 tracking-wide uppercase">
            Order Management
          </p>
        </div>

        {orders.length === 0 ? (
          <p className="px-6 py-10 text-sm text-gray-400 text-center">No orders found.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {orders.map((order) => (
              <div key={order.id} className="px-6 py-5 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-black">Order #{order.id}</p>
                    <p className="text-xs text-gray-500 mt-1">User: {order.userEmail || `User #${order.userId}`}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(order.orderDate).toLocaleString("id-ID")}
                    </p>
                    <p className="text-sm font-bold text-black mt-2">
                      Rp {order.totalAmount.toLocaleString("id-ID")}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                      disabled={updatingId === order.id}
                      className="border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black bg-white"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    {updatingId === order.id && (
                      <span className="text-xs text-gray-400">Saving...</span>
                    )}
                  </div>
                </div>

                <div className="border border-gray-200 bg-gray-50">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Items
                    </p>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {order.items.map((item, index) => (
                      <div key={`${order.id}-${item.productId}-${index}`} className="px-4 py-3 flex justify-between gap-3">
                        <p className="text-sm text-black">
                          {item.productName} <span className="text-gray-500">x{item.quantity}</span>
                        </p>
                        <p className="text-sm font-semibold text-black">
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
  );
}
