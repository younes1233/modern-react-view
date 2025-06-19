
import { useState, useEffect } from "react";
import { StoreLayout } from "@/components/store/StoreLayout";
import { ProductCard } from "@/components/store/ProductCard";
import { ShopByCategory } from "@/components/store/ShopByCategory";
import { ProductSection } from "@/components/store/ProductSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Star, Heart, ShoppingCart, Zap, Shield, Truck } from "lucide-react";
import { 
  getProducts, 
  getFeaturedProducts, 
  getNewArrivals, 
  getProductsOnSale, 
  getProductListings,
  getHeroSection,
  getActiveHomeSections,
  getBanners,
  HeroSection,
  HomeSection,
  Banner,
  ProductListing
} from "@/data/storeData";

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
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const products = getProducts();
  const featuredProducts = getFeaturedProducts();
  const newArrivals = getNewArrivals();
  const bestSellers = getProductsOnSale();

  const getSectionContent = (section: HomeSection) => {
    if (section.type === 'banner') {
      const banner = banners.find(b => b.id === section.itemId);
      if (!banner) return null;
      
      return (
        <section key={section.id} className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10"></div>
          
          <div className="relative container mx-auto px-4 py-16 lg:py-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-white space-y-6">
                <div className="space-y-4">
                  <h2 className="text-4xl lg:text-6xl font-bold leading-tight">
                    {banner.title}
                  </h2>
                  {banner.subtitle && (
                    <p className="text-xl text-gray-300 max-w-lg">
                      {banner.subtitle}
                    </p>
                  )}
                </div>
                
                {banner.ctaText && banner.ctaLink && (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg font-semibold shadow-2xl hover:shadow-purple-500/25 transition-all duration-300">
                      {banner.ctaText}
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="relative">
                <div className="relative z-10">
                  <img 
                    src={banner.image} 
                    alt={banner.title} 
                    className="rounded-2xl shadow-2xl w-full h-[400px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 to-transparent rounded-2xl"></div>
                </div>
                <div className="absolute -top-4 -left-4 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-4 -right-4 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl"></div>
              </div>
            </div>
          </div>
        </section>
      );
    } else if (section.type === 'productListing') {
      const listing = productListings.find(l => l.id === section.itemId);
      if (!listing) return null;
      
      return (
        <section key={section.id} className="py-8 lg:py-12 container mx-auto px-4">
          <ProductSection listing={listing} />
        </section>
      );
    }
    
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      <StoreLayout>
        {/* Dynamic Hero Section from Dashboard */}
        {heroSection && heroSection.isActive && (
          <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10"></div>
            
            <div className="relative container mx-auto px-4 py-24 lg:py-32">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="text-white space-y-8">
                  <div className="space-y-4">
                    <Badge className="bg-purple-500/20 text-purple-200 border-purple-400/30 px-4 py-2">
                      ✨ New Collection 2024
                    </Badge>
                    <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                      {heroSection.title}
                    </h1>
                    <p className="text-xl text-gray-300 max-w-lg">
                      {heroSection.subtitle}
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg font-semibold shadow-2xl hover:shadow-purple-500/25 transition-all duration-300">
                      {heroSection.ctaText}
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                    <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg backdrop-blur-sm">
                      Explore Collection
                    </Button>
                  </div>

                  <div className="flex items-center gap-8 pt-4">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="text-gray-300">4.9/5 from 2,000+ reviews</span>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="relative z-10">
                    <img 
                      src={heroSection.backgroundImage} 
                      alt="Premium Products" 
                      className="rounded-2xl shadow-2xl w-full h-[500px] object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 to-transparent rounded-2xl"></div>
                  </div>
                  <div className="absolute -top-4 -left-4 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"></div>
                  <div className="absolute -bottom-4 -right-4 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl"></div>
                </div>
              </div>
            </div>

            {/* Features Strip */}
            <div className="border-t border-white/10 bg-black/20 backdrop-blur-sm">
              <div className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-white">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Truck className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Free Shipping</h3>
                      <p className="text-sm text-gray-300">On orders over $99</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Shield className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Secure Payment</h3>
                      <p className="text-sm text-gray-300">100% protected</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Zap className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Fast Delivery</h3>
                      <p className="text-sm text-gray-300">Same day delivery</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Shop by Category */}
        <ShopByCategory />

        {/* Dynamic Home Sections from Dashboard */}
        {homeSections.map((section) => getSectionContent(section))}

        {/* Fallback Best Sellers if no sections are configured */}
        {homeSections.length === 0 && (
          <section className="py-16 bg-muted/30 dark:bg-muted/10">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Best Sellers</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Join thousands of satisfied customers who love these products
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {bestSellers.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Newsletter Section */}
        <section className="py-16 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-2xl mx-auto text-white">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">Stay in the Loop</h2>
              <p className="text-lg mb-8 text-purple-100">
                Be the first to know about new products, exclusive offers, and special events.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
                />
                <Button className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-3 font-semibold">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </section>
      </StoreLayout>
    </div>
  );
};

export default Store;
