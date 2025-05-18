"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Users, Package, DollarSign } from "lucide-react";
import { type DashboardStats as DashboardStatsType } from "@/lib/actions";

interface DashboardStatsProps {
  stats: DashboardStatsType;
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  const statItems = [
    {
      title: "Total Produits",
      value: stats.totalYogurts,
      icon: Package,
      color: "bg-blue-500/10 text-blue-500",
      increase: "+12% par rapport au mois dernier",
    },
    {
      title: "Total Commandes",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "bg-green-500/10 text-green-500",
      increase: "+18% par rapport au mois dernier",
    },
    {
      title: "Total Utilisateurs",
      value: stats.totalUsers,
      icon: Users,
      color: "bg-purple-500/10 text-purple-500",
      increase: "+7% par rapport au mois dernier",
    },
    {
      title: "Revenu Total",
      value: `${stats.totalRevenue.toFixed(0)} FCFA`,
      icon: DollarSign,
      color: "bg-amber-500/10 text-amber-500",
      increase: "+15% par rapport au mois dernier",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statItems.map((item, index) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            delay: index * 0.1,
            type: "spring",
            stiffness: 300,
            damping: 24
          }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {item.title}
                  </p>
                  <h3 className="mt-1 text-2xl font-bold">{item.value}</h3>
                  <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                    {item.increase}
                  </p>
                </div>
                <div className={`rounded-full p-3 ${item.color}`}>
                  <item.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
