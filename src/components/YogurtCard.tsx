import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

interface YogurtCardProps {
  yogurt: {
    id: string;
    name: string;
    price: number;
    description: string;
    imageUrl: string;
    stock: number;
    quantity: number;
  };
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
    toast.success(`Added ${yogurt.name} to cart!`);
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{yogurt.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="aspect-square relative overflow-hidden rounded-md">
          <Image
            src={yogurt.imageUrl}
            alt={yogurt.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <p className="mt-4 text-gray-600">{yogurt.description}</p>
        <p className="mt-2 font-semibold">${yogurt.price.toFixed(2)}</p>
        <p className="mt-2 text-gray-500">Stock: {yogurt.stock}</p>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleAddToCart}
          disabled={yogurt.stock === 0}
        >
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}