"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ShoppingBag, User, LogOut } from "lucide-react";
import toast from "react-hot-toast";

import { useCart } from "@/context/CartContext";
import CartDrawer from "./CartDrawer";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cart } = useCart();

  useEffect(() => {
    setIsMounted(true);
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [pathname]);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    toast.success("Successfully logged out");
    router.push("/login");
  };

  if (pathname === "/login" || pathname === "/signup") {
    return null;
  }

  if (!isMounted) return null;

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-4 sm:px-6 lg:px-8 sticky top-0 z-50 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link
          href="/marketplace"
          className="text-2xl font-black text-blue-600 tracking-tighter"
        >
          TradeFlow.
        </Link>

        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/marketplace"
            className={`text-sm font-semibold flex items-center gap-1.5 transition-colors ${
              pathname === "/marketplace"
                ? "text-blue-600"
                : "text-slate-600 hover:text-blue-600"
            }`}
          >
            <ShoppingBag className="w-4 h-4 hidden sm:block" />
            Marketplace
          </Link>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
            aria-label="Open cart"
          >
            <ShoppingBag className="w-6 h-6" />
            {cart.length > 0 && (
              <span className="absolute top-0 right-0 -mt-1 -mr-1 flex items-center justify-center w-5 h-5 bg-blue-600 text-white text-[10px] font-black rounded-full border-2 border-white">
                {cart.length}
              </span>
            )}
          </button>

          {isLoggedIn ? (
            <>
              <Link
                href="/profile"
                className={`text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                  pathname === "/profile"
                    ? "text-blue-600"
                    : "text-slate-600 hover:text-blue-600"
                }`}
              >
                <User className="w-4 h-4 hidden sm:block" />
                Profile & Settings
              </Link>

              <button
                onClick={handleSignOut}
                className="text-sm font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-full transition-all flex items-center gap-1.5"
              >
                <LogOut className="w-4 h-4 hidden sm:block" />
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-semibold text-slate-900 hover:text-blue-600 transition"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="text-sm font-semibold text-white bg-blue-600 px-5 py-2.5 rounded-full hover:bg-blue-500 transition shadow-sm hover:shadow-md"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </nav>
  );
}