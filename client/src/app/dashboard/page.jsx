"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      
      // Security Check: If no token, kick them back to login
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/auth/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (data.success) {
          setProfile(data.user);
        } else {
          // Token might be expired/invalid
          localStorage.removeItem("token");
          router.push("/login");
        }
      } catch (error) {
        console.error("Failed to fetch profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading Ledger...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Welcome back, {profile.name}
        </h1>

        {/* The Financial Metrics Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700">
            <h2 className="text-sm font-medium text-blue-100 uppercase tracking-wide">
              Total Wallet Balance
            </h2>
            <p className="mt-2 text-4xl font-extrabold text-white">
              ₹{profile.walletBalance || 0}
            </p>
            <p className="mt-1 text-sm text-blue-200">
              Platform fees (10%) have already been deducted.
            </p>
          </div>
          
          <div className="p-6 bg-white">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Account Details</h3>
            <ul className="divide-y divide-gray-100">
              <li className="py-3 flex justify-between">
                <span className="text-gray-500">Email</span>
                <span className="font-medium text-gray-900">{profile.email}</span>
              </li>
              <li className="py-3 flex justify-between">
                <span className="text-gray-500">Account Role</span>
                <span className="font-medium capitalize text-gray-900">{profile.role}</span>
              </li>
            </ul>
            
            <button 
              onClick={() => {
                localStorage.removeItem("token");
                router.push("/login");
              }}
              className="mt-6 w-full text-center px-4 py-2 border border-red-200 text-red-600 rounded-md hover:bg-red-50 transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}