"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function SignupPage() {
  const router = useRouter();
  
  // State for tracking which screen the user is on
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // State for all form data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer", // Default role
    otp: "",
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Step 1: Moves to OTP screen
  const handleProceedToOTP = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill in all details.");
      return;
    }
    setStep(2);
    toast.success("OTP sent to your email!"); // Fake toast for realism
  };

  // Step 2: Final Submission to Database
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const toastId = toast.loading("Verifying and creating account...");

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      toast.success("Account created successfully!", { id: toastId });
      router.push("/login"); // Redirect to login as requested

    } catch (error) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mb-4">
            <Link href="/" className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center justify-center">
             &larr; Back to Home
            </Link>
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900">Create your account</h2>
        <p className="mt-2 text-sm text-gray-600">
          Or{" "}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
          
          {/* ----- STEP 1: INITIAL DETAILS ----- */}
          {step === 1 && (
            <form onSubmit={handleProceedToOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" name="name" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" onChange={handleInputChange} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email address</label>
                <input type="email" name="email" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" onChange={handleInputChange} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input type="password" name="password" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" onChange={handleInputChange} />
              </div>

              {/* Compulsory Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input type="radio" name="role" value="customer" checked={formData.role === "customer"} onChange={handleInputChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                    <span className="ml-2 text-sm text-gray-700">Buyer</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="role" value="merchant" checked={formData.role === "merchant"} onChange={handleInputChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                    <span className="ml-2 text-sm text-gray-700">Merchant</span>
                  </label>
                </div>
              </div>

              <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Continue
              </button>
            </form>
          )}

          {/* ----- STEP 2: OTP VERIFICATION ----- */}
          {step === 2 && (
            <form onSubmit={handleFinalSubmit} className="space-y-6">
              <div className="text-center mb-6">
                <p className="text-sm text-gray-600">We've sent a 6-digit verification code to <span className="font-semibold text-gray-900">{formData.email}</span>.</p>
                <p className="text-xs text-gray-400 mt-2">(Demo Master Code: 999999)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 text-center">Enter OTP</label>
                <input 
                  type="text" 
                  name="otp" 
                  maxLength="6"
                  required 
                  className="mt-1 block w-full text-center tracking-[0.5em] text-2xl px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
                  onChange={handleInputChange} 
                />
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="w-1/3 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  Back
                </button>
                <button type="submit" disabled={isLoading} className="w-2/3 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400">
                  {isLoading ? "Verifying..." : "Verify & Sign Up"}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}