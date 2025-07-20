
import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdvancedFilterBar } from "@/components/AdvancedFilterBar";
import { ExportButton } from "@/components/ui/export-button";
import { AdminProductModal } from "@/components/AdminProductModal";
import { MassUploadModal } from "@/components/MassUploadModal";
import { Plus, Package, TrendingUp, AlertTriangle, Edit, Trash2, Eye, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportToExcel, exportToPDF } from "@/utils/exportUtils";
import { useAdminProducts, useDeleteProduct, useCreateProduct, useUpdateProduct } from "@/hooks/useAdminProducts";
import { AdminProductAPI, CreateProductData } from "@/services/adminProductService";
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

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "draft", label: "Draft" },
];

const Products = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedProduct, setSelectedProduct] = useState<AdminProductAPI | null>(null);
  const [isMassUploadOpen, setIsMassUploadOpen] = useState(false);
  const { toast } = useToast();

  // Mutations
  const deleteProductMutation = useDeleteProduct();
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();

  // Use the admin products API
  const { data: productsData, isLoading, error } = useAdminProducts({
    q: searchQuery || undefined,
    status: statusFilter as 'active' | 'inactive' | 'draft' || undefined,
    page: currentPage,
    limit: 25
  });

  const products = Array.isArray(productsData?.products) ? productsData.products : [];
  const pagination = productsData?.pagination;

  const handleSearch = (term: string) => {
    setSearchQuery(term);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleExportExcel = () => {
    const exportData = products.map(product => {
      const basePrice = product.product_prices?.[0]?.net_price || 0;
      return {
        'Name': product.name,
        'SKU': product.sku,
        'Slug': product.slug,
        'Status': product.status,
        'Short Description': product.short_description || '',
        'Long Description': product.long_description || '',
        'Category ID': product.category_id || '',
        'Store ID': product.store_id || '',
        'Base Price': basePrice,
        'Has Variants': product.has_variants ? 'true' : 'false',
        'Is Featured': product.is_featured ? 'true' : 'false',
        'Is On Sale': product.is_on_sale ? 'true' : 'false',
        'Is New Arrival': product.is_new_arrival ? 'true' : 'false',
        'Is Seller Product': product.is_seller_product ? 'true' : 'false',
        'Cover Image': product.cover_image || '',
        'Available Countries': product.variants?.[0]?.available_countries?.join(',') || '',
        'Specifications': product.specifications?.map(s => `${s.name}:${s.value}`).join(';') || ''
      };
    });
    
    exportToExcel(exportData, 'admin-products-export', 'Admin Products');
    toast({
      title: "Export Successful",
      description: "Products data has been exported to Excel file"
    });
  };

  const handleExportPDF = () => {
    const exportData = products.map(product => ({
      name: product.name,
      sku: product.sku,
      status: product.status,
      price: product.product_prices?.[0]?.net_price?.toString() || '0',
      type: product.has_variants ? 'Variable' : 'Simple',
      featured: product.is_featured ? 'Yes' : 'No',
      sale: product.is_on_sale ? 'Yes' : 'No'
    }));

    const columns = [
      { header: 'Product Name', dataKey: 'name' },
      { header: 'SKU', dataKey: 'sku' },
      { header: 'Status', dataKey: 'status' },
      { header: 'Price', dataKey: 'price' },
      { header: 'Type', dataKey: 'type' },
      { header: 'Featured', dataKey: 'featured' },
      { header: 'On Sale', dataKey: 'sale' }
    ];

    exportToPDF(exportData, 'admin-products-export', 'Products Report', columns);
    toast({
      title: "Export Successful",
      description: "Products data has been exported to PDF file"
    });
  };

  const handleDeleteProduct = (productId: number) => {
    deleteProductMutation.mutate(productId);
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: AdminProductAPI) => {
    setSelectedProduct(product);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSaveProduct = (productData: CreateProductData) => {
    if (modalMode === 'add') {
      createProductMutation.mutate(productData);
    } else if (selectedProduct) {
      updateProductMutation.mutate({
        id: selectedProduct.id,
        data: productData
      });
    }
    setIsModalOpen(false);
  };

  const handleMassUpload = () => {
    setIsMassUploadOpen(true);
  };

  const handleMassUploadComplete = async (data: any[]) => {
    try {
      // Process each product in the uploaded data
      const promises = data.map(async (productData) => {
        const createData: CreateProductData = {
          name: productData.name,
          slug: productData.slug || productData.name.toLowerCase().replace(/\s+/g, '-'),
          sku: productData.sku,
          short_description: productData.short_description || '',
          long_description: productData.long_description || '',
          status: productData.status || 'draft',
          category_id: parseInt(productData.category_id) || 1,
          store_id: productData.store_id ? parseInt(productData.store_id) : undefined,
          has_variants: productData.has_variants === 'true' || productData.has_variants === true,
          is_featured: productData.is_featured === 'true' || productData.is_featured === true,
          is_on_sale: productData.is_on_sale === 'true' || productData.is_on_sale === true,
          is_new_arrival: productData.is_new_arrival === 'true' || productData.is_new_arrival === true,
          is_seller_product: productData.is_seller_product === 'true' || productData.is_seller_product === true,
          available_countries: productData.available_countries ? 
            productData.available_countries.split(',').map((id: string) => parseInt(id.trim())) : 
            [1], // Default to country ID 1
          product_prices: productData.base_price ? [{
            country_id: 1,
            net_price: parseFloat(productData.base_price),
            cost: parseFloat(productData.cost || productData.base_price) * 0.7, // 70% of price as cost
            vat_percentage: parseFloat(productData.vat_percentage || '20')
          }] : undefined,
          specifications: productData.specifications ? 
            productData.specifications.split(';').map((spec: string) => {
              const [name, value] = spec.split(':');
              return { name: name?.trim() || '', value: value?.trim() || '' };
            }).filter((spec: any) => spec.name && spec.value) : 
            undefined
        };

        return createProductMutation.mutateAsync(createData);
      });

      await Promise.all(promises);
      
      toast({
        title: "Mass Upload Successful",
        description: `Successfully uploaded ${data.length} products`
      });
      setIsMassUploadOpen(false);
    } catch (error) {
      console.error('Mass upload error:', error);
      toast({
        title: "Upload Error",
        description: "Some products failed to upload. Please check the data and try again.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200">Active</Badge>;
      case "inactive":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Inactive</Badge>;
      case "draft":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Draft</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const activeProducts = products.filter(p => p.status === "active").length;
  const inactiveProducts = products.filter(p => p.status === "inactive").length;
  const draftProducts = products.filter(p => p.status === "draft").length;

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <AppSidebar />
          <main className="flex-1 flex flex-col overflow-hidden">
            <DashboardHeader />
            <div className="flex-1 overflow-auto p-4 lg:p-6 space-y-6">
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="ml-4 text-gray-600">Loading products...</p>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  if (error) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <AppSidebar />
          <main className="flex-1 flex flex-col overflow-hidden">
            <DashboardHeader />
            <div className="flex-1 overflow-auto p-4 lg:p-6 space-y-6">
              <div className="flex items-center justify-center py-12">
                <p className="text-red-600">Error loading products: {error.message}</p>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

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
              <div className="flex gap-2">
                <Button 
                  onClick={handleMassUpload}
                  variant="outline"
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Mass Upload
                </Button>
                <Button 
                  onClick={handleAddProduct}
                  className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
                  Add Product
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-shadow">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Products</p>
                      <p className="text-2xl lg:text-3xl font-bold text-blue-900 dark:text-blue-100">{pagination?.total || 0}</p>
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
                      <p className="text-sm font-medium text-amber-600">Draft</p>
                      <p className="text-2xl lg:text-3xl font-bold text-amber-900">{draftProducts}</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-amber-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-600">Inactive</p>
                      <p className="text-2xl lg:text-3xl font-bold text-red-900">{inactiveProducts}</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Advanced Filters */}
            <AdvancedFilterBar
              searchPlaceholder="Search products by name, SKU..."
              statusOptions={statusOptions}
              onSearch={handleSearch}
              onStatusFilter={handleStatusFilter}
              onExportExcel={handleExportExcel}
              showStatusFilter
              showExcelExport={false}
              exportLabel="Export"
              exportButton={<ExportButton onExportExcel={handleExportExcel} onExportPDF={handleExportPDF} />}
            />

            {/* Products Table */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b">
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Product List ({products.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800 border-b">
                      <tr className="text-left">
                        <th className="p-4 font-semibold text-gray-700 dark:text-gray-300">Product</th>
                        <th className="p-4 font-semibold text-gray-700 dark:text-gray-300 hidden lg:table-cell">SKU</th>
                        <th className="p-4 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                        <th className="p-4 font-semibold text-gray-700 dark:text-gray-300 hidden sm:table-cell">Type</th>
                        <th className="p-4 font-semibold text-gray-700 dark:text-gray-300">Flags</th>
                        <th className="p-4 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product: AdminProductAPI) => (
                        <tr key={product.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <img 
                                  src={product.cover_image || "/placeholder.svg"} 
                                  alt={product.name} 
                                  className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-700 object-cover" 
                                />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900 dark:text-gray-100">{product.name}</span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 lg:hidden">SKU: {product.sku}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-gray-600 dark:text-gray-400 hidden lg:table-cell">{product.sku}</td>
                          <td className="p-4">{getStatusBadge(product.status)}</td>
                          <td className="p-4 text-gray-600 dark:text-gray-400 hidden sm:table-cell">
                            {product.has_variants ? 'Variable' : 'Simple'}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-1 flex-wrap">
                              {product.is_featured && <Badge className="bg-blue-100 text-blue-800 text-xs">Featured</Badge>}
                              {product.is_on_sale && <Badge className="bg-green-100 text-green-800 text-xs">Sale</Badge>}
                              {product.is_new_arrival && <Badge className="bg-purple-100 text-purple-800 text-xs">New</Badge>}
                              {product.is_seller_product && <Badge className="bg-orange-100 text-orange-800 text-xs">Seller</Badge>}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditProduct(product)}
                              >
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

                {/* Pagination */}
                {pagination && pagination.last_page > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t">
                    <div className="text-sm text-gray-500">
                      Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} results
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(pagination.current_page - 1)}
                        disabled={pagination.current_page <= 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(pagination.current_page + 1)}
                        disabled={pagination.current_page >= pagination.last_page}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Product Modal */}
            <AdminProductModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSave={handleSaveProduct}
              product={selectedProduct}
              mode={modalMode}
            />

            {/* Mass Upload Modal */}
            <MassUploadModal
              isOpen={isMassUploadOpen}
              onClose={() => setIsMassUploadOpen(false)}
              type="products"
              onUploadComplete={handleMassUploadComplete}
            />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Products;
