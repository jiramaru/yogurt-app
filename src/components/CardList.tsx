"use client";

import { Yogurt } from "@/types";
import YogurtCard from "./YogurtCard";
import { yogurts } from "@/data/yogurts";

export default function CardList() {
  return (
    <div className="container mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {yogurts.map((yogurt) => (
          <YogurtCard key={yogurt.id} yogurt={yogurt} />
        ))}
      </div>
    </div>
  );
}