
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCategories, Category } from '@/data/storeData';
import { useSearch } from '@/contexts/SearchContext';

export function ShopByCategory() {
  const [categories, setCategories] = useState<Category[]>([]);
  const { setSelectedCategory } = useSearch();

  useEffect(() => {
    setCategories(getCategories());
  }, []);

  const handleCategoryClick = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
  };

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl transform -translate-x-48 -translate-y-48"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-3xl transform translate-x-48 translate-y-48"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16 lg:mb-20">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
            <Package className="w-4 h-4 mr-2" />
            Shop by Category
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Discover Our
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Collections</span>
          </h2>
          <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Explore our carefully curated categories designed to meet all your needs
          </p>
        </div>

        {/* Desktop: Horizontal Scrolling Layout */}
        <div className="hidden lg:block">
          <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                to="/store/categories"
                onClick={() => handleCategoryClick(category.slug)}
                className="group flex-shrink-0"
              >
                <Card className="w-64 h-80 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 bg-white/90 backdrop-blur-sm overflow-hidden relative">
                  <CardContent className="p-0 h-full">
                    <div className="relative h-full">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
                      
                      {/* Content */}
                      <div className="absolute inset-0 flex flex-col justify-between p-6">
                        {/* Icon */}
                        <div className="flex justify-center">
                          <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform duration-300">
                            <span className="text-2xl">{category.icon}</span>
                          </div>
                        </div>
                        
                        {/* Text Content */}
                        <div className="text-center text-white">
                          <h3 className="text-xl font-bold mb-2 group-hover:text-blue-200 transition-colors duration-300">
                            {category.name}
                          </h3>
                          <p className="text-sm text-white/80 mb-3">
                            {category.productCount} products
                          </p>
                          <div className="w-12 h-0.5 bg-gradient-to-r from-blue-400 to-indigo-400 mx-auto transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile & Tablet: Grid Layout */}
        <div className="lg:hidden grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to="/store/categories"
              onClick={() => handleCategoryClick(category.slug)}
              className="group"
            >
              <Card className="h-40 sm:h-48 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white/90 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-0 h-full">
                  <div className="relative h-full">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
                    
                    <div className="absolute inset-0 flex flex-col justify-between p-3 sm:p-4">
                      <div className="flex justify-center">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                          <span className="text-lg sm:text-xl">{category.icon}</span>
                        </div>
                      </div>
                      
                      <div className="text-center text-white">
                        <h3 className="font-bold text-sm sm:text-base mb-1">
                          {category.name}
                        </h3>
                        <p className="text-xs text-white/80">
                          {category.productCount} items
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center mt-16 lg:mt-20">
          <Link to="/store/categories">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-10 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/25"
            >
              View All Categories
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
      
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
