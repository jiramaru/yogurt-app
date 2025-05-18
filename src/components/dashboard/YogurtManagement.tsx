"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Edit, 
  Trash2, 
  Plus, 
  X, 
  Search, 
  RefreshCw,
  Check,
  Image as ImageIcon,
  ArrowUpDown,
  ShoppingCart
} from "lucide-react";
import { Yogurt } from "@/types";
import { getYogurts, createYogurt, updateYogurt, deleteYogurt, type YogurtFormData } from "@/actions";

// Form schema for yogurt validation
const yogurtFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  price: z.coerce.number().min(0, "Price must be positive"),
  description: z.string().min(1, "Description is required").max(500, "Description is too long"),
  imageUrl: z.string().url("Invalid URL"),
  stock: z.coerce.number().int().min(0, "Stock must be a positive integer"),
});

type YogurtFormValues = z.infer<typeof yogurtFormSchema>;

export default function YogurtManagement() {
  const [yogurts, setYogurts] = useState<Yogurt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingYogurt, setEditingYogurt] = useState<Yogurt | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<keyof Yogurt>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Initialize form
  const form = useForm<YogurtFormValues>({
    resolver: zodResolver(yogurtFormSchema),
    defaultValues: {
      name: "",
      price: 0,
      description: "",
      imageUrl: "",
      stock: 0,
    },
  });

  // Fetch yogurts
  useEffect(() => {
    const fetchYogurts = async () => {
      try {
        setIsLoading(true);
        const result = await getYogurts();
        
        if (!result.success) {
          throw new Error(result.error || "Failed to fetch yogurts");
        }
        
        setYogurts(result.data || []);
      } catch (error) {
        console.error("Error fetching yogurts:", error);
        toast.error("Failed to load yogurts");
      } finally {
        setIsLoading(false);
      }
    };

    fetchYogurts();
  }, []);

  // Handle adding a new yogurt
  const handleAddYogurt = async (values: YogurtFormValues) => {
    try {
      const result = await createYogurt(values);

      if (!result.success) {
        throw new Error(result.error || "Failed to add yogurt");
      }

      const newYogurt = result.data;
      setYogurts((prev) => [...prev, newYogurt]);
      setIsAddModalOpen(false);
      form.reset();
      toast.success("Yogurt added successfully!");
    } catch (error) {
      console.error("Error adding yogurt:", error);
      toast.error("Failed to add yogurt");
    }
  };

  // Handle editing a yogurt
  const handleEditYogurt = async (values: YogurtFormValues) => {
    if (!editingYogurt) return;

    try {
      const result = await updateYogurt(editingYogurt.id, values);

      if (!result.success) {
        throw new Error(result.error || "Failed to update yogurt");
      }

      const updatedYogurt = result.data;
      setYogurts((prev) =>
        prev.map((yogurt) => (yogurt.id === updatedYogurt.id ? updatedYogurt : yogurt))
      );
      setIsEditModalOpen(false);
      setEditingYogurt(null);
      toast.success("Yogurt updated successfully!");
    } catch (error) {
      console.error("Error updating yogurt:", error);
      toast.error("Failed to update yogurt");
    }
  };

  // Handle deleting a yogurt
  const handleDeleteYogurt = async (id: string) => {
    if (!confirm("Are you sure you want to delete this yogurt?")) return;

    try {
      const result = await deleteYogurt(id);

      if (!result.success) {
        throw new Error(result.error || "Failed to delete yogurt");
      }

      setYogurts((prev) => prev.filter((yogurt) => yogurt.id !== id));
      toast.success("Yogurt deleted successfully!");
    } catch (error) {
      console.error("Error deleting yogurt:", error);
      toast.error("Failed to delete yogurt");
    }
  };

  // Open edit modal and populate form with yogurt data
  const openEditModal = (yogurt: Yogurt) => {
    setEditingYogurt(yogurt);
    form.reset({
      name: yogurt.name,
      price: yogurt.price,
      description: yogurt.description,
      imageUrl: yogurt.imageUrl,
      stock: yogurt.stock,
    });
    setIsEditModalOpen(true);
  };

  // Filter yogurts based on search query
  const filteredYogurts = yogurts.filter((yogurt) =>
    yogurt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    yogurt.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort yogurts
  const sortedYogurts = [...filteredYogurts].sort((a, b) => {
    const fieldA = a[sortField];
    const fieldB = b[sortField];

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
  const toggleSort = (field: keyof Yogurt) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
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
              <CardTitle>Yogurt Management</CardTitle>
              <CardDescription>
                Add, edit, or remove yogurt products from your shop.
              </CardDescription>
            </div>
            <Button onClick={() => {
              form.reset();
              setIsAddModalOpen(true);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Yogurt
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search yogurts..."
                className="w-full pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  setIsLoading(true);
                  const result = await getYogurts();
                  
                  if (result.success && result.data) {
                    setYogurts(result.data);
                    toast.success("Yogurts refreshed");
                  } else {
                    throw new Error(result.error || "Failed to refresh yogurts");
                  }
                } catch (error) {
                  console.error("Error refreshing yogurts:", error);
                  toast.error("Failed to refresh yogurts");
                } finally {
                  setIsLoading(false);
                }
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          {isLoading ? (
            <div className="flex h-[300px] items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="text-sm text-muted-foreground">Loading yogurts...</p>
              </div>
            </div>
          ) : sortedYogurts.length === 0 ? (
            <div className="flex h-[300px] flex-col items-center justify-center gap-2">
              <div className="rounded-full bg-muted p-3">
                <ShoppingCart className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No yogurts found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? "Try a different search term"
                  : "Add your first yogurt to get started"}
              </p>
            </div>
          ) : (
            <div className="overflow-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort("name")}>
                      <div className="flex items-center gap-1">
                        Name
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort("price")}>
                      <div className="flex items-center gap-1">
                        Price
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort("stock")}>
                      <div className="flex items-center gap-1">
                        Stock
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {sortedYogurts.map((yogurt) => (
                      <motion.tr
                        key={yogurt.id}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="group"
                      >
                        <TableCell>
                          <div className="relative h-10 w-10 overflow-hidden rounded-md">
                            {yogurt.imageUrl ? (
                              <img
                                src={yogurt.imageUrl}
                                alt={yogurt.name}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?auto=compress&cs=tinysrgb&w=600";
                                }}
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-muted">
                                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{yogurt.name}</TableCell>
                        <TableCell>${yogurt.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                              yogurt.stock > 10
                                ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
                                : yogurt.stock > 0
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-800/20 dark:text-amber-400"
                                : "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400"
                            }`}
                          >
                            {yogurt.stock}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditModal(yogurt)}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteYogurt(yogurt.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {sortedYogurts.length} of {yogurts.length} yogurts
          </p>
        </CardFooter>
      </Card>

      {/* Add Yogurt Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div
              className="w-full max-w-md overflow-hidden rounded-lg bg-background shadow-lg"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="flex items-center justify-between border-b p-4">
                <h2 className="text-lg font-semibold">Add New Yogurt</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </div>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleAddYogurt)} className="space-y-4 p-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Strawberry Bliss" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="A creamy blend of fresh strawberries and smooth yogurt."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/image.jpg"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter a valid URL for the yogurt image
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Yogurt
                    </Button>
                  </div>
                </form>
              </Form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Yogurt Modal */}
      <AnimatePresence>
        {isEditModalOpen && editingYogurt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div
              className="w-full max-w-md overflow-hidden rounded-lg bg-background shadow-lg"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="flex items-center justify-between border-b p-4">
                <h2 className="text-lg font-semibold">Edit Yogurt</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingYogurt(null);
                  }}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </div>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleEditYogurt)} className="space-y-4 p-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          Enter a valid URL for the yogurt image
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditModalOpen(false);
                        setEditingYogurt(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      <Check className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
