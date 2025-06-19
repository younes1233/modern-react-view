
import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Package, 
  Clock, 
  AlertCircle 
} from "lucide-react";
import { demoProducts, Product } from "@/data/users";
import { useToast } from "@/hooks/use-toast";

const ProductApproval = () => {
  const [products, setProducts] = useState<Product[]>(demoProducts);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const handleApprove = (productId: string) => {
    setProducts(prev => prev.map(product => 
      product.id === productId 
        ? { ...product, status: 'approved' as const }
        : product
    ));
    
    const product = products.find(p => p.id === productId);
    toast({
      title: "Product Approved",
      description: `${product?.name} has been approved for sale`,
    });
  };

  const handleReject = (productId: string, reason: string) => {
    setProducts(prev => prev.map(product => 
      product.id === productId 
        ? { ...product, status: 'rejected' as const, rejectionReason: reason }
        : product
    ));
    
    const product = products.find(p => p.id === productId);
    toast({
      title: "Product Rejected",
      description: `${product?.name} has been rejected`,
      variant: "destructive"
    });
    setRejectionReason("");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Rejected</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const pendingProducts = products.filter(p => p.status === 'pending');
  const approvedProducts = products.filter(p => p.status === 'approved');
  const rejectedProducts = products.filter(p => p.status === 'rejected');

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <AppSidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <div className="flex-1 overflow-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Package className="w-8 h-8 text-blue-600" />
                  Product Approval
                </h1>
                <p className="text-gray-600 dark:text-gray-400">Review and approve seller submissions</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <p className="text-2xl font-bold">{pendingProducts.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Approved</p>
                      <p className="text-2xl font-bold">{approvedProducts.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Rejected</p>
                      <p className="text-2xl font-bold">{rejectedProducts.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-2xl font-bold">{products.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Products Table */}
            <Card>
              <CardHeader>
                <CardTitle>Product Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Seller</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-10 h-10 rounded object-cover"
                            />
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-muted-foreground truncate max-w-32">
                                {product.description}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{product.sellerName}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>${product.price}</TableCell>
                        <TableCell>{getStatusBadge(product.status)}</TableCell>
                        <TableCell>
                          {new Date(product.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedProduct(product)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>{selectedProduct?.name}</DialogTitle>
                                  <DialogDescription>
                                    Review product details and approve or reject
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedProduct && (
                                  <div className="space-y-4">
                                    <img 
                                      src={selectedProduct.image} 
                                      alt={selectedProduct.name}
                                      className="w-full h-48 object-cover rounded"
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="text-sm font-medium">Price</label>
                                        <p className="text-lg font-bold">${selectedProduct.price}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Category</label>
                                        <p>{selectedProduct.category}</p>
                                      </div>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Description</label>
                                      <p className="text-sm text-muted-foreground">
                                        {selectedProduct.description}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Seller</label>
                                      <p>{selectedProduct.sellerName}</p>
                                    </div>
                                    {selectedProduct.status === 'rejected' && selectedProduct.rejectionReason && (
                                      <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded">
                                        <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                                          <AlertCircle className="w-4 h-4" />
                                          <span className="font-medium">Rejection Reason</span>
                                        </div>
                                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                          {selectedProduct.rejectionReason}
                                        </p>
                                      </div>
                                    )}
                                    
                                    {selectedProduct.status === 'pending' && (
                                      <div className="flex gap-2">
                                        <Button 
                                          onClick={() => handleApprove(selectedProduct.id)}
                                          className="flex-1 gap-2"
                                        >
                                          <CheckCircle className="w-4 h-4" />
                                          Approve
                                        </Button>
                                        <Dialog>
                                          <DialogTrigger asChild>
                                            <Button variant="destructive" className="flex-1 gap-2">
                                              <XCircle className="w-4 h-4" />
                                              Reject
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent>
                                            <DialogHeader>
                                              <DialogTitle>Reject Product</DialogTitle>
                                              <DialogDescription>
                                                Please provide a reason for rejecting this product
                                              </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                              <Textarea
                                                placeholder="Reason for rejection..."
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                              />
                                              <Button 
                                                variant="destructive" 
                                                onClick={() => {
                                                  handleReject(selectedProduct.id, rejectionReason);
                                                }}
                                                disabled={!rejectionReason.trim()}
                                                className="w-full"
                                              >
                                                Reject Product
                                              </Button>
                                            </div>
                                          </DialogContent>
                                        </Dialog>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            
                            {product.status === 'pending' && (
                              <>
                                <Button 
                                  size="sm" 
                                  onClick={() => handleApprove(product.id)}
                                  className="gap-1"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Approve
                                </Button>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="destructive" size="sm" className="gap-1">
                                      <XCircle className="w-4 h-4" />
                                      Reject
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Reject Product</DialogTitle>
                                      <DialogDescription>
                                        Please provide a reason for rejecting "{product.name}"
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <Textarea
                                        placeholder="Reason for rejection..."
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                      />
                                      <Button 
                                        variant="destructive" 
                                        onClick={() => {
                                          handleReject(product.id, rejectionReason);
                                        }}
                                        disabled={!rejectionReason.trim()}
                                        className="w-full"
                                      >
                                        Reject Product
                                      </Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ProductApproval;
