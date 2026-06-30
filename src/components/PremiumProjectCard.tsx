"use client";
import React from 'react';
import { Project } from '@/lib/data';
import Link from 'next/link';
import Image from 'next/image';

export default function PremiumProjectCard({ project }: { project: Project }) {
  // Use the first preview image if available, else null
  const coverImage = project.preview_images && project.preview_images.length > 0 
    ? project.preview_images[0] 
    : null;

  return (
    <Link href={`/projects/${project.slug}`}>
      <div
        className="w-full h-96 shrink-0 relative rounded-xl bg-[#0a0a0a] border border-white/10 group hover:border-white/30 transition-colors shadow-lg overflow-hidden cursor-pointer flex flex-col"
      >
        {/* Cover Image Section */}
        <div className="h-40 w-full relative bg-[#111] overflow-hidden shrink-0 border-b border-white/10">
          {coverImage ? (
            <Image 
              src={coverImage} 
              alt={project.title} 
              fill
              className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/20">
              No Preview
            </div>
          )}
          {/* Subtle gradient overlay to blend into the card body */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-[#0a0a0a] to-transparent"></div>
        </div>

        {/* Animated Glow on Hover */}
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"></div>
        
        {/* Card Body */}
        <div className="relative z-10 flex flex-col grow p-6">
          
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xl font-medium text-white leading-tight group-hover:text-gray-300 transition-colors line-clamp-2">
              {project.title}
            </h3>
            <span className="text-lg font-semibold text-white ml-4 shrink-0">₹{project.price}</span>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            <span className="bg-white/10 text-gray-300 border border-white/20 px-2 py-1 rounded text-[10px] font-sans tracking-wide uppercase">
              {(project as any).ros_version || project.rosVersion}
            </span>
            <span className="bg-white/10 text-gray-300 border border-white/20 px-2 py-1 rounded text-[10px] font-sans tracking-wide uppercase">
              {project.difficulty}
            </span>
          </div>

          <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 mb-4">
            {(project as any).short_description || project.shortDescription}
          </p>

          <div className="mt-auto grid grid-cols-2 gap-y-2 pt-4 border-t border-white/10">
            <div className="flex items-center text-[10px] text-gray-400"><span className="text-white mr-1 text-xs">✓</span> Components</div>
            <div className="flex items-center text-[10px] text-gray-400"><span className="text-white mr-1 text-xs">✓</span> Circuit</div>
            <div className="flex items-center text-[10px] text-gray-400"><span className="text-white mr-1 text-xs">✓</span> Commands</div>
            <div className="flex items-center text-[10px] text-gray-400"><span className="text-white mr-1 text-xs">✓</span> Code</div>
          </div>

        </div>
      </div>
    </Link>
  );
}
