"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function Storefront() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/products");
        if (!response.ok) throw new Error("Failed to load marketplace");
        
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        toast.error("Could not connect to the server.");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Welcome to TradeFlow
        </h1>
        <p className="mt-4 max-w-2xl text-xl mx-auto text-blue-100">
          Discover premium tech gear directly from verified merchants.
        </p>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Latest Arrivals</h2>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500 text-lg animate-pulse">Loading marketplace...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No products available yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <Link href={`/product/${product._id}`} key={product._id} className="group">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
                  {/* Image Container */}
                  <div className="w-full h-56 overflow-hidden bg-gray-100">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  
                  {/* Card Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {product.title}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xl font-bold text-blue-600">
                        ₹{product.price.toLocaleString("en-IN")}
                      </span>
                      <span className="text-sm font-medium text-gray-900 bg-gray-100 px-3 py-1 rounded-full group-hover:bg-blue-50 group-hover:text-blue-700 transition">
                        View Details
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}