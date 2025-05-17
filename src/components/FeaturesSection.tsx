"use client";

import { motion } from "framer-motion";
import { Leaf, Heart, Award, Truck } from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      icon: <Leaf className="h-10 w-10 text-green-500" />,
      title: "Ingrédients Naturels",
      description: "Nous n'utilisons que des ingrédients frais et naturels, sans conservateurs ni additifs artificiels."
    },
    {
      icon: <Heart className="h-10 w-10 text-red-500" />,
      title: "Santé & Bien-être",
      description: "Nos yogurts sont riches en probiotiques, favorisant une bonne digestion et un système immunitaire renforcé."
    },
    {
      icon: <Award className="h-10 w-10 text-amber-500" />,
      title: "Qualité Premium",
      description: "Chaque pot est préparé avec soin selon nos recettes traditionnelles pour un goût exceptionnel."
    },
    {
      icon: <Truck className="h-10 w-10 text-blue-500" />,
      title: "Livraison Rapide",
      description: "Nous livrons dans toute la ville pour vous garantir des produits toujours frais à votre porte."
    }
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4">Pourquoi Choisir Nos Yogurts?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Découvrez ce qui rend nos yogurts artisanaux si spéciaux et pourquoi ils sont appréciés par nos clients fidèles.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-card p-6 rounded-lg shadow-md flex flex-col items-center text-center"
            >
              <div className="mb-4 p-3 rounded-full bg-background">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
