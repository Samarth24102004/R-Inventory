import HeroScrollAnimation from '@/components/HeroScrollAnimation';
import ProjectSlider from '@/components/ProjectSlider';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';

export const revalidate = 0; // Ensure data is fetched dynamically

export default async function Home() {
  const { data: projects } = await supabase.from('projects').select('*').order('created_at', { ascending: false });

  return (
    <main className="relative bg-black min-h-screen text-white selection:bg-[#84cc16]/30">
      
      {/* Sticky Canvas Animation */}
      <HeroScrollAnimation />

      {/* Empty space to allow scrolling through the animation without text overlay */}
      <div className="relative z-10 mt-[-100vh] h-[500vh] pointer-events-none"></div>

      {/* Actual Content Sections - Appears AFTER the scroll animation finishes */}
      <div id="projects" className="relative z-20 bg-black pt-10 pb-32">
        {/* Endless Project Slider section */}
        <ProjectSlider projects={projects || []} />
      </div>

      {/* Footer Section */}
      <Footer />
    </main>
  );
}
