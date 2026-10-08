import React, { useState } from "react";
import { useProducts } from "@/context/ProductContext";
import { Product } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Search, Package, Pill, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";
import { validateProductName, validateAmount, validateCategoryName, validateQuantity } from "@/lib/validation";
import Header from "@/components/Header";

interface ProductFormData {
  name: string;
  category: string;
  group: "SERVICES" | "DRUGS";
  cashPrice: string;
  nhisPrice: string;
  stock: string;
  lowStockThreshold: string;
  expiryDate: string;
}

const ItemsManagement = () => {
  const { products, categories, addProduct, updateProduct, deleteProduct } = useProducts();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    category: "",
    group: "SERVICES",
    cashPrice: "",
    nhisPrice: "",
    stock: "",
    lowStockThreshold: "",
    expiryDate: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      group: "SERVICES",
      cashPrice: "",
      nhisPrice: "",
      stock: "",
      lowStockThreshold: "",
      expiryDate: "",
    });
    setEditingProduct(null);
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    const nameValidation = validateProductName(formData.name);
    if (!nameValidation.isValid) {
      errors.name = nameValidation.error!;
    }

    const categoryValidation = validateCategoryName(formData.category);
    if (!categoryValidation.isValid) {
      errors.category = categoryValidation.error!;
    }

    const cashPriceValidation = validateAmount(formData.cashPrice, "Cash price");
    if (!cashPriceValidation.isValid) {
      errors.cashPrice = cashPriceValidation.error!;
    }

    const nhisPriceValidation = validateAmount(formData.nhisPrice, "NHIS price");
    if (!nhisPriceValidation.isValid) {
      errors.nhisPrice = nhisPriceValidation.error!;
    }

    if (formData.stock) {
      const stockValue = parseInt(formData.stock, 10);
      const stockValidation = validateQuantity(stockValue);
      if (!stockValidation.isValid) {
        errors.stock = stockValidation.error!;
      }
    }

    if (formData.lowStockThreshold) {
      const thresholdValue = parseInt(formData.lowStockThreshold, 10);
      const thresholdValidation = validateQuantity(thresholdValue);
      if (!thresholdValidation.isValid) {
        errors.lowStockThreshold = thresholdValidation.error!;
      }
    }

    if (formData.expiryDate) {
      const dateValue = new Date(formData.expiryDate);
      if (Number.isNaN(dateValue.getTime())) {
        errors.expiryDate = "Expiry date must be a valid date";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const productData = {
        name: formData.name,
        category: formData.category,
        group: formData.group,
        cashPrice: parseFloat(formData.cashPrice) || 0,
        nhisPrice: parseFloat(formData.nhisPrice) || 0,
        stock: formData.stock ? parseInt(formData.stock, 10) : undefined,
        lowStockThreshold: formData.lowStockThreshold ? parseInt(formData.lowStockThreshold, 10) : undefined,
        expiryDate: formData.expiryDate ? formData.expiryDate : undefined,
      };

      if (editingProduct) {
        updateProduct(editingProduct, productData);
      } else {
        addProduct(productData);
      }

    setIsAddDialogOpen(false);
    resetForm();
    setIsSubmitting(false);
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      category: product.category,
      group: product.group,
      cashPrice: product.cashPrice.toString(),
      nhisPrice: product.nhisPrice.toString(),
      stock: product.stock !== undefined ? product.stock.toString() : "",
      lowStockThreshold: product.lowStockThreshold !== undefined ? product.lowStockThreshold.toString() : "",
      expiryDate: product.expiryDate ?? "",
    });
    setEditingProduct(product.id);
    setIsAddDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteProduct(id);
  };

  const getGroupIcon = (group: string) => {
    switch (group) {
      case "SERVICES":
        return <Stethoscope className="w-4 h-4" />;
      case "DRUGS":
        return <Pill className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getGroupColor = (group: string) => {
    switch (group) {
      case "SERVICES":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "DRUGS":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header Section */}
          <div className="h-12 md:h-16 glass-panel border-b border-border/50 flex items-center px-4 md:px-6 gap-3 md:gap-4 shrink-0 z-20">
            <div className="flex items-center gap-2 md:gap-2.5">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
                <Package className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-foreground text-xs md:text-sm">Items Management</h1>
                <p className="text-[10px] md:text-[11px] text-muted-foreground">{products.length} total products</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingProduct ? "Edit Item" : "Add New Item"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Item Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter item name"
                      className={formErrors.name ? "border-destructive" : ""}
                    />
                    {formErrors.name && (
                      <p className="text-sm text-destructive mt-1">{formErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger className={formErrors.category ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.name} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.category && (
                      <p className="text-sm text-destructive mt-1">{formErrors.category}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="group">Group</Label>
                    <Select
                      value={formData.group}
                      onValueChange={(value: "SERVICES" | "DRUGS") => setFormData(prev => ({ ...prev, group: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SERVICES">Services</SelectItem>
                        <SelectItem value="DRUGS">Drugs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cashPrice">Cash Price (₵)</Label>
                      <Input
                        id="cashPrice"
                        type="number"
                        step="0.01"
                        value={formData.cashPrice}
                        onChange={(e) => setFormData(prev => ({ ...prev, cashPrice: e.target.value }))}
                        placeholder="0.00"
                        className={formErrors.cashPrice ? "border-destructive" : ""}
                      />
                      {formErrors.cashPrice && (
                        <p className="text-sm text-destructive mt-1">{formErrors.cashPrice}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="nhisPrice">NHIS Price (₵)</Label>
                      <Input
                        id="nhisPrice"
                        type="number"
                        step="0.01"
                        value={formData.nhisPrice}
                        onChange={(e) => setFormData(prev => ({ ...prev, nhisPrice: e.target.value }))}
                        placeholder="0.00"
                        className={formErrors.nhisPrice ? "border-destructive" : ""}
                      />
                      {formErrors.nhisPrice && (
                        <p className="text-sm text-destructive mt-1">{formErrors.nhisPrice}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="stock">Stock Quantity</Label>
                      <Input
                        id="stock"
                        type="number"
                        step="1"
                        min="0"
                        value={formData.stock}
                        onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                        placeholder="Optional"
                        className={formErrors.stock ? "border-destructive" : ""}
                      />
                      {formErrors.stock && (
                        <p className="text-sm text-destructive mt-1">{formErrors.stock}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                      <Input
                        id="lowStockThreshold"
                        type="number"
                        step="1"
                        min="0"
                        value={formData.lowStockThreshold}
                        onChange={(e) => setFormData(prev => ({ ...prev, lowStockThreshold: e.target.value }))}
                        placeholder="Optional"
                        className={formErrors.lowStockThreshold ? "border-destructive" : ""}
                      />
                      {formErrors.lowStockThreshold && (
                        <p className="text-sm text-destructive mt-1">{formErrors.lowStockThreshold}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                      className={formErrors.expiryDate ? "border-destructive" : ""}
                    />
                    {formErrors.expiryDate && (
                      <p className="text-sm text-destructive mt-1">{formErrors.expiryDate}</p>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsAddDialogOpen(false);
                        resetForm();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Saving..." : editingProduct ? "Update" : "Add"} Item
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* Filters */}
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.name} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getGroupIcon(product.group)}
                        <Badge className={cn("text-xs", getGroupColor(product.group))}>
                          {product.group}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(product)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Item</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{product.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(product.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">{product.category}</p>
                      <div className="flex items-center gap-2 flex-wrap text-sm">
                        <span>Cash: ₵{product.cashPrice.toFixed(2)}</span>
                        <span>NHIS: ₵{product.nhisPrice.toFixed(2)}</span>
                        {typeof product.stock === 'number' && (
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] text-slate-700">
                            Stock: {product.stock}
                          </span>
                        )}
                        {product.expiryDate && (
                          <span className="rounded-full bg-amber-100 px-2 py-1 text-[11px] text-amber-900">
                            Exp: {new Date(product.expiryDate).toLocaleDateString('en-GB')}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No items found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery || selectedCategory !== "All"
                    ? "Try adjusting your search or filter criteria."
                    : "Get started by adding your first item."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemsManagement;
