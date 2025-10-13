
import { useState } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, RotateCcw, Package } from "lucide-react";
import { toast } from '@/components/ui/sonner';

// Mock data for returns
const mockReturns = [
  {
    id: "RET-001",
    orderId: "ORD-2024-001",
    customerName: "John Smith",
    customerEmail: "john.smith@email.com",
    productName: "Wireless Headphones Pro",
    reason: "Defective product",
    status: "pending",
    requestDate: "2024-01-15",
    refundAmount: 149.99,
    description: "Left earbud stopped working after 2 days"
  },
  {
    id: "RET-002",
    orderId: "ORD-2024-002",
    customerName: "Sarah Johnson",
    customerEmail: "sarah.j@email.com",
    productName: "Smart Watch Series 5",
    reason: "Wrong item received",
    status: "approved",
    requestDate: "2024-01-14",
    refundAmount: 299.99,
    description: "Received Series 4 instead of Series 5"
  },
  {
    id: "RET-003",
    orderId: "ORD-2024-003",
    customerName: "Mike Wilson",
    customerEmail: "mike.w@email.com",
    productName: "Gaming Keyboard RGB",
    reason: "Not as described",
    status: "rejected",
    requestDate: "2024-01-13",
    refundAmount: 79.99,
    description: "RGB lighting doesn't match description"
  },
  {
    id: "RET-004",
    orderId: "ORD-2024-004",
    customerName: "Emma Davis",
    customerEmail: "emma.davis@email.com",
    productName: "Bluetooth Speaker",
    reason: "Changed mind",
    status: "processed",
    requestDate: "2024-01-12",
    refundAmount: 59.99,
    description: "No longer needed"
  }
];

const Returns = () => {
  const [returns, setReturns] = useState(mockReturns);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReturn, setSelectedReturn] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  // Removed useToast hook;

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      approved: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
      processed: "bg-blue-100 text-blue-800 border-blue-200"
    };

    const icons = {
      pending: <Clock className="w-3 h-3" />,
      approved: <CheckCircle className="w-3 h-3" />,
      rejected: <XCircle className="w-3 h-3" />,
      processed: <Package className="w-3 h-3" />
    };

    return (
      <Badge className={`${variants[status as keyof typeof variants]} flex items-center gap-1`}>
        {icons[status as keyof typeof icons]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredReturns = returns.filter(returnItem => {
    const matchesSearch = returnItem.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         returnItem.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         returnItem.productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || returnItem.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = (returnId: string, newStatus: string) => {
    setReturns(returns.map(returnItem => 
      returnItem.id === returnId ? { ...returnItem, status: newStatus } : returnItem
    ));
    toast({
      title: "Status Updated",
      description: `Return ${returnId} status changed to ${newStatus}`,
    });
  };

  const getStatusCounts = () => {
    return {
      total: returns.length,
      pending: returns.filter(r => r.status === 'pending').length,
      approved: returns.filter(r => r.status === 'approved').length,
      rejected: returns.filter(r => r.status === 'rejected').length,
      processed: returns.filter(r => r.status === 'processed').length
    };
  };

  const statusCounts = getStatusCounts();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50 dark:bg-gray-900">
        <AppSidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <div className="flex-1 overflow-auto p-6 space-y-6">
            {/* Header */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Returns Management</h1>
              <p className="text-gray-600 dark:text-gray-300">Manage customer return requests and refunds</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Returns</CardTitle>
                  <RotateCcw className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statusCounts.total}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Approved</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{statusCounts.approved}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                  <XCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{statusCounts.rejected}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Processed</CardTitle>
                  <Package className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{statusCounts.processed}</div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Returns List</CardTitle>
                <CardDescription>Manage and process customer return requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search by customer, order ID, or product..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="processed">Processed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Returns Table */}
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Return ID</TableHead>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReturns.map((returnItem) => (
                        <TableRow key={returnItem.id}>
                          <TableCell className="font-medium">{returnItem.id}</TableCell>
                          <TableCell>{returnItem.orderId}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{returnItem.customerName}</div>
                              <div className="text-sm text-gray-500">{returnItem.customerEmail}</div>
                            </div>
                          </TableCell>
                          <TableCell>{returnItem.productName}</TableCell>
                          <TableCell>{returnItem.reason}</TableCell>
                          <TableCell>${returnItem.refundAmount}</TableCell>
                          <TableCell>{getStatusBadge(returnItem.status)}</TableCell>
                          <TableCell>{returnItem.requestDate}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedReturn(returnItem);
                                  setIsDetailOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {returnItem.status === 'pending' && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-green-600 hover:text-green-700"
                                    onClick={() => handleStatusUpdate(returnItem.id, 'approved')}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700"
                                    onClick={() => handleStatusUpdate(returnItem.id, 'rejected')}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              {returnItem.status === 'approved' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-blue-600 hover:text-blue-700"
                                  onClick={() => handleStatusUpdate(returnItem.id, 'processed')}
                                >
                                  <Package className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Return Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Return Details - {selectedReturn?.id}</DialogTitle>
              <DialogDescription>
                Complete information about this return request
              </DialogDescription>
            </DialogHeader>
            {selectedReturn && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Return ID</Label>
                    <p className="text-sm text-gray-600">{selectedReturn.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Order ID</Label>
                    <p className="text-sm text-gray-600">{selectedReturn.orderId}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Customer</Label>
                    <p className="text-sm text-gray-600">{selectedReturn.customerName}</p>
                    <p className="text-xs text-gray-500">{selectedReturn.customerEmail}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Product</Label>
                    <p className="text-sm text-gray-600">{selectedReturn.productName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Reason</Label>
                    <p className="text-sm text-gray-600">{selectedReturn.reason}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Refund Amount</Label>
                    <p className="text-sm text-gray-600">${selectedReturn.refundAmount}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="mt-1">{getStatusBadge(selectedReturn.status)}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Request Date</Label>
                    <p className="text-sm text-gray-600">{selectedReturn.requestDate}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-gray-600 mt-1">{selectedReturn.description}</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarProvider>
  );
};

export default Returns;
