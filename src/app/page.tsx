import HeroScrollAnimation from '@/components/HeroScrollAnimation';
import HomepageSlideshow from '@/components/HomepageSlideshow';
import Footer from '@/components/Footer';

export const revalidate = 0; // Ensure data is fetched dynamically

export default async function Home() {
  return (
    <main className="relative bg-black min-h-screen text-white selection:bg-[#84cc16]/30 overflow-x-hidden">
      
      {/* 1. Sticky 3D Canvas Background Animation */}
      <HeroScrollAnimation />

      {/* 2. Floating Right-Side Slideshow (Visible right from starting view down to footer) */}
      <div className="fixed top-24 right-4 md:right-8 lg:right-12 z-40 w-[90vw] sm:w-[420px] md:w-[460px] lg:w-[500px] pointer-events-auto transition-all duration-300">
        <HomepageSlideshow />
      </div>

      {/* 3. Empty scroll space to allow scrolling through 3D canvas animation */}
      <div className="relative z-10 mt-[-100vh] h-[450vh] pointer-events-none"></div>

      {/* 4. Footer Section (Overlaps sticky slideshow smoothly when reached) */}
      <div className="relative z-50 bg-black">
        <Footer />
      </div>
    </main>
  );
}
