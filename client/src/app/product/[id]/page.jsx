"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  ShoppingCart,
  Heart,
  CreditCard,
  ArrowLeft,
  ShieldCheck,
  Zap,
} from "lucide-react";
import Link from "next/link";

// --- RAZORPAY SCRIPT LOADER ---
const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function ProductDetails() {
  const { id } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isCartAdded, setIsCartAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/products/${id}`);
        if (!response.ok) throw new Error("Product not found");

        const data = await response.json();
        setProduct(data);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleFavorite = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to save favorites.");
      router.push("/login");
      return;
    }
    setIsFavorite((prev) => {
      const next = !prev;
      toast.success(next ? "Added to Favorites!" : "Removed from Favorites");
      return next;
    });
  };

  const handleAddToCart = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to add items to your cart.");
      router.push("/login");
      return;
    }
    setIsCartAdded(true);
    toast.success("Added to Cart!");
    setTimeout(() => setIsCartAdded(false), 2000);
  };

  // --- THE REAL RAZORPAY ENGINE ---
  const handleBuyNow = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to complete your purchase.");
      router.push("/login");
      return;
    }

    setIsProcessing(true);
    const toastId = toast.loading("Initializing secure gateway...");

    try {
      // 1. Load the Razorpay SDK
      const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      if (!res) throw new Error("Razorpay SDK failed to load. Check your connection.");

      // 2. Create the Order on Backend
      const orderResponse = await fetch("http://localhost:5000/api/payments/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: id }),
      });

      if (!orderResponse.ok) throw new Error("Failed to create order on the server.");
      const orderData = await orderResponse.json();
      toast.dismiss(toastId);

      // 3. Configure Razorpay Popup
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "TradeFlow Marketplace",
        description: `Purchase of ${product.title}`,
        order_id: orderData.order.id,

        // 4. Success Handler
        handler: async function (response) {
          const verifyToast = toast.loading("Verifying payment signature...");
          try {
            const verifyRes = await fetch("http://localhost:5000/api/payments/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                productId: id,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              toast.success("Payment Successful! Ledger updated.", { id: verifyToast });
              router.push("/marketplace");
            } else {
              throw new Error("Payment verification failed.");
            }
          } catch (err) {
            toast.error(err.message || "Verification error.", { id: verifyToast });
            setIsProcessing(false);
          }
        },
        prefill: {
          name: "Demo Buyer",
          email: "demo_buyer@tradeflow.com",
        },
        theme: {
          color: "#2563EB", 
        },
        // NEW: Handles the case where the user closes the popup without paying
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            toast.error("Payment window closed.");
          },
        },
      };

      // 5. Initialize and Open Razorpay
      const paymentObject = new window.Razorpay(options);
      
      paymentObject.on("payment.failed", function (response) {
        toast.error(`Payment Failed: ${response.error.description}`);
        setIsProcessing(false);
      });

      paymentObject.open();

    } catch (error) {
      console.error("Payment Gateway Error:", error);
      toast.error(error.message || "Could not bridge to payment infrastructure.", { id: toastId });
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center text-slate-500 gap-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          Loading product details...
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 bg-slate-50">
        Product not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Marketplace
        </Link>

        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden flex flex-col md:flex-row">
          <div className="md:w-1/2 bg-slate-100 relative min-h-[400px] flex items-center justify-center p-8 group">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-contain max-h-[500px] relative z-10 transform group-hover:scale-105 transition-transform duration-500 drop-shadow-xl"
            />

            <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
              <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Verified Merchant
              </span>
            </div>
          </div>

          <div className="md:w-1/2 p-8 lg:p-12 flex flex-col">
            <div className="flex-grow">
              <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
                {product.title}
              </h1>

              <div className="flex items-end gap-3 mb-6">
                <span className="text-4xl font-black text-blue-600">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
                <span className="text-sm font-medium text-slate-400 mb-1.5">
                  Free Delivery
                </span>
              </div>

              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 mb-8">
                <h3 className="text-sm font-bold text-slate-900 mb-2">
                  Description
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {product.description}
                </p>
              </div>

              <div className="flex items-center gap-6 mb-10 text-sm font-medium text-slate-500">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" /> Instant Checkout
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" /> Secure Escrow
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {isCartAdded ? "Added!" : "Add to Cart"}
                </button>

                <button
                  onClick={handleFavorite}
                  className={`flex items-center justify-center p-4 rounded-xl border-2 transition-all duration-300 ${
                    isFavorite
                      ? "bg-red-50 border-red-100 text-red-500"
                      : "border-slate-200 text-slate-400 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <Heart className={`w-6 h-6 ${isFavorite ? "fill-current" : ""}`} />
                </button>
              </div>

              <button
                onClick={handleBuyNow}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-6 rounded-xl shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] hover:shadow-[0_0_40px_-5px_rgba(37,99,235,0.6)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Connecting to Razorpay...
                  </span>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" /> Proceed to Buy
                  </>
                )}
              </button>
            </div>

            <p className="text-center text-xs text-slate-400 mt-4 font-medium tracking-wide">
              Secure environment integration active via Razorpay Ecosystem.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}