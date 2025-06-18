
import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FilterBar } from "@/components/FilterBar";
import { ProductModal } from "@/components/ProductModal";
import { Plus, Package, TrendingUp, AlertTriangle, Edit, Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// TODO: Replace with API call to fetch products
const initialMockProducts = [
  { id: 1, name: "Wireless Headphones", category: "Electronics", price: 89.99, stock: 45, status: "active", image: "/placeholder.svg", sku: "WH001" },
  { id: 2, name: "Smart Watch", category: "Electronics", price: 199.99, stock: 23, status: "active", image: "/placeholder.svg", sku: "SW002" },
  { id: 3, name: "Bluetooth Speaker", category: "Electronics", price: 59.99, stock: 12, status: "low_stock", image: "/placeholder.svg", sku: "BS003" },
  { id: 4, name: "Phone Case", category: "Accessories", price: 24.99, stock: 67, status: "active", image: "/placeholder.svg", sku: "PC004" },
  { id: 5, name: "Laptop Stand", category: "Accessories", price: 39.99, stock: 0, status: "out_of_stock", image: "/placeholder.svg", sku: "LS005" },
];

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "low_stock", label: "Low Stock" },
  { value: "out_of_stock", label: "Out of Stock" },
];

const categoryOptions = [
  { value: "Electronics", label: "Electronics" },
  { value: "Accessories", label: "Accessories" },
];

const Products = () => {
  const [products, setProducts] = useState(initialMockProducts);
  const [filteredProducts, setFilteredProducts] = useState(initialMockProducts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { toast } = useToast();

  const handleSearch = (term: string) => {
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(term.toLowerCase()) ||
      product.category.toLowerCase().includes(term.toLowerCase()) ||
      product.sku.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const handleStatusFilter = (status: string) => {
    if (!status) {
      setFilteredProducts(products);
      return;
    }
    const filtered = products.filter(product => product.status === status);
    setFilteredProducts(filtered);
  };

  const handleCategoryFilter = (category: string) => {
    if (!category) {
      setFilteredProducts(products);
      return;
    }
    const filtered = products.filter(product => product.category === category);
    setFilteredProducts(filtered);
  };

  const handleAddProduct = () => {
    setModalMode('add');
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: any) => {
    setModalMode('edit');
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleSaveProduct = (productData: any) => {
    if (modalMode === 'add') {
      const newProduct = {
        ...productData,
        id: Date.now(),
        image: "/placeholder.svg"
      };
      const updatedProducts = [...products, newProduct];
      setProducts(updatedProducts);
      setFilteredProducts(updatedProducts);
    } else {
      const updatedProducts = products.map(p => 
        p.id === selectedProduct?.id ? { ...p, ...productData } : p
      );
      setProducts(updatedProducts);
      setFilteredProducts(updatedProducts);
    }
  };

  const handleDeleteProduct = (productId: number) => {
    const updatedProducts = products.filter(p => p.id !== productId);
    setProducts(updatedProducts);
    setFilteredProducts(updatedProducts);
    toast({
      title: "Success",
      description: "Product deleted successfully"
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200">Active</Badge>;
      case "low_stock":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Low Stock</Badge>;
      case "out_of_stock":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Out of Stock</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const activeProducts = products.filter(p => p.status === "active").length;
  const lowStockProducts = products.filter(p => p.status === "low_stock").length;
  const outOfStockProducts = products.filter(p => p.status === "out_of_stock").length;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <AppSidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <div className="flex-1 overflow-auto p-4 lg:p-6 space-y-6">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">Products</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage your product inventory</p>
              </div>
              <Button 
                onClick={handleAddProduct}
                className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-shadow">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Products</p>
                      <p className="text-2xl lg:text-3xl font-bold text-blue-900 dark:text-blue-100">{products.length}</p>
                    </div>
                    <Package className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-emerald-600">Active</p>
                      <p className="text-2xl lg:text-3xl font-bold text-emerald-900">{activeProducts}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-emerald-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-600">Low Stock</p>
                      <p className="text-2xl lg:text-3xl font-bold text-amber-900">{lowStockProducts}</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-amber-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-600">Out of Stock</p>
                      <p className="text-2xl lg:text-3xl font-bold text-red-900">{outOfStockProducts}</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <FilterBar
              searchPlaceholder="Search products by name, category, or SKU..."
              statusOptions={statusOptions}
              categoryOptions={categoryOptions}
              onSearch={handleSearch}
              onStatusFilter={handleStatusFilter}
              onCategoryFilter={handleCategoryFilter}
              showStatusFilter
              showCategoryFilter
            />

            {/* Products Table */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b">
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Product List ({filteredProducts.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800 border-b">
                      <tr className="text-left">
                        <th className="p-4 font-semibold text-gray-700 dark:text-gray-300">Product</th>
                        <th className="p-4 font-semibold text-gray-700 dark:text-gray-300 hidden lg:table-cell">SKU</th>
                        <th className="p-4 font-semibold text-gray-700 dark:text-gray-300">Category</th>
                        <th className="p-4 font-semibold text-gray-700 dark:text-gray-300">Price</th>
                        <th className="p-4 font-semibold text-gray-700 dark:text-gray-300 hidden sm:table-cell">Stock</th>
                        <th className="p-4 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                        <th className="p-4 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => (
                        <tr key={product.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img 
                                src={product.image} 
                                alt={product.name} 
                                className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 object-cover" 
                              />
                              <div>
                                <span className="font-medium text-gray-900 dark:text-gray-100">{product.name}</span>
                                <p className="text-sm text-gray-500 dark:text-gray-400 lg:hidden">SKU: {product.sku}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-gray-600 dark:text-gray-400 hidden lg:table-cell">{product.sku}</td>
                          <td className="p-4 text-gray-600 dark:text-gray-400">{product.category}</td>
                          <td className="p-4 font-semibold text-gray-900 dark:text-gray-100">${product.price}</td>
                          <td className="p-4 text-gray-600 dark:text-gray-400 hidden sm:table-cell">{product.stock}</td>
                          <td className="p-4">{getStatusBadge(product.status)}</td>
                          <td className="p-4">
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" onClick={() => handleEditProduct(product)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Product</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{product.name}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteProduct(product.id)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        product={selectedProduct}
        mode={modalMode}
      />
    </SidebarProvider>
  );
};

export default Products;
