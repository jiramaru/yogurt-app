"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Eye, 
  RefreshCw, 
  Search, 
  ShoppingCart,
  ArrowUpDown,
  CheckCircle,
  Clock,
  XCircle,
  Package
} from "lucide-react";
import { Order, OrderItemWithYogurt } from "@/types";
import { getOrders, getOrderById, updateOrderStatus as updateStatus } from "@/actions";

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<keyof Order>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const result = await getOrders();
        
        if (!result.success) {
          throw new Error(result.error || "Impossible de récupérer les commandes");
        }
        
        setOrders(result.data || []);
      } catch (error) {
        console.error("Erreur lors de la récupération des commandes:", error);
        toast.error("Impossible de charger les commandes");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Update order status
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const result = await updateStatus(orderId, newStatus);
      
      if (!result.success) {
        throw new Error(result.error || "Failed to update order status");
      }
      
      // Update local state
      const updatedOrders = orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, updatedAt: new Date().toISOString() } 
          : order
      );
      
      setOrders(updatedOrders);
      
      // If the order being viewed is the one being updated, update it too
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          status: newStatus,
          updatedAt: new Date().toISOString()
        });
      }
      
      toast.success(`Commande #${orderId.substring(0, 4)} statut mis à jour: ${newStatus}`);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la commande:", error);
      toast.error("Échec de la mise à jour du statut de la commande");
    }
  };

  // Filter orders based on search query and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.includes(searchQuery) || 
                          order.userId?.includes(searchQuery) || 
                          false;
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const fieldA = a[sortField];
    const fieldB = b[sortField];

    if (sortField === "createdAt" || sortField === "updatedAt") {
      const dateA = new Date(fieldA as string).getTime();
      const dateB = new Date(fieldB as string).getTime();
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    }

    if (typeof fieldA === "string" && typeof fieldB === "string") {
      return sortDirection === "asc"
        ? fieldA.localeCompare(fieldB)
        : fieldB.localeCompare(fieldA);
    }

    if (typeof fieldA === "number" && typeof fieldB === "number") {
      return sortDirection === "asc" ? fieldA - fieldB : fieldB - fieldA;
    }

    return 0;
  });

  // Toggle sort direction
  const toggleSort = (field: keyof Order) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // View order details
  const viewOrderDetails = async (order: Order) => {
    try {
      // Get detailed order information including items
      const result = await getOrderById(order.id);
      
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch order details");
      }
      
      setSelectedOrder(result.data);
      setIsDetailsModalOpen(true);
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast.error("Failed to load order details");
    }
  };

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return {
          color: "bg-amber-100 text-amber-800 dark:bg-amber-800/20 dark:text-amber-400",
          icon: Clock,
          label: "En attente"
        };
      case "completed":
        return {
          color: "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400",
          icon: CheckCircle,
          label: "Terminée"
        };
      case "cancelled":
        return {
          color: "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400",
          icon: XCircle,
          label: "Annulée"
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-400",
          icon: Package,
          label: status
        };
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Order Management</CardTitle>
              <CardDescription>
                View and manage customer orders.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-col gap-4 sm:flex-row">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by order ID or customer..."
                  className="w-full pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="completed">Terminée</SelectItem>
                  <SelectItem value="cancelled">Annulée</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  setIsLoading(true);
                  const result = await getOrders();
                  
                  if (result.success && result.data) {
                    setOrders(result.data);
                    toast.success("Commandes actualisées");
                  } else {
                    throw new Error(result.error || "Impossible d'actualiser les commandes");
                  }
                } catch (error) {
                  console.error("Erreur lors de l'actualisation des commandes:", error);
                  toast.error("Impossible d'actualiser les commandes");
                } finally {
                  setIsLoading(false);
                }
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualiser
            </Button>
          </div>

          {isLoading ? (
            <div className="flex h-[300px] items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="text-sm text-muted-foreground">Chargement des commandes...</p>
              </div>
            </div>
          ) : sortedOrders.length === 0 ? (
            <div className="flex h-[300px] flex-col items-center justify-center gap-2">
              <div className="rounded-full bg-muted p-3">
                <ShoppingCart className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">Aucune commande trouvée</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery || statusFilter !== "all"
                  ? "Essayez d'autres termes de recherche ou filtres"
                  : "Les commandes apparaîtront ici lorsque les clients effectueront des achats"}
              </p>
            </div>
          ) : (
            <div className="overflow-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">
                      <div className="flex items-center gap-1 cursor-pointer" onClick={() => toggleSort("id")}>
                        ID Commande
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>
                      <div className="flex items-center gap-1 cursor-pointer" onClick={() => toggleSort("createdAt")}>
                        Date
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-1 cursor-pointer" onClick={() => toggleSort("total")}>
                        Total
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-1 cursor-pointer" onClick={() => toggleSort("status")}>
                        Statut
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {sortedOrders.map((order) => {
                      const statusBadge = getStatusBadge(order.status);
                      const StatusIcon = statusBadge.icon;
                      
                      return (
                        <motion.tr
                          key={order.id}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          className="group"
                        >
                          <TableCell className="font-medium">#{order.id}</TableCell>
                          <TableCell>
                            {order.userId ? `User ${order.userId}` : "Guest"}
                          </TableCell>
                          <TableCell>
                            {format(new Date(order.createdAt), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>${order.total.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${statusBadge.color}`}
                              >
                                <StatusIcon className="h-3 w-3" />
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => viewOrderDetails(order)}
                              >
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View</span>
                              </Button>
                              <Select
                                value={order.status}
                                onValueChange={(value) => updateOrderStatus(order.id, value)}
                              >
                                <SelectTrigger className="h-8 w-[130px]">
                                  <SelectValue placeholder="Update Status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {sortedOrders.length} of {orders.length} orders
          </p>
        </CardFooter>
      </Card>

      {/* Order Details Modal */}
      <AnimatePresence>
        {isDetailsModalOpen && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div
              className="w-full max-w-2xl overflow-hidden rounded-lg bg-background shadow-lg"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="flex items-center justify-between border-b p-4">
                <h2 className="text-lg font-semibold">Order Details - #{selectedOrder.id}</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsDetailsModalOpen(false)}
                >
                  <XCircle className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </div>
              
              <div className="p-4">
                <div className="mb-6 grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Order Date</h3>
                    <p>{format(new Date(selectedOrder.createdAt), "PPP p")}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
                    <p>{format(new Date(selectedOrder.updatedAt), "PPP p")}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Customer</h3>
                    <p>{selectedOrder.userId ? `User ${selectedOrder.userId}` : "Guest"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                    <div className="flex items-center gap-1 mt-1">
                      {(() => {
                        const statusBadge = getStatusBadge(selectedOrder.status);
                        const StatusIcon = statusBadge.icon;
                        return (
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${statusBadge.color}`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="mb-2 text-sm font-medium text-muted-foreground">Articles de la commande</h3>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produit</TableHead>
                          <TableHead className="text-right">Quantité</TableHead>
                          <TableHead className="text-right">Prix</TableHead>
                          <TableHead className="text-right">Sous-total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedOrder.items && selectedOrder.items.length > 0 ? (
                          selectedOrder.items.map((item: any) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.yogurt?.name || 'Produit inconnu'}</TableCell>
                              <TableCell className="text-right">{item.quantity}</TableCell>
                              <TableCell className="text-right">{item.price.toFixed(0)} FCFA</TableCell>
                              <TableCell className="text-right">{(item.price * item.quantity).toFixed(0)} FCFA</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                              Aucun article dans cette commande
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                
                <div className="mb-6 rounded-md border p-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sous-total:</span>
                    <span>{(selectedOrder.total * 0.9).toFixed(0)} FCFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">TVA (10%):</span>
                    <span>{(selectedOrder.total * 0.1).toFixed(0)} FCFA</span>
                  </div>
                  <div className="mt-2 flex justify-between border-t pt-2 font-medium">
                    <span>Total:</span>
                    <span>{selectedOrder.total.toFixed(0)} FCFA</span>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(value) => {
                      updateOrderStatus(selectedOrder.id, value);
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Mettre à jour le statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="completed">Terminée</SelectItem>
                      <SelectItem value="cancelled">Annulée</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="outline"
                    onClick={() => setIsDetailsModalOpen(false)}
                  >
                    Fermer
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
