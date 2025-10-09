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
import { PackageDiscountModal } from "@/components/coupons/PackageDiscountModal";
import { DiscountModal } from "@/components/coupons/DiscountModal";
import { useDiscounts, useCoupons, useDiscountAnalytics } from "@/hooks/useDiscounts";
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
  Gift,
  Globe,
  Store,
  Zap
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

const validatePackageDiscount = (packageData: any): string[] => {
  const errors: string[] = [];
  
  if (!packageData.name || packageData.name.trim() === '') {
    errors.push('Package name is required');
  }
  
  if (!packageData.discountType) {
    errors.push('Discount type is required');
  }
  
  if (packageData.discountValue === undefined || packageData.discountValue < 0) {
    errors.push('Discount value must be a positive number');
  }
  
  if (packageData.minQuantity < 1) {
    errors.push('Minimum quantity must be at least 1');
  }
  
  if (packageData.maxQuantity && packageData.maxQuantity < packageData.minQuantity) {
    errors.push('Maximum quantity must be greater than minimum quantity');
  }
  
  return errors;
};

const Coupons = () => {
  // Real backend hooks
  const { 
    discounts, 
    loading: discountsLoading, 
    createDiscount, 
    updateDiscount, 
    deleteDiscount, 
    toggleDiscountStatus,
    formatDiscountValue,
    getDiscountScope,
    getDiscountStatus
  } = useDiscounts({ autoFetch: true });
  
  // Temporarily disabled coupons to test authentication issue
  const coupons = [];
  const couponsLoading = false;
  const createCoupon = async () => {};
  const updateCoupon = async () => {};
  const deleteCoupon = async () => {};
  // const { 
  //   coupons, 
  //   loading: couponsLoading, 
  //   createCoupon, 
  //   updateCoupon, 
  //   deleteCoupon 
  // } = useCoupons();
  
  // Temporarily disabled analytics to test other endpoints
  // const { analytics } = useDiscountAnalytics();

  // UI State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<'discounts' | 'coupons' | 'packages'>('discounts');
  
  // Modal states
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  
  // Editing states
  const [editingDiscount, setEditingDiscount] = useState<any>(null);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [editingPackage, setEditingPackage] = useState<any>(null);

  // Coupon form state (for backward compatibility)
  const [newCoupon, setNewCoupon] = useState<any>({
    discount_type: 'percentage',
    discount_value: 0,
    is_active: true,
    usage_limit: 100,
    used_count: 0
  });

  // Package discount state (temporary mock data - will be replaced with unified backend system)
  const [packageDiscounts, setPackageDiscounts] = useState([
    {
      id: '1',
      name: 'Buy 3 Get 15% Off',
      description: 'Get 15% off when you buy 3 or more items',
      discountType: 'percentage',
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
      discountType: 'buy_x_get_y',
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
  ]);

  // Filter functions for different types
  const filteredDiscounts = discounts?.filter(discount => {
    const matchesSearch = discount.label?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "active" && getDiscountStatus(discount) === 'active') ||
                         (filterStatus === "inactive" && getDiscountStatus(discount) === 'inactive') ||
                         (filterStatus === "expired" && getDiscountStatus(discount) === 'expired');
    return matchesSearch && matchesStatus;
  }) || [];

  const filteredCoupons = coupons?.filter(coupon => {
    const matchesSearch = coupon.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         coupon.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "active" && coupon.status === 'active') ||
                         (filterStatus === "inactive" && coupon.status === 'inactive');
    return matchesSearch && matchesStatus;
  }) || [];

  // Discount handlers
  const handleCreateDiscount = async (discountData: any) => {
    await createDiscount(discountData);
    setIsDiscountModalOpen(false);
  };

  const handleEditDiscount = (discount: any) => {
    setEditingDiscount(discount);
    setIsDiscountModalOpen(true);
  };

  const handleUpdateDiscount = async (discountData: any) => {
    if (editingDiscount) {
      await updateDiscount(editingDiscount.id, discountData);
      setEditingDiscount(null);
      setIsDiscountModalOpen(false);
    }
  };

  const handleDeleteDiscount = async (id: number) => {
    await deleteDiscount(id);
  };

  // Coupon handlers
  const handleCreateCoupon = async () => {
    if (newCoupon.code && newCoupon.discount_type && newCoupon.discount_value !== undefined) {
      await createCoupon({
        name: newCoupon.name || newCoupon.code,
        code: newCoupon.code,
        discount_type: newCoupon.discount_type,
        discount_value: newCoupon.discount_value,
        max_discount: newCoupon.max_discount,
        usage_limit: newCoupon.usage_limit,
        per_user_limit: newCoupon.per_user_limit,
        minimum_order_amount: newCoupon.minimum_order_amount,
        applies_to: newCoupon.applies_to || 'cart',
        is_stackable: newCoupon.is_stackable || false,
        starts_at: newCoupon.starts_at,
        expires_at: newCoupon.expires_at,
      });
      setNewCoupon({
        discount_type: 'percentage',
        discount_value: 0,
        usage_limit: 100,
        used_count: 0
      });
      setIsCouponModalOpen(false);
    }
  };

  const handleEditCoupon = (coupon: any) => {
    setEditingCoupon(coupon);
    setNewCoupon(coupon);
    setIsCouponModalOpen(true);
  };

  const handleUpdateCoupon = async () => {
    if (editingCoupon && newCoupon.code) {
      await updateCoupon(editingCoupon.id, newCoupon);
      setEditingCoupon(null);
      setNewCoupon({
        discount_type: 'percentage',
        discount_value: 0,
        usage_limit: 100,
        used_count: 0
      });
      setIsCouponModalOpen(false);
    }
  };

  const handleDeleteCoupon = async (id: number) => {
    await deleteCoupon(id);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage': return <Percent className="w-4 h-4" />;
      case 'fixed': return <DollarSign className="w-4 h-4" />;
      case 'free_shipping': 
      case 'delivery_free': return <Package className="w-4 h-4" />;
      case 'buy_x_get_y': return <Gift className="w-4 h-4" />;
      default: return <Tag className="w-4 h-4" />;
    }
  };

  const getScopeIcon = (scope: string) => {
    switch (scope) {
      case 'global': return <Globe className="w-4 h-4" />;
      case 'product': return <Package className="w-4 h-4" />;
      case 'category': return <Tag className="w-4 h-4" />;
      case 'store': return <Store className="w-4 h-4" />;
      case 'country': return <Globe className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'percentage': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'fixed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'free_shipping': 
      case 'delivery_free': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'buy_x_get_y': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getScopeColor = (scope: string) => {
    switch (scope) {
      case 'global': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400';
      case 'product': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'category': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'store': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'country': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getPackageDiscountDisplay = (packageDiscount: any) => {
    switch (packageDiscount.discountType) {
      case 'percentage':
        return `${packageDiscount.discountValue}%`;
      case 'fixed':
        return `$${packageDiscount.discountValue}`;
      case 'buy_x_get_y':
        return `Get ${packageDiscount.discountValue} Free`;
      default:
        return `${packageDiscount.discountValue}% off`;
    }
  };

  // Statistics calculations
  const totalDiscounts = discounts?.length || 0;
  const activeDiscounts = discounts?.filter(d => getDiscountStatus(d) === 'active').length || 0;
  const totalCoupons = coupons?.length || 0;
  const activeCoupons = coupons?.filter(c => c.status === 'active').length || 0;
  const totalUsage = coupons?.reduce((sum: number, c: any) => sum + (c.used_count || 0), 0) || 0;
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
                  variant={activeTab === 'discounts' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('discounts')}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Discounts
                </Button>
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
                      <p className="text-blue-100">Total Discounts</p>
                      <p className="text-3xl font-bold">{totalDiscounts}</p>
                    </div>
                    <Zap className="w-8 h-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Active Discounts</p>
                      <p className="text-3xl font-bold">{activeDiscounts}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100">Total Coupons</p>
                      <p className="text-3xl font-bold">{totalCoupons}</p>
                    </div>
                    <Tag className="w-8 h-8 text-purple-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100">Coupon Usage</p>
                      <p className="text-3xl font-bold">{totalUsage}</p>
                    </div>
                    <Users className="w-8 h-8 text-orange-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {activeTab === 'discounts' && (
              <>
                {/* Filters and Search */}
                <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          placeholder="Search discounts..."
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
                          <SelectItem value="all">All Discounts</SelectItem>
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

                {/* Discounts Table */}
                <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Discount Management</CardTitle>
                      <CardDescription>
                        Manage product, category, store, and global discounts
                      </CardDescription>
                    </div>
                    <Button onClick={() => setIsDiscountModalOpen(true)} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Discount
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {discountsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-muted-foreground">Loading discounts...</div>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name & Type</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead>Scope</TableHead>
                            <TableHead>Schedule</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredDiscounts?.map((discount: any) => (
                            <TableRow key={discount.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  {getTypeIcon(discount.type)}
                                  <div>
                                    <div className="font-semibold">{discount.label || `Discount ${discount.id}`}</div>
                                    <Badge className={getTypeColor(discount.type)} variant="secondary">
                                      {discount.type.replace('_', ' ')}
                                    </Badge>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">{formatDiscountValue(discount)}</div>
                                {discount.max_discount && (
                                  <div className="text-xs text-muted-foreground">
                                    Max: ${discount.max_discount}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {getScopeIcon(getDiscountScope(discount))}
                                  <Badge className={getScopeColor(getDiscountScope(discount))} variant="outline">
                                    {getDiscountScope(discount)}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {discount.starts_at ? (
                                    <div>From {format(new Date(discount.starts_at), "MMM dd")}</div>
                                  ) : (
                                    <div>No start date</div>
                                  )}
                                  {discount.expires_at ? (
                                    <div className="text-muted-foreground">Until {format(new Date(discount.expires_at), "MMM dd, yyyy")}</div>
                                  ) : (
                                    <div className="text-muted-foreground">No end date</div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={discount.is_active}
                                    onCheckedChange={() => toggleDiscountStatus(discount.id, !discount.is_active)}
                                  />
                                  <Badge variant={getDiscountStatus(discount) === 'active' ? "default" : "secondary"}>
                                    {getDiscountStatus(discount)}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditDiscount(discount)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteDiscount(discount.id)}
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
                    )}
                  </CardContent>
                </Card>

                {/* Discount Modal */}
                <DiscountModal
                  isOpen={isDiscountModalOpen}
                  onClose={() => {
                    setIsDiscountModalOpen(false);
                    setEditingDiscount(null);
                  }}
                  onSave={editingDiscount ? handleUpdateDiscount : handleCreateDiscount}
                  editingDiscount={editingDiscount}
                />
              </>
            )}

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
                    <Button onClick={() => setIsCouponModalOpen(true)} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Coupon
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {couponsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-muted-foreground">Loading coupons...</div>
                      </div>
                    ) : (
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
                          {filteredCoupons?.map((coupon: any) => (
                            <TableRow key={coupon.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  {getTypeIcon(coupon.discount_type)}
                                  <div>
                                    <div className="font-mono text-sm">{coupon.code}</div>
                                    <div className="text-xs text-muted-foreground">{coupon.name}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={getTypeColor(coupon.discount_type)}>
                                  {coupon.discount_type.replace('_', ' ')}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` :
                                 coupon.discount_type === 'fixed' ? `$${coupon.discount_value}` :
                                 'Free Delivery'}
                                {coupon.minimum_order_amount > 0 && (
                                  <div className="text-xs text-muted-foreground">
                                    Min: ${coupon.minimum_order_amount}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="text-sm">{coupon.used_count || 0} / {coupon.usage_limit || '∞'}</div>
                                  {coupon.usage_limit && (
                                    <div className="w-16 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                      <div 
                                        className="bg-blue-600 h-2 rounded-full transition-all" 
                                        style={{ width: `${Math.min(((coupon.used_count || 0) / coupon.usage_limit) * 100, 100)}%` }}
                                      ></div>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {coupon.starts_at ? (
                                    <div>{format(new Date(coupon.starts_at), "MMM dd")}</div>
                                  ) : (
                                    <div>No start</div>
                                  )}
                                  {coupon.expires_at ? (
                                    <div className="text-muted-foreground">to {format(new Date(coupon.expires_at), "MMM dd, yyyy")}</div>
                                  ) : (
                                    <div className="text-muted-foreground">No expiry</div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Badge variant={coupon.status === 'active' ? "default" : "secondary"}>
                                    {coupon.status || 'active'}
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
                    )}
                  </CardContent>
                </Card>

                {/* Create/Edit Coupon Modal */}
                <Dialog open={isCouponModalOpen} onOpenChange={setIsCouponModalOpen}>
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
                          <Select value={newCoupon.discount_type} onValueChange={(value) => setNewCoupon({ ...newCoupon, discount_type: value as any })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="percentage">Percentage</SelectItem>
                              <SelectItem value="fixed">Fixed Amount</SelectItem>
                              <SelectItem value="delivery_free">Free Delivery</SelectItem>
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
                              {getPackageDiscountDisplay(packageDiscount)}
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
