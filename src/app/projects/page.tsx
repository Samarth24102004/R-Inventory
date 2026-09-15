import PremiumProjectCard from '@/components/PremiumProjectCard';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';

export const revalidate = 0; // Ensure data is fetched dynamically

export const metadata = {
  title: 'ROS Projects | RoS Inventory',
  description: 'Explore our comprehensive library of open-source ROS and ROS2 robotics projects. Find complete source code, circuit diagrams, components, and robotics tutorials for your next autonomous build.',
  alternates: {
    canonical: 'https://rosinventory.co.in/projects',
  },
};

export default async function ProjectsPage() {
  const { data: projects } = await supabase.from('projects').select('*').order('created_at', { ascending: false });

  return (
    <main className="relative bg-[#E2DFD0] min-h-screen text-[#32012F] selection:bg-[#32012F]/20 flex flex-col">
      {/* Background Image */}
      <div
        className="fixed inset-0 z-0 opacity-15 pointer-events-none mix-blend-multiply"
        style={{
          backgroundImage: 'url("/drone-bg.png")',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
          backgroundAttachment: 'fixed',
        }}
      />
      <div className="fixed inset-0 bg-linear-to-b from-[#E2DFD0]/90 via-[#E2DFD0]/80 to-[#E2DFD0] z-0 pointer-events-none"></div>

      <div className="pt-32 pb-32 px-6 md:px-12 max-w-7xl mx-auto grow w-full relative z-10">
        <div className="text-center mb-16 relative z-20">
          <h1 className="text-4xl md:text-5xl font-bold text-[#32012F] mb-4 drop-shadow-sm">Projects Inventory</h1>
          <p className="text-[#32012F]/70 text-lg max-w-2xl mx-auto">Explore premium ROS 2 projects complete with components, circuit diagrams, commands, and source code downloads.</p>
        </div>

        {projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <PremiumProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="text-[#32012F]/50 italic text-center py-20">No projects found. Use the Admin Portal to upload some!</div>
        )}
      </div>
      <Footer />
    </main>
  );
}
