import { useState } from "react";
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
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: number;
  name: string;
  description: string;
  products: number;
  revenue: number;
  status: "active" | "inactive";
  created: string;
  parentId?: number;
  children?: Category[];
  isExpanded?: boolean;
  level: number;
  image?: string;
}

// TODO: Replace with API call to fetch hierarchical categories
const mockCategories: Category[] = [
  {
    id: 1,
    name: "Electronics",
    description: "Electronic devices and gadgets",
    products: 156,
    revenue: 45230,
    status: "active",
    created: "2023-08-15",
    level: 0,
    isExpanded: true,
    children: [
      {
        id: 2,
        name: "Smartphones",
        description: "Mobile phones and accessories",
        products: 45,
        revenue: 15670,
        status: "active",
        created: "2023-09-01",
        parentId: 1,
        level: 1,
        isExpanded: false,
        children: [
          {
            id: 3,
            name: "iPhone",
            description: "Apple iPhone series",
            products: 25,
            revenue: 12000,
            status: "active",
            created: "2023-09-10",
            parentId: 2,
            level: 2
          },
          {
            id: 4,
            name: "Samsung",
            description: "Samsung Galaxy series",
            products: 20,
            revenue: 8500,
            status: "active",
            created: "2023-09-12",
            parentId: 2,
            level: 2
          }
        ]
      },
      {
        id: 5,
        name: "Laptops",
        description: "Portable computers",
        products: 35,
        revenue: 18900,
        status: "active",
        created: "2023-09-05",
        parentId: 1,
        level: 1
      }
    ]
  },
  {
    id: 6,
    name: "Home & Garden",
    description: "Home improvement and garden supplies",
    products: 67,
    revenue: 12340,
    status: "active",
    created: "2023-06-10",
    level: 0
  },
  {
    id: 7,
    name: "Sports & Outdoors",
    description: "Sports equipment and outdoor gear",
    products: 34,
    revenue: 8900,
    status: "active",
    created: "2023-07-18",
    level: 0
  }
];

const Categories = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState(mockCategories);
  const [viewMode, setViewMode] = useState<"tree" | "grid">("tree");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const { toast } = useToast();

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

  const handleEditCategory = (category: Category) => {
    setModalMode('edit');
    setSelectedCategory(category);
    setIsAddDialogOpen(true);
  };

  const handleSaveCategory = (categoryData: Category) => {
    if (modalMode === 'add') {
      const newCategory = {
        ...categoryData,
        id: Date.now(),
        level: categoryData.parentId ? 1 : 0,
        products: 0,
        revenue: 0,
        created: new Date().toISOString().split('T')[0]
      };
      setCategories(prev => [...prev, newCategory]);
    } else if (selectedCategory) {
      setCategories(prev => prev.map(cat => 
        cat.id === selectedCategory.id ? { ...cat, ...categoryData } : cat
      ));
    }
  };

  const handleExportExcel = () => {
    // Implementation for Excel export
    toast({
      title: "Export Started",
      description: "Categories are being exported to Excel"
    });
  };

  const renderCategoryRow = (category: Category) => {
    const hasChildren = category.children && category.children.length > 0;
    const indentLevel = category.level * 24;

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
                onClick={() => toggleExpand(category.id)}
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
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">{category.name}</h3>
                {category.level === 0 && <Star className="w-4 h-4 text-yellow-500" />}
                <Badge className={category.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                  {category.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{category.description}</p>
              <p className="text-xs text-gray-500">
                {category.level > 0 ? `Electronics > ${category.name}` : category.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="flex items-center gap-1">
                <Package className="w-4 h-4 text-gray-400" />
                <span className="font-medium">{category.products}</span>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center gap-1 text-green-600">
                <DollarSign className="w-4 h-4" />
                <span className="font-bold">${category.revenue.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAddSubcategory(category.id)}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-700"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
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

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

            {/* Search and Filters */}
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
                <Select defaultValue="all">
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

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-lg bg-white/20">
                      <Package className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-bold">24</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Total Categories</h3>
                    <p className="text-pink-100 text-sm">+3 this month</p>
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

            {/* Categories Content */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                <CardTitle>Category Management</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {viewMode === "tree" ? (
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredCategories.map(category => (
                      <div key={category.id}>
                        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditCategory(category)}
                              className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {flattenCategories(filteredCategories).map((category) => (
                      <Card key={category.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900">
                              {category.image ? (
                                <img src={category.image} alt={category.name} className="w-6 h-6 rounded" />
                              ) : (
                                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                              )}
                            </div>
                            <Badge className={category.status === "active" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"}>
                              {category.status}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-lg mb-2 dark:text-gray-100">{category.name}</h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{category.description}</p>
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-sm text-gray-500 dark:text-gray-400">{category.products} products</span>
                            <span className="text-sm font-bold text-green-600 dark:text-green-400">${category.revenue.toLocaleString()}</span>
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
                              onClick={() => handleAddSubcategory(category.id)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
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
        categories={categories}
      />
    </SidebarProvider>
  );
};

export default Categories;
