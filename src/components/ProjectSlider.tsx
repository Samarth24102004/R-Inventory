"use client";
import React from 'react';
import { motion } from 'framer-motion';
import PremiumProjectCard from '@/components/PremiumProjectCard';

export default function ProjectSlider({ projects }: { projects: any[] }) {
  return (
    <div className="relative w-full overflow-hidden py-24 bg-black/40 border-y border-white/10 my-20">
      <div className="text-center mb-16 relative z-20">
        <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-md">Latest Projects Inventory</h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto drop-shadow-sm">Explore premium ROS 2 projects complete with components, circuit diagrams, commands, and GitHub code.</p>
      </div>

      <div className="absolute inset-y-0 left-0 w-48 bg-linear-to-r from-black to-transparent z-10 pointer-events-none"></div>
      <div className="absolute inset-y-0 right-0 w-48 bg-linear-to-l from-black to-transparent z-10 pointer-events-none"></div>
      
      <div className="flex overflow-hidden">
        <motion.div 
          className="flex space-x-12 w-max pl-12 py-8"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 60 }}
        >
          {projects && projects.length > 0 ? (
            [...projects, ...projects, ...projects].map((project, index) => (
              <PremiumProjectCard key={`${project.id}-${index}`} project={project} />
            ))
          ) : (
            <div className="text-gray-500 italic px-20">No projects found. Use the Admin Portal to upload some!</div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
