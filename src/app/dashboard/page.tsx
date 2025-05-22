"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Yogurt } from "@/types";
import YogurtManagement from "@/components/dashboard/YogurtManagement";
import OrderManagement from "@/components/dashboard/OrderManagement";
import UserManagement from "@/components/dashboard/UserManagement";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardStatsComponent from "@/components/dashboard/DashboardStats";
import { toast } from "sonner";
import { 
  getDashboardStats, 
  getTopSellingYogurts, 
  getRecentOrders, 
  getLowStockYogurts, 
  type DashboardStats as DashboardStatsType, 
  type TopSellingYogurt, 
  type RecentOrder, 
  type LowStockYogurt 
} from "@/actions";
import OTPModal from "@/components/OTPModal";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStatsType>({
    totalYogurts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
  });

  // State for overview data
  const [topYogurts, setTopYogurts] = useState<TopSellingYogurt[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStockYogurts, setLowStockYogurts] = useState<LowStockYogurt[]>([]);

  // OTP verification states
  const [showOTP, setShowOTP] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const router = useRouter();

  // Fetch dashboard stats and overview data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch stats from server action
        const statsResponse = await getDashboardStats();
        if (statsResponse.success && statsResponse.data) {
          setStats(statsResponse.data);
        } else {
          toast.error(statsResponse.error || "Failed to load dashboard statistics");
        }
        
        // Fetch additional overview data
        const [topSellingResponse, recentOrdersResponse, lowStockResponse] = await Promise.all([
          getTopSellingYogurts(),
          getRecentOrders(),
          getLowStockYogurts()
        ]);
        
        if (topSellingResponse.success && topSellingResponse.data) {
          setTopYogurts(topSellingResponse.data);
        }
        
        if (recentOrdersResponse.success && recentOrdersResponse.data) {
          setRecentOrders(recentOrdersResponse.data);
        }
        
        if (lowStockResponse.success && lowStockResponse.data) {
          setLowStockYogurts(lowStockResponse.data);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    // Check if already verified
    const verified = sessionStorage.getItem("dashboard-verified");
    if (verified === "true") {
      setIsVerified(true);
    } else {
      handleSendOTP();
    }
  }, []);

  const handleSendOTP = async () => {
    try {
      const response = await fetch("/api/otp", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to send OTP");
      }

      setShowOTP(true);
      toast.success("Verification code sent to ode808prod@gmail.com");
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("Failed to send verification code");
      router.push("/");
    }
  };

  const handleVerifyOTP = async (otp: string) => {
    try {
      const response = await fetch("/api/otp", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ otp }),
      });

      if (!response.ok) {
        throw new Error("Invalid verification code");
      }

      setIsVerified(true);
      setShowOTP(false);
      sessionStorage.setItem("dashboard-verified", "true");
      toast.success("Successfully verified!");
    } catch (error) {
      toast.error("Invalid verification code");
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-lg font-medium">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <OTPModal
        isOpen={showOTP}
        onVerify={handleVerifyOTP}
        onClose={() => router.push("/")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <DashboardHeader />
      
      <motion.div
        className="container mx-auto px-4 py-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <h1 className="mb-2 text-3xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="mb-8 text-muted-foreground">
            Gérez votre boutique de yogurts - produits, commandes et utilisateurs.
          </p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <DashboardStatsComponent stats={stats} />
        </motion.div>

        <motion.div variants={itemVariants} className="mt-8">
          <Tabs
            defaultValue="overview"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Aperçu</TabsTrigger>
              <TabsTrigger value="yogurts">Yogurts</TabsTrigger>
              <TabsTrigger value="orders">Commandes</TabsTrigger>
              <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            </TabsList>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <TabsContent value="overview" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Aperçu de la Boutique</CardTitle>
                      <CardDescription>
                        Obtenez un aperçu rapide des performances de votre boutique de yogurts.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Produits les Plus Vendus</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {topYogurts.length > 0 ? (
                                topYogurts.map((yogurt) => (
                                  <li key={yogurt.id} className="flex items-center justify-between">
                                    <span>{yogurt.name}</span>
                                    <span className="text-sm text-muted-foreground">{yogurt.sold} vendus</span>
                                  </li>
                                ))
                              ) : (
                                <li className="text-sm text-muted-foreground">Aucune donnée de vente disponible</li>
                              )}
                            </ul>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Commandes Récentes</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {recentOrders.length > 0 ? (
                                recentOrders.map((order) => (
                                  <li key={order.id} className="flex items-center justify-between">
                                    <span>Commande #{order.id.substring(0, 4)}</span>
                                    <span className={`text-sm ${order.status === 'completed' ? 'text-green-500' : 
                                                      order.status === 'cancelled' ? 'text-red-500' : 'text-amber-500'}`}>
                                      {order.status === 'completed' ? 'Terminée' : 
                                       order.status === 'cancelled' ? 'Annulée' : 'En attente'}
                                    </span>
                                  </li>
                                ))
                              ) : (
                                <li className="text-sm text-muted-foreground">Aucune commande récente</li>
                              )}
                            </ul>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Alerte Stock Bas</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {lowStockYogurts.length > 0 ? (
                                lowStockYogurts.map((yogurt) => (
                                  <li key={yogurt.id} className="flex items-center justify-between">
                                    <span>{yogurt.name}</span>
                                    <span className={`text-sm ${yogurt.stock < 10 ? 'text-red-500' : 'text-amber-500'}`}>
                                      {yogurt.stock} restants
                                    </span>
                                  </li>
                                ))
                              ) : (
                                <li className="text-sm text-muted-foreground">Aucun produit en stock bas</li>
                              )}
                            </ul>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <div className="mt-6">
                        <h3 className="mb-4 text-lg font-medium">Actions Rapides</h3>
                        <div className="flex flex-wrap gap-3">
                          <Button onClick={() => setActiveTab("yogurts")}>Ajouter un Yogurt</Button>
                          <Button variant="outline" onClick={() => setActiveTab("orders")}>Voir Toutes les Commandes</Button>
                          <Button variant="outline" onClick={() => setActiveTab("users")}>Gérer les Utilisateurs</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="yogurts" className="mt-6">
                  <YogurtManagement />
                </TabsContent>
                
                <TabsContent value="orders" className="mt-6">
                  <OrderManagement />
                </TabsContent>
                
                <TabsContent value="users" className="mt-6">
                  <UserManagement />
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  );
}
