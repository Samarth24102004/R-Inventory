import React from 'react';
import Link from 'next/link';
import { Terminal, Database, Code, Shield } from 'lucide-react';

export default function GlassNavbar() {
  return (
    <nav className="fixed top-5 left-1/2 -translate-x-1/2 w-[90%] max-w-6xl flex justify-between items-center py-4 px-8 box-border bg-white/5 backdrop-blur-md z-50 border border-white/10 rounded-full shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]">
      <Link href="/" className="flex items-center space-x-2 group">
        <Terminal className="text-cyan-400 group-hover:text-cyan-300 transition-colors" size={24} />
        <span className="text-xl font-bold tracking-widest bg-linear-to-br from-white to-gray-400 bg-clip-text text-transparent">
          RoS Inventory
        </span>
      </Link>
      
      <div className="hidden md:flex space-x-8">
        <Link href="#features" className="text-white/70 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] text-sm font-medium transition-all">
          Features
        </Link>
        <Link href="#projects" className="text-white/70 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] text-sm font-medium transition-all">
          Projects
        </Link>
        <Link href="#pricing" className="text-white/70 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] text-sm font-medium transition-all">
          Pricing
        </Link>
      </div>

      <div className="flex space-x-4">
        <Link href="/login" className="px-5 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors">
          Log in
        </Link>
        <Link href="/signup" className="px-5 py-2 text-sm font-medium bg-cyan-600/20 border border-cyan-500/50 rounded-full text-cyan-300 hover:bg-cyan-500 hover:text-white transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)]">
          Get Access
        </Link>
      </div>
    </nav>
  );
}
