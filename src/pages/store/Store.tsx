
import { useState, useEffect } from "react";
import { StoreLayout } from "@/components/store/StoreLayout";
import { ProductCard } from "@/components/store/ProductCard";
import { ShopByCategory } from "@/components/store/ShopByCategory";
import { ProductSection } from "@/components/store/ProductSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Star, Heart, ShoppingCart, Zap, Shield, Truck } from "lucide-react";
import { getProducts, getFeaturedProducts, getNewArrivals, getProductsOnSale, getProductListings, getHeroSection, getActiveHomeSections, getBanners, HeroSection, HomeSection, Banner, ProductListing } from "@/data/storeData";

const Store = () => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [heroSection, setHeroSection] = useState<HeroSection | null>(null);
  const [homeSections, setHomeSections] = useState<HomeSection[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [productListings, setProductListings] = useState<ProductListing[]>([]);

  useEffect(() => {
    // Load initial data
    const loadData = () => {
      setHeroSection(getHeroSection());
      setHomeSections(getActiveHomeSections());
      setBanners(getBanners());
      setProductListings(getProductListings());
    };
    loadData();

    // Listen for data updates from dashboard
    const handleDataUpdate = () => {
      loadData();
    };
    window.addEventListener('storeDataUpdated', handleDataUpdate);
    return () => {
      window.removeEventListener('storeDataUpdated', handleDataUpdate);
    };
  }, []);

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
  };

  const products = getProducts();
  const featuredProducts = getFeaturedProducts();
  const newArrivals = getNewArrivals();
  const bestSellers = getProductsOnSale();

  const getSectionContent = (section: HomeSection) => {
    if (section.type === 'banner') {
      const banner = banners.find(b => b.id === section.itemId);
      if (!banner) return null;
      return <section key={section.id} className="py-1 md:py-2 bg-white">
          <div className="w-full max-w-full overflow-hidden bg-white">
            <div className="relative rounded-2xl overflow-hidden shadow-lg bg-white">
              <img src={banner.image} alt={banner.title} className="w-full h-64 md:h-80 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center">
                <div className="p-4 md:p-8 text-white">
                  <h2 className="text-2xl md:text-4xl font-bold mb-2">
                    {banner.title}
                  </h2>
                  {banner.subtitle && <p className="text-lg mb-4 opacity-90">
                      {banner.subtitle}
                    </p>}
                  {banner.ctaText && banner.ctaLink && <Button className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-full">
                      {banner.ctaText}
                    </Button>}
                </div>
              </div>
            </div>
          </div>
        </section>;
    } else if (section.type === 'productListing') {
      const listing = productListings.find(l => l.id === section.itemId);
      if (!listing) return null;
      return <section key={section.id} className="py-1 md:py-2 bg-white">
          <ProductSection listing={listing} />
        </section>;
    }
    return null;
  };

  return <div className="min-h-screen bg-white light overflow-x-hidden" data-store-page>
      <StoreLayout>
        {/* Hero Section - Full Width with Overlay Text */}
        {heroSection && heroSection.isActive && <section className="relative w-full h-[70vh] md:h-[80vh] overflow-hidden z-10">
            <div className="absolute inset-0">
              <img src={heroSection.backgroundImage} alt="Hero Background" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
            </div>
            
            <div className="relative z-20 h-full flex items-center rounded-md mx-0">
              <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
                <div className="max-w-2xl text-white">
                  <div className="inline-block bg-cyan-500/20 backdrop-blur-sm text-cyan-200 px-4 py-2 rounded-full text-sm font-medium mb-6">
                    ✨ Premium Quality
                  </div>
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                    {heroSection.title}
                  </h1>
                  <p className="text-lg md:text-xl text-gray-200 leading-relaxed mb-8 max-w-xl">
                    {heroSection.subtitle}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <Button size="lg" className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-xl">
                      {heroSection.ctaText}
                    </Button>
                    <div className="text-left">
                      <div className="text-xl md:text-2xl font-bold text-white">961 76591765</div>
                      <div className="text-sm text-gray-300">WWW.MEEMHOME.COM</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>}

        {/* Shop by Category */}
        <div className="w-full overflow-hidden">
          <ShopByCategory />
        </div>

        {/* Dynamic Home Sections from Dashboard */}
        <div className="w-full overflow-hidden bg-white">
          {homeSections.map(section => getSectionContent(section))}
        </div>

        {/* Fallback Best Sellers if no sections are configured */}
        {homeSections.length === 0 && <section className="py-8 md:py-16 bg-white overflow-hidden">
            <div className="w-full max-w-full px-2 md:px-4">
              <div className="max-w-7xl mx-auto">
                <div className="mb-12">
                  <div className="bg-cyan-500 text-white px-6 py-2 rounded-t-lg inline-block">
                    <h2 className="text-2xl lg:text-3xl font-bold">Electronic</h2>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                  {bestSellers.map(product => <ProductCard key={product.id} product={product} />)}
                </div>
                
                {/* Pagination dots */}
                <div className="flex justify-center mt-8 space-x-2">
                  <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                </div>
              </div>
            </div>
          </section>}

        {/* Newsletter Section */}
        <section className="py-12 md:py-16 bg-gradient-to-r from-cyan-400 to-blue-500 overflow-hidden relative">
          {/* Decorative Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 text-6xl text-white transform rotate-12">+</div>
            <div className="absolute top-20 right-20 text-4xl text-white transform -rotate-12">×</div>
            <div className="absolute bottom-10 left-20 text-5xl text-white transform rotate-45">+</div>
            <div className="absolute bottom-20 right-10 text-3xl text-white transform -rotate-45">×</div>
            <div className="absolute top-1/2 left-1/4 text-4xl text-white transform rotate-12">+</div>
            <div className="absolute top-1/3 right-1/3 text-3xl text-white transform -rotate-12">×</div>
          </div>
          
          <div className="relative z-10 w-full max-w-full px-4 md:px-8 text-center">
            <div className="max-w-2xl mx-auto text-white">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Get Your Order Now</h2>
              <p className="text-lg mb-8 text-cyan-100 opacity-90">
                Be the first to know about new products, exclusive offers, and special events.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                <div className="relative flex-1">
                  <input type="email" placeholder="Type your email here" className="w-full px-6 py-4 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white bg-white/95 backdrop-blur-sm" />
                  <Button className="absolute right-1 top-1 bottom-1 bg-cyan-500 hover:bg-cyan-600 text-white px-8 rounded-full font-semibold">
                    Subscribe
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </StoreLayout>
    </div>;
};

export default Store;
