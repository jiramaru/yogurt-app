// components/CardsList.tsx

import React from "react";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Yogurt } from "@/generated/prisma"; // Adjust this if needed

interface Props {
  yogurts: Yogurt[];
}

export default function CardsList({ yogurts }: Props) {
  return (
    <div>
      

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {yogurts.map((yogurt) => (
          <Card
            key={yogurt.id}
            className="rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300"
          >
            <div className="relative h-48 w-full rounded-t-2xl overflow-hidden">
              <Image
                src={yogurt.imageUrl}
                alt={yogurt.name}
                fill
                className="object-cover"
              />
            </div>

            <CardContent className="p-4 space-y-2">
              <h2 className="text-xl font-semibold">{yogurt.name}</h2>
              <p className="text-sm text-muted-foreground">${yogurt.price}</p>
              <p className="text-sm text-gray-600">{yogurt.description}</p>
              <p className="text-sm text-gray-400">Stock: {yogurt.stock}</p>
            </CardContent>

            <CardFooter className="p-4">
              <Button className="w-full">Add to Cart</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
