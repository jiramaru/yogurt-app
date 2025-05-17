"use client";

import { Yogurt } from "@/types";
import YogurtCard from "./YogurtCard";
import { yogurts } from "@/data/yogurts";

export default function CardList() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {yogurts.map((yogurt) => (
        <YogurtCard key={yogurt.id} yogurt={yogurt} />
      ))}
    </div>
  );
}