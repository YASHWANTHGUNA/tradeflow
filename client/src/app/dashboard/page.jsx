"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function Dashboard() {
  const router = useRouter();
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLedger = async () => {
      try {
        // 1. The Gatekeeper: Check for the token first
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Session expired. Please log in again.");
          router.push("/login");
          return; // Stop the function immediately
        }

        // 2. The Secure Request: Attach the token to the Headers
        const response = await fetch("http://localhost:5000/api/products/merchant", { // Update this URL to match your actual backend ledger endpoint
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // The crucial security step
          },
        });

        // 3. Handle Token Expiration or Unauthorized Access
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          toast.error("Not authorized. Redirecting...");
          router.push("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch ledger data");
        }
        
        const data = await response.json();
        
        // setProducts(data); <-- Update whatever state you are using here
      } catch (error) {
        console.error("Dashboard Fetch Error:", error);
        toast.error("Could not load dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLedger();
  }, [router]);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Top Stats Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-blue-600 px-6 py-8 text-white flex justify-between items-center">
            <div>
              <h2 className="text-sm font-medium text-blue-100 uppercase tracking-wider">Total Inventory Value</h2>
              <p className="mt-2 text-4xl font-extrabold">
                ₹{inventory.reduce((total, item) => total + item.price, 0).toLocaleString("en-IN")}
              </p>
            </div>
            <Link 
              href="/add-product" 
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition"
            >
              + List New Item
            </Link>
          </div>
          
          <div className="px-6 py-4 flex justify-between items-center bg-gray-50 border-t border-gray-200">
            <span className="text-sm text-gray-500">Merchant Account Active</span>
            <button onClick={handleSignOut} className="text-sm text-red-600 font-medium hover:text-red-800">
              Sign Out
            </button>
          </div>
        </div>

        {/* Inventory Ledger Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Active Inventory Ledger</h3>
          </div>
          
          {isLoading ? (
            <div className="p-6 text-center text-gray-500">Loading ledger...</div>
          ) : inventory.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No products listed yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Listed</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price (₹)</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inventory.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img className="h-10 w-10 rounded object-cover" src={item.image} alt={item.title} />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{item.title}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                        ₹{item.price.toLocaleString("en-IN")}
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