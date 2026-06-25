"use client";
import React, { useRef, MouseEvent } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Project } from '@/lib/data';
import Link from 'next/link';

export default function PremiumProjectCard({ project }: { project: Project }) {
  const ref = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    
    const width = rect.width;
    const height = rect.height;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <Link href={`/projects/${project.slug}`}>
      <motion.div
        ref={ref}
        onClick={() => {
          if (project.slug) {
            window.location.href = `/projects/${project.slug}`;
          }
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="w-md h-88 shrink-0 relative rounded-xl bg-[#0a0a0a] border border-white/10 p-8 group hover:border-white/30 transition-colors shadow-lg overflow-hidden cursor-pointer flex flex-col justify-between"
      >
        {/* Animated Glow on Hover */}
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/5 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div style={{ transform: "translateZ(40px)", transformStyle: "preserve-3d" }} className="relative z-10 flex flex-col h-full pointer-events-none">
          
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-medium text-white leading-tight group-hover:text-gray-300 transition-colors">
              {project.title}
            </h3>
            <span className="text-lg font-semibold text-white ml-4">₹{project.price}</span>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-white/10 text-gray-300 border border-white/20 px-2 py-1 rounded text-xs font-sans tracking-wide uppercase">
              {(project as any).ros_version || project.rosVersion}
            </span>
            <span className="bg-white/10 text-gray-300 border border-white/20 px-2 py-1 rounded text-xs font-sans tracking-wide uppercase">
              {project.difficulty}
            </span>
          </div>

          <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 mb-6">
            {(project as any).short_description || project.shortDescription}
          </p>

          <div className="mt-auto grid grid-cols-2 gap-y-3 pt-6 border-t border-white/10">
            <div className="flex items-center text-xs text-gray-400"><span className="text-white mr-2 text-sm">✓</span> Components</div>
            <div className="flex items-center text-xs text-gray-400"><span className="text-white mr-2 text-sm">✓</span> Circuit Diagram</div>
            <div className="flex items-center text-xs text-gray-400"><span className="text-white mr-2 text-sm">✓</span> Commands</div>
            <div className="flex items-center text-xs text-gray-400"><span className="text-white mr-2 text-sm">✓</span> Source Code</div>
          </div>

        </div>
      </motion.div>
    </Link>
  );
}
