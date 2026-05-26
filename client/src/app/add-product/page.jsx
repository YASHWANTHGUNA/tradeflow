"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AddProductPage() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  
  // UPDATED: Matches backend schema (title instead of name, added description)
  const [formData, setFormData] = useState({ title: "", price: "", description: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      toast.error("Please select a product image!");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Uploading image to cloud...");

    try {
      const token = localStorage.getItem("token");

      // 1. Prepare the image file for transit
      const imagePayload = new FormData();
      imagePayload.append("image", file);

      // 2. Send image to your Express Cloudinary route
      const uploadRes = await fetch("http://localhost:5000/api/products/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: imagePayload,
      });

      const uploadData = await uploadRes.json();

      if (!uploadData.success) {
        throw new Error("Image upload failed");
      }

      toast.loading("Saving product to database...", { id: toastId });

      // 3. Send final data to MongoDB (UPDATED: Removed /create from URL)
      const productRes = await fetch("http://localhost:5000/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        // UPDATED: Sending exact fields backend expects
        body: JSON.stringify({
          ...formData,
          image: uploadData.imageUrl, // Changed from imageUrl to image
        }),
      });

      // The backend actually returns the product directly, not an object with {success: true}
      // based on your controller code. We need to handle HTTP errors properly.
      if (!productRes.ok) {
        const errorData = await productRes.json();
        throw new Error(errorData.message || "Failed to save product");
      }

      // If we got here, it's a 201 Created!
      toast.success("Product listed successfully!", { id: toastId });
      router.push("/dashboard");

    } catch (error) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">List a New Product</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Product Title</label>
            <input
              type="text"
              name="title" // UPDATED: Changed from "name" to "title"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              onChange={handleInputChange}
            />
          </div>

          {/* NEW: Description Text Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              required
              rows="3"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              onChange={handleInputChange}
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
            <input
              type="number"
              name="price"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Product Image</label>
            <input
              type="file"
              accept="image/*"
              required
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              onChange={handleFileChange}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
          >
            {isLoading ? "Publishing..." : "Publish Product"}
          </button>
        </form>
      </div>
    </div>
  );
}