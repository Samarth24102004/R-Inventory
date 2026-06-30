"use client";

import React, { useState, useEffect } from 'react';
import { Home, LayoutList, Search, MessageSquare, PlusSquare, Box } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

export default function BottomNavbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [hash, setHash] = useState('');

  useEffect(() => {
    // Set initial hash
    setHash(window.location.hash);
    
    // Listen for hash changes
    const onHashChange = () => {
      setHash(window.location.hash);
    };
    
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [pathname, searchParams]); // re-evaluate when route changes

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Projects', path: '/projects', icon: LayoutList },
    { name: '3D Models', path: '/3d-models', icon: Box },
    { name: 'Search', path: '?search=true', icon: Search },
    { name: 'Idea', path: '?idea=true', icon: MessageSquare, hasBadge: true },
  ];

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <nav className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] px-3 py-3 flex items-center gap-6 shadow-[0_20px_40px_rgba(0,0,0,0.8)]">
        {navItems.map((item) => {
          let isActive = false;
          const isSearch = searchParams.get('search') === 'true';
          const isIdea = searchParams.get('idea') === 'true';

          if (item.name === 'Search') {
            isActive = isSearch;
          } else if (item.name === 'Idea') {
            isActive = isIdea;
          } else if (item.name === 'Home') {
            isActive = pathname === '/' && !isSearch && !isIdea && hash !== '#projects';
          } else if (item.name === 'Projects') {
            isActive = pathname === '/projects' || (hash === '#projects' && !isSearch && !isIdea);
          } else if (item.name === '3D Models') {
            isActive = pathname === '/3d-models' && !isSearch && !isIdea;
          } else {
            isActive = pathname === item.path && !isSearch && !isIdea;
          }

          const Icon = item.icon;

          return (
            <div key={item.name} className="relative group flex items-center justify-center">
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 px-3 py-1.5 bg-white text-black text-xs font-bold rounded-md shadow-lg pointer-events-none whitespace-nowrap z-50 transform translate-y-2 group-hover:translate-y-0">
                {item.name}
              </div>
              <Link
                href={item.path}
                className={`flex items-center justify-center transition-all duration-300 rounded-full hover:scale-125 relative p-3 hover:bg-white hover:text-black hover:shadow-md ${
                  isActive
                    ? 'bg-transparent text-white'
                    : 'bg-transparent text-white'
                }`}
              >
                <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                {item.hasBadge && (
                  <span
                    className={`absolute top-[10px] right-[10px] w-2.5 h-2.5 rounded-full border-2 ${
                      isActive ? 'border-white bg-black' : 'border-[#0a0a0a] bg-white/60'
                    }`}
                  ></span>
                )}
              </Link>
            </div>
          );
        })}
      </nav>
    </div>
  );
}
