"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Package, Truck, CheckCircle, Clock } from "lucide-react";

export default function MerchantDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Role Authorization Check
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole"); // Assuming you save role on login

    if (!token || role !== "merchant") {
      toast.error("Unauthorized. Merchant access only.");
      router.push("/");
      return;
    }

    // 2. Fetch Active Orders
    const fetchOrders = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/orders/merchant`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!response.ok) throw new Error("Failed to load ledgers");
        
        const data = await response.json();
        setOrders(data.orders);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

  // 3. Status Update Handler
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      // Optimistic UI Update
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
         order._id === orderId ? { ...order, fulfillmentStatus: newStatus } : order
        )
      );
      toast.success(`Order marked as ${newStatus}`);
    } catch (error) {
      toast.error("Could not update shipping status.");
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading secure dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-8 flex items-center gap-3">
          <Package className="w-8 h-8 text-blue-600" />
          Fulfillment Ledger
        </h1>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {orders.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              No active orders found. Your inventory is waiting.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {orders.map((order) => (
                <div key={order._id} className="p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-slate-50 transition-colors">
                  
                  {/* Order Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-16 h-16 bg-slate-100 rounded-lg p-2 border border-slate-200">
                      <img src={order.product.image} alt="product" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{order.product.title}</h3>
                      <p className="text-sm text-slate-500 mt-1">
                        Buyer: <span className="font-mono text-xs bg-slate-200 px-1.5 py-0.5 rounded">{order.buyer?.name}</span>
                      </p>
                      <p className="text-sm font-black text-blue-600 mt-1">
                        ₹{(order.price * order.quantity).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  {/* Status Toggles */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateOrderStatus(order._id, "Processing")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                        order.fulfillmentStatus === "Processing" ? "bg-amber-100 text-amber-700 ring-2 ring-amber-400" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      <Clock className="w-4 h-4" /> Processing
                    </button>
                    
                    <button
                      onClick={() => updateOrderStatus(order._id, "Shipped")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                        order.fulfillmentStatus === "Shipped" ? "bg-blue-100 text-blue-700 ring-2 ring-blue-400" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      <Truck className="w-4 h-4" /> Shipped
                    </button>

                    <button
                      onClick={() => updateOrderStatus(order._id, "Delivered")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                        
                      order.fulfillmentStatus  === "Delivered" ? "bg-emerald-100 text-emerald-700 ring-2 ring-emerald-400" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" /> Delivered
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}