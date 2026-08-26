import HeroScrollAnimation from '@/components/HeroScrollAnimation';
import Footer from '@/components/Footer';

export const revalidate = 0; // Ensure data is fetched dynamically

export default async function Home() {
  return (
    <main className="relative bg-black min-h-screen text-white selection:bg-[#84cc16]/30 overflow-x-hidden">
      
      {/* 3D Hero Scroll Canvas Section */}
      <div className="relative h-[250vh]">
        <HeroScrollAnimation />
      </div>

      {/* Footer Section */}
      <div className="relative z-50 bg-black">
        <Footer />
      </div>
    </main>
  );
}
