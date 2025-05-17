"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { items } = useCart();

  const cartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const CartButton = () => (
    <div className="relative">
      <Button variant="outline" asChild>
        <Link href="/cart">Cart</Link>
      </Button>
      {cartItemsCount > 0 && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
          {cartItemsCount}
        </div>
      )}
    </div>
  );

  return (
    <header className="w-full px-4 md:px-8 py-4 shadow-sm bg-white flex items-center justify-between relative z-50">
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
        {cartItemsCount > 0 && !isOpen && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
            {cartItemsCount}
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
            className="absolute top-full left-0 w-full bg-white shadow-md flex flex-col items-start px-6 py-4 space-y-4 md:hidden"
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
            <div className="w-full">
              <CartButton />
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
