"use client";
import CheckoutButton from "@/components/CheckoutButton"; // Adjust the import path if needed

export default function TestProductPage() {
  // For this test, paste the exact IDs you used in Thunder Client earlier
  const testProductId = "6a12b9c75d1202437599dce7";
  const testCustomerToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhMTJlMDYyMTg2ZTVlNWU3NTUxZmY5MSIsImlhdCI6MTc3OTYyMTk4NiwiZXhwIjoxNzgyMjEzOTg2fQ.Qze6ru1Q7FR_TZ9rc-ijD84n-8BHBHRao9YRZRxF1zA";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          TradeFlow Pro Keyboard
        </h1>
        <p className="text-gray-500 mb-8">Price: ₹1000</p>

        {/* Here is your newly minted component! */}
        <CheckoutButton productId={testProductId} token={testCustomerToken} />
      </div>
    </div>
  );
}
