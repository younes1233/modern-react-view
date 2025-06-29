
import { useState, useEffect } from 'react';
import { StoreLayout } from '@/components/store/StoreLayout';
import { CategoryFilters } from '@/components/store/CategoryFilters';
import { ProductToolbar } from '@/components/store/ProductToolbar';
import { ProductGrid } from '@/components/store/ProductGrid';
import { ProductPagination } from '@/components/store/ProductPagination';
import { useSearch } from '@/contexts/SearchContext';
import { useIsMobile } from '@/hooks/use-mobile';
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
  const isMobile = useIsMobile();

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

  return (
    <StoreLayout>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Shop by Category</h1>
          <p className="text-gray-600 text-sm sm:text-base">Discover our wide range of products</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-8">
          {/* Sidebar Filters */}
          <CategoryFilters
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            priceRange={priceRange}
            onPriceRangeChange={setPriceRange}
            onClearFilters={clearFilters}
            showFilters={showFilters}
          />

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <ProductToolbar
              totalProducts={filteredProducts.length}
              displayedCount={displayedProducts.length}
              showFilters={showFilters}
              onToggleFilters={() => setShowFilters(!showFilters)}
              sortBy={sortBy}
              onSortChange={setSortBy}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              isMobile={isMobile}
            />

            {/* Products Grid */}
            <ProductGrid
              products={displayedProducts}
              viewMode={viewMode}
              displaySettings={displaySettings}
              isMobile={isMobile}
              onClearFilters={clearFilters}
            />

            {/* Pagination */}
            <ProductPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </StoreLayout>
  );
};

export default StoreCategories;
