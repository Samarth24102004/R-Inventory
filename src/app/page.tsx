import HeroScrollAnimation from '@/components/HeroScrollAnimation';
import PremiumProjectCard from '@/components/PremiumProjectCard';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { CircuitBoard } from 'lucide-react';

export const revalidate = 0; // Ensure data is fetched dynamically

export default async function Home() {
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <main className="relative bg-black min-h-screen text-white selection:bg-[#84cc16]/30 overflow-x-hidden">
      
      {/* 1. Sticky 3D Canvas Background Animation */}
      <HeroScrollAnimation />

      {/* 2. Scroll space for 3D hero canvas animation */}
      <div className="relative z-10 mt-[-100vh] h-[220vh] pointer-events-none"></div>

      {/* 3. Robotics Projects Grid Section */}
      <section id="projects" className="relative z-30 bg-black/90 backdrop-blur-xl border-t border-white/10 py-20 px-[5%]">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <div className="flex items-center gap-2 text-[#84cc16] mb-2 font-mono text-xs tracking-widest uppercase">
                <CircuitBoard className="w-4 h-4" /> Open Source Inventory
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
                Robotics Projects & ROS 2 Packages
              </h2>
            </div>
            <p className="text-gray-400 text-sm max-w-md">
              Complete open-source packages with source code, circuit diagrams, hardware BOM, and step-by-step setup guides.
            </p>
          </div>

          {projects && projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project) => (
                <PremiumProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border border-dashed border-white/10 rounded-xl text-gray-500">
              No projects available yet. Use the Admin Portal to upload your first project.
            </div>
          )}

        </div>
      </section>

      {/* 4. Footer Section */}
      <div className="relative z-50 bg-black">
        <Footer />
      </div>
    </main>
  );
}
