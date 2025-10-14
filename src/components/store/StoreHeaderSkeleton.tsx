/**
 * Skeleton for StoreLayout header - matches exact dimensions to prevent layout shift
 * Reserves space for header while it loads so hero doesn't jump up
 * Uses same background as real header for seamless transition
 */
export function StoreHeaderSkeleton() {
  return (
    <>
      {/* Header Skeleton - white background, no animations, just reserves space */}
      <header className="bg-white shadow-lg border-b border-gray-200 z-50">
        <div className="w-full max-w-7xl mx-auto px-3 md:px-6">
          <div className="flex items-center justify-between h-14 md:h-16 lg:h-18 gap-2 md:gap-4">
            {/* Logo Skeleton - white, invisible */}
            <div className="flex items-center flex-shrink-0">
              <div className="h-12 md:h-14 lg:h-16 w-32 md:w-36 lg:w-40"></div>
            </div>

            {/* Search Bar Skeleton - Desktop */}
            <div className="hidden lg:flex flex-1 max-w-lg xl:max-w-xl mx-4 xl:mx-8">
              <div className="w-full h-7"></div>
            </div>

            {/* Desktop Actions Skeleton */}
            <div className="hidden lg:flex items-center space-x-2 md:space-x-3 lg:space-x-4 flex-shrink-0">
              <div className="w-9 h-9"></div>
              <div className="w-9 h-9"></div>
              <div className="w-9 h-9"></div>
            </div>

            {/* Mobile Search + Menu Skeleton */}
            <div className="lg:hidden flex items-center flex-1 gap-2">
              <div className="flex-1">
                <div className="w-full h-8"></div>
              </div>
              <div className="w-10 h-10"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Social Media Banner Skeleton - EXACT match to StoreLayout line 1020 */}
      <div className="bg-cyan-400 text-white py-2 md:py-3 w-full overflow-hidden">
        <div className="w-full max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center">
            <div className="flex items-center gap-4 md:gap-8 lg:gap-12 text-sm md:text-base lg:text-lg font-light tracking-wider">
              {/* Invisible spacer matching real banner content height */}
              <div className="opacity-0">TIKTOK</div>
              <div className="opacity-0">INSTAGRAM</div>
              <div className="opacity-0">FACEBOOK</div>
              <div className="opacity-0">YOUTUBE</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
