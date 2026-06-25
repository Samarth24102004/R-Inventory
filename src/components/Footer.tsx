import React from 'react';

export default function Footer() {
  return (
    <footer className="relative z-20 bg-[#050505] border-t border-white/10 pt-16 pb-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start">
          <div className="flex items-center gap-1 mb-2">
            <span className="text-2xl font-black tracking-tighter text-white" style={{ fontFamily: 'sans-serif' }}>
              ROS
            </span>
            <span className="w-1.5 h-1.5 bg-[#84cc16] rounded-sm mt-2"></span>
          </div>
          <span className="text-[9px] font-bold tracking-[0.3em] text-gray-500 mt-[-4px]">
            INVENTORY
          </span>
        </div>
        
        <div className="flex items-center gap-6 text-sm text-gray-500">
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-8 text-center md:text-left text-xs text-gray-600">
        &copy; {new Date().getFullYear()} ROS Inventory. All rights reserved.
      </div>
    </footer>
  );
}
