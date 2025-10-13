export function HeroSkeleton() {
  return (
    <section className="relative w-full overflow-hidden z-10 flex justify-center items-center bg-white animate-pulse">
      {/* Match actual hero: simple gray rectangle with aspect ratio similar to hero images */}
      <div className="w-full bg-gray-300" style={{ aspectRatio: '16/9', maxHeight: '400px' }}>
        {/* Optional: Add gradient overlay like real hero */}
        <div className="w-full h-full bg-gradient-to-r from-gray-400 to-gray-300"></div>
      </div>
    </section>
  );
}
