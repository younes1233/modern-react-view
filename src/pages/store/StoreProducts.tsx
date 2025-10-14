import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { StoreLayout } from '@/components/store/StoreLayout';
import { ProductCard } from '@/components/store/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Filter, X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { useCountryCurrency } from '@/contexts/CountryCurrencyContext';
import { useStoreCategories } from '@/hooks/useStoreCategories';
import { useDebounce } from '@/hooks/useDebounce';
import BaseApiService from '@/services/baseApiService';
import { metaPixelService } from '@/services/metaPixelService';

const StoreProducts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedCountry, selectedCurrency } = useCountryCurrency();
  
  const { categories } = useStoreCategories();
  
  // State
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const debouncedSearchQuery = useDebounce(searchQuery, 500); // Debounce search by 500ms
  const [selectedCategory, setSelectedCategory] = useState(() => {
    // Ensure we properly read category from URL on mount (Safari fix)
    const categoryParam = searchParams.get('category');
    return categoryParam || 'all';
  });
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filter states
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const debouncedPriceRange = useDebounce(priceRange, 800); // Debounce price slider by 800ms
  const [maxPrice, setMaxPrice] = useState(1000);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  // ProductCard component handles the API data format directly, no conversion needed

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      });

      // Add country and currency if available (backend uses user settings as fallback)
      if (selectedCountry?.id) {
        params.append('country_id', selectedCountry.id.toString());
      }

      if (selectedCurrency?.id) {
        params.append('currency_id', selectedCurrency.id.toString());
      }

      if (debouncedSearchQuery) {
        params.append('q', debouncedSearchQuery);
      }

      if (selectedCategory && selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }

      // Add price range filters (using debounced values)
      if (debouncedPriceRange[0] > 0) {
        params.append('min_price', debouncedPriceRange[0].toString());
      }
      if (debouncedPriceRange[1] < maxPrice) {
        params.append('max_price', debouncedPriceRange[1].toString());
      }

      // Add sort parameter
      if (sortBy !== 'newest') {
        params.append('sort', sortBy);
      }

      // Add rating filter
      if (selectedRating && selectedRating > 0) {
        params.append('min_rating', selectedRating.toString());
      }

      // Add feature filters
      if (selectedFeatures.includes('On Sale')) {
        params.append('on_sale', '1');
      }
      if (selectedFeatures.includes('Featured')) {
        params.append('featured', '1');
      }
      if (selectedFeatures.includes('New Arrival')) {
        params.append('new_arrival', '1');
      }
      if (selectedFeatures.includes('In Stock')) {
        params.append('in_stock', '1');
      }

      // Use the search endpoint from backend
      const apiService = new BaseApiService();
      const response = await apiService.get(`/products/search?${params.toString()}`);
      
      if (response.error === false) {
        const productsData = response.details.products.data || [];
        setProducts(productsData);
        setTotalPages(response.details.products.last_page || 1);
        
        // Update max price based on available products
        const prices = productsData.map((p: any) => p.pricing?.price || 0);
        if (prices.length > 0) {
          const newMaxPrice = Math.max(...prices);
          setMaxPrice(Math.ceil(newMaxPrice));
        }

        // Track Meta Pixel category view event
        try {
          if (selectedCategory && selectedCategory !== 'all') {
            const categoryName = categories.find(c => c.id.toString() === selectedCategory)?.name || selectedCategory;
            await metaPixelService.trackProductListView(productsData, categoryName);
            await metaPixelService.trackCustomEvent('CategoryView', {
              category_name: categoryName,
              product_count: productsData.length,
              search_query: debouncedSearchQuery || undefined,
              sort_by: sortBy,
              page: currentPage
            });
          } else if (searchQuery) {
            // Track product list view for search results
            await metaPixelService.trackProductListView(productsData, 'Search Results');
          } else {
            // Track general product browsing
            await metaPixelService.trackProductListView(productsData, 'All Products');
          }
        } catch (pixelError) {
          console.warn('Meta Pixel category tracking failed:', pixelError);
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      // Reset to defaults if there's an error
      if (error?.response?.status === 422) {
        console.error('Validation error in filters:', error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  // Sync category from URL params (Safari fix - ensures URL params are respected)
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam && categoryParam !== selectedCategory) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  // Effect to reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, selectedCategory, debouncedPriceRange, sortBy, selectedFeatures, selectedRating]);

  // Track filter usage
  useEffect(() => {
    const trackFilterUsage = async () => {
      try {
        if (sortBy !== 'newest') {
          await metaPixelService.trackFilterUsage('sort', sortBy);
        }
        if (selectedCategory && selectedCategory !== 'all') {
          const categoryName = categories.find(c => c.id.toString() === selectedCategory)?.name || selectedCategory;
          await metaPixelService.trackFilterUsage('category', categoryName);
        }
        if (priceRange[0] > 0 || priceRange[1] < maxPrice) {
          await metaPixelService.trackFilterUsage('price_range', `${priceRange[0]}-${priceRange[1]}`);
        }
        if (selectedFeatures.length > 0) {
          for (const feature of selectedFeatures) {
            await metaPixelService.trackFilterUsage('feature', feature);
          }
        }
        if (selectedRating) {
          await metaPixelService.trackFilterUsage('rating', selectedRating.toString());
        }
      } catch (pixelError) {
        console.warn('Meta Pixel filter tracking failed:', pixelError);
      }
    };

    // Only track if there are actual filters applied (not initial load)
    if (hasActiveFilters) {
      trackFilterUsage();
    }
  }, [selectedCategory, sortBy, priceRange, selectedFeatures, selectedRating]); // Don't include searchQuery to avoid duplicate search tracking

  // Effect to fetch products when params change (initial load + filter changes)
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCurrency, debouncedSearchQuery, selectedCategory, currentPage, debouncedPriceRange, sortBy, selectedRating, selectedFeatures]);

  // Effect to update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory);
    if (sortBy !== 'newest') params.set('sort', sortBy);
    if (currentPage > 1) params.set('page', currentPage.toString());
    if (priceRange[0] > 0) params.set('min_price', priceRange[0].toString());
    if (priceRange[1] < maxPrice) params.set('max_price', priceRange[1].toString());

    // Use replace: true to avoid creating multiple history entries
    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedCategory, sortBy, currentPage, priceRange, maxPrice]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Page reset is handled automatically by useEffect
  };

  // Clear filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy('newest');
    setPriceRange([0, maxPrice]);
    setSelectedFeatures([]);
    setSelectedRating(null);
    setSearchParams({});
    // Page reset is handled automatically by useEffect
  };

  const hasActiveFilters = debouncedSearchQuery || (selectedCategory && selectedCategory !== 'all') || sortBy !== 'newest' ||
    priceRange[0] > 0 || priceRange[1] < maxPrice || selectedFeatures.length > 0 || selectedRating !== null;

  return (
    <StoreLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Products</h1>
          {selectedCategory && (
            <div className="text-gray-600">
              Showing products in category: <Badge variant="secondary">{selectedCategory}</Badge>
            </div>
          )}
        </div>

        {/* Search and Filters Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search products by name or SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </form>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>

              {/* Filters Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
                <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Category Filter */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Category</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.slug}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">
                      Price Range: ${priceRange[0]} - ${priceRange[1]}
                    </Label>
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={maxPrice}
                      min={0}
                      step={10}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>${0}</span>
                      <span>${maxPrice}</span>
                    </div>
                  </div>

                  {/* Product Features */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Features</Label>
                    <div className="space-y-2">
                      {['On Sale', 'Featured', 'New Arrival', 'In Stock'].map((feature) => (
                        <div key={feature} className="flex items-center space-x-2">
                          <Checkbox
                            id={feature}
                            checked={selectedFeatures.includes(feature)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedFeatures([...selectedFeatures, feature]);
                              } else {
                                setSelectedFeatures(selectedFeatures.filter(f => f !== feature));
                              }
                            }}
                          />
                          <Label htmlFor={feature} className="text-sm cursor-pointer">
                            {feature}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Rating Filter */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Minimum Rating</Label>
                    <Select 
                      value={selectedRating?.toString() || "any"} 
                      onValueChange={(value) => setSelectedRating(value === "any" ? null : Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any Rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any Rating</SelectItem>
                        <SelectItem value="4">4+ Stars</SelectItem>
                        <SelectItem value="3">3+ Stars</SelectItem>
                        <SelectItem value="2">2+ Stars</SelectItem>
                        <SelectItem value="1">1+ Stars</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t">
                <span className="text-sm text-gray-600">Active filters:</span>
                {searchQuery && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Search: {searchQuery}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} />
                  </Badge>
                )}
                {selectedCategory && selectedCategory !== 'all' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Category: {categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategory('all')} />
                  </Badge>
                )}
                {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Price: ${priceRange[0]} - ${priceRange[1]}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => setPriceRange([0, maxPrice])} />
                  </Badge>
                )}
                {selectedFeatures.map((feature) => (
                  <Badge key={feature} variant="secondary" className="flex items-center gap-1">
                    {feature}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => setSelectedFeatures(selectedFeatures.filter(f => f !== feature))} 
                    />
                  </Badge>
                ))}
                {selectedRating && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {selectedRating}+ Stars
                    <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedRating(null)} />
                  </Badge>
                )}
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear all
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-300 rounded-lg h-64 mb-4"></div>
                <div className="bg-gray-300 rounded h-4 mb-2"></div>
                <div className="bg-gray-300 rounded h-4 w-3/4"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
              {products.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={page === currentPage ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">
              {hasActiveFilters
                ? 'Try adjusting your search criteria or clearing filters.'
                : 'There are no products available at the moment.'}
            </p>
            {hasActiveFilters && (
              <Button onClick={clearFilters}>Clear all filters</Button>
            )}
          </div>
        )}
      </div>
    </StoreLayout>
  );
};

export default StoreProducts;