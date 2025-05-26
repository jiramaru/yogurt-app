// app/page.tsx

"use client";

import CardList from "@/components/CardList";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import NewsletterSection from "@/components/NewsletterSection";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-background text-foreground">
      <HeroSection />
      
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-4xl font-bold mb-8 text-center">
          {/* <span className="block text-primary mb-2">✨ Savourez l'Excellence ✨</span> */}
          <span className="block">Nos Yogurts Artisanaux, Une Symphonie de Saveurs</span>
          <span className="block text-sm md:text-base font-normal text-muted-foreground mt-4">Chaque cuillérée est une invitation au voyage gustatif 🍦✨</span>
        </h2>
        
        <div className="mb-16">
          <CardList />
        </div>
        
        {/* <div className="text-center">
          <Button asChild size="lg" className="mx-auto">
            <Link href="/contact">Commander maintenant</Link>
          </Button>
        </div> */}

      </div>
      
      <FeaturesSection />
      <TestimonialsSection />
      <NewsletterSection />
      
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Prêt à Découvrir Nos Délices?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Rejoignez notre communauté de gourmets et découvrez pourquoi nos yogurts artisanaux font la différence.
          </p>
          <Button asChild size="lg">
            <Link href="/contact">Contactez-nous</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
