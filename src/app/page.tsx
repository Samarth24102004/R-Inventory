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
          <div className="flex flex-wrap items-center gap-3 mt-6">
            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/samarth-katageri-0b7b71291/?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base%3BoofaF2UMQYejMzKyTIgbpA%3D%3D"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn Profile"
              className="group inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#0a0a0a]/90 hover:bg-[#0a66c2]/10 border border-white/10 hover:border-[#0a66c2]/50 text-gray-300 hover:text-white transition-all duration-300 backdrop-blur-xl shadow-md hover:shadow-[0_0_20px_rgba(10,102,194,0.25)] hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <div className="w-6 h-6 rounded-lg bg-[#0a66c2]/15 border border-[#0a66c2]/30 flex items-center justify-center text-[#0a66c2] group-hover:scale-110 group-hover:bg-[#0a66c2] group-hover:text-white transition-all duration-300 shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="w-3.5 h-3.5"
                >
                  <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z" />
                </svg>
              </div>
              <span className="text-xs sm:text-sm font-semibold tracking-tight">LinkedIn</span>
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/rosinventory?stkn=MWhiM3Fna2V6cXdpag=="
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram Profile"
              className="group inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#0a0a0a]/90 hover:bg-[#e1306c]/10 border border-white/10 hover:border-[#e1306c]/50 text-gray-300 hover:text-white transition-all duration-300 backdrop-blur-xl shadow-md hover:shadow-[0_0_20px_rgba(225,48,108,0.25)] hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <div className="w-6 h-6 rounded-lg bg-[#e1306c]/15 border border-[#e1306c]/30 flex items-center justify-center text-[#e1306c] group-hover:scale-110 group-hover:bg-[#e1306c] group-hover:text-white transition-all duration-300 shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="w-3.5 h-3.5"
                >
                  <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334" />
                </svg>
              </div>
              <span className="text-xs sm:text-sm font-semibold tracking-tight">Instagram</span>
            </a>

            {/* YouTube */}
            <a
              href="https://www.youtube.com/@RosInventory"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube Channel"
              className="group inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#0a0a0a]/90 hover:bg-[#ff0000]/10 border border-white/10 hover:border-[#ff0000]/50 text-gray-300 hover:text-white transition-all duration-300 backdrop-blur-xl shadow-md hover:shadow-[0_0_20px_rgba(255,0,0,0.25)] hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <div className="w-6 h-6 rounded-lg bg-[#ff0000]/15 border border-[#ff0000]/30 flex items-center justify-center text-[#ff0000] group-hover:scale-110 group-hover:bg-[#ff0000] group-hover:text-white transition-all duration-300 shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="w-3.5 h-3.5"
                >
                  <path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.1-.014.155c-.036.388-.106.84-.214 1.242a2.01 2.01 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.01 2.01 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31 31 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.01 2.01 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A100 100 0 0 1 7.858 2zM6.4 5.209v4.818l4.157-2.408z" />
                </svg>
              </div>
              <span className="text-xs sm:text-sm font-semibold tracking-tight">YouTube</span>
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