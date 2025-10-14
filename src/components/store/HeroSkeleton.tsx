export function HeroSkeleton() {
  return (
    <section className="relative w-full overflow-hidden z-10 flex justify-center items-center bg-white">
      {/* Match actual hero: white background, reserves natural image space */}
      <div className="w-full bg-white" style={{ aspectRatio: '16/9', maxHeight: '400px' }}>
        {/* Invisible placeholder - same background as real hero */}
        <div className="w-full h-full bg-white"></div>
      </div>
    </section>
  );
}
