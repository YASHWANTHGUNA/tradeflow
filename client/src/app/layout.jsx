import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";
import { CartProvider } from "@/context/CartContext"; // <-- Import the Provider

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "TradeFlow | The Global Tech Exchange",
  description: "A premium multi-vendor hardware marketplace.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider> {/* <-- Wrap everything inside the Provider */}
          <Toaster 
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#333',
                color: '#fff',
                borderRadius: '12px',
                fontWeight: '500',
              },
            }}
          />
          <Navbar />
          <main>{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}