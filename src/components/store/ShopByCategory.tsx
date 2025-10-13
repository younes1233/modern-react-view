import { useState, useCallback, useMemo, memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { useStoreCategories } from '@/hooks/useStoreCategories';
import { ShopByCategorySkeleton } from './ShopByCategorySkeleton';

export const ShopByCategory = memo(function ShopByCategory() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { categories, loading } = useStoreCategories();

  // Show skeleton while loading
  if (loading) {
    return <ShopByCategorySkeleton />;
  }

  // Hide if no categories
  if (categories.length === 0) {
    return null;
  }

  // Memoize handlers to prevent re-creating on every render
  const handleCategoryClick = useCallback((categorySlug: string) => {
    console.log('Category selected:', categorySlug);
  }, []);

  const totalSlides = useMemo(() => Math.ceil(categories.length / 7), [categories.length]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Memoize visible categories for current slide
  const visibleCategories = useMemo(() => {
    const startIndex = currentSlide * 7;
    return categories.slice(startIndex, startIndex + 7);
  }, [currentSlide, categories]);

  return (
    <section className="py-6 sm:py-8 md:py-12 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="hidden sm:block text-center mb-4 sm:mb-6 md:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-light text-gray-600 tracking-wide">
            SHOP BY CATEGORY
          </h2>
        </div>

        {/* Desktop Slider with Hover Animation */}
        <div className="hidden lg:block relative">
          {/* Container with proper margins */}
          <div className="mx-32">
            <div className="flex justify-center items-center gap-6">
              {visibleCategories.map((category) => (
                <Link
                  key={category.id}
                  to={`/products?category=${category.slug}`}
                  onClick={() => handleCategoryClick(category.slug)}
                  className="group flex-shrink-0"
                >
                  <Card className="w-[135px] h-[420px] border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 bg-white overflow-hidden relative rounded-3xl group-hover:w-[250px]">
                    <CardContent className="p-0 h-full">
                      <div className="relative h-full overflow-hidden">
                        <img
                          src={category.image}
                          alt={category.name}
                          loading="eager"
                          decoding="async"
                          fetchpriority="high"
                          className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700 group-hover:object-center"
                        />

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                        {/* Content */}
                        <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center px-4">
                          {/* Text wrapper with animation */}
                          <div className="flex justify-center items-center w-[120px] h-[110px] mb-2 overflow-visible group-hover:w-[170px] transition-all duration-500">
                            <h3 className="text-base font-bold text-white group-hover:text-blue-200 transition-all duration-500 whitespace-nowrap group-hover:text-lg -rotate-90 group-hover:rotate-0 origin-center">
                              {category.name}
                            </h3>
                          </div>

                          {/* Icon */}
                          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 group-hover:w-12 group-hover:h-12 transition-all duration-500">
                            {category.icon && category.icon.startsWith('http') ? (
                              <img src={category.icon} alt={`${category.name} icon`} className="w-6 h-6 object-contain group-hover:w-7 group-hover:h-7 transition-all duration-500" />
                            ) : (
                              <span className="text-xl text-white group-hover:text-2xl transition-all duration-500">{category.icon || '📦'}</span>
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
          {totalSlides > 1 && (
            <div className="flex justify-end mt-6 space-x-2">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                    index === currentSlide ? 'bg-cyan-500' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Mobile & Tablet: Text Below Image Design */}
        <div className="lg:hidden">
          <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {categories.map((category) => (
              <div key={category.id} className="group flex-shrink-0 flex flex-col items-center">
                <Link
                  to={`/products?category=${category.slug}`}
                  onClick={() => handleCategoryClick(category.slug)}
                  className="block"
                >
                  <Card className="w-20 h-28 sm:w-24 sm:h-32 md:w-28 md:h-36 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white overflow-hidden rounded-2xl">
                    <CardContent className="p-0 h-full">
                      <img
                        src={category.image}
                        alt={category.name}
                        loading="eager"
                        decoding="async"
                        fetchpriority="high"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </CardContent>
                  </Card>
                </Link>
                <h3 className="font-bold text-xs leading-tight text-gray-800 text-center mt-2 px-1">
                  {category.name}
                </h3>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
});