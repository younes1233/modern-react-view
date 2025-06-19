
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
    <section className="py-16 lg:py-24 bg-white/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Shop by Category
          </h2>
          <p className="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our curated collection across different categories
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 lg:gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to="/store/categories"
              onClick={() => handleCategoryClick(category.slug)}
              className="group"
            >
              <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-white/80 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative">
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    
                    <div className="absolute bottom-0 left-0 right-0 p-3 lg:p-4 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 lg:p-3 border border-white/20">
                        <div className="flex items-center justify-center mb-2">
                          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                            <span className="text-lg lg:text-xl">{category.icon}</span>
                          </div>
                        </div>
                        <h3 className="font-bold text-sm lg:text-base text-center mb-1">
                          {category.name}
                        </h3>
                        <p className="text-xs lg:text-sm text-center text-white/80">
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

        <div className="text-center mt-12 lg:mt-16">
          <Link to="/store/categories">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/25"
            >
              View All Categories
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
