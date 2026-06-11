"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  ShoppingCart,
  Heart,
  CreditCard,
  ArrowLeft,
  ShieldCheck,
  Zap,
  Minus,
  Plus,
} from "lucide-react";
import { useCart } from "@/context/CartContext";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existingScript) {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      existingScript.addEventListener("load", () => resolve(true), {
        once: true,
      });
      existingScript.addEventListener("error", () => resolve(false), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function ProductDetails() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const id = useMemo(() => {
    const rawId = params?.id;
    return Array.isArray(rawId) ? rawId[0] : rawId;
  }, [params]);

  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [isCartAdded, setIsCartAdded] = useState(false);

  useEffect(() => {
    if (!id) return;

    let ignore = false;

    const fetchProduct = async () => {
      setIsLoading(true);

      try {
        const response = await fetch(`${API_BASE_URL}/api/products/${id}`);

        if (!response.ok) {
          throw new Error("Product not found");
        }

        const data = await response.json();

        if (!ignore) {
          setProduct(data);
        }
      } catch (error) {
        if (!ignore) {
          toast.error(error.message || "Failed to load product.");
          setProduct(null);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      ignore = true;
    };
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) return;

    let ignore = false;

    const fetchFavoriteStatus = async () => {
      try {
        setIsFavoriteLoading(true);

        const response = await fetch(`${API_BASE_URL}/api/users/favorites`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) return;

        const data = await response.json();
        const favorites = Array.isArray(data) ? data : data?.favorites || [];

        const exists = favorites.some((item) => {
          const favoriteId =
            item?._id || item?.product?._id || item?.product || item?.id;
          return String(favoriteId) === String(id);
        });

        if (!ignore) {
          setIsFavorite(exists);
        }
      } catch {
      } finally {
        if (!ignore) {
          setIsFavoriteLoading(false);
        }
      }
    };

    fetchFavoriteStatus();

    return () => {
      ignore = true;
    };
  }, [id]);

  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decreaseQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleFavorite = async () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      toast.error("Please log in to save favorites.");
      router.push("/login");
      return;
    }

    if (!id) {
      toast.error("Invalid product.");
      return;
    }

    const nextFavoriteState = !isFavorite;
    setIsFavorite(nextFavoriteState);

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/favorites`, {
        method: nextFavoriteState ? "POST" : "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: id }),
      });

      if (!response.ok) {
        throw new Error("Failed to sync favorite with server");
      }

      toast.success(
        nextFavoriteState ? "Saved to Favorites!" : "Removed from Favorites"
      );
    } catch {
      setIsFavorite(!nextFavoriteState);
      toast.error("Could not sync with server. Please try again.");
    }
  };

  const handleAddToCart = () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      toast.error("Please log in to add items to your cart.");
      router.push("/login");
      return;
    }

    if (!product) {
      toast.error("Product data is unavailable.");
      return;
    }

    addToCart({
      ...product,
      quantity,
    });

    setIsCartAdded(true);
    toast.success(`Added ${quantity} item${quantity > 1 ? "s" : ""} to cart!`);
    setTimeout(() => setIsCartAdded(false), 2000);
  };

  const handleBuyNow = async () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      toast.error("Please log in to complete your purchase.");
      router.push("/login");
      return;
    }

    if (!product || !id) {
      toast.error("Product data is unavailable.");
      return;
    }

    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

    if (!razorpayKey) {
      toast.error("Razorpay key is missing.");
      return;
    }

    setIsProcessing(true);
    const loadingToast = toast.loading("Initializing secure gateway...");

    try {
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded || !window.Razorpay) {
        throw new Error("Razorpay SDK failed to load. Check your connection.");
      }

      const orderResponse = await fetch(
        `${API_BASE_URL}/api/payments/create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            items: [{ productId: id, quantity }],
          }),
        }
      );

      if (!orderResponse.ok) {
        throw new Error("Failed to create order on the server.");
      }

      const orderData = await orderResponse.json();
      const order = orderData?.order;

      if (!order?.id || !order?.amount || !order?.currency) {
        throw new Error("Invalid order data received from server.");
      }

      toast.dismiss(loadingToast);

      const paymentObject = new window.Razorpay({
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency,
        name: "TradeFlow Marketplace",
        description: `Purchase of ${product.title}`,
        order_id: order.id,
        handler: async function (response) {
          const verifyToast = toast.loading("Verifying payment signature...");

          try {
            const verifyRes = await fetch(`${API_BASE_URL}/api/payments/verify`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                items: orderData.validatedItems,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok || !verifyData?.success) {
              throw new Error(
                verifyData?.message || "Payment verification failed."
              );
            }

            toast.success("Payment Successful! Ledger updated.", {
              id: verifyToast,
            });

            router.push("/marketplace");
          } catch (err) {
            toast.error(err.message || "Verification error.", {
              id: verifyToast,
            });
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
        modal: {
          confirm_close: true,
          ondismiss: function () {
            setIsProcessing(false);
            toast.error("Payment window closed.");
          },
        },
      });

      paymentObject.on("payment.failed", function (response) {
        toast.error(
          response?.error?.description || "Payment failed. Please try again."
        );
        setIsProcessing(false);
      });

      paymentObject.open();
    } catch (error) {
      console.error("Payment Gateway Error:", error);
      toast.error(
        error.message || "Could not bridge to payment infrastructure.",
        { id: loadingToast }
      );
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center text-slate-500 gap-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span>Loading product details...</span>
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
          <ArrowLeft className="w-4 h-4" />
          Back to Marketplace
        </Link>

        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden flex flex-col md:flex-row">
          <div className="md:w-1/2 bg-slate-100 relative min-h-[400px] flex items-center justify-center p-8 group">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-contain max-h-[500px] relative z-10 transform group-hover:scale-105 transition-transform duration-500 drop-shadow-xl"
            />

            <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
              <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Verified Merchant
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
                  ₹{Number(product.price || 0).toLocaleString("en-IN")}
                </span>
                <span className="text-sm font-medium text-slate-400 mb-1.5">
                  Free Delivery
                </span>
              </div>

              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 mb-6">
                <h3 className="text-sm font-bold text-slate-900 mb-2">
                  Description
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {product.description}
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 mb-8">
                <h3 className="text-sm font-bold text-slate-900 mb-3">
                  Quantity
                </h3>

                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="inline-flex items-center rounded-xl border border-slate-200 overflow-hidden bg-white">
                    <button
                      type="button"
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                      className="w-12 h-12 flex items-center justify-center text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <div className="w-14 h-12 flex items-center justify-center font-bold text-slate-900 border-x border-slate-200">
                      {quantity}
                    </div>

                    <button
                      type="button"
                      onClick={increaseQuantity}
                      className="w-12 h-12 flex items-center justify-center text-slate-700 hover:bg-slate-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-500 font-medium">
                      Total Amount
                    </p>
                    <p className="text-lg font-extrabold text-slate-900">
                      ₹
                      {(Number(product.price || 0) * quantity).toLocaleString(
                        "en-IN"
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 mb-10 text-sm font-medium text-slate-500 flex-wrap">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  Instant Checkout
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  Secure Escrow
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
                  disabled={isFavoriteLoading}
                  aria-label={
                    isFavorite
                      ? "Remove from favorites"
                      : "Add to favorites"
                  }
                  className={`flex items-center justify-center p-4 rounded-xl border-2 transition-all duration-300 ${
                    isFavorite
                      ? "bg-red-50 border-red-100 text-red-500"
                      : "border-slate-200 text-slate-400 hover:border-slate-300 hover:bg-slate-50"
                  } ${isFavoriteLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <Heart
                    className={`w-6 h-6 ${isFavorite ? "fill-current" : ""}`}
                  />
                </button>
              </div>

              <button
                onClick={handleBuyNow}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-6 rounded-xl shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] hover:shadow-[0_0_40px_-5px_rgba(37,99,235,0.6)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Connecting to Razorpay...
                  </span>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Proceed to Buy
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