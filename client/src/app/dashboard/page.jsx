"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { 
  Loader2, Package, ArrowLeft, Store, Wallet, 
  TrendingUp, IndianRupee, ShieldCheck, ShoppingBag, Eye 
} from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [merchantData, setMerchantData] = useState(null);

  useEffect(() => {
    const fetchLedgerAndProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Session expired. Please log in again.");
          router.push("/login");
          return;
        }

        // 1. Fetch Dynamic Profile Data to verify role & get metrics
        const profileRes = await fetch("http://localhost:5000/api/users/profile", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (profileRes.status === 401 || profileRes.status === 403) {
          handleAuthFailure();
          return;
        }

        const pData = await profileRes.json();
        setMerchantData(pData);

        // 2. Fetch Active Inventory Ledger
        const response = await fetch("http://localhost:5000/api/products/merchant", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch ledger data");
        
        const data = await response.json();
        
        // FIX: Bound incoming array to active state hook
        setInventory(data); 

      } catch (error) {
        console.error("Dashboard Fetch Error:", error);
        toast.error("Could not load financial metrics.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLedgerAndProfile();
  }, [router]);

  const handleAuthFailure = () => {
    localStorage.removeItem("token");
    toast.error("Not authorized. Redirecting...");
    router.push("/login");
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="font-medium">Syncing Ledger & Wallet Balances...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-16">
      
      {/* ----- DYNAMIC NAV BAR ----- */}
      <nav className="bg-white border-b border-slate-200 px-4 py-4 sm:px-6 lg:px-8 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link href="/marketplace" className="text-xl font-black text-blue-600 tracking-tighter">
              TradeFlow.
            </Link>
            <Link href="/marketplace" className="text-sm font-semibold text-slate-600 hover:text-blue-600 flex items-center gap-1.5 transition">
              <ShoppingBag className="w-4 h-4" /> Browse Marketplace
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/profile" className="text-sm font-semibold text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full transition">
              Edit Store Profile
            </Link>
            <button onClick={handleSignOut} className="text-sm font-bold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-full transition">
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* ----- MAIN ANALYTICS HUB ----- */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-8">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Financial Ledger</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Storefront: <span className="text-blue-600 font-bold">{merchantData?.storeDetails?.storeName || merchantData?.name}</span>
            </p>
          </div>
          <Link 
            href="/add-product" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold transition shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 flex items-center gap-2"
          >
            + List New Item
          </Link>
        </div>

        {/* Financial Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Wallet Payouts */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600"><Wallet className="w-5 h-5" /></div>
              <h3 className="text-sm font-bold text-slate-500">Withdrawable Balance</h3>
            </div>
            <p className="text-3xl font-black text-slate-900 tracking-tight">
              ₹{merchantData?.walletBalance?.toLocaleString("en-IN") || 0}
            </p>
            <span className="text-xs text-emerald-600 font-semibold mt-2 block">Settled via Razorpay Smart Route</span>
          </div>

          {/* Active Inventory Assets */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600"><Package className="w-5 h-5" /></div>
              <h3 className="text-sm font-bold text-slate-500">Asset Valuation</h3>
            </div>
            <p className="text-3xl font-black text-slate-900 tracking-tight">
              ₹{inventory.reduce((total, item) => total + item.price, 0).toLocaleString("en-IN")}
            </p>
            <span className="text-xs text-blue-600 font-semibold mt-2 block">{inventory.length} Active Listings live</span>
          </div>

          {/* Platform Performance metrics */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600"><TrendingUp className="w-5 h-5" /></div>
              <h3 className="text-sm font-bold text-slate-500">Platform Split Fee</h3>
            </div>
            <p className="text-3xl font-black text-slate-900 tracking-tight">10%</p>
            <span className="text-xs text-amber-600 font-semibold mt-2 block">Standard Escrow Retainer Rate</span>
          </div>
        </div>

        {/* ----- DETAILED OPERATIONS TABLE ----- */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900">Active Inventory Ledger</h3>
            <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-md">Real-Time Data Active</span>
          </div>
          
          {inventory.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-medium">
              No products found. Use the button above to add your first item!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50/70">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Hardware Asset Details</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date Created</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Listing Cost</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Earnings (90%)</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {inventory.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/80 transition duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-12 w-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0">
                            <img className="h-full w-full object-contain" src={item.image} alt={item.title} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-slate-900">{item.title}</div>
                            <div className="text-xs text-slate-400 truncate max-w-[200px]">{item.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">
                        {new Date(item.createdAt).toLocaleDateString("en-IN", {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 text-right font-bold">
                        ₹{item.price.toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600 text-right font-extrabold">
                        ₹{(item.price * 0.9).toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <Link href={`/product/${item._id}`} className="text-blue-600 hover:text-blue-800 bg-blue-50 p-2 rounded-lg inline-flex items-center gap-1 transition">
                          <Eye className="w-4 h-4" /> View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}