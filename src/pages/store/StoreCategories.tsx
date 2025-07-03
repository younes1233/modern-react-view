import { useState, useEffect } from 'react';
import { StoreLayout } from '@/components/store/StoreLayout';
import { CategoryFilters } from '@/components/store/CategoryFilters';
import { ProductToolbar } from '@/components/store/ProductToolbar';
import { ProductGrid } from '@/components/store/ProductGrid';
import { ProductPagination } from '@/components/store/ProductPagination';
import { useSearch } from '@/contexts/SearchContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useProducts, useProductSearch } from '@/hooks/useProducts';
import { ProductAPI } from '@/services/productService';
import { 
  getDisplaySettings,
  DisplaySettings 
} from '@/data/storeData';

// Convert API product to legacy format for ProductCard
const convertAPIProductToLegacy = (apiProduct: ProductAPI) => {
  return {
    id: apiProduct.id, // Keep as number, don't convert to string
    name: apiProduct.name,
    slug: apiProduct.slug,
    image: apiProduct.media.cover_image,
    price: apiProduct.pricing.final.price,
    originalPrice: apiProduct.pricing.final.original_price,
    category: apiProduct.category.name.toLowerCase(),
    rating: apiProduct.rating.average,
    reviews: apiProduct.rating.count,
    isOnSale: apiProduct.flags.on_sale,
    isFeatured: apiProduct.flags.is_featured,
    isNewArrival: apiProduct.flags.is_new_arrival,
    sku: apiProduct.identifiers.sku,
    thumbnails: apiProduct.media.thumbnails.map((thumb, index) => ({
      id: index + 1, // Add missing id property
      url: thumb.image,
      alt: thumb.alt_text
    })),
    description: apiProduct.short_description,
    stock: apiProduct.inventory.stock ? parseInt(apiProduct.inventory.stock) : 0,
    isAvailable: apiProduct.inventory.is_available,
    // Add missing required properties
    inStock: apiProduct.inventory.is_available,
    variations: [] // Default to empty array since API doesn't provide variations in this format
  };
};

const StoreCategories = () => {
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

  // Default to Lebanon (1) and USD (1)
  const countryId = 1;
  const currencyId = 1;

  const productsPerPage = displaySettings?.productsPerPage || 12;

  // Use products API instead of mock data
  const { data: productsData, isLoading: productsLoading } = useProducts(
    countryId,
    currencyId,
    currentPage,
    productsPerPage
  );

  // Use search API when there's a search query
  const { data: searchData, isLoading: searchLoading } = useProductSearch(
    searchQuery,
    countryId,
    currencyId,
    {
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      min_price: priceRange[0],
      max_price: priceRange[1],
      sort: sortBy === 'price-low' ? 'price_asc' : 
            sortBy === 'price-high' ? 'price_desc' : 
            sortBy === 'rating' ? 'rating' : 
            sortBy === 'newest' ? 'newest' : 'featured',
      page: currentPage,
      limit: productsPerPage
    }
  );

  const isLoading = productsLoading || searchLoading;
  const currentData = searchQuery ? searchData : productsData;
  const apiProducts = currentData?.products || [];
  const pagination = currentData?.pagination;

  // Convert API products to legacy format
  const products = apiProducts.map(convertAPIProductToLegacy);

  useEffect(() => {
    setDisplaySettings(getDisplaySettings());
    if (getDisplaySettings()) {
      setViewMode(getDisplaySettings().layout);
    }
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, priceRange, sortBy]);

  // Create categories from API data (simplified for now)
  const categories = [
    { id: 'all', name: 'All Products', count: pagination?.total || 0 },
    { id: 'audio', name: 'Audio', count: 0 },
    { id: 'home-office', name: 'Home Office', count: 0 },
    { id: 'electronics', name: 'Electronics', count: 0 },
    { id: 'furniture', name: 'Furniture', count: 0 },
    { id: 'fashion', name: 'Fashion', count: 0 },
    { id: 'home', name: 'Home & Tools', count: 0 },
  ];

  const totalPages = pagination?.totalPages || 1;

  if (isLoading) {
    return (
      <StoreLayout>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
            <p className="ml-4 text-gray-600">Loading products...</p>
          </div>
        </div>
      </StoreLayout>
    );
  }

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
              totalProducts={pagination?.total || 0}
              displayedCount={products.length}
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
              products={products}
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
