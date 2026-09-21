import Link from 'next/link';
import Footer from '@/components/Footer';
import PremiumProjectCard from '@/components/PremiumProjectCard';
import { supabase } from '@/lib/supabase';
import { demoProjects, Project } from '@/lib/data';
import { ArrowRight, Cpu, BookOpen, Box, ArrowUpRight, Star, Layers } from 'lucide-react';

export const revalidate = 0; // Ensure data is fetched dynamically

export default async function Home() {
  // Fetch real projects from Supabase
  const { data: dbProjects } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  // Use DB projects if available, otherwise use demo data
  const allProjects: Project[] = (dbProjects && dbProjects.length > 0) ? dbProjects : demoProjects;

  // Find VitaBot specifically for the featured hero card, or fallback to first project
  const featuredVitaBot = allProjects.find(
    (p) => p.slug === 'vitabot' || p.title.toLowerCase().includes('vitabot')
  ) || allProjects[0];

  // Display top projects in the grid (excluding featured if we have enough)
  const displayProjects = allProjects.length > 4 
    ? allProjects.filter(p => p.id !== featuredVitaBot?.id).slice(0, 4)
    : allProjects.slice(0, 4);

  // Fetch real 3D models from Supabase
  const { data: dbModels } = await supabase
    .from('models_3d')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(4);

  const displayModels = dbModels || [];

  return (
    <main className="relative bg-[#B6FFFA] min-h-screen text-[#0B2447] selection:bg-[#687EFF]/30 selection:text-[#0B2447] flex flex-col">
      {/* Background Image Overlay */}
      <div
        className="fixed inset-0 z-0 opacity-15 pointer-events-none mix-blend-multiply"
        style={{
          backgroundImage: 'url("/drone-bg.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundAttachment: 'fixed',
        }}
      />
      <div className="fixed inset-0 bg-linear-to-b from-[#B6FFFA]/90 via-[#B6FFFA]/80 to-[#B6FFFA] z-0 pointer-events-none"></div>

      {/* Main Content Container */}
      <div className="relative z-10 grow max-w-7xl mx-auto px-6 md:px-12 pt-36 pb-24 w-full">
        
        {/* Brief / Hero Section with VitaBot Card Beside Text */}
        <section className="mb-24 flex flex-col lg:flex-row lg:items-center justify-between gap-10 lg:gap-14">
          
          {/* Left Column: Heading, Quick Action Navigation & Social Links */}
          <div className="text-left max-w-2xl lg:max-w-xl xl:max-w-2xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#0B2447] mb-8 leading-[1.12]">
              Build Production-<br />
              Ready<br />
              Robotics <span className="text-[#687EFF]">Solutions</span>
            </h1>

            {/* Quick Action Navigation Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 max-w-3xl">
              {/* ROS Packages */}
              <Link
                href="/projects"
                className="group relative inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white hover:bg-white/90 border border-white/80 hover:border-[#687EFF] transition-all duration-300 shadow-sm hover:shadow-[0_4px_20px_rgba(104,126,255,0.2)] hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <div className="w-8 h-8 rounded-xl bg-[#687EFF]/15 border border-[#687EFF]/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-[#687EFF] group-hover:text-white transition-all duration-300 shrink-0 text-[#687EFF]">
                  <Cpu className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-[#0B2447] tracking-tight">
                  ROS Packages
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#0B2447]/40 group-hover:text-[#687EFF] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 shrink-0" />
              </Link>

              {/* Manuals */}
              <Link
                href="/manuals"
                className="group relative inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white hover:bg-white/90 border border-white/80 hover:border-[#687EFF] transition-all duration-300 shadow-sm hover:shadow-[0_4px_20px_rgba(104,126,255,0.2)] hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <div className="w-8 h-8 rounded-xl bg-[#687EFF]/15 border border-[#687EFF]/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-[#687EFF] group-hover:text-white transition-all duration-300 shrink-0 text-[#687EFF]">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-[#0B2447] tracking-tight">
                  Manuals
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#0B2447]/40 group-hover:text-[#687EFF] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 shrink-0" />
              </Link>

              {/* CAD & 3D Models */}
              <Link
                href="/3d-models"
                className="group relative inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white hover:bg-white/90 border border-white/80 hover:border-[#687EFF] transition-all duration-300 shadow-sm hover:shadow-[0_4px_20px_rgba(104,126,255,0.2)] hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <div className="w-8 h-8 rounded-xl bg-[#687EFF]/15 border border-[#687EFF]/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-[#687EFF] group-hover:text-white transition-all duration-300 shrink-0 text-[#687EFF]">
                  <Box className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-[#0B2447] tracking-tight">
                  CAD & 3D Models
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#0B2447]/40 group-hover:text-[#687EFF] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 shrink-0" />
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
                className="group w-10 h-10 rounded-xl bg-white hover:bg-white border border-white/80 hover:border-[#ff0000]/40 text-[#0B2447]/70 hover:text-[#ff0000] transition-all duration-300 shadow-sm hover:shadow-[0_4px_15px_rgba(255,0,0,0.15)] hover:-translate-y-0.5 active:scale-95 flex items-center justify-center"
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
                className="group w-10 h-10 rounded-xl bg-white hover:bg-white border border-white/80 hover:border-[#e1306c]/40 text-[#0B2447]/70 hover:text-[#e1306c] transition-all duration-300 shadow-sm hover:shadow-[0_4px_15px_rgba(225,48,108,0.15)] hover:-translate-y-0.5 active:scale-95 flex items-center justify-center"
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
                className="group w-10 h-10 rounded-xl bg-white hover:bg-white border border-white/80 hover:border-[#0a66c2]/40 text-[#0B2447]/70 hover:text-[#0a66c2] transition-all duration-300 shadow-sm hover:shadow-[0_4px_15px_rgba(10,102,194,0.15)] hover:-translate-y-0.5 active:scale-95 flex items-center justify-center"
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
          </div>

          {/* Right Column: Featured VitaBot Card Playing Video */}
          {featuredVitaBot && (
            <div className="w-full sm:w-95 lg:w-97.5 xl:w-102.5 shrink-0 mx-auto lg:mx-0 mt-6 lg:mt-0">
              <div className="relative group">
                {/* Ambient glow behind card */}
                <div className="absolute -inset-1.5 rounded-3xl bg-linear-to-r from-[#687EFF]/25 via-[#98E4FF]/20 to-[#687EFF]/15 opacity-70 blur-xl group-hover:opacity-100 transition-all duration-500 pointer-events-none"></div>

                {/* Floating live badge */}
                <div className="absolute -top-3.5 left-6 z-30 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0B2447] border border-[#687EFF] text-[11px] font-semibold text-[#B6FFFA] shadow-lg backdrop-blur-md">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#687EFF] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#687EFF]"></span>
                  </span>
                  <span className="tracking-wide uppercase">Featured Robot</span>
                </div>

                <div className="relative rounded-2xl overflow-hidden shadow-xl">
                  <PremiumProjectCard 
                    project={featuredVitaBot} 
                    className="w-full h-102.5 shrink-0" 
                    videoHeight="h-48"
                  />
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Projects Section */}
        <section id="projects" className="mb-28">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#687EFF] mb-2">
                <Layers className="w-3.5 h-3.5" />
                <span>Featured Collection</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#0B2447]">ROS 2 Projects</h2>
            </div>
            <Link
              href="/projects"
              className="hidden sm:inline-flex group items-center gap-2 px-5 py-2.5 rounded-full bg-[#0B2447] text-[#B6FFFA] hover:bg-[#19376D] text-sm font-semibold transition-all duration-300 shadow-[0_4px_20px_rgba(11,36,71,0.2)]"
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
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[#0B2447] text-[#B6FFFA] font-semibold shadow-[0_4px_20px_rgba(11,36,71,0.2)] active:scale-[0.98] transition-all"
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
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#687EFF] mb-2">
                <Box className="w-3.5 h-3.5" />
                <span>Print-Ready CAD</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#0B2447]">3D Models</h2>
            </div>
            <Link
              href="/3d-models"
              className="hidden sm:inline-flex group items-center gap-2 px-5 py-2.5 rounded-full bg-[#0B2447] text-[#B6FFFA] hover:bg-[#19376D] text-sm font-semibold transition-all duration-300 shadow-[0_4px_20px_rgba(11,36,71,0.2)]"
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
                  className={`group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-[#687EFF]/20 hover:border-[#687EFF] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#687EFF]/15 ${
                    idx >= 3 ? 'hidden sm:flex' : 'flex'
                  }`}
                >
                  <div className="relative h-48 overflow-hidden bg-[#EAF8FF]">
                    <div className="absolute inset-0 bg-linear-to-t from-white to-transparent z-10 opacity-60"></div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={model.image_url || '/placeholder.jpg'}
                      alt={model.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 right-3 z-20 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#0B2447] text-[#B6FFFA] border border-[#0B2447] text-xs">
                      <Star className="w-3 h-3 text-[#687EFF] fill-[#687EFF]" />
                      <span className="font-medium text-[#B6FFFA]">{model.rating || '5.0'}</span>
                    </div>
                  </div>

                  <div className="flex flex-col flex-1 p-5 z-20 relative">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-[#0B2447] tracking-tight line-clamp-1 group-hover:text-[#687EFF] transition-colors">{model.title}</h3>
                      <span className="text-base font-bold text-[#0B2447] shrink-0">₹{model.price}</span>
                    </div>

                    <p className="text-xs text-[#0B2447]/70 line-clamp-2 mb-4 flex-1">
                      {model.description}
                    </p>

                    <Link
                      href="/3d-models"
                      className="w-full mt-auto bg-[#0B2447] hover:bg-[#19376D] text-[#B6FFFA] text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-sm"
                    >
                      View 3D Models
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-4 rounded-2xl bg-white border border-[#687EFF]/20 text-[#0B2447]/70">
              <Box className="w-10 h-10 text-[#0B2447]/40 mx-auto mb-3" />
              <p className="text-sm">Explore our collection of 3D printable robotics models.</p>
              <Link href="/3d-models" className="inline-block mt-4 text-xs font-semibold text-[#687EFF] hover:underline">
                Go to 3D Models Inventory &rarr;
              </Link>
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/3d-models"
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[#0B2447] text-[#B6FFFA] font-semibold shadow-[0_4px_20px_rgba(11,36,71,0.2)] active:scale-[0.98] transition-all"
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