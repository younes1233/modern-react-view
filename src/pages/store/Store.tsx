
import { useState, useEffect } from "react";
import { StoreLayout } from "@/components/store/StoreLayout";
import { ProductSection } from "@/components/store/ProductSection";
import { ShopByCategory } from "@/components/store/ShopByCategory";
import { Button } from "@/components/ui/button";
import { useSearch } from "@/contexts/SearchContext";
import { Link } from "react-router-dom";
import { 
  getActiveHomeSections, 
  getBanners, 
  getProductListings,
  getHeroSection,
  HomeSection,
  Banner,
  ProductListing,
  HeroSection
} from "@/data/storeData";

const Store = () => {
  const [homeSections, setHomeSections] = useState<HomeSection[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [productListings, setProductListings] = useState<ProductListing[]>([]);
  const [heroSection, setHeroSection] = useState<HeroSection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setSearchQuery, setSelectedCategory } = useSearch();

  // Function to refresh all data
  const refreshStoreData = () => {
    console.log("Refreshing store data...");
    setHomeSections(getActiveHomeSections());
    setBanners(getBanners());
    setProductListings(getProductListings());
    setHeroSection(getHeroSection());
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
        {heroSection && heroSection.isActive && (
          <div className="relative h-[600px] md:h-[700px] lg:h-[800px] overflow-hidden">
            <img
              src={heroSection.backgroundImage}
              alt="Hero Background"
              className="w-full h-full object-cover"
            />
            
            {/* Enhanced Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto text-center text-white">
                  <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold mb-6 lg:mb-8 leading-tight animate-fade-in">
                    {heroSection.title}
                  </h1>
                  <p className="text-xl sm:text-2xl lg:text-3xl mb-12 lg:mb-16 leading-relaxed animate-fade-in max-w-4xl mx-auto opacity-90">
                    {heroSection.subtitle}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in">
                    <Link to={heroSection.ctaLink}>
                      <Button 
                        onClick={handleShopNow}
                        size="lg"
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-12 py-6 rounded-2xl font-semibold text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/25"
                      >
                        {heroSection.ctaText}
                      </Button>
                    </Link>
                    <Link to="/store/categories">
                      <Button 
                        variant="outline"
                        size="lg"
                        className="border-2 border-white/30 hover:border-white text-white hover:text-gray-900 hover:bg-white/90 backdrop-blur-sm px-12 py-6 rounded-2xl font-semibold text-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                      >
                        Browse Categories
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Shop by Category Section */}
        <ShopByCategory />

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
