import React, { useState } from 'react';
import {
  useAdminProducts,
  useDeleteProduct,
  useCreateProduct,
  useUpdateProduct,
} from '@/hooks/useAdminProducts';
import { AdminProductAPI, CreateProductData } from '@/services/adminProductService';
import { toast } from 'sonner';
import { Sidebar, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AdminProductModal } from '@/components/AdminProductModal';
import { MassUploadModal } from '@/components/MassUploadModal';
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash,
  Upload,
  Search,
  Filter,
  Download,
  Package,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { exportToExcel, exportToPDF } from '@/utils/exportUtils';

export default function Products() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedProduct, setSelectedProduct] = useState<AdminProductAPI | null>(
    null,
  );
  const [isMassUploadModalOpen, setIsMassUploadModalOpen] = useState(false);

  // Fetch products data
  const { data: productsData, isLoading, error, refetch } = useAdminProducts({
    q: searchQuery || undefined,
    status: statusFilter === 'all' ? undefined : (statusFilter as any) || undefined,
    page: currentPage,
    limit: 25,
  });

  // Mutations
  const deleteProductMutation = useDeleteProduct();
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();

  const products = productsData?.products || [];
  const pagination = productsData?.pagination;

  // Event handlers
  const handleSearch = (term: string) => {
    setSearchQuery(term);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status === 'all' ? '' : status);
    setCurrentPage(1);
  };

  const handleExportExcel = () => {
    if (products.length === 0) {
      toast.error('No data to export');
      return;
    }

    const exportData = products.map((product) => ({
      ID: product.id,
      Name: product.name,
      SKU: product.identifiers?.sku || 'N/A',
      Status: product.status,
      Category: product.category?.name || 'N/A',
      Store: product.store?.store_name || 'N/A',
      'Has Variants': product.variants?.length > 0 ? 'Yes' : 'No',
      'On Sale': product.flags?.on_sale ? 'Yes' : 'No',
      Featured: product.flags?.is_featured ? 'Yes' : 'No',
      'New Arrival': product.flags?.is_new_arrival ? 'Yes' : 'No',
      'Seller Product': product.flags?.seller_product_status || 'N/A',
      'Created At': new Date(product.meta?.created_at || Date.now()).toLocaleDateString(),
    }));

    exportToExcel(exportData, 'products');
  };

  const handleExportPDF = () => {
    if (products.length === 0) {
      toast.error('No data to export');
      return;
    }

    const exportData = products.map((product) => [
      product.id.toString(),
      product.name,
      product.identifiers?.sku || 'N/A',
      product.status,
      product.category?.name || 'N/A',
      product.store?.store_name || 'N/A',
      product.variants?.length > 0 ? 'Yes' : 'No',
    ]);

    const headers = [
      { header: 'ID', dataKey: 'id' },
      { header: 'Name', dataKey: 'name' },
      { header: 'SKU', dataKey: 'sku' },
      { header: 'Status', dataKey: 'status' },
      { header: 'Category', dataKey: 'category' },
      { header: 'Store', dataKey: 'store' },
      { header: 'Has Variants', dataKey: 'hasVariants' },
    ];

    exportToPDF(exportData, 'products', 'Products Report', headers);
  };

  const handleDeleteProduct = (productId: number) => {
    deleteProductMutation.mutate(productId, {
      onSuccess: () => {
        toast.success('Product deleted successfully');
        refetch();
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to delete product');
      },
    });
  };

  // Modal handlers
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
      createProductMutation.mutate(productData, {
        onSuccess: () => {
          toast.success('Product created successfully');
          setIsModalOpen(false);
          refetch();
        },
        onError: (error: any) => {
          toast.error(error.message || 'Failed to create product');
        },
      });
    } else if (modalMode === 'edit' && selectedProduct) {
      updateProductMutation.mutate({ id: selectedProduct.id, data: productData }, {
        onSuccess: () => {
          toast.success('Product updated successfully');
          setIsModalOpen(false);
          refetch();
        },
        onError: (error: any) => {
          toast.error(error.message || 'Failed to update product');
        },
      });
    }
  };

  const handleMassUpload = () => {
    setIsMassUploadModalOpen(true);
  };

  const handleMassUploadComplete = async (data: any[]) => {
    try {
      const promises = data.map((item) =>
        createProductMutation.mutateAsync({
          name: item.name,
          slug: item.slug || item.name.toLowerCase().replace(/\s+/g, '-'),
          sku: item.sku,
          description: item.description || '',
          status: item.status || 'active',
          category_id: parseInt(item.category_id),
          has_variants: Boolean(item.has_variants),
          is_seller_product: Boolean(item.is_seller_product),
          is_on_sale: Boolean(item.is_on_sale),
          is_featured: Boolean(item.is_featured),
          is_new_arrival: Boolean(item.is_new_arrival),
        }),
      );

      await Promise.all(promises);
      toast.success(`Successfully uploaded ${data.length} products`);
      setIsMassUploadModalOpen(false);
      refetch();
    } catch (error: any) {
      toast.error('Failed to upload some products');
    }
  };

  // Utility functions
  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      inactive: 'secondary',
      draft: 'outline',
    };

    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const getSellerStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      approved: 'default',
      pending: 'secondary',
      rejected: 'destructive',
      draft: 'outline',
    };

    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  if (error) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <DashboardHeader />
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-lg font-semibold text-red-600">Error loading products</p>
                <p className="text-gray-600">{error.message}</p>
                <Button onClick={() => refetch()} className="mt-4">
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  const activeProducts = products.filter((p) => p.status === 'active').length;
  const inactiveProducts = products.filter((p) => p.status === 'inactive').length;
  const draftProducts = products.filter((p) => p.status === 'draft').length;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        {/* Make the main content area a flex column with overflow handling */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          {/* This inner container scrolls vertically and horizontally when content overflows */}
          <div className="flex-1 overflow-auto space-y-4 p-4 md:p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                <p className="text-muted-foreground">Manage your product inventory</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={handleExportExcel}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Excel
                </Button>
                <Button variant="outline" onClick={handleExportPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button variant="outline" onClick={handleMassUpload}>
                  <Upload className="h-4 w-4 mr-2" />
                  Mass Upload
                </Button>
                <Button onClick={handleAddProduct}>
                  <Plus className="h-4 w-4 mr-2" />
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

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={handleStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Products Table */}
            <Card>
              <CardHeader>
                <CardTitle>Products ({pagination?.total || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Image</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Store</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Seller Status</TableHead>
                          <TableHead>Variants</TableHead>
                          <TableHead>Pricing</TableHead>
                          <TableHead>Flags</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>
                              {product.media?.cover_image ? (
                                <img
                                  src={product.media.cover_image.image}
                                  alt={product.media.cover_image.alt_text}
                                  className="h-12 w-12 rounded-md object-cover"
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center">
                                  <span className="text-xs text-muted-foreground">No image</span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{product.name}</div>
                                <div className="text-sm text-muted-foreground truncate max-w-xs">
                                  {product.description}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {product.identifiers?.sku || 'N/A'}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {product.category?.path?.map((cat, index) => (
                                  <span key={cat.id}>
                                    {index > 0 && ' > '}
                                    {cat.name}
                                  </span>
                                )) || product.category?.name || 'N/A'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{product.store?.store_name || 'N/A'}</div>
                                <div className="text-xs text-muted-foreground">
                                  {product.store?.store_type || 'N/A'}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(product.status)}</TableCell>
                            <TableCell>
                              {getSellerStatusBadge(product.flags?.seller_product_status || 'N/A')}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{product.variants?.length || 0} variants</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {product.pricing && product.pricing.length > 0 && (
                                  <div>
                                    {product.pricing[0].currency.symbol}
                                    {product.pricing[0].net_price}
                                    {product.pricing.length > 1 && (
                                      <span className="text-muted-foreground">
                                        {' '}
                                        +{product.pricing.length - 1} more
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {product.flags?.on_sale && (
                                  <Badge variant="secondary" className="text-xs">
                                    Sale
                                  </Badge>
                                )}
                                {product.flags?.is_featured && (
                                  <Badge variant="default" className="text-xs">
                                    Featured
                                  </Badge>
                                )}
                                {product.flags?.is_new_arrival && (
                                  <Badge variant="outline" className="text-xs">
                                    New
                                  </Badge>
                                )}
                                {product.flags?.is_best_seller && (
                                  <Badge variant="destructive" className="text-xs">
                                    Bestseller
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                        <Trash className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This action cannot be undone. This will permanently delete the product.
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
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      </Table>
                    </div>
                )}

                {/* Pagination */}
                {pagination && pagination.total > 0 && (
                  <div className="flex items-center justify-between space-x-2 py-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {(pagination.current_page - 1) * pagination.per_page + 1} to{' '}
                      {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
                      {pagination.total} products
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(pagination.current_page - 1)}
                        disabled={pagination.current_page === 1}
                      >
                        Previous
                      </Button>
                      <div className="text-sm">Page {pagination.current_page} of {pagination.last_page}</div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(pagination.current_page + 1)}
                        disabled={pagination.current_page === pagination.last_page}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* End of main content wrapper */}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AdminProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        mode={modalMode}
        product={selectedProduct}
      />

      <MassUploadModal
        isOpen={isMassUploadModalOpen}
        onClose={() => setIsMassUploadModalOpen(false)}
        onUploadComplete={handleMassUploadComplete}
        type="products"
      />
    </SidebarProvider>
  );
}