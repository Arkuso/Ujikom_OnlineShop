"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo, useRef } from "react";
import orderService from "@/services/orderService";
import authService from "@/services/authService";
import { Order } from "@/types/order";
import { useAuthStore } from "@/lib/useAuthstore";
import { buildUserFromToken } from "@/lib/authSession";
import OrderCard from "@/components/OrderCard";

type UserRole = "Admin" | "Customer" | null;

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user: storeUser, login, logout, syncFromStorage } = useAuthStore();
  const [isLoaded, setIsLoaded] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    syncFromStorage();
    setIsLoaded(true);
    
    const handleStorage = () => syncFromStorage();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    if (storeUser) {
      const fetchOrders = async () => {
        try {
          const res = await orderService.getMyOrders();
          if (res.success && res.data) {
             const validOrders = res.data.filter(order => 
               order.items.length > 0 && 
               !order.items.some(item => item.productName === "Product Unavailable" || item.productName === "Empty Data Product")
             );
             setOrders(validOrders);
          }
        } catch (error) {
          console.error("Failed to fetch orders", error);
        }
      };
      fetchOrders();
    }
  }, [storeUser]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await authService.uploadProfileImage(file);
      if (res.success && res.data) {
        // Update user data by rebuilding from potential new token, 
        // but here we just need to update the profileImageUrl.
        // For simplicity, let's just re-fetch or manually update the store.
        const token = localStorage.getItem("token");
        if (token) {
          // In a real app the backend might return a new token with updated claims,
          // but here we can just update the current state if needed.
          // For now, let's assume the user needs to re-login or we manually update store.
          // Since our buildUserFromToken decodes the token, we'd ideally want a new token.
          // However, we can patch the store user directly for immediate UI update.
          if (storeUser) {
             login({ ...storeUser, profileImageUrl: res.data }, token);
          }
        }
      }
    } catch (error) {
      console.error("Failed to upload image", error);
    } finally {
      setUploading(false);
    }
  };

  const nameToShow = storeUser?.name || "User";
  const roleToShow = storeUser?.role === "Admin" ? "Admin/Customer" : storeUser?.role || "Customer";
  const emailToShow = storeUser?.email || "-";
  const profileImage = storeUser?.profileImageUrl 
    ? (storeUser.profileImageUrl.startsWith('http') ? storeUser.profileImageUrl : `http://localhost:5055${storeUser.profileImageUrl}`)
    : null;

  if (!isLoaded) {
    return <div className="min-h-screen bg-[#D9D9D9] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-black/20 border-t-black rounded-full animate-spin"></div>
    </div>;
  }

  if (!storeUser) {
     return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-[#D9D9D9]">
           <h2 className="text-4xl font-['HKGroteskWide'] font-semibold text-[#171717] mb-6 tracking-tight">Account not detected</h2>
           <p className="text-[#171717]/60 text-lg mb-12 max-w-sm mx-auto font-['Vercetti-Regular'] leading-relaxed">
             Please log in to manage your profile and view order history.
           </p>
           <div className="flex flex-wrap gap-6 justify-center">
              <Link href="/login" className="bg-[#1A1A1A] text-white py-5 px-16 text-sm font-['Vercetti-Regular'] rounded-xl hover:bg-black transition-all">Sign In</Link>
              <Link href="/register" className="bg-white text-[#171717] py-5 px-16 text-sm font-['Vercetti-Regular'] rounded-xl border border-black/5 hover:bg-gray-50 transition-all">Sign up</Link>
           </div>
        </div>
     );
  }

  return (
    <div className="min-h-screen pt-32 pb-24 bg-[#D9D9D9] px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-8 block">
        {/* Account Detail Block */}
        <div className="bg-[#E0E0E0] rounded-[2rem] p-8 md:p-10 relative">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-2.5 h-8 bg-[#2563EB] rounded-full"></div>
            <h2 className="text-2xl font-medium text-black">Account Detail</h2>
          </div>

          <div className="flex items-start gap-8 mb-16 pl-2">
            {/* Avatar with Upload Capability */}
            <div 
              className="relative w-[140px] h-[140px] bg-[#111111] rounded-full flex-shrink-0 flex items-center justify-center text-white text-5xl font-bold cursor-pointer group hover:opacity-90 transition-opacity overflow-hidden"
              onClick={handleImageClick}
            >
              {profileImage ? (
                <img src={profileImage} alt={nameToShow} className="w-full h-full object-cover" />
              ) : (
                <span>{nameToShow.slice(0, 1).toUpperCase()}</span>
              ) }
              
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <img src="/noun-add-picture.svg" alt="Add" className="w-8 h-8 invert" />
                {uploading && <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                </div>}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />
            </div>
            
            <div className="flex flex-col pt-1">
               <h3 className="text-[32px] font-['HKGroteskWide'] font-semibold text-black mb-6">{nameToShow}</h3>
               <div className="flex flex-wrap gap-8 sm:gap-20">
                 <div className="flex flex-col">
                   <p className="text-[14px] text-black/60 mb-1 font-['Vercetti-Regular']">Role</p>
                   <p className="text-[22px] text-black font-medium">{roleToShow}</p>
                 </div>
                 <div className="flex flex-col">
                   <p className="text-[14px] text-black/60 mb-1 font-['Vercetti-Regular']">Email Address</p>
                   <p className="text-[22px] text-black font-medium">{emailToShow}</p>
                 </div>
               </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-6">
            <div className="flex gap-5">
              {storeUser.role === "Admin" && (
                <Link href="/admin" className="bg-white text-black py-4 px-10 rounded-xl font-medium hover:bg-gray-100 transition-colors">Admin Dashboard</Link>
              )}
            </div>
            <button 
              onClick={() => logout()}
              className="px-6 py-2 text-red-600 font-medium hover:bg-red-50 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Order History Section */}
        {orders.length > 0 && (
          <div className="space-y-10 pt-10">
            <h2 className="text-4xl font-['HKGroteskWide'] font-bold text-black px-4 tracking-tighter">Order History</h2>
            <div className="grid grid-cols-1 gap-8 px-2">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}