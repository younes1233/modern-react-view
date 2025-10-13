import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreLayout } from '@/components/store/StoreLayout';
import { useStoreCategories } from '@/hooks/useStoreCategories';
import { Category } from '@/services/categoryService';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Package, Loader2, AlertCircle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const StoreCategories = () => {
  const navigate = useNavigate();
  const { categories, loading, error } = useStoreCategories();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParent, setSelectedParent] = useState<Category | null>(null);

  // Get top-level categories (no parent)
  const topLevelCategories = useMemo(() => {
    return categories.filter(cat => !cat.parent_id);
  }, [categories]);

  // Filter top-level categories based on search
  const filteredTopLevel = useMemo(() => {
    if (!searchQuery.trim()) return topLevelCategories;
    
    return topLevelCategories.filter(category =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [topLevelCategories, searchQuery]);

  // Get all children of selected parent (recursive - all levels)
  const getAllChildren = (parentCategory: Category): Category[] => {
    let allChildren: Category[] = [];
    
    const findChildren = (category: Category) => {
      if (category.children && category.children.length > 0) {
        category.children.forEach(child => {
          allChildren.push(child);
          findChildren(child); // Recursively find children's children
        });
      }
    };
    
    findChildren(parentCategory);
    return allChildren;
  };

  const childrenCategories = useMemo(() => {
    if (!selectedParent) return [];
    return getAllChildren(selectedParent);
  }, [selectedParent]);

  const handleCategoryClick = (category: Category) => {
    navigate(`/products?category=${category.slug}`);
  };

  const handleParentSelect = (category: Category) => {
    setSelectedParent(category);
  };

  // Auto-select first category on load
  React.useEffect(() => {
    if (topLevelCategories.length > 0 && !selectedParent) {
      setSelectedParent(topLevelCategories[0]);
    }
  }, [topLevelCategories, selectedParent]);

  if (error) {
    return (
      <StoreLayout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Unable to Load Categories</h2>
            <p className="text-gray-600 mb-6">Please check your connection and try again.</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </StoreLayout>
    );
  }

  if (loading) {
    return (
      <StoreLayout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600">Loading categories...</p>
            </div>
          </div>
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <div className="min-h-screen bg-white">
        {/* Desktop Header - Hidden on mobile */}
        <div className="hidden md:block">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Shop by Category
              </h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Browse through our categories to find exactly what you're looking for
              </p>
            </div>

            {/* Desktop Search Bar */}
            <div className="relative max-w-md mx-auto mb-8">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:max-w-7xl md:mx-auto md:px-4 md:pb-8">
          <div className="flex flex-row h-screen md:h-auto md:gap-8">
            {/* Left Sidebar - Top Level Categories */}
            <div className="w-1/2 md:w-1/3 border-r md:border-r-0">
              <div className="h-full bg-white md:rounded-lg md:shadow-sm md:border md:p-4">
                <div className="hidden md:block">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Categories</h2>
                </div>
                
                <div className="space-y-0 md:space-y-1 h-full overflow-y-auto">
                  {filteredTopLevel.map((category) => (
                    <div
                      key={category.id}
                      onClick={() => handleParentSelect(category)}
                      className={`flex items-center justify-between px-3 py-3 md:p-2 md:rounded-md cursor-pointer transition-colors border-b border-gray-100 md:border-0 ${
                        selectedParent?.id === category.id
                          ? 'bg-blue-50 md:border border-blue-200 text-blue-700'
                          : 'hover:bg-gray-50 md:border border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 md:w-7 md:h-7 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {category.image_path ? (
                            <img
                              src={category.image_path}
                              alt={category.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-4 h-4 md:w-3 md:h-3 text-gray-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm md:text-xs truncate">{category.name}</div>
                          <div className="text-xs md:text-xs text-gray-500">
                            {category.products_count || 0}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        {category.children && category.children.length > 0 && (
                          <Badge variant="secondary" className="text-xs px-1 py-0 h-4">
                            {getAllChildren(category).length}
                          </Badge>
                        )}
                        <ChevronRight className="w-4 h-4 md:w-3 md:h-3 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>

                {filteredTopLevel.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No categories found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Content - Children Categories */}
            <div className="w-1/2 md:w-2/3 flex flex-col">
              <div className="h-full bg-white md:rounded-lg md:shadow-sm md:border p-2 md:p-4 flex flex-col">
                {selectedParent ? (
                  <>
                    {/* Selected Category Header */}
                    <div className="flex items-center justify-between mb-3 md:mb-4 flex-shrink-0">
                      <div>
                        <h2 className="text-sm md:text-lg font-semibold text-gray-900 truncate">
                          {selectedParent.name}
                        </h2>
                        <p className="text-gray-600 text-xs md:text-sm">
                          {childrenCategories.length} items
                        </p>
                      </div>
                      <Button
                        onClick={() => handleCategoryClick(selectedParent)}
                        variant="outline"
                        size="sm"
                        className="text-xs px-2 py-1 h-7 md:h-8"
                      >
                        View All
                      </Button>
                    </div>

                    {/* Children Grid */}
                    {childrenCategories.length > 0 ? (
                      <div className="flex-1 overflow-y-auto">
                        <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-3 pb-4">
                          {childrenCategories.map((child) => (
                            <div
                              key={child.id}
                              onClick={() => handleCategoryClick(child)}
                              className="group cursor-pointer p-1 md:p-2 rounded-md hover:bg-gray-50 transition-colors text-center"
                            >
                              <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-1 md:mb-2 rounded-full bg-gray-100 overflow-hidden group-hover:shadow-sm transition-shadow">
                                {child.image_path ? (
                                  <img
                                    src={child.image_path}
                                    alt={child.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div className="text-xs font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 px-1">
                                {child.name}
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5">
                                {child.products_count || 0}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <Package className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-2 md:mb-4 text-gray-300" />
                          <h3 className="text-sm md:text-lg font-medium text-gray-900 mb-1 md:mb-2">No Subcategories</h3>
                          <p className="text-xs md:text-sm mb-3 md:mb-4">This category doesn't have subcategories yet.</p>
                          <Button
                            onClick={() => handleCategoryClick(selectedParent)}
                            className="text-xs h-7 md:h-8"
                            size="sm"
                          >
                            Browse Products
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <Package className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-2 md:mb-4 text-gray-300" />
                      <h3 className="text-sm md:text-lg font-medium text-gray-900 mb-1 md:mb-2">Select a Category</h3>
                      <p className="text-xs md:text-sm">Choose a category to see its subcategories</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
};

export default StoreCategories;