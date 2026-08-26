"use client";

import React from 'react';
import Link from 'next/link';
import { 
  BarChart3, 
  ImageIcon, 
  CircuitBoard, 
  Plus, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  Settings
} from 'lucide-react';

export default function AdminHubPage() {
  const adminModules = [
    {
      title: "Analytics Dashboard",
      description: "View real-time site views, search keywords, active users, and project sales revenue.",
      icon: BarChart3,
      href: "/admin/analytics",
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20"
    },
    {
      title: "Homepage Slideshow",
      description: "Upload and manage promotional slides, custom banner images, and target links.",
      icon: ImageIcon,
      href: "/admin/slideshow",
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20"
    },
    {
      title: "Manage Content",
      description: "Edit, update videos, or delete existing ROS 2 projects and 3D STL models.",
      icon: CircuitBoard,
      href: "/admin/projects",
      color: "text-green-400",
      bg: "bg-green-500/10",
      border: "border-green-500/20"
    },
    {
      title: "Upload New Project",
      description: "Upload new ROS 2 packages, software/hardware descriptions, code ZIPs, and video files.",
      icon: Plus,
      href: "/admin/upload",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white pt-28 pb-20 px-[5%] font-sans">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-white" strokeWidth={1.5} />
              <h1 className="text-3xl font-semibold text-white tracking-tight">
                Admin Control Panel
              </h1>
            </div>
            <p className="text-sm text-gray-400 mt-1">Manage platform analytics, slideshow banners, projects, and 3D models.</p>
          </div>
        </div>

        {/* Grid of Admin Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {adminModules.map((module) => {
            const Icon = module.icon;
            return (
              <Link key={module.title} href={module.href}>
                <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-xl hover:border-white/30 transition-all duration-300 shadow-xl group flex flex-col justify-between h-full cursor-pointer">
                  <div className="space-y-4">
                    <div className={`w-12 h-12 rounded-xl ${module.bg} ${module.border} border flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${module.color}`} strokeWidth={1.5} />
                    </div>
                    <h2 className="text-xl font-bold text-white group-hover:text-gray-200 transition-colors flex items-center justify-between">
                      <span>{module.title}</span>
                      <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-white" />
                    </h2>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      {module.description}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-white/10 mt-6 flex items-center text-xs font-semibold text-white">
                    <span>Open Module</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </div>
  );
}
