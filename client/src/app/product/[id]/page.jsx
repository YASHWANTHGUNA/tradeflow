"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CheckoutButton from "@/components/CheckoutButton"; 

export default function ProductDetailsPage() {
  // 1. DYNAMIC ROUTING: Automatically grab the ID from the URL (e.g., /product/65df...)
  const params = useParams();
  const productId = params.id;

  // 2. STATE MANAGEMENT: Prepare to hold the user's secure token
  const [token, setToken] = useState("");

  useEffect(() => {
    // We now strictly pull the token from the browser's secure storage!
    const savedToken = localStorage.getItem("token");
    setToken(savedToken || "");
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="md:flex">
          {/* Mock Product Image Area */}
          <div className="md:shrink-0 bg-gray-200 md:w-1/2 h-64 md:h-auto flex items-center justify-center">
            <span className="text-gray-400 text-lg font-medium">Product Image Placeholder</span>
          </div>
          
          {/* Dynamic Product Details Area */}
          <div className="p-8 md:w-1/2">
            <div className="uppercase tracking-wide text-sm text-blue-600 font-semibold mb-1">
              Tech Accessories
            </div>
            <h1 className="block mt-1 text-2xl leading-tight font-bold text-gray-900">
              TradeFlow Pro Keyboard
            </h1>
            <p className="mt-4 text-gray-500 mb-6">
              This is a dynamic product page. The ID being read from the URL is: 
              <br/>
              <code className="text-xs bg-gray-100 text-pink-600 px-1 py-0.5 rounded mt-2 block">
                {productId}
              </code>
            </p>

            <div className="flex items-center justify-between mb-8">
              <span className="text-3xl font-bold text-gray-900">₹1000</span>
              <span className="text-sm text-gray-500 line-through mt-2">₹1499</span>
            </div>

            {/* Your fully dynamic engine! */}
            {token ? (
              <CheckoutButton productId={productId} token={token} />
            ) : (
              <p className="text-sm text-red-500">Please log in to purchase.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}