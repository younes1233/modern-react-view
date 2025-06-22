
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCategories, Category } from '@/data/storeData';
import { useSearch } from '@/contexts/SearchContext';

export function ShopByCategory() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { setSelectedCategory } = useSearch();

  useEffect(() => {
    setCategories(getCategories());
  }, []);

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
    <section className="py-3 sm:py-4 md:py-8 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-3 sm:mb-4 md:mb-6">
          <h2 className="text-base sm:text-lg md:text-2xl font-light text-gray-600 tracking-wide">
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
                            <span className="text-xl text-white">{category.icon}</span>
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
          <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-3 scrollbar-hide">
            {categories.map((category) => (
              <Link
                key={category.id}
                to="/store/categories"
                onClick={() => handleCategoryClick(category.slug)}
                className="group flex-shrink-0"
              >
                <Card className="w-16 h-20 sm:w-18 sm:h-24 md:w-20 md:h-28 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white overflow-hidden rounded-2xl">
                  <CardContent className="p-0 h-full">
                    <div className="relative h-full">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                      <div className="absolute inset-0 flex flex-col justify-between p-1.5 sm:p-2">
                        <div className="flex justify-center">
                          <div className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                            <span className="text-xs">{category.icon}</span>
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
          <div className="flex justify-end items-center mt-3 space-x-2 pr-4">
            <div className="flex space-x-1">
              {Array.from({ length: Math.ceil(categories.length / 7) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                    index === currentSlide ? 'bg-cyan-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            {/* Number of hidden slides */}
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {Math.max(0, (Math.ceil(categories.length / 7) - 1 - currentSlide))} more
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
