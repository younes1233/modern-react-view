
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

  useEffect(() => {
    setHomeSections(getActiveHomeSections());
    setBanners(getBanners());
    setProductListings(getProductListings());
  }, []);

  const renderSection = (section: HomeSection) => {
    if (section.type === 'banner') {
      const banner = banners.find(b => b.id === section.itemId);
      if (!banner || !banner.isActive) return null;
      
      return (
        <div key={`banner-${section.id}`} className="mb-8">
          <div className="relative h-64 lg:h-96 rounded-lg overflow-hidden">
            <img
              src={banner.image}
              alt={banner.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <div className="text-center text-white">
                <h2 className="text-3xl lg:text-5xl font-bold mb-4">{banner.title}</h2>
                {banner.subtitle && (
                  <p className="text-xl lg:text-2xl mb-6">{banner.subtitle}</p>
                )}
                {banner.ctaText && (
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors">
                    {banner.ctaText}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      const listing = productListings.find(p => p.id === section.itemId);
      if (!listing || !listing.isActive) return null;
      
      return (
        <div key={`listing-${section.id}`} className="mb-8">
          <ProductSection listing={listing} />
        </div>
      );
    }
  };

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-4">
            Welcome to Our Store
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Discover amazing products at unbeatable prices
          </p>
        </div>

        {/* Dynamic Sections */}
        {homeSections.map(renderSection)}
      </div>
    </StoreLayout>
  );
};

export default Store;
