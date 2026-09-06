import Link from 'next/link';
import Footer from '@/components/Footer';
import PremiumProjectCard from '@/components/PremiumProjectCard';
import { supabase } from '@/lib/supabase';
import { demoProjects, Project } from '@/lib/data';
import { ArrowRight, ArrowUpRight, BookOpen, Box, Cpu, Layers, Star } from 'lucide-react';

export const revalidate = 0; // Ensure data is fetched dynamically

export default async function Home() {
  // Fetch up to 4 projects
  const { data: dbProjects } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(4);

  const displayProjects: Project[] = (dbProjects && dbProjects.length > 0)
    ? dbProjects
    : demoProjects.slice(0, 4);

  // Fetch up to 4 3D models
  const { data: dbModels } = await supabase
    .from('stl_models')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(4);

  const displayModels = dbModels || [];

  return (
    <main className="relative bg-black min-h-screen text-white selection:bg-[#84cc16]/30 flex flex-col">
      {/* Background Image Overlay */}
      <div
        className="fixed inset-0 z-0 opacity-30 pointer-events-none mix-blend-screen"
        style={{
          backgroundImage: 'url("/drone-bg.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundAttachment: 'fixed',
        }}
      />
      <div className="fixed inset-0 bg-linear-to-b from-black/80 via-black/60 to-black z-0 pointer-events-none"></div>

      {/* Main Content Container */}
      <div className="relative z-10 grow max-w-7xl mx-auto px-6 md:px-12 pt-36 pb-24 w-full">
        
        {/* Brief / Hero Section */}
        <section className="text-left max-w-4xl mb-20">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-8 leading-[1.15]">
            Build Production-Ready <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#84cc16] via-emerald-400 to-cyan-400">
              Robotics Solutions
            </span>
          </h1>

          {/* Quick Action Navigation Buttons */}
          <div className="flex flex-wrap items-center gap-3.5 max-w-3xl">
            {/* ROS Packages */}
            <Link
              href="/projects"
              className="group relative inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#0a0a0a]/90 hover:bg-white/[0.06] border border-white/10 hover:border-[#84cc16]/50 transition-all duration-300 backdrop-blur-xl shadow-lg hover:shadow-[0_0_25px_rgba(132,204,22,0.18)] hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <div className="w-8 h-8 rounded-xl bg-[#84cc16]/10 border border-[#84cc16]/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-[#84cc16]/20 group-hover:border-[#84cc16]/40 transition-all duration-300 shrink-0">
                <Cpu className="w-4 h-4 text-[#84cc16]" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-white tracking-tight">
                ROS Packages
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#84cc16] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 shrink-0" />
            </Link>

            {/* Manuals */}
            <Link
              href="/manuals"
              className="group relative inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#0a0a0a]/90 hover:bg-white/[0.06] border border-white/10 hover:border-cyan-400/50 transition-all duration-300 backdrop-blur-xl shadow-lg hover:shadow-[0_0_25px_rgba(34,211,238,0.18)] hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <div className="w-8 h-8 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-cyan-400/20 group-hover:border-cyan-400/40 transition-all duration-300 shrink-0">
                <BookOpen className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-white tracking-tight">
                Manuals
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 shrink-0" />
            </Link>

            {/* CAD & 3D Models */}
            <Link
              href="/3d-models"
              className="group relative inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#0a0a0a]/90 hover:bg-white/[0.06] border border-white/10 hover:border-purple-400/50 transition-all duration-300 backdrop-blur-xl shadow-lg hover:shadow-[0_0_25px_rgba(168,85,247,0.18)] hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-400/10 border border-purple-400/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-400/20 group-hover:border-purple-400/40 transition-all duration-300 shrink-0">
                <Box className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-white tracking-tight">
                CAD & 3D Models
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-purple-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 shrink-0" />
            </Link>
          </div>

          {/* Social Media Links */}
          <div className="flex items-center gap-3 mt-6">
            {/* YouTube */}
            <a
              href="https://www.youtube.com/@RosInventory"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube Channel"
              className="group p-2.5 rounded-xl bg-[#0a0a0a]/90 hover:bg-[#ff0000]/10 border border-white/10 hover:border-[#ff0000]/50 text-gray-400 hover:text-[#ff0000] transition-all duration-300 backdrop-blur-xl shadow-md hover:shadow-[0_0_20px_rgba(255,0,0,0.3)] hover:-translate-y-0.5 active:scale-95 flex items-center justify-center"
              title="YouTube"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 transition-transform group-hover:scale-110"
              >
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/rosinventory?stkn=MWhiM3Fna2V6cXdpag=="
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram Profile"
              className="group p-2.5 rounded-xl bg-[#0a0a0a]/90 hover:bg-[#e1306c]/10 border border-white/10 hover:border-[#e1306c]/50 text-gray-400 hover:text-[#e1306c] transition-all duration-300 backdrop-blur-xl shadow-md hover:shadow-[0_0_20px_rgba(225,48,108,0.3)] hover:-translate-y-0.5 active:scale-95 flex items-center justify-center"
              title="Instagram"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 transition-transform group-hover:scale-110"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>

            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/samarth-katageri-0b7b71291/?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base%3BoofaF2UMQYejMzKyTIgbpA%3D%3D"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn Profile"
              className="group p-2.5 rounded-xl bg-[#0a0a0a]/90 hover:bg-[#0a66c2]/10 border border-white/10 hover:border-[#0a66c2]/50 text-gray-400 hover:text-[#0a66c2] transition-all duration-300 backdrop-blur-xl shadow-md hover:shadow-[0_0_20px_rgba(10,102,194,0.3)] hover:-translate-y-0.5 active:scale-95 flex items-center justify-center"
              title="LinkedIn"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 transition-transform group-hover:scale-110"
              >
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
          </div>
        </section>

        {/* Projects Section */}
        <section id="projects" className="mb-28">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#84cc16] mb-2">
                <Layers className="w-3.5 h-3.5" />
                <span>Featured Collection</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">ROS 2 Projects</h2>
            </div>
            <Link
              href="/projects"
              className="hidden sm:inline-flex group items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-[#84cc16] text-white hover:text-black border border-white/15 hover:border-[#84cc16] text-sm font-semibold transition-all duration-300 shadow-md"
            >
              <span>View More Projects</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayProjects.map((project, idx) => (
              <div key={project.id} className={idx >= 2 ? 'hidden sm:block' : 'block'}>
                <PremiumProjectCard project={project} />
              </div>
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/projects"
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[#84cc16] text-black font-semibold shadow-lg shadow-[#84cc16]/20 active:scale-[0.98] transition-all"
            >
              <span>View More Projects</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* 3D Models Section */}
        <section id="3d-models" className="mb-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-blue-400 mb-2">
                <Box className="w-3.5 h-3.5" />
                <span>Print-Ready CAD</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">3D Models</h2>
            </div>
            <Link
              href="/3d-models"
              className="hidden sm:inline-flex group items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-blue-500 text-white hover:text-white border border-white/15 hover:border-blue-500 text-sm font-semibold transition-all duration-300 shadow-md"
            >
              <span>View More 3D Models</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {displayModels.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayModels.map((model, idx) => (
                <div
                  key={model.id}
                  className={`group relative flex flex-col bg-[#0a0a0a] rounded-2xl overflow-hidden border border-white/10 hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 ${
                    idx >= 3 ? 'hidden sm:flex' : 'flex'
                  }`}
                >
                  <div className="relative h-48 overflow-hidden bg-neutral-900">
                    <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0a] to-transparent z-10 opacity-60"></div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={model.image_url || '/placeholder.jpg'}
                      alt={model.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 right-3 z-20 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span className="font-medium text-white">{model.rating || '5.0'}</span>
                    </div>
                  </div>

                  <div className="flex flex-col flex-1 p-5 z-20 relative">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h3 className="text-lg font-medium text-white tracking-tight line-clamp-1 group-hover:text-blue-400 transition-colors">{model.title}</h3>
                      <span className="text-base font-semibold text-blue-400 shrink-0">₹{model.price}</span>
                    </div>

                    <p className="text-xs text-neutral-400 line-clamp-2 mb-4 flex-1">
                      {model.description}
                    </p>

                    <Link
                      href="/3d-models"
                      className="w-full mt-auto bg-white/5 border border-white/10 hover:bg-blue-600 hover:text-white hover:border-blue-500 text-white text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-300"
                    >
                      View 3D Models
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-4 rounded-2xl bg-[#0a0a0a] border border-white/10 text-gray-400">
              <Box className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-sm">Explore our collection of 3D printable robotics models.</p>
              <Link href="/3d-models" className="inline-block mt-4 text-xs font-semibold text-blue-400 hover:underline">
                Go to 3D Models Inventory &rarr;
              </Link>
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/3d-models"
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all"
            >
              <span>View More 3D Models</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

      </div>

      <Footer />
    </main>
  );
}