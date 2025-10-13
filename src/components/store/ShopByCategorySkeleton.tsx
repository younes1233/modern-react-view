export function ShopByCategorySkeleton() {
  return (
    <section className="py-6 sm:py-8 md:py-12 bg-white animate-pulse">
      <div className="container mx-auto px-4">
        {/* Header - matches actual component */}
        <div className="hidden sm:block text-center mb-4 sm:mb-6 md:mb-8">
          <div className="bg-gray-300 h-7 sm:h-8 md:h-9 w-64 mx-auto rounded"></div>
        </div>

        {/* Desktop Layout: Tall vertical cards (unhovered state - 135px × 420px) */}
        <div className="hidden lg:block relative">
          <div className="mx-32">
            <div className="flex justify-center items-center gap-6">
              {Array.from({ length: 7 }).map((_, index) => (
                <div key={index} className="flex-shrink-0">
                  {/* Matches: w-[135px] h-[420px] rounded-3xl */}
                  <div className="w-[135px] h-[420px] bg-gray-200 rounded-3xl shadow-lg overflow-hidden">
                    {/* Image area */}
                    <div className="w-full h-full bg-gray-300 relative">
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                      {/* Bottom content area */}
                      <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center px-4">
                        {/* Rotated text placeholder - matches h-[110px] */}
                        <div className="w-[120px] h-[110px] mb-2 flex items-center justify-center">
                          <div className="bg-gray-400 h-4 w-24 rounded -rotate-90"></div>
                        </div>

                        {/* Icon circle - matches w-10 h-10 */}
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full border border-white/30"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-end mt-6 space-x-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-gray-400' : 'bg-gray-300'}`}></div>
            ))}
          </div>
        </div>

        {/* Mobile & Tablet: Small cards with text below */}
        <div className="lg:hidden">
          <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="flex-shrink-0 flex flex-col items-center">
                {/* Matches: w-20 h-28 sm:w-24 sm:h-32 md:w-28 md:h-36 rounded-2xl */}
                <div className="w-20 h-28 sm:w-24 sm:h-32 md:w-28 md:h-36 bg-gray-200 rounded-2xl shadow-lg"></div>
                {/* Text below */}
                <div className="bg-gray-300 h-3 w-16 sm:w-20 rounded mt-2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
