// client/components/CheckoutButton.jsx
import { useState } from 'react';
import { loadRazorpayScript } from '../utils/loadRazorpay';
import toast from 'react-hot-toast';

export default function CheckoutButton({ productId, token }) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);

    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      toast.error('Failed to load Razorpay SDK. Please check your connection.');
      setIsLoading(false);
      return;
    }

    try {
      const orderResponse = await fetch('http://localhost:5000/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        toast.error('Failed to create order');
        setIsLoading(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'TradeFlow Marketplace',
        description: `Purchase of ${orderData.product.name}`,
        order_id: orderData.order.id,

        handler: async function (response) {
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
            toast.success('Payment Successful! Vendor Ledger Updated.');
          } else {
            toast.error('Payment Verification Failed!');
          }
        },

        theme: {
          color: '#3399cc',
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong during checkout.');
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