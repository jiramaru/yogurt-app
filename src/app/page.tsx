// app/page.tsx

"use client";

import Header from "@/components/Header";
import CardList from "@/components/CardList";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-8 text-center">
            Découvrez les délices de Isy 🤗🤤
          </h1>
          <CardList />
        </div>
      </main>
    </div>
  );
}
