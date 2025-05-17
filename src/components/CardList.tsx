"use client";

import { Yogurt } from "@/types";
import YogurtCard from "./YogurtCard";
import { yogurts } from "@/data/yogurts";

export default function CardList() {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:flex lg:grid-cols-4 gap-4 md:gap-6 place-items-center">
        {yogurts.map((yogurt) => (
          <div key={yogurt.id} className="flex justify-center w-full">
            <YogurtCard yogurt={yogurt} />
          </div>
        ))}
      </div>
    </>
  );
}