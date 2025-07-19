
export function BannerSkeleton() {
  return (
    <section className="py-1 md:py-2 bg-white animate-pulse">
      <div className="w-full max-w-full overflow-hidden bg-white">
        <div className="relative rounded-2xl overflow-hidden shadow-lg bg-gray-200 dark:bg-gray-700">
          <div className="w-full h-40 sm:h-48 md:h-64 lg:h-80 bg-gray-300 dark:bg-gray-600"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center">
            <div className="p-3 sm:p-4 md:p-8">
              <div className="bg-gray-400 dark:bg-gray-500 h-6 sm:h-8 md:h-10 lg:h-12 w-48 sm:w-64 md:w-80 rounded mb-1 sm:mb-2"></div>
              <div className="bg-gray-500 dark:bg-gray-600 h-4 sm:h-5 md:h-6 w-32 sm:w-48 md:w-64 rounded mb-2 sm:mb-3 md:mb-4"></div>
              <div className="bg-gray-400 dark:bg-gray-500 w-24 sm:w-28 md:w-32 h-8 sm:h-10 md:h-12 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
