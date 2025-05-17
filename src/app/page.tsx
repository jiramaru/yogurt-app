// app/page.tsx

"use client";

import Header from "@/components/Header";
import CardList from "@/components/CardList";

export default function Home() {
  return (
    <>
      <Header />
      <h1 className="text-3xl font-bold m-8 text-center">
        Découvrez les délices de Isy 🤗🤤
      </h1>
      <div className="px-4 md:px-12 lg:px-20 py-10">
        <CardList />
      </div>
    </>
  );
}
