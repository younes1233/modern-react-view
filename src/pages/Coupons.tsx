import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Download,
  Tag,
  TrendingUp,
  Users,
  Calendar as CalendarIcon,
  Percent,
  DollarSign,
  Package,
  Gift
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  minOrderAmount: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  description: string;
  applicableProducts?: string[];
  applicableCategories?: string[];
}

const initialCoupons: Coupon[] = [
  {
    id: '1',
    code: 'WELCOME20',
    type: 'percentage',
    value: 20,
    minOrderAmount: 50,
    maxDiscount: 100,
    usageLimit: 100,
    usedCount: 45,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    isActive: true,
    description: 'Welcome discount for new customers',
    applicableCategories: ['electronics', 'clothing']
  },
  {
    id: '2',
    code: 'FREESHIP',
    type: 'free_shipping',
    value: 0,
    minOrderAmount: 75,
    usageLimit: 500,
    usedCount: 234,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    isActive: true,
    description: 'Free shipping on orders over $75'
  },
  {
    id: '3',
    code: 'SAVE50',
    type: 'fixed',
    value: 50,
    minOrderAmount: 200,
    usageLimit: 50,
    usedCount: 23,
    startDate: new Date('2024-06-01'),
    endDate: new Date('2024-06-30'),
    isActive: false,
    description: '$50 off on orders over $200'
  }
];

const initialPackageDiscounts = [
  {
    id: '1',
    name: 'Buy 3 Get 15% Off',
    description: 'Get 15% off when you buy 3 or more items',
    discountType: 'percentage' as const,
    discountValue: 15,
    minQuantity: 3,
    maxQuantity: 10,
    applicableProducts: [],
    applicableCategories: ['electronics', 'clothing'],
    isActive: true,
    validUntil: '2024-12-31',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    name: 'Buy 2 Get 1 Free',
    description: 'Buy any 2 items and get the 3rd one free',
    discountType: 'buy_x_get_y' as const,
    discountValue: 1,
    minQuantity: 2,
    maxQuantity: 20,
    applicableProducts: [],
    applicableCategories: [],
    isActive: true,
    validUntil: '',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
  }
];

const Coupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [newCoupon, setNewCoupon] = useState<Partial<Coupon>>({
    type: 'percentage',
    isActive: true,
    usageLimit: 100,
    usedCount: 0,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  });

  const [packageDiscounts, setPackageDiscounts] = useState(initialPackageDiscounts);
  const [activeTab, setActiveTab] = useState<'coupons' | 'packages'>('coupons');
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<any>(null);

  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         coupon.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "active" && coupon.isActive) ||
                         (filterStatus === "inactive" && !coupon.isActive) ||
                         (filterStatus === "expired" && new Date() > coupon.endDate);
    return matchesSearch && matchesStatus;
  });

  const handleCreateCoupon = () => {
    if (newCoupon.code && newCoupon.type && newCoupon.value !== undefined) {
      const coupon: Coupon = {
        id: Date.now().toString(),
        code: newCoupon.code,
        type: newCoupon.type,
        value: newCoupon.value,
        minOrderAmount: newCoupon.minOrderAmount || 0,
        maxDiscount: newCoupon.maxDiscount,
        usageLimit: newCoupon.usageLimit || 100,
        usedCount: 0,
        startDate: newCoupon.startDate || new Date(),
        endDate: newCoupon.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: newCoupon.isActive !== false,
        description: newCoupon.description || '',
        applicableProducts: newCoupon.applicableProducts,
        applicableCategories: newCoupon.applicableCategories
      };
      setCoupons([...coupons, coupon]);
      setNewCoupon({
        type: 'percentage',
        isActive: true,
        usageLimit: 100,
        usedCount: 0,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
      setIsCreateModalOpen(false);
    }
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setNewCoupon(coupon);
    setIsCreateModalOpen(true);
  };

  const handleUpdateCoupon = () => {
    if (editingCoupon && newCoupon.code) {
      setCoupons(coupons.map(c => c.id === editingCoupon.id ? { ...editingCoupon, ...newCoupon } : c));
      setEditingCoupon(null);
      setNewCoupon({
        type: 'percentage',
        isActive: true,
        usageLimit: 100,
        usedCount: 0,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
      setIsCreateModalOpen(false);
    }
  };

  const handleDeleteCoupon = (id: string) => {
    setCoupons(coupons.filter(c => c.id !== id));
  };

  const toggleCouponStatus = (id: string) => {
    setCoupons(coupons.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage': return <Percent className="w-4 h-4" />;
      case 'fixed': return <DollarSign className="w-4 h-4" />;
      case 'free_shipping': return <Package className="w-4 h-4" />;
      default: return <Tag className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'percentage': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'fixed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'free_shipping': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter(c => c.isActive).length;
  const totalUsage = coupons.reduce((sum, c) => sum + c.usedCount, 0);
  const averageUsage = totalCoupons > 0 ? Math.round(totalUsage / totalCoupons) : 0;

  const handleCreatePackageDiscount = (packageData: any) => {
    const errors = validatePackageDiscount(packageData);
    if (errors.length > 0) {
      console.error('Validation errors:', errors);
      return;
    }
    setPackageDiscounts([...packageDiscounts, packageData]);
  };

  const handleEditPackageDiscount = (packageDiscount: any) => {
    setEditingPackage(packageDiscount);
    setIsPackageModalOpen(true);
  };

  const handleUpdatePackageDiscount = (packageData: any) => {
    const errors = validatePackageDiscount(packageData);
    if (errors.length > 0) {
      console.error('Validation errors:', errors);
      return;
    }
    setPackageDiscounts(packageDiscounts.map(p => p.id === packageData.id ? packageData : p));
    setEditingPackage(null);
  };

  const handleDeletePackageDiscount = (id: string) => {
    setPackageDiscounts(packageDiscounts.filter(p => p.id !== id));
  };

  const togglePackageStatus = (id: string) => {
    setPackageDiscounts(packageDiscounts.map(p => 
      p.id === id ? { ...p, isActive: !p.isActive } : p
    ));
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <AppSidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <div className="flex-1 overflow-auto p-6 space-y-8">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Coupons & Discounts</h1>
                <p className="text-muted-foreground">Manage promotional codes and discount campaigns</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant={activeTab === 'coupons' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('coupons')}
                >
                  <Tag className="w-4 h-4 mr-2" />
                  Coupons
                </Button>
                <Button 
                  variant={activeTab === 'packages' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('packages')}
                >
                  <Package className="w-4 h-4 mr-2" />
                  Package Deals
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Total Coupons</p>
                      <p className="text-3xl font-bold">{totalCoupons}</p>
                    </div>
                    <Tag className="w-8 h-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Active Coupons</p>
                      <p className="text-3xl font-bold">{activeCoupons}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100">Total Usage</p>
                      <p className="text-3xl font-bold">{totalUsage}</p>
                    </div>
                    <Users className="w-8 h-8 text-purple-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100">Avg. Usage</p>
                      <p className="text-3xl font-bold">{averageUsage}</p>
                    </div>
                    <Gift className="w-8 h-8 text-orange-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {activeTab === 'coupons' && (
              <>
                {/* Filters and Search */}
                <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          placeholder="Search coupons..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Coupons</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Coupons Table */}
                <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Coupon Management</CardTitle>
                      <CardDescription>
                        Manage your promotional codes and track their performance
                      </CardDescription>
                    </div>
                    <Button onClick={() => setIsCreateModalOpen(true)} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Coupon
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Code</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>Usage</TableHead>
                          <TableHead>Validity</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCoupons.map((coupon) => (
                          <TableRow key={coupon.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {getTypeIcon(coupon.type)}
                                <div>
                                  <div className="font-mono text-sm">{coupon.code}</div>
                                  <div className="text-xs text-muted-foreground">{coupon.description}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getTypeColor(coupon.type)}>
                                {coupon.type.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {coupon.type === 'percentage' ? `${coupon.value}%` :
                               coupon.type === 'fixed' ? `$${coupon.value}` :
                               'Free Shipping'}
                              {coupon.minOrderAmount > 0 && (
                                <div className="text-xs text-muted-foreground">
                                  Min: ${coupon.minOrderAmount}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="text-sm">{coupon.usedCount} / {coupon.usageLimit}</div>
                                <div className="w-16 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all" 
                                    style={{ width: `${Math.min((coupon.usedCount / coupon.usageLimit) * 100, 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{format(coupon.startDate, "MMM dd")}</div>
                                <div className="text-muted-foreground">to {format(coupon.endDate, "MMM dd, yyyy")}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={coupon.isActive}
                                  onCheckedChange={() => toggleCouponStatus(coupon.id)}
                                />
                                <Badge variant={coupon.isActive ? "default" : "secondary"}>
                                  {coupon.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditCoupon(coupon)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteCoupon(coupon.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Create/Edit Coupon Modal */}
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingCoupon ? 'Edit' : 'Create'} Coupon</DialogTitle>
                      <DialogDescription>
                        {editingCoupon ? 'Update' : 'Create a new'} promotional coupon for your store
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-6 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="code">Coupon Code</Label>
                          <Input
                            id="code"
                            value={newCoupon.code || ''}
                            onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                            placeholder="WELCOME20"
                            className="font-mono"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="type">Discount Type</Label>
                          <Select value={newCoupon.type} onValueChange={(value) => setNewCoupon({ ...newCoupon, type: value as any })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="percentage">Percentage</SelectItem>
                              <SelectItem value="fixed">Fixed Amount</SelectItem>
                              <SelectItem value="free_shipping">Free Shipping</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {newCoupon.type !== 'free_shipping' && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="value">
                              {newCoupon.type === 'percentage' ? 'Percentage (%)' : 'Amount ($)'}
                            </Label>
                            <Input
                              id="value"
                              type="number"
                              value={newCoupon.value || ''}
                              onChange={(e) => setNewCoupon({ ...newCoupon, value: Number(e.target.value) })}
                              placeholder={newCoupon.type === 'percentage' ? '20' : '50'}
                            />
                          </div>
                          {newCoupon.type === 'percentage' && (
                            <div className="space-y-2">
                              <Label htmlFor="maxDiscount">Max Discount ($)</Label>
                              <Input
                                id="maxDiscount"
                                type="number"
                                value={newCoupon.maxDiscount || ''}
                                onChange={(e) => setNewCoupon({ ...newCoupon, maxDiscount: Number(e.target.value) })}
                                placeholder="100"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="minOrder">Minimum Order ($)</Label>
                          <Input
                            id="minOrder"
                            type="number"
                            value={newCoupon.minOrderAmount || ''}
                            onChange={(e) => setNewCoupon({ ...newCoupon, minOrderAmount: Number(e.target.value) })}
                            placeholder="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="usageLimit">Usage Limit</Label>
                          <Input
                            id="usageLimit"
                            type="number"
                            value={newCoupon.usageLimit || ''}
                            onChange={(e) => setNewCoupon({ ...newCoupon, usageLimit: Number(e.target.value) })}
                            placeholder="100"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={newCoupon.description || ''}
                          onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                          placeholder="Brief description of the coupon"
                          rows={3}
                        />
                      </div>

                      <Separator />

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="active"
                          checked={newCoupon.isActive !== false}
                          onCheckedChange={(checked) => setNewCoupon({ ...newCoupon, isActive: checked })}
                        />
                        <Label htmlFor="active">Activate coupon immediately</Label>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={editingCoupon ? handleUpdateCoupon : handleCreateCoupon}>
                        {editingCoupon ? 'Update' : 'Create'} Coupon
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            )}

            {activeTab === 'packages' && (
              <>
                {/* Package Discounts Section */}
                <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Package Discounts</CardTitle>
                      <CardDescription>
                        Manage bulk purchase discounts and bundle deals
                      </CardDescription>
                    </div>
                    <Button 
                      onClick={() => setIsPackageModalOpen(true)} 
                      className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Package Deal
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Package Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Discount</TableHead>
                          <TableHead>Quantity Range</TableHead>
                          <TableHead>Applicable To</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {packageDiscounts.map((packageDiscount) => (
                          <TableRow key={packageDiscount.id}>
                            <TableCell className="font-medium">
                              <div>
                                <div className="font-semibold">{packageDiscount.name}</div>
                                <div className="text-xs text-muted-foreground">{packageDiscount.description}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getTypeColor(packageDiscount.discountType)}>
                                {packageDiscount.discountType.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {packageDiscount.discountType === 'percentage' ? `${packageDiscount.discountValue}%` :
                               packageDiscount.discountType === 'fixed' ? `$${packageDiscount.discountValue}` :
                               `Get ${packageDiscount.discountValue} Free`}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {packageDiscount.minQuantity} - {packageDiscount.maxQuantity || '∞'} items
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                {packageDiscount.applicableCategories.length > 0 && (
                                  <div className="text-xs">Categories: {packageDiscount.applicableCategories.join(', ')}</div>
                                )}
                                {packageDiscount.applicableProducts.length > 0 && (
                                  <div className="text-xs">Products: {packageDiscount.applicableProducts.length} specific</div>
                                )}
                                {packageDiscount.applicableCategories.length === 0 && packageDiscount.applicableProducts.length === 0 && (
                                  <div className="text-xs text-muted-foreground">All products</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={packageDiscount.isActive}
                                  onCheckedChange={() => togglePackageStatus(packageDiscount.id)}
                                />
                                <Badge variant={packageDiscount.isActive ? "default" : "secondary"}>
                                  {packageDiscount.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditPackageDiscount(packageDiscount)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeletePackageDiscount(packageDiscount.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Package Discount Modal */}
                <PackageDiscountModal
                  isOpen={isPackageModalOpen}
                  onClose={() => {
                    setIsPackageModalOpen(false);
                    setEditingPackage(null);
                  }}
                  onSave={editingPackage ? handleUpdatePackageDiscount : handleCreatePackageDiscount}
                  editingPackage={editingPackage}
                />
              </>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Coupons;
