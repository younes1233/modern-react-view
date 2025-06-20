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
      return <section key={section.id} className="py-8 container mx-auto px-4">
          <div className="relative rounded-2xl overflow-hidden shadow-lg">
            <img src={banner.image} alt={banner.title} className="w-full h-64 md:h-80 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center">
              <div className="p-8 text-white">
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
        </section>;
    } else if (section.type === 'productListing') {
      const listing = productListings.find(l => l.id === section.itemId);
      if (!listing) return null;
      return <section key={section.id} className="lg:py-12 container mx-auto px-px py-[10px]">
          <ProductSection listing={listing} />
        </section>;
    }
    return null;
  };
  return <div className="min-h-screen bg-gray-50" data-store-page>
      <StoreLayout>
        {/* Hero Section - Inspired by wooden door panels design */}
        {heroSection && heroSection.isActive && <section className="relative bg-white">
            <div className="container mx-auto px-4 py-16">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <div className="inline-block bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm font-medium">
                    ✨ Premium Quality
                  </div>
                  <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                    {heroSection.title}
                  </h1>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    {heroSection.subtitle}
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <Button size="lg" className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-4 rounded-full text-lg font-semibold">
                      {heroSection.ctaText}
                    </Button>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">961 76591765</div>
                      <div className="text-sm text-gray-600">WWW.MEEMHOME.COM</div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  {/* Wooden panels display inspired by the image */}
                  <div className="relative bg-gray-100 rounded-2xl p-8 shadow-xl">
                    <img src={heroSection.backgroundImage} alt="Premium Products" className="w-full h-96 object-cover rounded-lg" />
                    {/* Decorative elements */}
                    <div className="absolute -top-4 -left-4 w-20 h-20 bg-cyan-500 rounded-full opacity-20"></div>
                    <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-cyan-300 rounded-full opacity-30"></div>
                  </div>
                </div>
              </div>
            </div>
          </section>}

        {/* Shop by Category */}
        <ShopByCategory />

        {/* Dynamic Home Sections from Dashboard */}
        {homeSections.map(section => getSectionContent(section))}

        {/* Fallback Best Sellers if no sections are configured */}
        {homeSections.length === 0 && <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
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
          </section>}

        {/* Newsletter Section */}
        <section className="py-16 bg-gradient-to-r from-cyan-500 to-blue-600">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-2xl mx-auto text-white">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">Stay in the Loop</h2>
              <p className="text-lg mb-8 text-cyan-100">
                Be the first to know about new products, exclusive offers, and special events.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input type="email" placeholder="Enter your email" className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white" />
                <Button className="bg-white text-cyan-600 hover:bg-gray-100 px-8 py-3 font-semibold">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </section>
      </StoreLayout>
    </div>;
};
export default Store;