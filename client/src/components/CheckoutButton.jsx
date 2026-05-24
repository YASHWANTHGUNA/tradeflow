// client/components/CheckoutButton.jsx
import { useState } from 'react';
import { loadRazorpayScript } from '../utils/loadRazorpay';

export default function CheckoutButton({ productId, token }) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);

    // 1. Load the Razorpay SDK
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      alert('Failed to load Razorpay SDK. Please check your connection.');
      setIsLoading(false);
      return;
    }

    try {
      // 2. Call your Express backend to create the order
      const orderResponse = await fetch('http://localhost:5000/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Pass the logged-in customer's token
        },
        body: JSON.stringify({ productId }),
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        alert('Failed to create order');
        setIsLoading(false);
        return;
      }

      // 3. Configure the Razorpay Checkout Window
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'TradeFlow Marketplace',
        description: `Purchase of ${orderData.product.name}`,
        order_id: orderData.order.id, // The secure ID from your backend
        
        // 4. The Handler: What happens when the payment is successful
        handler: async function (response) {
          // Send the successful signature back to your backend Ledger
          const verifyResponse = await fetch('http://localhost:5000/api/payments/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              productId: productId,
            }),
          });

          const verifyData = await verifyResponse.json();

          if (verifyData.success) {
            alert('Payment Successful! Vendor Ledger Updated.');
          } else {
            alert('Payment Verification Failed!');
          }
        },
        theme: {
          color: '#3399cc',
        },
      };

      // 5. Open the Razorpay UI
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error(error);
      alert('Something went wrong during checkout.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handlePayment} 
      disabled={isLoading}
      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition"
    >
      {isLoading ? 'Processing...' : 'Buy Now'}
    </button>
  );
}