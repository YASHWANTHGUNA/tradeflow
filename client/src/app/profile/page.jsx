"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Loader2,
  Package,
  Heart,
  Settings,
  Store,
  Wallet,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import EditProfileModal from "@/components/EditProfileModal";
import ProfileListModal from "@/components/ProfileListModal";

export default function ProfileSwitchboard() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [listModalConfig, setListModalConfig] = useState({
    isOpen: false,
    title: "",
    type: "",
    items: [],
  });
  const [isMounted, setIsMounted] = useState(false);

  const refreshProfile = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please log in to view your profile.");
      router.push("/login");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/users/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to refresh profile data");
      }

      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error(error);
      toast.error("Session expired. Please log in again.");
      localStorage.removeItem("token");
      router.push("/login");
    }
  };

  useEffect(() => {
    setIsMounted(true);

    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please log in to view your profile.");
        router.push("/login");
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5000/api/users/profile",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) throw new Error("Failed to load profile data");

        const data = await response.json();
        setProfile(data);
      } catch (error) {
        console.error(error);
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  if (!isMounted) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-16">
      {profile.role === "customer" ? (
        <CustomerProfile
          profile={profile}
          onEditClick={() => setIsEditModalOpen(true)}
          onViewList={(title, type, items) =>
            setListModalConfig({
              isOpen: true,
              title,
              type,
              items: items || [],
            })
          }
        />
      ) : (
        <MerchantProfile
          profile={profile}
          onEditClick={() => setIsEditModalOpen(true)}
        />
      )}

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        onUpdateSuccess={refreshProfile}
      />

      <ProfileListModal
        isOpen={listModalConfig.isOpen}
        onClose={() =>
          setListModalConfig({ ...listModalConfig, isOpen: false })
        }
        title={listModalConfig.title}
        type={listModalConfig.type}
        items={listModalConfig.items}
        onRefresh={refreshProfile} 
      />
    </div>
  );
}

// ==========================================
// COMPONENT 1: THE CUSTOMER (BUYER) UI
// ==========================================
function CustomerProfile({ profile, onEditClick, onViewList }) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 mb-8 flex items-center gap-6">
        <div className="w-24 h-24 bg-gradient-to-tr from-blue-100 to-blue-50 rounded-full flex items-center justify-center border-4 border-white shadow-lg overflow-hidden flex-shrink-0">
          {profile.profilePicture ? (
            <img
              src={profile.profilePicture}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-blue-400 text-4xl font-black">
              {profile.name?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {profile.name}
          </h1>
          <p className="text-slate-500 font-medium mt-1">{profile.email}</p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider">
            TradeFlow Buyer
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() =>
            onViewList("Order History", "history", profile.purchaseHistory)
          }
          className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
        >
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
            <Package className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            Order History
          </h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-4">
            Track your recent purchases and download invoices.
          </p>
          <span className="text-sm font-bold text-blue-600 flex items-center gap-1">
            {profile.purchaseHistory?.length || 0} Orders placed &rarr;
          </span>
        </div>

        <div
          onClick={() =>
            onViewList("Saved Items", "favorites", profile.favorites)
          }
          className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:shadow-md hover:border-red-200 transition-all cursor-pointer group"
        >
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-red-500 transition-colors">
            <Heart className="w-7 h-7 text-red-500 group-hover:text-white transition-colors" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Saved Items</h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-4">
            View and manage the hardware you've bookmarked.
          </p>
          <span className="text-sm font-bold text-red-500 flex items-center gap-1">
            {profile.favorites?.length || 0} Items saved &rarr;
          </span>
        </div>

        <div
          onClick={onEditClick}
          className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-slate-800 transition-colors">
            <Settings className="w-7 h-7 text-slate-600 group-hover:text-white transition-colors" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            Account Settings
          </h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-4">
            Update your password, shipping address, and picture.
          </p>
          <span className="text-sm font-bold text-slate-700 flex items-center gap-1">
            Manage Details &rarr;
          </span>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// COMPONENT 2: THE MERCHANT UI
// ==========================================
function MerchantProfile({ profile, onEditClick }) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
      <div className="bg-slate-900 rounded-3xl shadow-xl border border-slate-800 p-8 mb-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex items-center gap-6">
          <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center border-2 border-slate-700 shadow-inner flex-shrink-0">
            <Store className="w-10 h-10 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
              {profile.storeDetails?.storeName || profile.name}
              <ShieldCheck className="w-6 h-6 text-emerald-400 hidden sm:block" />
            </h1>
            <p className="text-slate-400 font-medium mt-1">
              Verified TradeFlow Merchant
            </p>
          </div>
        </div>

        <div className="relative z-10 w-full md:w-auto flex flex-col sm:flex-row gap-3">
          <button
            onClick={onEditClick}
            className="w-full md:w-auto inline-flex justify-center items-center gap-2 px-6 py-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold rounded-xl transition-all"
          >
            Edit Store Profile
          </button>

          <Link
            href="/dashboard"
            className="w-full md:w-auto inline-flex justify-center items-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-emerald-500/25"
          >
            Financial Ledger
          </Link>

          <Link
            href="/dashboard/orders"
            className="w-full md:w-auto inline-flex justify-center items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5"
          >
            Fulfillment Ledger
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-50 rounded-xl">
              <Wallet className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-600">
              Available Balance
            </h3>
          </div>
          <p className="text-5xl font-black text-slate-900 tracking-tighter">
            ₹{profile.walletBalance?.toLocaleString("en-IN") || 0}
          </p>
          <p className="text-sm font-medium text-emerald-600 mt-4 flex items-center gap-1">
            Ready for Razorpay Payout
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-600">
              Active Inventory
            </h3>
          </div>
          <p className="text-5xl font-black text-slate-900 tracking-tighter">
            {profile.activeListings?.length || 0}
          </p>
          <p className="text-sm font-medium text-blue-600 mt-4 flex items-center gap-1">
            Live on the Marketplace
          </p>
        </div>
      </div>
    </div>
  );
}
