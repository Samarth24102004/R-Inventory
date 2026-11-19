"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import { 
  Cpu, 
  Terminal, 
  Layers, 
  Copy, 
  Check, 
  ExternalLink, 
  Play, 
  Box, 
  ShieldCheck, 
  ArrowRight,
  Download,
  Plus,
  RefreshCw
} from 'lucide-react';

export interface SimulationItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  tag?: string;
  simulator: string;
  ros_distro: string;
  launch_command: string;
  description?: string;
  long_description?: string;
  sensors?: string[];
  features?: string[];
  video_url?: string;
  preview_image_url?: string;
  code_file_url?: string;
  price?: number;
  project_id?: string;
  created_at?: string;
}

export default function SimulationPage() {
  const [simulations, setSimulations] = useState<SimulationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeModule, setActiveModule] = useState<SimulationItem | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const fetchSimulations = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('simulations')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const formatted: SimulationItem[] = data.map((item: any) => ({
            ...item,
            sensors: Array.isArray(item.sensors) ? item.sensors : [],
            features: Array.isArray(item.features) ? item.features : []
          }));
          setSimulations(formatted);
          setActiveModule(formatted[0]);
        } else {
          setSimulations([]);
          setActiveModule(null);
        }
      } catch (err) {
        console.error("Failed to load simulations:", err);
        setSimulations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSimulations();
  }, []);

  const categories = ['All', ...Array.from(new Set(simulations.map(s => s.category).filter(Boolean)))];

  const filteredModules = selectedCategory === 'All'
    ? simulations
    : simulations.filter(m => m.category === selectedCategory);

  const handleCopyCommand = (cmd: string) => {
    if (!cmd) return;
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[#B6FFFA] text-[#0B2447] flex flex-col relative selection:bg-[#687EFF]/30 selection:text-[#0B2447] overflow-x-clip">
      {/* Background Graphic Overlay */}
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
      <div className="fixed inset-0 bg-linear-to-b from-[#B6FFFA]/90 via-[#B6FFFA]/80 to-[#B6FFFA] z-0 pointer-events-none" />

      {/* Main Content Container */}
      <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto w-full relative z-10 grow">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B2447] text-[#B6FFFA] border border-[#687EFF]/40 mb-4 shadow-sm">
            <Cpu className="w-3.5 h-3.5 text-[#687EFF]" />
            <span className="text-[11px] sm:text-xs font-mono font-semibold tracking-wider uppercase">
              Digital Twins & Testing
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#0B2447] mb-5 leading-tight">
            Robot Simulation <span className="text-[#687EFF]">Workspace</span>
          </h1>

          <p className="text-base sm:text-lg text-[#0B2447]/75 leading-relaxed">
            Test and benchmark autonomous navigation, Gazebo digital twins, and kinematics controllers inside virtual ROS 2 environments.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 text-[#0B2447]/60 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-[#687EFF]" />
            <p className="text-sm font-semibold">Loading simulation environments...</p>
          </div>
        ) : simulations.length === 0 ? (
          /* Empty State - No Simulations in DB */
          <div className="bg-white/95 backdrop-blur-md border border-[#687EFF]/25 rounded-3xl p-8 sm:p-12 md:p-16 text-center max-w-2xl mx-auto shadow-xl mb-20 space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-[#687EFF]/15 border border-[#687EFF]/30 flex items-center justify-center text-[#687EFF] mx-auto shadow-sm">
              <Play className="w-8 h-8 ml-0.5" />
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B2447]">
              No Simulation Projects Uploaded Yet
            </h2>
            
            <p className="text-sm text-[#0B2447]/75 leading-relaxed max-w-lg mx-auto">
              You haven&apos;t added any simulation environments or launch commands yet. Use the Admin Portal to upload your real Gazebo worlds, URDF models, and ROS 2 launch commands.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/admin/upload?type=simulation"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0B2447] hover:bg-[#19376D] text-[#B6FFFA] font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
              >
                <Plus className="w-4 h-4 text-[#687EFF]" />
                <span>Upload Simulation in Admin</span>
              </Link>
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-[#EAF8FF] border border-[#687EFF]/30 text-[#0B2447] font-semibold text-xs sm:text-sm shadow-xs transition-all active:scale-95"
              >
                <span>Browse All Projects</span>
              </Link>
            </div>
          </div>
        ) : activeModule ? (
          /* Active Simulation Console Workbench */
          <>
            <div className="bg-white/95 backdrop-blur-md border border-[#687EFF]/25 rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl mb-16 relative overflow-hidden">
              {/* Subtle top ambient accent */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-[#687EFF] via-[#B6FFFA] to-[#687EFF]"></div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Console Details */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {activeModule.tag && (
                      <span className="px-3 py-1 rounded-full bg-[#687EFF]/15 text-[#687EFF] border border-[#687EFF]/30 text-xs font-mono font-bold tracking-wide uppercase">
                        {activeModule.tag}
                      </span>
                    )}
                    <span className="px-3 py-1 rounded-full bg-[#0B2447] text-[#B6FFFA] text-xs font-mono font-medium">
                      {activeModule.ros_distro || 'ROS 2'}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                      Simulator: {activeModule.simulator || 'Gazebo'}
                    </span>
                    {Number(activeModule.price || 0) <= 0 ? (
                      <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
                        Free Access
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                        ₹{activeModule.price}
                      </span>
                    )}
                  </div>

                  <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B2447] tracking-tight mb-3">
                      {activeModule.title}
                    </h2>
                    <p className="text-sm sm:text-base text-[#0B2447]/80 leading-relaxed whitespace-pre-line">
                      {activeModule.long_description || activeModule.description}
                    </p>
                  </div>

                  {/* Terminal Launch Command Box */}
                  {activeModule.launch_command && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono text-[#0B2447]/70">
                        <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                          <Terminal className="w-3.5 h-3.5 text-[#687EFF]" /> ROS 2 Launch Command
                        </span>
                        <span className="text-[11px] text-[#687EFF]">One-Click Copy</span>
                      </div>
                      <div className="bg-[#0B2447] text-[#B6FFFA] p-4 rounded-2xl flex items-center justify-between gap-3 font-mono text-xs sm:text-sm border border-[#687EFF]/30 shadow-inner overflow-x-auto">
                        <span className="shrink-0 text-emerald-400 select-none">$</span>
                        <code className="grow truncate select-all">{activeModule.launch_command}</code>
                        <button
                          onClick={() => handleCopyCommand(activeModule.launch_command)}
                          className="p-2 rounded-xl bg-white/10 hover:bg-[#687EFF] text-white transition-all shrink-0 cursor-pointer active:scale-95"
                          title="Copy command"
                        >
                          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Simulated Sensors Grid */}
                  {activeModule.sensors && activeModule.sensors.length > 0 && (
                    <div className="pt-2">
                      <h3 className="text-xs font-bold font-mono tracking-wider text-[#0B2447]/70 uppercase mb-2.5">
                        Simulated Sensors & Telemetry
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {activeModule.sensors.map((sensor, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-xl bg-[#EAF8FF] border border-[#687EFF]/20 text-[#0B2447] text-xs font-medium"
                          >
                            ✓ {sensor}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Features & Action Links */}
                  <div className="pt-4 border-t border-[#687EFF]/15 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-xs text-[#0B2447]/70">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Verified physics parameters & kinematics</span>
                    </div>

                    <div className="flex items-center gap-3">
                      {activeModule.code_file_url && (
                        <a
                          href={activeModule.code_file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#687EFF] hover:bg-[#566eef] text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Simulation .ZIP</span>
                        </a>
                      )}

                      {activeModule.slug && (
                        <Link
                          href={`/projects/${activeModule.slug}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B2447] hover:bg-[#19376D] text-[#B6FFFA] text-xs font-bold transition-all shadow-sm active:scale-95"
                        >
                          <span>View Full Package</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Visual Simulated Environment Deck */}
                <div className="lg:col-span-5 flex flex-col h-full justify-between space-y-4">
                  <div className="w-full aspect-video rounded-2xl bg-linear-to-br from-blue-600/20 via-cyan-500/15 to-transparent border border-[#687EFF]/30 p-6 flex flex-col justify-between relative overflow-hidden shadow-inner">
                    <div className="flex items-center justify-between relative z-10">
                      <span className="flex items-center gap-2 text-xs font-mono font-bold text-[#0B2447]">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        SIM ENGINE READY
                      </span>
                      <div className="p-2 rounded-lg bg-white/70 backdrop-blur-xs text-[#0B2447]">
                        <Layers className="w-4 h-4" />
                      </div>
                    </div>

                    {activeModule.preview_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={activeModule.preview_image_url}
                        alt={activeModule.title}
                        className="absolute inset-0 w-full h-full object-cover opacity-80"
                      />
                    ) : (
                      <div className="relative z-10 space-y-2 text-center py-4">
                        <div className="w-16 h-16 rounded-2xl bg-[#0B2447] text-[#B6FFFA] mx-auto flex items-center justify-center shadow-md">
                          <Play className="w-7 h-7 fill-current ml-1" />
                        </div>
                        <h4 className="font-bold text-[#0B2447] text-base">{activeModule.simulator}</h4>
                        <p className="text-xs text-[#0B2447]/70">Digital twin simulation workspace</p>
                      </div>
                    )}

                    <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-[#0B2447]/80 pt-2 border-t border-[#0B2447]/10 bg-white/60 backdrop-blur-xs px-3 py-1 rounded-lg">
                      <span>Simulator: {activeModule.simulator}</span>
                      <span>ROS: {activeModule.ros_distro}</span>
                    </div>
                  </div>

                  {/* Feature Checklist */}
                  {activeModule.features && activeModule.features.length > 0 && (
                    <div className="p-4 rounded-2xl bg-[#EAF8FF] border border-[#687EFF]/20 space-y-2">
                      <div className="text-xs font-bold text-[#0B2447] tracking-tight">Key Environment Capabilities</div>
                      <ul className="text-xs text-[#0B2447]/80 space-y-1.5">
                        {activeModule.features.map((feature, fIdx) => (
                          <li key={fIdx} className="flex items-center gap-2">
                            <span className="text-[#687EFF] font-bold">●</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Filter Category Tabs */}
            {categories.length > 1 && (
              <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B2447] tracking-tight">
                    Simulation Modules
                  </h2>
                  <p className="text-xs sm:text-sm text-[#0B2447]/70 mt-1">
                    Select an environment to load its digital twin configuration.
                  </p>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-[#0B2447] text-[#B6FFFA] shadow-xs'
                          : 'bg-white/80 hover:bg-white text-[#0B2447]/70 hover:text-[#0B2447] border border-white/80'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Simulation Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {filteredModules.map((module) => {
                const isSelected = activeModule.id === module.id;
                return (
                  <div
                    key={module.id}
                    onClick={() => {
                      setActiveModule(module);
                      window.scrollTo({ top: 280, behavior: 'smooth' });
                    }}
                    className={`group relative flex flex-col bg-white rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-1 cursor-pointer shadow-sm hover:shadow-xl ${
                      isSelected
                        ? 'border-[#687EFF] ring-2 ring-[#687EFF]/30 bg-white'
                        : 'border-[#687EFF]/20 hover:border-[#687EFF]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <span className="px-2.5 py-1 rounded-lg bg-[#687EFF]/10 text-[#687EFF] border border-[#687EFF]/25 text-[10px] font-mono font-bold uppercase tracking-wider">
                        {module.tag || module.category}
                      </span>
                      <span className="text-[11px] font-semibold text-[#0B2447]/60">
                        {module.simulator}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-[#0B2447] tracking-tight mb-2 group-hover:text-[#687EFF] transition-colors">
                      {module.title}
                    </h3>

                    <p className="text-xs text-[#0B2447]/70 line-clamp-3 mb-6 leading-relaxed">
                      {module.description}
                    </p>

                    <div className="mt-auto pt-4 border-t border-[#687EFF]/15 flex items-center justify-between text-xs">
                      <span className="font-mono text-[11px] font-semibold text-[#0B2447]/80">
                        {module.ros_distro}
                      </span>
                      <span className="font-bold text-[#687EFF] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        <span>{isSelected ? "Active Workspace" : "Load Workspace"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : null}

        {/* Hardware & Simulation Integration Callout */}
        <div className="bg-white/90 border border-[#687EFF]/20 rounded-3xl p-8 md:p-12 text-center max-w-4xl mx-auto shadow-md space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#687EFF]/15 border border-[#687EFF]/30 flex items-center justify-center text-[#687EFF] mx-auto mb-2 shadow-xs">
            <Box className="w-7 h-7" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0B2447]">
            Looking for 3D Print CAD Models or Physical Hardware?
          </h3>
          <p className="text-sm text-[#0B2447]/75 max-w-xl mx-auto leading-relaxed">
            Transition your digital twin simulations to physical hardware with our 3D printable STL files and verified components.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
            <Link
              href="/3d-models"
              className="px-6 py-3 rounded-full bg-[#0B2447] hover:bg-[#19376D] text-[#B6FFFA] font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
            >
              Explore 3D Models
            </Link>
            <Link
              href="/projects"
              className="px-6 py-3 rounded-full bg-white hover:bg-[#EAF8FF] border border-[#687EFF]/30 text-[#0B2447] font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95"
            >
              Browse Full Projects
            </Link>
          </div>
        </div>

      </div>

      <Footer />
    </main>
  );
}
