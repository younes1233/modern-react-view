
import { useState, useEffect } from "react";
import { StoreLayout } from "@/components/store/StoreLayout";
import { ProductSection } from "@/components/store/ProductSection";
import { Button } from "@/components/ui/button";
import { useSearch } from "@/contexts/SearchContext";
import { Link } from "react-router-dom";
import { 
  getActiveHomeSections, 
  getBanners, 
  getProductListings,
  HomeSection,
  Banner,
  ProductListing
} from "@/data/storeData";

const Store = () => {
  const [homeSections, setHomeSections] = useState<HomeSection[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [productListings, setProductListings] = useState<ProductListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { setSearchQuery, setSelectedCategory } = useSearch();

  // Function to refresh all data
  const refreshStoreData = () => {
    console.log("Refreshing store data...");
    setHomeSections(getActiveHomeSections());
    setBanners(getBanners());
    setProductListings(getProductListings());
    setIsLoading(false);
  };

  useEffect(() => {
    refreshStoreData();
    
    // Listen for custom events from the dashboard
    const handleDataUpdate = () => {
      console.log("Data update event received, refreshing store data");
      refreshStoreData();
    };

    window.addEventListener('storeDataUpdated', handleDataUpdate);
    
    // Cleanup
    return () => {
      window.removeEventListener('storeDataUpdated', handleDataUpdate);
    };
  }, []);

  const handleShopNow = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
  };

  const renderSection = (section: HomeSection) => {
    console.log("Rendering section:", section);
    
    if (section.type === 'banner') {
      const banner = banners.find(b => b.id === section.itemId);
      console.log("Found banner:", banner);
      
      if (!banner || !banner.isActive) {
        console.log("Banner not found or inactive");
        return null;
      }
      
      return (
        <div key={`banner-${section.id}`} className="mb-8 lg:mb-12">
          <div className="relative h-64 md:h-80 lg:h-96 rounded-2xl overflow-hidden shadow-2xl group">
            <img
              src={banner.image}
              alt={banner.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent flex items-center">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl text-white">
                  <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-4 leading-tight animate-fade-in">
                    {banner.title}
                  </h2>
                  {banner.subtitle && (
                    <p className="text-lg sm:text-xl lg:text-2xl mb-8 opacity-90 animate-fade-in">
                      {banner.subtitle}
                    </p>
                  )}
                  {banner.ctaText && (
                    <Button 
                      onClick={() => {
                        if (banner.ctaLink?.includes('categories')) {
                          if (banner.ctaLink.includes('category=')) {
                            const category = banner.ctaLink.split('category=')[1];
                            handleCategoryClick(category);
                          }
                        }
                        handleShopNow();
                      }}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-2xl text-base sm:text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/25 animate-fade-in"
                    >
                      {banner.ctaText}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      const listing = productListings.find(p => p.id === section.itemId);
      console.log("Found product listing:", listing);
      
      if (!listing || !listing.isActive) {
        console.log("Product listing not found or inactive");
        return null;
      }
      
      return (
        <div key={`listing-${section.id}`} className="mb-8 lg:mb-12">
          <ProductSection listing={listing} />
        </div>
      );
    }
  };

  console.log("Store render - homeSections:", homeSections.length, "banners:", banners.length, "listings:", productListings.length);

  return (
    <StoreLayout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="bg-white/80 backdrop-blur-sm shadow-lg">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
            <div className="text-center max-w-5xl mx-auto">
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6 lg:mb-8 leading-tight animate-fade-in">
                Welcome to Our Store
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-10 lg:mb-16 leading-relaxed animate-fade-in max-w-3xl mx-auto">
                Discover amazing products at unbeatable prices with fast shipping and exceptional customer service
              </p>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center animate-fade-in">
                <Button 
                  onClick={handleShopNow}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-10 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/25"
                >
                  Shop Now
                </Button>
                <Link to="/store/categories">
                  <Button 
                    variant="outline"
                    className="border-2 border-gray-300 hover:border-blue-600 text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-10 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Browse Categories
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Sections */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
          {isLoading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600 text-lg">Loading store content...</p>
            </div>
          ) : homeSections.length === 0 ? (
            <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-xl">
              <p className="text-gray-600 text-xl mb-6">No sections configured. Please add some content in the Store Management dashboard.</p>
              <Link to="/store-management">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl px-8 py-3 text-lg font-semibold shadow-lg">
                  Manage Store
                </Button>
              </Link>
            </div>
          ) : (
            homeSections.map(renderSection)
          )}
        </div>
      </div>
    </StoreLayout>
  );
};

export default Store;
