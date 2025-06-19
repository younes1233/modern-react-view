
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
        {/* Modern Hero Section */}
        {heroSection && heroSection.isActive && (
          <div className="relative min-h-screen overflow-hidden">
            {/* Background Image with Parallax Effect */}
            <div className="absolute inset-0">
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3"
                alt="Modern Shopping Experience"
                className="w-full h-full object-cover scale-105 transform transition-transform duration-20000 hover:scale-110"
              />
            </div>
            
            {/* Modern Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 via-purple-900/70 to-pink-900/60" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 via-transparent to-purple-900/30" />
            
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-400/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
            
            <div className="relative h-full flex items-center justify-center min-h-screen">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto text-center text-white">
                  {/* Modern Typography */}
                  <div className="space-y-8 animate-fade-in">
                    <h1 className="text-6xl sm:text-7xl lg:text-9xl font-black mb-8 leading-tight tracking-tight">
                      <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                        {heroSection.title}
                      </span>
                    </h1>
                    
                    <p className="text-xl sm:text-2xl lg:text-4xl mb-12 leading-relaxed max-w-5xl mx-auto font-light opacity-90">
                      <span className="bg-gradient-to-r from-gray-100 to-white bg-clip-text text-transparent">
                        {heroSection.subtitle}
                      </span>
                    </p>
                    
                    {/* Modern CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
                      <Link to={heroSection.ctaLink}>
                        <Button 
                          onClick={handleShopNow}
                          size="lg"
                          className="group relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-800 text-white px-16 py-8 rounded-2xl font-bold text-2xl transition-all duration-500 transform hover:scale-110 shadow-2xl hover:shadow-blue-500/50 border border-white/20"
                        >
                          <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                          <span className="relative z-10">{heroSection.ctaText}</span>
                        </Button>
                      </Link>
                      
                      <Link to="/store/categories">
                        <Button 
                          variant="outline"
                          size="lg"
                          className="group relative overflow-hidden border-2 border-white/40 hover:border-white text-white hover:text-gray-900 hover:bg-white/95 backdrop-blur-xl px-16 py-8 rounded-2xl font-bold text-2xl transition-all duration-500 transform hover:scale-110 shadow-2xl bg-white/10"
                        >
                          <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                          <span className="relative z-10">Browse Categories</span>
                        </Button>
                      </Link>
                    </div>

                    {/* Modern Stats/Features */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                      <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                        <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">10k+</div>
                        <div className="text-lg opacity-90">Happy Customers</div>
                      </div>
                      <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                        <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">50k+</div>
                        <div className="text-lg opacity-90">Products</div>
                      </div>
                      <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                        <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">24/7</div>
                        <div className="text-lg opacity-90">Support</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
              <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
                <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
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
