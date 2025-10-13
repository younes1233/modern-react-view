
export function BannerSkeleton() {
  return (
    <section className="py-1 md:py-2 bg-white animate-pulse">
      <div className="w-full max-w-full overflow-hidden bg-white">
        {/* Must match actual banner: aspectRatio 4/1, shadow-lg, no rounded corners */}
        <div className="relative overflow-hidden shadow-lg bg-gray-200" style={{ aspectRatio: '4/1' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center">
            <div className="p-3 sm:p-4 md:p-8">
              {/* Title skeleton - matches text-lg sm:text-xl md:text-2xl lg:text-4xl */}
              <div className="bg-gray-400 h-5 sm:h-6 md:h-7 lg:h-10 w-48 sm:w-64 md:w-80 rounded mb-1 sm:mb-2"></div>
              {/* Subtitle skeleton - matches text-sm sm:text-base md:text-lg */}
              <div className="bg-gray-500 h-4 sm:h-5 md:h-6 w-32 sm:w-48 md:w-64 rounded mb-2 sm:mb-3 md:mb-4 opacity-90"></div>
              {/* CTA button skeleton - matches px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 */}
              <div className="bg-gray-400 w-24 sm:w-28 md:w-36 h-7 sm:h-9 md:h-10 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
