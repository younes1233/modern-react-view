
export function HeroSkeleton() {
  return (
    <section className="relative w-full overflow-hidden z-10 animate-pulse" style={{
      height: 'clamp(300px, 40vh, 600px)', // Reduced from 50vh to 40vh and min from 400px to 300px
      minHeight: '300px', // Reduced from 400px to 300px
      maxHeight: '600px'
    }}>
      <div className="absolute inset-0">
        <div className="w-full h-full bg-gray-300 dark:bg-gray-700"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
      </div>

      <div className="relative z-20 h-full flex items-center rounded-md mx-0">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-8 flex flex-col md:flex-row justify-between items-start md:items-center">
          {/* Left side: title + subtitle */}
          <div className="max-w-2xl">
            <div className="inline-block bg-gray-400 dark:bg-gray-600 w-32 h-6 rounded-full mb-3 sm:mb-4 md:mb-6"></div>
            <div className="space-y-3 mb-3 sm:mb-4 md:mb-6">
              <div className="bg-gray-300 dark:bg-gray-600 h-6 sm:h-8 md:h-10 lg:h-12 w-full max-w-lg rounded"></div>
              <div className="bg-gray-300 dark:bg-gray-600 h-4 sm:h-6 md:h-8 w-3/4 rounded"></div>
            </div>
            <div className="bg-gray-400 dark:bg-gray-600 h-3 sm:h-4 md:h-5 w-full max-w-xl rounded mb-4 sm:mb-6 md:mb-8"></div>
          </div>

          {/* Bottom right: button + contact info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 md:gap-6 mt-2 sm:mt-3 md:mt-0 ml-0 md:ml-8 self-end">
            <div className="bg-gray-400 dark:bg-gray-600 w-24 sm:w-32 md:w-36 h-8 sm:h-10 md:h-12 rounded-full"></div>
            <div className="text-left space-y-1">
              <div className="bg-gray-300 dark:bg-gray-600 w-20 sm:w-24 md:w-28 h-4 sm:h-5 md:h-6 rounded"></div>
              <div className="bg-gray-400 dark:bg-gray-600 w-24 sm:w-28 md:w-32 h-2 sm:h-3 md:h-4 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
