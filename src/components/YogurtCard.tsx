import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { Yogurt } from "@/types";

interface YogurtCardProps {
  yogurt: Yogurt;
}

export default function YogurtCard({ yogurt }: YogurtCardProps) {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem({
      id: yogurt.id,
      name: yogurt.name,
      price: yogurt.price,
      quantity: 1,
    });
    toast.success(`${yogurt.name} ajouté au panier !`);
  };

  return (
    <Card className="flex flex-col h-full transition-transform hover:scale-[1.01] max-w-xs mx-auto group">
      <Link href={`/product/${yogurt.id}`} className="flex-grow">
        <CardHeader className="p-3 pb-0">
          <CardTitle className="text-base font-semibold truncate group-hover:text-primary transition-colors">{yogurt.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow space-y-3 p-3">
          <div className="aspect-square relative overflow-hidden rounded-md">
            <Image
              src={yogurt.imageUrl}
              alt={yogurt.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
              priority={false}
              loading="lazy"
              onError={(e) => {
                // Fallback to a placeholder if image fails to load
                const target = e.target as HTMLImageElement;
                target.src = "https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?auto=compress&cs=tinysrgb&w=600";
              }}
            />
          </div>
          <p className="text-muted-foreground text-sm line-clamp-2">{yogurt.description}</p>
          <div className="flex justify-between items-center">
            <p className="font-semibold">${yogurt.price.toFixed(2)}</p>
            <p className={`text-xs ${yogurt.stock > 10 ? 'text-green-600 dark:text-green-400' : yogurt.stock > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
              {yogurt.stock > 0 ? `En stock (${yogurt.stock})` : 'Épuisé'}
            </p>
          </div>
        </CardContent>
      </Link>
      <CardFooter className="p-3 pt-0">
        <Button 
          className="w-full transition-colors text-sm" 
          onClick={handleAddToCart}
          disabled={yogurt.stock === 0}
          size="sm"
          aria-label={`Ajouter ${yogurt.name} au panier`}
        >
          {yogurt.stock === 0 ? 'Épuisé' : 'Ajouter au panier'}
        </Button>
      </CardFooter>
    </Card>
  );
}