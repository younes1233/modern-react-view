
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStoreCategories } from '@/hooks/useStoreCategories';
import { Category } from '@/services/categoryService';
import { useSearch } from '@/contexts/SearchContext';

export function ShopByCategory() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { setSelectedCategory } = useSearch();
  
  // Use API data instead of mock data
  const { categories, loading } = useStoreCategories();

  const handleCategoryClick = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(categories.length / 7));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(categories.length / 7)) % Math.ceil(categories.length / 7));
  };

  const startIndex = currentSlide * 7;
  const visibleCategories = categories.slice(startIndex, startIndex + 7);

  return (
    <section className="py-6 sm:py-8 md:py-12 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-light text-gray-600 tracking-wide">
            SHOP BY CATEGORY
          </h2>
        </div>

        {/* Desktop Slider */}
        <div className="hidden lg:block relative">
          {/* Container with proper margins - width of one category on each side */}
          <div className="mx-32">
            <div className="flex justify-center items-center gap-6">
              {visibleCategories.map((category) => (
                <Link
                  key={category.id}
                  to="/store/categories"
                  onClick={() => handleCategoryClick(category.slug)}
                  className="group flex-shrink-0"
                >
                  <Card className="w-[135px] h-[420px] border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white overflow-hidden relative rounded-3xl">
                    <CardContent className="p-0 h-full">
                      <div className="relative h-full">
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                        {/* Content */}
                        <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center px-4">
                          {/* Text wrapper with fixed width and overflow visible */}
                          <div className="flex justify-center items-center w-[120px] h-[110px] mb-2 overflow-visible">
                            <h3
                              className="text-base font-bold text-white group-hover:text-blue-200 transition-colors duration-300 whitespace-nowrap"
                              style={{
                                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.6)',
                                transform: 'rotate(-90deg)',
                                transformOrigin: 'center center',
                              }}
                            >
                              {category.name}
                            </h3>
                          </div>

                          {/* Icon */}
                          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                            {category.icon && category.icon.startsWith('http') ? (
                              <img src={category.icon} alt={`${category.name} icon`} className="w-6 h-6 object-contain" />
                            ) : (
                              <span className="text-xl text-white">{category.icon || '📦'}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-end mt-6 space-x-2">
            {Array.from({ length: Math.ceil(categories.length / 7) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  index === currentSlide ? 'bg-cyan-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Mobile & Tablet: Horizontal Scroll */}
        <div className="lg:hidden">
          <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {categories.map((category) => (
              <Link
                key={category.id}
                to="/store/categories"
                onClick={() => handleCategoryClick(category.slug)}
                className="group flex-shrink-0"
              >
                <Card className="w-20 h-28 sm:w-24 sm:h-32 md:w-28 md:h-36 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white overflow-hidden rounded-2xl">
                  <CardContent className="p-0 h-full">
                    <div className="relative h-full">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                      <div className="absolute inset-0 flex flex-col justify-between p-2 sm:p-3">
                         <div className="flex justify-center">
                           <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                             {category.icon && category.icon.startsWith('http') ? (
                               <img src={category.icon} alt={`${category.name} icon`} className="w-3 h-3 sm:w-4 sm:h-4 object-contain" />
                             ) : (
                               <span className="text-xs sm:text-sm md:text-base">{category.icon || '📦'}</span>
                             )}
                           </div>
                         </div>
                        <div className="text-center text-white">
                          <h3 className="font-bold text-xs leading-tight">
                            {category.name}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Navigation Dots on right with hidden slides count */}
          <div className="flex justify-end items-center mt-4 space-x-3 pr-4">
            <div className="flex space-x-2">
              {Array.from({ length: Math.ceil(categories.length / 7) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                    index === currentSlide ? 'bg-cyan-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            {/* Number of hidden slides */}
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {Math.max(0, (Math.ceil(categories.length / 7) - 1 - currentSlide))} more
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
