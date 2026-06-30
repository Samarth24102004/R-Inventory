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
            RoS Inventory is your premier destination for ROS2 projects, autonomous robots, AI robotics tutorials, and 3D models. We empower the open-source robotics community with production-ready code and simulation resources.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-6 text-sm text-gray-500 mt-8 md:mt-0">
          <div className="flex flex-col gap-2 text-center md:text-right">
            <span className="font-semibold text-gray-300">Resources</span>
            <a href="/projects" className="hover:text-white transition-colors">ROS Projects</a>
            <a href="/3d-models" className="hover:text-white transition-colors">3D Models</a>
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
