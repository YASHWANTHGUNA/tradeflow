"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // We allow passing direct credentials for the Recruiter Demo buttons
  const handleLogin = async (e, directCredentials = null) => {
    if (e) e.preventDefault();
    
    const credentialsToUse = directCredentials || formData;
    
    if (!credentialsToUse.email || !credentialsToUse.password) {
      toast.error("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Authenticating secure connection...");

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentialsToUse),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid credentials");
      }

      // 1. Save the secure token
      localStorage.setItem("token", data.token);
      toast.success(`Welcome back!`, { id: toastId });

      // 2. The RBAC Gatekeeper (Role-Based Access Control)
      if (data.role === "merchant") {
        router.push("/dashboard");
      } else {
        // Customers/Buyers go straight to the storefront
        router.push("/marketplace");
      }

    } catch (error) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
      <div className="mb-4">
                 <Link href="/" className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center justify-center">
                &larr; Back to Home
                </Link>
      </div>
        <h2 className="text-3xl font-extrabold text-gray-900">Sign in to TradeFlow</h2>
        <p className="mt-2 text-sm text-gray-600">
          Need an account?{" "}
          <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
            Create one here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email}
                required 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
                onChange={handleInputChange} 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input 
                type="password" 
                name="password"
                value={formData.password} 
                required 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
                onChange={handleInputChange} 
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* ----- RECRUITER FRICTIONLESS DEMO SECTION ----- */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Recruiter Demo Access</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {/* Note: Update these demo credentials to match an actual account you created! */}
              <button
                onClick={() => handleLogin(null, { email: "merchant@demo.com", password: "password123" })}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Demo Merchant
              </button>
              <button
                onClick={() => handleLogin(null, { email: "buyer@demo.com", password: "password123" })}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Demo Buyer
              </button>
            </div>
            <p className="mt-3 text-xs text-center text-gray-400">
              One-click access for portfolio review.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}