"use client";

import { X, ExternalLink, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function ProfileListModal({ isOpen, onClose, title, items, type }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            <p className="text-sm text-slate-500 font-medium">{items?.length || 0} items found</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
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
                {type === 'favorites' 
                  ? "Items you bookmark will appear here." 
                  : "Your completed purchases will appear here."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item._id || index} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-blue-200 transition-colors">
                  {/* Product Image */}
                  <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 border border-slate-100">
                    <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
                  </div>
                  
                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-bold text-slate-900 truncate">{item.title}</h4>
                    <p className="text-sm text-slate-500 truncate">{item.description}</p>
                    <div className="mt-2 font-black text-blue-600">
                      ₹{item.price?.toLocaleString("en-IN")}
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link 
                    href={`/product/${item._id}`}
                    className="flex-shrink-0 p-3 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-xl transition-colors flex items-center gap-2 font-semibold text-sm border border-slate-200 hover:border-blue-200"
                  >
                    View <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}