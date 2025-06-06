"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  ShoppingCart,
  UploadCloud
} from "lucide-react";
import { Yogurt } from "@/types";
import { getYogurts, createYogurt, updateYogurt, deleteYogurt, type YogurtFormData } from "@/actions";

// Form schema for yogurt validation
const yogurtFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  price: z.coerce.number().min(0, "Price must be positive"),
  description: z.string().min(1, "Description is required").max(500, "Description is too long"),
  imageUrl: z.string().optional(), // Made optional since we'll set it after upload
  stock: z.coerce.number().int().min(0, "Stock must be a positive integer"),
});

type YogurtFormValues = z.infer<typeof yogurtFormSchema>;

// Image upload component
const ImageUpload = ({ 
  onImageSelected, 
  currentImageUrl 
}: { 
  onImageSelected: (file: File) => void;
  currentImageUrl?: string;
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer?.files[0];
    if (file && file.type.startsWith('image/')) {
      onImageSelected(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }, [onImageSelected]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelected(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }, [onImageSelected]);

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      onDragEnter={(e) => { handleDrag(e); setIsDragging(true); }}
      onDragOver={(e) => { handleDrag(e); setIsDragging(true); }}
      onDragLeave={(e) => { handleDrag(e); setIsDragging(false); }}
      onDrop={handleDrop}
      className={`relative flex min-h-[200px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors ${
        isDragging 
          ? "border-primary bg-primary/10" 
          : "border-muted-foreground/25 hover:border-primary/50"
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      {previewUrl ? (
        <div className="relative h-full w-full">
          <img
            src={previewUrl}
            alt="Preview"
            className="h-full w-full rounded-lg object-contain"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100">
            <Button
              type="button"
              variant="secondary"
              onClick={handleBrowseClick}
              className="z-10"
            >
              Changer l'image
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <UploadCloud className="h-8 w-8" />
          <div className="flex flex-col items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleBrowseClick}
            >
              Parcourir
            </Button>
            <p className="text-sm text-center">ou déposez une image ici</p>
          </div>
          <p className="text-xs">PNG, JPG jusqu'à 5MB</p>
        </div>
      )}
    </div>
  );
};

export default function YogurtManagement() {
  const [yogurts, setYogurts] = useState<Yogurt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingYogurt, setEditingYogurt] = useState<Yogurt | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<keyof Yogurt>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

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

  // Function to upload image to Cloudinary
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.imageUrl;
  };

  // Function to reset form and clear data
  const resetFormAndState = () => {
    form.reset({
      name: "",
      price: 0,
      description: "",
      imageUrl: "",
      stock: 0,
    });
    setSelectedImage(null);
    // Clear any preview URLs that might be stored
    const imageUrl = form.getValues("imageUrl");
    if (imageUrl && imageUrl.startsWith("blob:")) {
      URL.revokeObjectURL(imageUrl);
    }
  };

  // Add modal close handler
  const handleModalClose = () => {
    resetFormAndState();
    setIsAddModalOpen(false);
  };

  // Edit modal close handler
  const handleEditModalClose = () => {
    resetFormAndState();
    setIsEditModalOpen(false);
    setEditingYogurt(null);
  };

  // Handle adding a new yogurt
  const handleAddYogurt = async (values: YogurtFormValues) => {
    try {
      let imageUrl = values.imageUrl || '';
      
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }

      if (!imageUrl) {
        toast.error("Please provide an image");
        return;
      }

      const result = await createYogurt({
        ...values,
        imageUrl: imageUrl,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to add yogurt");
      }

      const newYogurt = result.data;
      setYogurts((prev) => [...prev, newYogurt]);
      handleModalClose(); // Using the correct handler name
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
      let imageUrl = values.imageUrl || editingYogurt.imageUrl;
      
      // If there's a selected file, upload it first
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }

      if (!imageUrl) {
        toast.error("Please provide an image");
        return;
      }

      const result = await updateYogurt(editingYogurt.id, {
        ...values,
        imageUrl: imageUrl,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to update yogurt");
      }

      const updatedYogurt = result.data;
      setYogurts((prev) =>
        prev.map((yogurt) => (yogurt.id === updatedYogurt.id ? updatedYogurt : yogurt))
      );
      setIsEditModalOpen(false);
      setEditingYogurt(null);
      setSelectedImage(null);
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
              <CardTitle>Gestion des yaourts</CardTitle>
              <CardDescription>
                Ajoutez, modifiez ou supprimez des produits de yaourt de votre boutique.
              </CardDescription>
            </div>
            <Button onClick={() => {
              form.reset();
              setIsAddModalOpen(true);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un yaourt
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
              Rafraichir
            </Button>
          </div>

          {isLoading ? (
            <div className="flex h-[300px] items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="text-sm text-muted-foreground">Chargement des yaourts...</p>
              </div>
            </div>
          ) : sortedYogurts.length === 0 ? (
            <div className="flex h-[300px] flex-col items-center justify-center gap-2">
              <div className="rounded-full bg-muted p-3">
                <ShoppingCart className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">Aucun yaourt trouvé</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? "Essayez un terme de recherche différent"
                  : "Ajoutez votre premier yaourt pour commencer"}
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
                        Nom
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort("price")}>
                      <div className="flex items-center gap-1">
                        Prix
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
                        <TableCell>{yogurt.price.toFixed(0)} XAF</TableCell>
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
                              <span className="sr-only">Modifier</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteYogurt(yogurt.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Supprimer</span>
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
            Affichage {sortedYogurts.length} de {yogurts.length} yaourts
          </p>
        </CardFooter>
      </Card>

      {/* Add Yogurt Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div
              className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg bg-background shadow-lg"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background p-4">
                <h2 className="text-lg font-semibold">Ajouter un nouveau yaourt</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleModalClose}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Fermer</span>
                </Button>
              </div>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleAddYogurt)} className="space-y-4 p-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom</FormLabel>
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
                        <FormLabel>Prix (XAF)</FormLabel>
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
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={() => (
                      <FormItem>
                        <FormLabel>Image</FormLabel>
                        <FormControl>
                          <ImageUpload
                            currentImageUrl={form.getValues("imageUrl")}
                            onImageSelected={(file) => {
                              setSelectedImage(file);
                              // Create a temporary URL for preview
                              form.setValue("imageUrl", URL.createObjectURL(file));
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleModalClose}
                    >
                      Annuler
                    </Button>
                    <Button type="submit">
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter un yaourt
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
              className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg bg-background shadow-lg"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background p-4">
                <h2 className="text-lg font-semibold">Modifier le yaourt</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleEditModalClose}
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
                        <FormLabel>Nom</FormLabel>
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
                        <FormLabel>Prix (XAF)</FormLabel>
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
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={() => (
                      <FormItem>
                        <FormLabel>Image</FormLabel>
                        <FormControl>
                          <ImageUpload
                            currentImageUrl={form.getValues("imageUrl")}
                            onImageSelected={(file) => {
                              setSelectedImage(file);
                              // Create a temporary URL for preview
                              form.setValue("imageUrl", URL.createObjectURL(file));
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleEditModalClose}
                    >
                      Annuler
                    </Button>
                    <Button type="submit">
                      <Check className="mr-2 h-4 w-4" />
                      Enregister les modifications
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
