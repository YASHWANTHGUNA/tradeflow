"use client";

import { useState, useEffect } from "react";
import { X, ExternalLink, ShoppingBag, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function ProfileListModal({ isOpen, onClose, title, items: initialItems, type, onRefresh }) {
  const [items, setItems] = useState([]);
  const [removingId, setRemovingId] = useState(null);

  // Sync the modal's internal state with the props when it opens
  useEffect(() => {
    setItems(initialItems || []);
  }, [initialItems, isOpen]);

  if (!isOpen) return null;

  const handleRemoveFavorite = async (productId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setRemovingId(productId);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/favorites`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) throw new Error("Failed to remove");

      // Instantly remove from the UI without a page reload
      setItems((prev) => prev.filter((item) => item._id !== productId));
      toast.success("Removed from favorites");
      
      // Tell the parent profile page to refresh its data quietly
      if (onRefresh) onRefresh();
      
    } catch (error) {
      toast.error("Could not remove item.");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            <p className="text-sm text-slate-500 font-medium">
              {items?.length || 0} items found
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable List Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
          {!items || items.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Nothing to see here yet!</h3>
              <p className="text-slate-500 mt-2">
                {type === "favorites"
                  ? "Items you bookmark will appear here."
                  : "Your completed purchases will appear here."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={`${item._id}-${index}`}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-blue-200 transition-colors"
                >
                  {/* Product Image */}
                  <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 border border-slate-100">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-bold text-slate-900 truncate">
                      {item.title}
                    </h4>
                    <p className="text-sm text-slate-500 truncate">
                      {item.description}
                    </p>
                    <div className="mt-2 font-black text-blue-600">
                      ₹{item.price?.toLocaleString("en-IN")}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      href={`/product/${item._id}`}
                      className="p-3 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-xl transition-colors flex items-center gap-2 font-semibold text-sm border border-slate-200 hover:border-blue-200"
                    >
                      View <ExternalLink className="w-4 h-4" />
                    </Link>

                    {/* Render the Remove button ONLY if this is the favorites list */}
                    {type === "favorites" && (
                      <button
                        onClick={() => handleRemoveFavorite(item._id)}
                        disabled={removingId === item._id}
                        className="p-3 bg-white hover:bg-red-50 text-red-400 hover:text-red-600 rounded-xl transition-colors border border-slate-200 hover:border-red-200 disabled:opacity-50"
                      >
                        {removingId === item._id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}