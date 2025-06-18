
import { useState, useEffect } from "react";
import { StoreLayout } from "@/components/store/StoreLayout";
import { ProductSection } from "@/components/store/ProductSection";
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
    
    // Listen for storage events to detect changes from dashboard
    const handleStorageChange = () => {
      console.log("Storage change detected, refreshing store data");
      refreshStoreData();
    };

    // Listen for custom events from the dashboard
    const handleDataUpdate = () => {
      console.log("Data update event received, refreshing store data");
      refreshStoreData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storeDataUpdated', handleDataUpdate);
    
    // Poll for changes every 2 seconds as a fallback
    const interval = setInterval(refreshStoreData, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storeDataUpdated', handleDataUpdate);
      clearInterval(interval);
    };
  }, []);

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
          <div className="relative h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden shadow-lg">
            <img
              src={banner.image}
              alt={banner.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent flex items-center">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl text-white">
                  <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-4 leading-tight">
                    {banner.title}
                  </h2>
                  {banner.subtitle && (
                    <p className="text-lg sm:text-xl lg:text-2xl mb-6 opacity-90">
                      {banner.subtitle}
                    </p>
                  )}
                  {banner.ctaText && (
                    <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
                      {banner.ctaText}
                    </button>
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Hero Section */}
        <div className="bg-white shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-900 mb-4 lg:mb-6 leading-tight">
                Welcome to Our Store
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-8 lg:mb-12 leading-relaxed">
                Discover amazing products at unbeatable prices
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
                  Shop Now
                </button>
                <button className="border-2 border-gray-300 hover:border-cyan-600 text-gray-700 hover:text-cyan-600 px-8 py-3 rounded-lg font-semibold transition-all duration-300">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Sections */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
              <p className="mt-4 text-gray-600">Loading store content...</p>
            </div>
          ) : homeSections.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No sections configured. Please add some content in the Store Management dashboard.</p>
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
