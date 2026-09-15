import React from 'react';

export default function Footer() {
  return (
    <footer className="relative z-20 bg-[#050505] border-t border-white/10 pt-16 pb-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start max-w-sm">
          <div className="flex items-center gap-1 mb-2">
            <span className="text-2xl font-black tracking-tighter text-white" style={{ fontFamily: 'sans-serif' }}>
              RoS
            </span>
            <span className="w-1.5 h-1.5 bg-[#84cc16] rounded-sm mt-2"></span>
          </div>
          <span className="text-[9px] font-bold tracking-[0.3em] text-gray-500 mt-[-4px] mb-4">
            INVENTORY
          </span>
          <p className="text-gray-400 text-sm text-center md:text-left leading-relaxed">
            RoS Inventory is your premier destination for ROS2 projects, autonomous robots, and AI robotics. We empower the open-source robotics community with production-ready code, 3D models, and developer resources for SLAM, Navigation2, MoveIt, and Gazebo robot simulation.
          </p>
          <div className="flex items-center gap-3 mt-4">
            <a
              href="https://www.youtube.com/@RosInventory"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube Channel"
              className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:border-[#ff0000]/50 hover:bg-[#ff0000]/20 flex items-center justify-center text-gray-400 hover:text-white transition-all"
              title="YouTube"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/rosinventory?stkn=MWhiM3Fna2V6cXdpag=="
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram Profile"
              className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:border-[#e1306c]/50 hover:bg-[#e1306c]/20 flex items-center justify-center text-gray-400 hover:text-white transition-all"
              title="Instagram"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/in/samarth-katageri-0b7b71291/?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base%3BoofaF2UMQYejMzKyTIgbpA%3D%3D"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn Profile"
              className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:border-[#0a66c2]/50 hover:bg-[#0a66c2]/20 flex items-center justify-center text-gray-400 hover:text-white transition-all"
              title="LinkedIn"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-6 text-sm text-gray-500 mt-8 md:mt-0">
          <div className="flex flex-col gap-2 text-center md:text-right">
            <span className="font-semibold text-gray-300">Resources</span>
            <a href="/projects" className="hover:text-white transition-colors">ROS Projects</a>
            <a href="/3d-models" className="hover:text-white transition-colors">3D Models</a>
            <a href="/manuals" className="hover:text-white transition-colors">ROS Manuals</a>
          </div>
          <div className="flex flex-col gap-2 text-center md:text-right">
            <span className="font-semibold text-gray-300">Legal</span>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-600">
        <div>&copy; {new Date().getFullYear()} RoS Inventory. All rights reserved.</div>
        <div className="flex gap-4">
          <span>Powered by ROS2</span>
          <span>Open Source Robotics</span>
        </div>
      </div>
    </footer>
  );
}
