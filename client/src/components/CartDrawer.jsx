"use client";

import { X, Trash2, ShoppingBag, ArrowRight, Minus, Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function CartDrawer({ isOpen, onClose }) {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Ensures the portal only renders on the client side to prevent hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please log in to checkout.");
      router.push("/login");
      onClose();
      return;
    }

    setIsProcessing(true);
    const toastId = toast.loading("Preparing your secure checkout...");

    try {
      const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      if (!res) throw new Error("Razorpay SDK failed to load.");

      const itemsPayload = cart.map((item) => ({
        productId: item._id,
        quantity: item.quantity,
      }));

      const orderResponse = await fetch("http://localhost:5000/api/payments/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items: itemsPayload }),
      });

      if (!orderResponse.ok) throw new Error("Could not create order.");

      const orderData = await orderResponse.json();
      toast.dismiss(toastId);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "TradeFlow Marketplace",
        description: `Checkout (${cart.length} items)`,
        order_id: orderData.order.id,
        handler: async function (response) {
          const verifyToast = toast.loading("Verifying payment...");

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
                items: orderData.validatedItems,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              toast.success("Payment Successful! Order placed.", { id: verifyToast });
              clearCart();
              onClose();
              router.push("/profile");
            } else {
              throw new Error("Verification failed.");
            }
          } catch (err) {
            toast.error(err.message || "Payment failed.", { id: verifyToast });
          }
        },
        theme: { color: "#2563EB" },
        modal: {
          ondismiss: function () {
            toast.error("Payment cancelled.");
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      toast.error(error.message || "Something went wrong.", { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  // We wrap the entire drawer UI in a constant so we can teleport it
  const drawerContent = (
    <>
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[9998] transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-[9999] flex flex-col animate-in slide-in-from-right duration-300">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900">Your Cart</h2>
            <span className="bg-slate-200 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-full">
              {cart.length}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-10 h-10 text-slate-300" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">Your cart is empty</p>
                <p className="text-slate-500 text-sm mt-1">
                  Looks like you haven't added anything yet.
                </p>
              </div>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {cart.map((item) => (
                <div key={item._id} className="flex gap-4 group">
                  <div className="w-20 h-20 bg-slate-50 rounded-xl border border-slate-100 flex-shrink-0 p-2">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                        {item.title}
                      </h3>
                      <div className="font-black text-blue-600 mt-1">
                        ₹{item.price.toLocaleString("en-IN")}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Interactive Quantity Control */}
                      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="px-2 py-1 text-slate-500 hover:bg-slate-50 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 py-1 text-xs font-bold text-slate-900 border-x border-slate-200">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="px-2 py-1 text-slate-500 hover:bg-slate-50 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                        aria-label={`Remove ${item.title} from cart`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-slate-100 p-6 bg-slate-50">
            <div className="flex justify-between items-center mb-6">
              <span className="text-slate-500 font-medium">Subtotal</span>
              <span className="text-2xl font-black text-slate-900">
                ₹{cartTotal.toLocaleString("en-IN")}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] hover:shadow-[0_0_40px_-5px_rgba(37,99,235,0.6)] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isProcessing ? "Processing..." : "Proceed to Checkout"}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </>
  );

  // 💥 THE MAGIC: Teleporting the drawer to the document.body
  return createPortal(drawerContent, document.body);
}