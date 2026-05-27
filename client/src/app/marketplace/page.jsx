"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Search, Filter, ShoppingBag, PackageSearch, Loader2 } from "lucide-react";

export default function Marketplace() {
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
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-200">
      
      {/* ----- DYNAMIC NAVIGATION ----- */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center sticky top-0 z-50">
        <Link href="/" className="text-xl font-black text-blue-600 tracking-tighter">TradeFlow.</Link>
        <div>
          {typeof window !== 'undefined' && localStorage.getItem("token") ? (
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition">Dashboard</Link>
              <button 
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.reload(); 
                }} 
                className="text-sm font-semibold text-red-600 hover:text-red-800 transition"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="space-x-6 flex items-center">
              <Link href="/login" className="text-sm font-semibold text-slate-900 hover:text-blue-600 transition">Log in</Link>
              <Link href="/signup" className="text-sm font-semibold text-white bg-blue-600 px-4 py-2 rounded-full hover:bg-blue-500 transition shadow-sm">Sign up</Link>
            </div>
          )}
        </div>
      </nav>

      {/* ----- MARKETPLACE HERO ----- */}
      <div className="relative bg-slate-900 overflow-hidden border-b border-slate-800">
        {/* Abstract glowing background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]"></div>
          <div className="absolute -bottom-1/2 -right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px]"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-blue-500/10 rounded-2xl mb-6 border border-blue-500/20">
            <ShoppingBag className="w-6 h-6 text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-6">
            The Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Tech Exchange</span>
          </h1>
          <p className="mt-2 text-slate-400 max-w-2xl mx-auto text-lg mb-10">
            Browse premium hardware sourced directly from verified independent merchants.
          </p>

          {/* Search & Filter Bar (UI Only for now) */}
          <div className="max-w-2xl mx-auto flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input 
                type="text" 
                className="block w-full pl-11 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all" 
                placeholder="Search for keyboards, monitors, watches..." 
              />
            </div>
            <button className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition-all backdrop-blur-sm">
              <Filter className="w-5 h-5" />
              <span className="hidden sm:block font-medium">Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* ----- PRODUCT GRID ----- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Latest Arrivals</h2>
          <span className="text-sm font-medium text-slate-500">{products.length} Items</span>
        </div>

        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-64 space-y-4">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            <p className="text-slate-500 font-medium">Syncing global inventory...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-6">
              <PackageSearch className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No products found</h3>
            <p className="text-slate-500 max-w-sm mx-auto">
              Our merchants are currently restocking their inventory. Please check back later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <Link href={`/product/${product._id}`} key={product._id} className="group">
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 hover:border-blue-200 transition-all duration-300 flex flex-col h-full">
                  
                  {/* Image Container with Zoom Effect */}
                  <div className="w-full h-64 overflow-hidden bg-slate-100 relative">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Subtle gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  {/* Card Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex-grow">
                      <h3 className="text-lg font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                        {product.title}
                      </h3>
                      <p className="text-slate-500 text-sm mt-2 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                    
                    <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100">
                      <span className="text-xl font-black text-slate-900">
                        ₹{product.price.toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                        View Item
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
