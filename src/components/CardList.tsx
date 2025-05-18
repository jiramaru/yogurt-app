"use client";

import { useEffect, useState } from "react";
import { Yogurt } from "@/types";
import YogurtCard from "./YogurtCard";
import { getYogurts } from "@/actions/yogurt-actions";

export default function CardList() {
  const [yogurts, setYogurts] = useState<Yogurt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchYogurts = async () => {
      try {
        const response = await getYogurts();
        if (response.success && response.data) {
          setYogurts(response.data);
        }
      } catch (error) {
        console.error("Error fetching yogurts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchYogurts();
  }, []);

  if (loading) {
    return (
      <div className="w-full py-12 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 lg:grid-cols-4 gap-4 md:gap-6 place-items-center">
        {yogurts.map((yogurt) => (
          <div key={yogurt.id} className="flex justify-center w-full">
            <YogurtCard yogurt={yogurt} />
          </div>
        ))}
      </div>
    </>
  );
}