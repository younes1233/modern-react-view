import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CategoryModal } from "@/components/CategoryModal";
import { ExportButton } from "@/components/ui/export-button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Search, 
  Plus, 
  ChevronDown, 
  ChevronRight, 
  Grid, 
  Trees, 
  Filter,
  Star,
  Package,
  DollarSign,
  TrendingUp,
  MoreHorizontal,
  Edit,
  Trash2,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { categoryService, Category } from "@/services/categoryService";

const Categories = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [viewMode, setViewMode] = useState<"tree" | "grid">("tree");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [stats, setStats] = useState({
    totalCategories: 0,
    activeCategories: 0,
    products: 0,
    revenue: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    loadCategories();
    loadStats();
  }, []);

  useEffect(() => {
    loadCategories();
  }, [searchTerm, statusFilter]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const filters = {
        search: searchTerm || undefined,
        status: statusFilter === "all" ? undefined : statusFilter as "active" | "inactive"
      };
      
      const response = await categoryService.getCategories();
      if (!response.error) {
        let categoriesData: Category[] = [];
        
        if (Array.isArray(response.details)) {
          categoriesData = response.details;
        } else if (response.details && typeof response.details === 'object' && Array.isArray((response.details as any).categories)) {
          categoriesData = (response.details as any).categories;
        }
        
        const sanitizedCategories = categoriesData.map(category => ({
          ...category,
          products: category.products ?? 0,
          revenue: category.revenue ?? 0,
          level: category.level ?? 0,
          isExpanded: category.isExpanded ?? false,
          is_active: category.is_active ?? true,
          featured: category.featured ?? false,
          order: category.order ?? 0
        }));
        
        setCategories(sanitizedCategories);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to load categories",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await categoryService.getCategoryStats();
      if (!response.error) {
        setStats({
          totalCategories: response.details?.totalCategories || 0,
          activeCategories: response.details?.activeCategories || 0,
          products: 0,
          revenue: 0
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const toggleExpand = (categoryId: number) => {
    const updateCategories = (cats: Category[]): Category[] => {
      return cats.map(cat => {
        if (cat.id === categoryId) {
          return { ...cat, isExpanded: !cat.isExpanded };
        }
        if (cat.children) {
          return { ...cat, children: updateCategories(cat.children) };
        }
        return cat;
      });
    };
    setCategories(updateCategories(categories));
  };

  const handleAddCategory = () => {
    setModalMode('add');
    setSelectedCategory(null);
    setIsAddDialogOpen(true);
  };

  const handleAddSubcategory = (parentCategory: Category) => {
    setModalMode('add');
    setSelectedCategory({
      name: '',
      slug: '',
      image: '',
      icon: '',
      description: '',
      order: 0,
      is_active: true,
      featured: false,
      parent_id: parentCategory.id,
      level: (parentCategory.level || 0) + 1
    } as Category);
    setIsAddDialogOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setModalMode('edit');
    setSelectedCategory(category);
    setIsAddDialogOpen(true);
  };

  const handleDeleteCategory = async (categoryId: number) => {
    try {
      const response = await categoryService.deleteCategory(categoryId);
      if (!response.error) {
        toast({
          title: "Success",
          description: "Category deleted successfully",
        });
        loadCategories();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to delete category",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive"
      });
    }
  };

  const handleSaveCategory = async (categoryData: Category, imageFile?: File, iconFile?: File) => {
    try {
      let response;
      
      if (modalMode === 'add') {
        response = await categoryService.createCategory(categoryData, imageFile, iconFile);
      } else if (selectedCategory?.id) {
        response = await categoryService.updateCategory(selectedCategory.id, categoryData, imageFile, iconFile);
      }

      if (response && !response.error) {
        toast({
          title: "Success",
          description: `Category ${modalMode === 'add' ? 'created' : 'updated'} successfully`
        });
        loadCategories();
      } else {
        toast({
          title: "Error",
          description: response?.message || `Failed to ${modalMode} category`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error(`Error ${modalMode} category:`, error);
      toast({
        title: "Error",
        description: `Failed to ${modalMode} category`,
        variant: "destructive"
      });
    }
  };

  const handleExportExcel = () => {
    toast({
      title: "Export Started",
      description: "Categories are being exported to Excel"
    });
  };

  const getCategoryPath = (category: Category): string => {
    if (category.level === 0) return category.name;
    
    const parent = flattenCategories(categories).find(cat => cat.id === category.parent_id);
    if (!parent) return category.name;
    
    return `${getCategoryPath(parent)} > ${category.name}`;
  };

  const renderCategoryRow = (category: Category) => {
    const hasChildren = category.children && category.children.length > 0;
    const indentLevel = (category.level || 0) * 24;

    const displayImage = category.images?.urls?.original || category.image;

    return (
      <div key={category.id}>
        <div 
          className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
          style={{ paddingLeft: `${16 + indentLevel}px` }}
        >
          <div className="flex items-center gap-3 flex-1">
            {hasChildren ? (
              <Button
                variant="ghost"
                size="sm"
                className="p-0 w-6 h-6"
                onClick={() => toggleExpand(category.id!)}
              >
                {category.isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </Button>
            ) : (
              <div className="w-6" />
            )}
            
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              {displayImage ? (
                <img src={displayImage} alt={category.name} className="w-8 h-8 rounded object-cover" />
              ) : (
                <Package className="w-6 h-6 text-blue-600" />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">{category.name}</h3>
                {category.level === 0 && <Star className="w-4 h-4 text-yellow-500" />}
                <Badge className={category.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                  {category.is_active ? 'active' : 'inactive'}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{category.description || ''}</p>
              {category.level && category.level > 0 && (
                <p className="text-xs text-gray-500">
                  {getCategoryPath(category)}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="flex items-center gap-1">
                <Package className="w-4 h-4 text-gray-400" />
                <span className="font-medium">{(category.products || 0)}</span>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center gap-1 text-green-600">
                <DollarSign className="w-4 h-4" />
                <span className="font-bold">${(category.revenue || 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAddSubcategory(category)}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditCategory(category)}
                className="text-gray-600 hover:text-gray-700"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Category</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{category.name}"? This action cannot be undone and will also delete all subcategories.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => handleDeleteCategory(category.id!)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAddSubcategory(category)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Subcategory
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDeleteCategory(category.id!)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {hasChildren && category.isExpanded && category.children?.map(child => renderCategoryRow(child))}
      </div>
    );
  };

  const flattenCategories = (cats: Category[]): Category[] => {
    const result: Category[] = [];
    cats.forEach(cat => {
      result.push(cat);
      if (cat.children) {
        result.push(...flattenCategories(cat.children));
      }
    });
    return result;
  };

  const validCategories = Array.isArray(categories) ? categories : [];
  const filteredCategories = searchTerm 
    ? validCategories.filter(category =>
        category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : validCategories;

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gray-50 dark:bg-gray-900">
          <AppSidebar />
          <main className="flex-1 flex flex-col overflow-hidden">
            <DashboardHeader />
            <div className="flex-1 flex items-center justify-center">
              <div className="flex items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Loading categories...</span>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50 dark:bg-gray-900">
        <AppSidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <div className="flex-1 overflow-auto p-6 space-y-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-pink-600 dark:text-pink-400">Categories</h1>
                <p className="text-gray-600 dark:text-gray-400">Organize your products with hierarchical categories</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant={viewMode === "tree" ? "default" : "outline"}
                  onClick={() => setViewMode("tree")}
                  className="gap-2"
                >
                  <Trees className="w-4 h-4" />
                  Tree
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  onClick={() => setViewMode("grid")}
                  className="gap-2"
                >
                  <Grid className="w-4 h-4" />
                  Grid
                </Button>
                <Button onClick={handleAddCategory} className="gap-2 bg-pink-600 hover:bg-pink-700">
                  <Plus className="w-4 h-4" />
                  Add Category
                </Button>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={(value: "all" | "active" | "inactive") => setStatusFilter(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="gap-2">
                  <Filter className="w-4 h-4" />
                  Advanced
                </Button>
                <ExportButton onExportExcel={handleExportExcel} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-lg bg-white/20">
                      <Package className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-bold">{stats.totalCategories}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Total Categories</h3>
                    <p className="text-pink-100 text-sm">{stats.activeCategories} active</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-lg bg-white/20">
                      <Package className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-bold">573</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Products</h3>
                    <p className="text-orange-100 text-sm">Across all categories</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-lg bg-white/20">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">Electronics</div>
                      <div className="text-sm text-green-100">45% of total sales</div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Top Category</h3>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-lg bg-white/20">
                      <Star className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-bold">8</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Featured</h3>
                    <p className="text-purple-100 text-sm">Categories featured</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                <CardTitle>Category Management</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {viewMode === "tree" ? (
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredCategories.map(category => renderCategoryRow(category))}
                    {filteredCategories.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-semibold mb-2">No Categories Found</h3>
                        <p>Get started by creating your first category.</p>
                        <Button onClick={handleAddCategory} className="mt-4">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Category
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {flattenCategories(filteredCategories).map((category) => {
                      const displayImage = category.images?.urls?.original || category.image;
                      
                      return (
                        <Card key={category.id} className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900">
                                {displayImage ? (
                                  <img src={displayImage} alt={category.name} className="w-6 h-6 rounded" />
                                ) : (
                                  <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                )}
                              </div>
                              <Badge className={category.is_active ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"}>
                                {category.is_active ? 'active' : 'inactive'}
                              </Badge>
                            </div>
                            <h3 className="font-semibold text-lg mb-2 dark:text-gray-100">{category.name}</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{category.description || ''}</p>
                            {category.parent_id && (
                              <p className="text-xs text-blue-600 dark:text-blue-400 mb-3 font-medium">
                                📁 {getCategoryPath(category)}
                              </p>
                            )}
                            <div className="flex justify-between items-center mb-4">
                              <span className="text-sm text-gray-500 dark:text-gray-400">{(category.products || 0)} products</span>
                              <span className="text-sm font-bold text-green-600 dark:text-green-400">${(category.revenue || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="flex-1"
                                onClick={() => handleEditCategory(category)}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleAddSubcategory(category)}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Category</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{category.name}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeleteCategory(category.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <CategoryModal
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSave={handleSaveCategory}
        category={selectedCategory}
        mode={modalMode}
        categories={flattenCategories(categories)}
      />
    </SidebarProvider>
  );
};

export default Categories;
