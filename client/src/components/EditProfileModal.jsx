"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Save } from "lucide-react";
import toast from "react-hot-toast";

export default function EditProfileModal({ isOpen, onClose, profile, onUpdateSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    storeName: "",
    storeDescription: "",
    gstNumber: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Pre-fill the form with existing data when the modal opens
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        phoneNumber: profile.phoneNumber || "",
        street: profile.shippingAddress?.street || "",
        city: profile.shippingAddress?.city || "",
        state: profile.shippingAddress?.state || "",
        postalCode: profile.shippingAddress?.postalCode || "",
        storeName: profile.storeDetails?.storeName || "",
        storeDescription: profile.storeDetails?.storeDescription || "",
        gstNumber: profile.storeDetails?.gstNumber || "",
      });
    }
  }, [profile]);

  if (!isOpen || !profile) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const toastId = toast.loading("Saving changes...");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      toast.success("Profile updated successfully!", { id: toastId });
      onUpdateSuccess(); // Refresh the parent component's data
      onClose(); // Close the modal
    } catch (error) {
      toast.error(error.message || "An error occurred.", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-900">
            {profile.role === "merchant" ? "Edit Store Profile" : "Edit Account Details"}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="space-y-4">
            {/* Universal Fields */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Phone Number</label>
              <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
            </div>

            {/* Merchant Specific Fields */}
            {profile.role === "merchant" && (
              <div className="pt-4 mt-4 border-t border-slate-100 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Store Name</label>
                  <input type="text" name="storeName" value={formData.storeName} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Store Description</label>
                  <textarea name="storeDescription" value={formData.storeDescription} onChange={handleChange} rows="3" className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">GST Number (Optional)</label>
                  <input type="text" name="gstNumber" value={formData.gstNumber} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                </div>
              </div>
            )}

            {/* Customer Specific Fields */}
            {profile.role === "customer" && (
              <div className="pt-4 mt-4 border-t border-slate-100 space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Shipping Address</h3>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Street Address</label>
                  <input type="text" name="street" value={formData.street} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">City</label>
                    <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">State</label>
                    <input type="text" name="state" value={formData.state} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Postal Code</label>
                  <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 disabled:opacity-70">
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}