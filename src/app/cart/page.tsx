"use client";

import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag, AlertCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useState } from "react";
import { createOrder } from "@/actions/order-actions";
import { ActionResponse } from "@/actions/types";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, totalItems, totalPrice } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  const handleCheckout = async () => {
    setIsCheckingOut(true);
    
    try {
      // Prepare order items data
      const orderItems = items.map(item => ({
        orderId: "", // This will be filled by the server action
        yogurtId: item.id,
        quantity: item.quantity,
        price: item.price
      }));
      
      // Create the order with items
      const orderResponse = await createOrder({
        userId: null, // Guest order (no user ID)
        status: 'pending',
        total: parseInt((totalPrice + (totalPrice * 0.1)).toFixed(0)),
        items: orderItems
      });
      
      if (orderResponse.success) {
        toast.success("Commande passée avec succès !");
        clearCart();
      } else {
        toast.error(orderResponse.error || "Erreur lors de la création de la commande");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Une erreur est survenue lors du traitement de votre commande");
    } finally {
      setIsCheckingOut(false);
    }
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
          <h1 className="text-2xl font-bold mb-8 text-center">
            Votre Panier
          </h1>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Votre panier est vide</h2>
          <p className="text-muted-foreground mb-6">Il semble que vous n'ayez pas encore ajouté de yogurts à votre panier.</p>
          <Button asChild>
            <Link href="/">Continuer mes achats</Link>
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
        <h1 className="text-2xl font-bold">Votre Panier</h1>
        <span className="ml-2 bg-primary text-primary-foreground text-xs font-medium px-2.5 py-0.5 rounded-full">
          {totalItems} {totalItems === 1 ? 'article' : 'articles'}
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
                <p className="font-semibold">{item.price.toFixed(0)} FCFA</p>
                <p className="text-muted-foreground text-sm">× {item.quantity}</p>
                <p className="font-bold text-primary">
                  = {(item.price * item.quantity).toFixed(0)} FCFA
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
                  toast.success(`${item.name} retiré du panier`);
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
        <h3 className="text-xl font-bold mb-4">Résumé de la commande</h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Sous-total ({totalItems} {totalItems === 1 ? 'article' : 'articles'})</span>
            <span>{totalPrice.toFixed(0)} FCFA</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Livraison</span>
            <span>Gratuite</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">TVA</span>
            <span>{(totalPrice * 0.1).toFixed(0)} FCFA</span>
          </div>
        </div>
        
        <div className="border-t pt-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium">Total:</span>
            <span className="text-lg font-bold">
              {(totalPrice + (totalPrice * 0.1)).toFixed(0)} FCFA
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
              Traitement en cours...
            </>
          ) : (
            'Finaliser la commande'
          )}
        </Button>
        
        <p className="text-xs text-muted-foreground text-center mt-4">
          En finalisant votre achat, vous acceptez nos Conditions Générales de Vente et notre Politique de Confidentialité.
        </p>
      </motion.div>
    </div>
  );
}