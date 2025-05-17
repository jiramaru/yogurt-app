"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { ThemeToggle } from "./theme-toggle";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { totalItems, totalPrice } = useCart();
  
  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const CartButton = () => (
    <div className="relative">
      <Button variant="outline" asChild className="flex items-center gap-2">
        <Link href="/cart">
          <span className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            <span>Cart</span>
            {totalPrice > 0 && <span className="text-xs text-muted-foreground">(${totalPrice.toFixed(2)})</span>}
          </span>
        </Link>
      </Button>
      {totalItems > 0 && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
          {totalItems}
        </div>
      )}
    </div>
  );

  return (
    <header className="w-full px-4 md:px-8 py-4 shadow-sm bg-background border-b flex items-center justify-between relative z-50">
      <Link href="/" className="text-2xl font-bold tracking-tight">
        Yogurt Org
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex gap-6 items-center">
        <Link href="#products" className="text-sm font-medium hover:text-primary">
          Products
        </Link>
        <Link href="#about" className="text-sm font-medium hover:text-primary">
          About
        </Link>
        <Link href="#contact" className="text-sm font-medium hover:text-primary">
          Contact
        </Link>
        <ThemeToggle />
        <CartButton />
      </nav>

      {/* Mobile Menu Toggle with Notification Badge */}
      <div className="md:hidden relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Toggle Menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
        {totalItems > 0 && !isOpen && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
            {totalItems}
          </div>
        )}
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 w-full bg-background border-b shadow-md flex flex-col items-start px-6 py-4 space-y-4 md:hidden"
          >
            <Link href="#products" className="text-sm font-medium hover:text-primary" onClick={() => setIsOpen(false)}>
              Products
            </Link>
            <Link href="#about" className="text-sm font-medium hover:text-primary" onClick={() => setIsOpen(false)}>
              About
            </Link>
            <Link href="#contact" className="text-sm font-medium hover:text-primary" onClick={() => setIsOpen(false)}>
              Contact
            </Link>
            <div className="flex items-center justify-between w-full">
              <ThemeToggle />
              <CartButton />
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
