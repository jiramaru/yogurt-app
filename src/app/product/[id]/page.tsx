"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getYogurtById, getYogurts } from "@/actions/yogurt-actions";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Minus, Plus, Star, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { Yogurt } from "@/types";

export default function ProductPage() {
  const params = useParams();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [yogurt, setYogurt] = useState<Yogurt | null>(null);
  const [relatedYogurts, setRelatedYogurts] = useState<Yogurt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchYogurtData = async () => {
      try {
        const id = params?.id as string;
        const yogurtResponse = await getYogurtById(id);
        
        if (yogurtResponse.success && yogurtResponse.data) {
          setYogurt(yogurtResponse.data);
          
          // Fetch related yogurts
          const allYogurtsResponse = await getYogurts();
          if (allYogurtsResponse.success && allYogurtsResponse.data) {
            const related = allYogurtsResponse.data
              .filter((y: Yogurt) => y.id !== id)
              .slice(0, 4);
            setRelatedYogurts(related);
          }
        }
      } catch (error) {
        console.error("Error fetching yogurt:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchYogurtData();
  }, [params?.id]);

  const handleAddToCart = () => {
    if (!yogurt) return;
    
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: yogurt.id,
        name: yogurt.name,
        price: yogurt.price,
        quantity: 1,
      });
    }
    
    toast.success(`${quantity} ${yogurt.name} ${quantity > 1 ? 'ajoutés' : 'ajouté'} au panier!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!yogurt) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Produit non trouvé</h1>
            <p className="text-muted-foreground mb-6">Désolé, le produit que vous recherchez n'existe pas.</p>
            <Button asChild>
              <Link href="/">Retour aux produits</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux produits
        </Link>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="relative aspect-square rounded-xl overflow-hidden shadow-lg"
          >
            <Image
              src={yogurt.imageUrl}
              alt={yogurt.name}
              fill
              className="object-cover"
              priority
            />
          </motion.div>
          
          {/* Product Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold mb-2">{yogurt.name}</h1>
            
            <div className="flex items-center mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-5 w-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-muted-foreground ml-2">(24 avis)</span>
            </div>
            
            <p className="text-2xl font-bold text-primary mb-6">${yogurt.price.toFixed(2)}</p>
            
            <div className="bg-muted/20 p-4 rounded-lg mb-6">
              <p className="text-muted-foreground">{yogurt.description}</p>
            </div>
            
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Disponibilité:</h3>
              <p className={`${yogurt.stock > 10 ? 'text-green-600 dark:text-green-400' : yogurt.stock > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                {yogurt.stock > 10 ? 'En stock' : yogurt.stock > 0 ? 'Stock limité' : 'Épuisé'}
                {yogurt.stock > 0 && ` (${yogurt.stock} disponibles)`}
              </p>
            </div>
            
            <div className="mb-8">
              <h3 className="font-semibold mb-3">Quantité:</h3>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                
                <span className="w-12 text-center font-medium mx-3">{quantity}</span>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.min(yogurt.stock, quantity + 1))}
                  disabled={quantity >= yogurt.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="flex-1"
                size="lg"
                onClick={handleAddToCart}
                disabled={yogurt.stock === 0}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Ajouter au panier
              </Button>
              
              <Button
                variant="secondary"
                className="flex-1"
                size="lg"
                asChild
              >
                <Link href="/contact">Demander plus d'infos</Link>
              </Button>
            </div>
            
            <div className="mt-8 border-t pt-6">
              <div className="flex flex-col gap-3">
                <div className="flex">
                  <span className="font-semibold w-32">Ingrédients:</span>
                  <span className="text-muted-foreground">Lait entier, ferments lactiques, sucre de canne</span>
                </div>
                <div className="flex">
                  <span className="font-semibold w-32">Allergènes:</span>
                  <span className="text-muted-foreground">Lait</span>
                </div>
                <div className="flex">
                  <span className="font-semibold w-32">Conservation:</span>
                  <span className="text-muted-foreground">À conserver entre 2°C et 6°C</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Related Products Section */}
        <section className="mt-20">
          <h2 className="text-2xl font-bold mb-8">Vous pourriez aussi aimer</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedYogurts.map((relatedYogurt: Yogurt) => (
              <Link 
                href={`/product/${relatedYogurt.id}`} 
                key={relatedYogurt.id}
                className="group"
              >
                <div className="bg-card rounded-lg overflow-hidden shadow-md transition-transform group-hover:shadow-lg group-hover:-translate-y-1">
                  <div className="aspect-square relative">
                    <Image
                      src={relatedYogurt.imageUrl}
                      alt={relatedYogurt.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold group-hover:text-primary transition-colors">{relatedYogurt.name}</h3>
                    <p className="text-primary font-medium mt-1">{relatedYogurt.price.toFixed(0)} FCFA</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
