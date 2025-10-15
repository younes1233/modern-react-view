import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreLayout } from '@/components/store/StoreLayout';
import { useStoreCategoriesFlattened } from '@/hooks/useStoreCategoriesFlattened';
import { Category } from '@/services/categoryService';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Package, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const StoreCategories = () => {
  const navigate = useNavigate();
  const { categories, loading, error } = useStoreCategoriesFlattened();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;

    const query = searchQuery.toLowerCase();
    return categories.filter(category =>
      category.name.toLowerCase().includes(query) ||
      category.description?.toLowerCase().includes(query) ||
      category.children?.some(child =>
        child.name.toLowerCase().includes(query)
      )
    );
  }, [categories, searchQuery]);

  const handleCategoryClick = (category: Category) => {
    navigate(`/products?category=${category.slug}`);
  };

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
              <Loader2 className="w-12 h-12 animate-spin text-cyan-600 mx-auto mb-4" />
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
        {/* Header Section */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-600 tracking-wide mb-4">
                ALL CATEGORIES
              </h1>
              <p className="text-gray-500 max-w-2xl mx-auto text-sm md:text-base">
                Discover our curated collections
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 text-base border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 md:py-12">
          {/* All Categories Section */}
          {filteredCategories.length > 0 ? (
            <>
              {/* Desktop Grid */}
              <div className="hidden md:flex md:flex-wrap md:justify-center md:gap-6 lg:gap-8">
                {filteredCategories.map((category) => (
                  <div
                    key={category.id}
                    onClick={() => handleCategoryClick(category)}
                    className="group cursor-pointer"
                  >
                    <Card className="w-[250px] h-[420px] border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 bg-white overflow-hidden rounded-3xl">
                      <CardContent className="p-0 h-full">
                        <div className="relative h-full overflow-hidden">
                          {category.image_path ? (
                            <img
                              src={category.image_path}
                              alt={category.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                              <Package className="w-24 h-24 text-gray-300" />
                            </div>
                          )}

                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                          {/* Content */}
                          <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center px-4">
                            {/* Text wrapper */}
                            <div className="flex justify-center items-center mb-2">
                              <h3 className="text-lg font-bold text-white group-hover:text-cyan-200 transition-all duration-500 text-center">
                                {category.name}
                              </h3>
                            </div>

                            {/* Product Count Badge */}
                            <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30">
                              <span className="text-sm text-white font-medium">
                                {category.products_count || 0} Products
                              </span>
                            </div>

                            {/* Icon */}
                            <div className="mt-3 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 group-hover:w-12 group-hover:h-12 transition-all duration-500">
                              {category.icon && category.icon.startsWith('http') ? (
                                <img src={category.icon} alt="" className="w-6 h-6 object-contain group-hover:w-7 group-hover:h-7 transition-all duration-500" />
                              ) : (
                                <Package className="w-5 h-5 text-white group-hover:w-6 group-hover:h-6 transition-all duration-500" />
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>

              {/* Mobile Grid */}
              <div className="md:hidden grid grid-cols-3 gap-3">
                {filteredCategories.map((category) => (
                  <div key={category.id} className="group flex flex-col items-center">
                    <div
                      onClick={() => handleCategoryClick(category)}
                      className="block w-full"
                    >
                      <Card className="w-full aspect-[5/7] border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white overflow-hidden rounded-2xl">
                        <CardContent className="p-0 h-full">
                          <div className="relative h-full">
                            {category.image_path ? (
                              <img
                                src={category.image_path}
                                alt={category.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                <Package className="w-12 h-12 text-gray-300" />
                              </div>
                            )}

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                            {/* Product Count Badge */}
                            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
                              <span className="text-xs font-semibold text-gray-900">
                                {category.products_count || 0}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    <h3 className="font-bold text-xs leading-tight text-gray-800 text-center mt-2 px-1 line-clamp-2">
                      {category.name}
                    </h3>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <Package className="w-20 h-20 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Categories Found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery
                  ? `No results for "${searchQuery}". Try a different search term.`
                  : 'No categories available at the moment.'}
              </p>
              {searchQuery && (
                <Button
                  onClick={() => setSearchQuery('')}
                  variant="outline"
                >
                  Clear Search
                </Button>
              )}
            </div>
          )}

          {/* Bottom CTA - Only show when not searching and have categories */}
          {!searchQuery && filteredCategories.length > 0 && (
            <div className="mt-12 text-center">
              <p className="text-gray-600 mb-4">Can't find what you're looking for?</p>
              <Button
                onClick={() => navigate('/products')}
                variant="outline"
                size="lg"
                className="border-gray-300"
              >
                Browse All Products
              </Button>
            </div>
          )}
        </div>
      </div>
    </StoreLayout>
  );
};

export default StoreCategories;
