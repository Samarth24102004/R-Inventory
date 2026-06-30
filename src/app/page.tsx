import HeroScrollAnimation from '@/components/HeroScrollAnimation';
import Footer from '@/components/Footer';

export const revalidate = 0; // Ensure data is fetched dynamically

export default async function Home() {

  return (
    <main className="relative bg-black min-h-screen text-white selection:bg-[#84cc16]/30">
      
      {/* Sticky Canvas Animation */}
      <HeroScrollAnimation />

      {/* Empty space to allow scrolling through the animation without text overlay */}
      <div className="relative z-10 mt-[-100vh] h-[500vh] pointer-events-none"></div>



      {/* Footer Section */}
      <Footer />
    </main>
  );
}
