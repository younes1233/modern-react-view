
export function ShopByCategorySkeleton() {
  return (
    <section className="py-8 md:py-16 bg-white animate-pulse">
      <div className="w-full max-w-full px-2 md:px-4">
        <div className="max-w-7xl mx-auto">
          {/* Title skeleton */}
          <div className="text-center mb-8 md:mb-12">
            <div className="bg-gray-300 dark:bg-gray-600 h-8 md:h-10 w-64 mx-auto rounded mb-4"></div>
            <div className="bg-gray-400 dark:bg-gray-700 h-4 md:h-5 w-96 mx-auto rounded"></div>
          </div>

          {/* Categories grid skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="group">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl p-4 md:p-6 text-center h-32 md:h-40 flex flex-col justify-center items-center">
                  <div className="bg-gray-300 dark:bg-gray-600 w-12 h-12 md:w-16 md:h-16 rounded-full mb-3"></div>
                  <div className="bg-gray-400 dark:bg-gray-600 h-4 w-16 md:w-20 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
