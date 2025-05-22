"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">
              Notre Histoire
            </h1>
            
            <div className="relative aspect-video w-full mb-8 rounded-lg overflow-hidden shadow-lg">
              <Image
                src="https://images.pexels.com/photos/3669640/pexels-photo-3669640.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="Yogurt production"
                fill
                className="object-cover"
                priority
              />
            </div>
            
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <h2 className="text-2xl font-semibold mb-4">Notre Passion pour le Yogurt</h2>
              <p>
                Bienvenue chez Isy Yogurt, où chaque pot raconte une histoire de passion, de tradition et d'innovation. Notre voyage a commencé dans une petite cuisine familiale, avec une recette transmise de génération en génération.
              </p>
              
              <p>
                Aujourd'hui, nous sommes fiers de partager avec vous notre collection de yogurts artisanaux, fabriqués avec des ingrédients soigneusement sélectionnés et un savoir-faire unique. Chaque saveur est le fruit d'une recherche minutieuse pour vous offrir une expérience gustative incomparable.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
                <div className="bg-card rounded-lg p-6 shadow-md">
                  <h3 className="text-xl font-semibold mb-3">Notre Mission</h3>
                  <p className="text-muted-foreground">
                    Créer des yogurts d'exception qui apportent joie et bien-être dans votre quotidien, tout en respectant l'environnement et en soutenant les producteurs locaux.
                  </p>
                </div>
                
                <div className="bg-card rounded-lg p-6 shadow-md">
                  <h3 className="text-xl font-semibold mb-3">Nos Valeurs</h3>
                  <p className="text-muted-foreground">
                    Qualité, authenticité, innovation et respect sont au cœur de notre démarche. Nous croyons que les meilleurs produits naissent d'un équilibre parfait entre tradition et créativité.
                  </p>
                </div>
              </div>
              
              <h2 className="text-2xl font-semibold mb-4">Notre Engagement</h2>
              <p>
                Chez Isy Yogurt, nous nous engageons à:
              </p>
              <ul>
                <li>Utiliser uniquement des ingrédients naturels et de première qualité</li>
                <li>Soutenir l'agriculture locale et les pratiques durables</li>
                <li>Réduire notre empreinte environnementale à chaque étape de production</li>
                <li>Innover constamment pour vous proposer des saveurs uniques et délicieuses</li>
              </ul>
              
              <div className="my-12 text-center">
                <h2 className="text-2xl font-semibold mb-6">Rencontrez Notre Équipe</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="flex flex-col items-center">
                    <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4">
                      <Image
                        src="/isy.jpeg"
                        alt="Israël J."
                        fill
                        className="object-cover"
                      />
                    </div>
                    <h3 className="font-semibold">Israël J.</h3>
                    <p className="text-sm text-muted-foreground">Fondatrice</p>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4">
                      <Image
                        src="/deo1.png"
                        alt="Deo BATA"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <h3 className="font-semibold"> <Link href={"/dashboard"}>Deo</Link> BATA</h3>
                    <p className="text-sm text-muted-foreground">Developpeur</p>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4">
                      <Image
                        src="https://images.pexels.com/photos/32108574/pexels-photo-32108574.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                        alt="Carolle"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <h3 className="font-semibold">Carolle</h3>
                    <p className="text-sm text-muted-foreground">Responsable Qualité</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <h2 className="text-2xl font-semibold mb-6">Venez Nous Rencontrer</h2>
              <p className="mb-6">
                Nous serions ravis de vous accueillir dans notre boutique pour vous faire découvrir nos produits et partager notre passion.
              </p>
              <Button asChild size="lg">
                <Link href="/contact">Contactez-nous</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
