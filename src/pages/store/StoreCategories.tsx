
import { useState, useEffect } from 'react';
import { StoreLayout } from '@/components/store/StoreLayout';
import { ProductCard } from '@/components/store/ProductCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Grid, List, Filter, X } from 'lucide-react';
import { useSearch } from '@/contexts/SearchContext';
import { 
  getProducts, 
  getDisplaySettings,
  Product,
  DisplaySettings 
} from '@/data/storeData';

const StoreCategories = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const {
    searchQuery,
    selectedCategory,
    setSelectedCategory,
    priceRange,
    setPriceRange,
    sortBy,
    setSortBy,
    clearFilters
  } = useSearch();

  useEffect(() => {
    const allProducts = getProducts();
    setProducts(allProducts);
    setDisplaySettings(getDisplaySettings());
    if (getDisplaySettings()) {
      setViewMode(getDisplaySettings().layout);
    }
  }, []);

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by price range
    filtered = filtered.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filtered.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0));
        break;
      case 'featured':
      default:
        filtered.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [products, searchQuery, selectedCategory, priceRange, sortBy]);

  const categories = [
    { id: 'all', name: 'All Products', count: products.length },
    { id: 'electronics', name: 'Electronics', count: products.filter(p => p.category === 'electronics').length },
    { id: 'furniture', name: 'Furniture', count: products.filter(p => p.category === 'furniture').length },
    { id: 'fashion', name: 'Fashion', count: products.filter(p => p.category === 'fashion').length },
    { id: 'home', name: 'Home & Tools', count: products.filter(p => p.category === 'home').length },
  ];

  const productsPerPage = displaySettings?.productsPerPage || 12;
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const displayedProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);

  const getGridColumns = () => {
    const cols = displaySettings?.gridColumns || 3;
    switch (cols) {
      case 2: return 'grid-cols-1 md:grid-cols-2';
      case 3: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      case 4: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
      case 5: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5';
      default: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    }
  };

  return (
    <StoreLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shop by Category</h1>
          <p className="text-gray-600">Discover our wide range of products</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className={`lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="space-y-6">
              {/* Categories */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? "default" : "ghost"}
                        className={`w-full justify-between ${
                          selectedCategory === category.id 
                            ? 'bg-cyan-500 hover:bg-cyan-600 text-white' 
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <span>{category.name}</span>
                        <Badge variant="secondary" className="ml-2">
                          {category.count}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Price Range */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Price Range</h3>
                  <div className="space-y-4">
                    <Slider
                      value={priceRange}
                      onValueChange={(value) => setPriceRange(value as [number, number])}
                      max={1000}
                      min={0}
                      step={10}
                      className="w-full"
                    />
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Clear Filters */}
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="w-full"
              >
                <X className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-4">
                <div className="text-gray-600">
                  Showing {displayedProducts.length} of {filteredProducts.length} products
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={viewMode === 'grid' ? 'bg-cyan-500 hover:bg-cyan-600' : ''}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={viewMode === 'list' ? 'bg-cyan-500 hover:bg-cyan-600' : ''}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {displayedProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No products found matching your criteria.</p>
                <Button onClick={clearFilters} className="mt-4 bg-cyan-600 hover:bg-cyan-700">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid' ? getGridColumns() : 'grid-cols-1'
              }`}>
                {displayedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                    className={page === currentPage ? "bg-cyan-500 hover:bg-cyan-600" : ""}
                  >
                    {page}
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </StoreLayout>
  );
};

export default StoreCategories;
