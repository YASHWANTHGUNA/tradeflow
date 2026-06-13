"use client";

import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";

// 1. Create the Context
const CartContext = createContext();

// 2. Create the Provider Component
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isMounted, setIsMounted] = useState(false);

  // Load cart from LocalStorage on first render
  useEffect(() => {
    setIsMounted(true);
    const savedCart = localStorage.getItem("tradeflow_cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to LocalStorage whenever it changes
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("tradeflow_cart", JSON.stringify(cart));
    }
  }, [cart, isMounted]);

  // Action: Add Item to Cart
  const addToCart = (product) => {
    const existingItem = cart.find((item) => item._id === product._id);

    if (existingItem) {
      toast.error("Item is already in your cart!");
      return;
    }

    setCart((prevCart) => [...prevCart, { ...product, quantity: 1 }]);
    toast.success("Added to Cart!");
  };

  // Action: Remove Item completely
  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item._id !== productId));
    toast.success("Removed from cart.");
  };

  // Action: Update Quantity (Increments, Decrements, or Direct Inputs)
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      // If quantity drops below 1, remove it cleanly
      setCart((prevCart) => prevCart.filter((item) => item._id !== productId));
      toast.success("Removed from cart.");
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item._id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Action: Clear entire cart
  const clearCart = () => {
    setCart([]);
  };

  // Calculations
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider 
      value={{ 
        cart, 
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        clearCart, 
        cartCount, 
        cartTotal, 
        isMounted 
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// 3. Create a custom hook for easy access in other files
export const useCart = () => {
  return useContext(CartContext);
};