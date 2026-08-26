import HeroScrollAnimation from '@/components/HeroScrollAnimation';
import Footer from '@/components/Footer';

export const revalidate = 0; // Ensure data is fetched dynamically

export default async function Home() {
  return (
    <main className="relative bg-black min-h-screen text-white selection:bg-[#84cc16]/30 overflow-x-hidden">
      
      {/* 1. Sticky 3D Canvas Background Animation */}
      <HeroScrollAnimation />

      {/* 2. Empty scroll space to allow scrolling through 3D canvas animation */}
      <div className="relative z-10 mt-[-100vh] h-[450vh] pointer-events-none"></div>

      {/* 3. Footer Section */}
      <div className="relative z-50 bg-black">
        <Footer />
      </div>
    </main>
  );
}
