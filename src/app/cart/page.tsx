"use client";

import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag, AlertCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useState } from "react";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, totalItems, totalPrice } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  const handleCheckout = () => {
    setIsCheckingOut(true);
    
    // Simulate checkout process
    setTimeout(() => {
      toast.success("Order placed successfully!");
      clearCart();
      setIsCheckingOut(false);
    }, 2000);
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Your Cart</h1>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Looks like you haven't added any yogurts to your cart yet.</p>
          <Button asChild>
            <Link href="/">Continue Shopping</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-8">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Your Cart</h1>
        <span className="ml-2 bg-primary text-primary-foreground text-xs font-medium px-2.5 py-0.5 rounded-full">
          {totalItems} {totalItems === 1 ? 'item' : 'items'}
        </span>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="mb-4 sm:mb-0">
              <h3 className="font-medium text-lg">{item.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <p className="font-semibold">${item.price.toFixed(2)}</p>
                <p className="text-muted-foreground text-sm">× {item.quantity}</p>
                <p className="font-bold text-primary">
                  = ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center border rounded-md overflow-hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-none h-8 w-8"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  <Minus className="h-3 w-3" />
                </Button>

                <span className="w-8 text-center font-medium">{item.quantity}</span>

                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-none h-8 w-8"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                onClick={() => {
                  removeItem(item.id);
                  toast.success(`${item.name} removed from cart`);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div 
        className="mt-8 border rounded-lg shadow-md p-6 bg-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-xl font-bold mb-4">Order Summary</h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Subtotal ({totalItems} items)</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Shipping</span>
            <span>Free</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Tax</span>
            <span>${(totalPrice * 0.1).toFixed(2)}</span>
          </div>
        </div>
        
        <div className="border-t pt-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium">Total:</span>
            <span className="text-lg font-bold">
              ${(totalPrice + (totalPrice * 0.1)).toFixed(2)}
            </span>
          </div>
        </div>
        
        <Button 
          className="w-full" 
          onClick={handleCheckout} 
          disabled={isCheckingOut}
          size="lg"
        >
          {isCheckingOut ? (
            <>
              <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
              Processing...
            </>
          ) : (
            'Complete Checkout'
          )}
        </Button>
        
        <p className="text-xs text-muted-foreground text-center mt-4">
          By completing your purchase, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}