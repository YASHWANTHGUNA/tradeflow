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

  // Actions
  const addToCart = (product) => {
    setCart((prevCart) => {
      // Check if item is already in cart
      const existingItem = prevCart.find((item) => item._id === product._id);
      if (existingItem) {
        toast.error("Item is already in your cart!");
        return prevCart;
      }
      toast.success("Added to Cart!");
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item._id !== productId));
    toast.success("Removed from cart.");
  };

  const clearCart = () => {
    setCart([]);
  };

  // Calculate Total
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider 
      value={{ cart, addToCart, removeFromCart, clearCart, cartTotal, isMounted }}
    >
      {children}
    </CartContext.Provider>
  );
};

// 3. Create a custom hook for easy access in other files
export const useCart = () => {
  return useContext(CartContext);
};