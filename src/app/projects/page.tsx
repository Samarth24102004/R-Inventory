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
    <main className="relative bg-[#222831] min-h-screen text-[#EEEEEE] selection:bg-[#FD7014]/30 flex flex-col">
      {/* Background Image */}
      <div
        className="fixed inset-0 z-0 opacity-40 pointer-events-none mix-blend-screen"
        style={{
          backgroundImage: 'url("/drone-bg.png")',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
          backgroundAttachment: 'fixed',
        }}
      />
      <div className="fixed inset-0 bg-linear-to-b from-[#222831]/80 via-[#222831]/60 to-[#222831] z-0 pointer-events-none"></div>

      <div className="pt-32 pb-32 px-6 md:px-12 max-w-7xl mx-auto grow w-full relative z-10">
        <div className="text-center mb-16 relative z-20">
          <h1 className="text-4xl md:text-5xl font-bold text-[#EEEEEE] mb-4 drop-shadow-md">Projects Inventory</h1>
          <p className="text-[#EEEEEE]/70 text-lg max-w-2xl mx-auto drop-shadow-sm">Explore premium ROS 2 projects complete with components, circuit diagrams, commands, and source code downloads.</p>
        </div>

        {projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <PremiumProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="text-gray-500 italic text-center py-20">No projects found. Use the Admin Portal to upload some!</div>
        )}
      </div>
      <Footer />
    </main>
  );
}
