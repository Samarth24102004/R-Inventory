"use client";

import React, { useState, useEffect } from 'react';
import { Home, Mail, PlusSquare, Box, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

function ProjectsBoardIcon({ className }: { className?: string; strokeWidth?: number }) {
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 shrink-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/projects-icon.png"
        alt="Projects"
        className="w-[26px] h-[20px] max-w-none object-contain transition-all duration-300 filter group-hover:invert"
      />
    </span>
  );
}

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
    { name: 'Projects', path: '/projects', icon: ProjectsBoardIcon },
    { name: '3D Models', path: '/3d-models', icon: Box },
    { name: 'Manuals', path: '/manuals', icon: BookOpen },
    { name: 'Contact Me', path: '?contact=true', icon: Mail, hasBadge: true },
  ];

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <nav className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] px-3 py-3 flex items-center gap-6 shadow-[0_20px_40px_rgba(0,0,0,0.8)]">
        {navItems.map((item) => {
          let isActive = false;
          const isContact = searchParams.get('contact') === 'true' || searchParams.get('idea') === 'true';

          if (item.name === 'Contact Me') {
            isActive = isContact;
          } else if (item.name === 'Home') {
            isActive = pathname === '/' && !isContact && hash !== '#projects';
          } else if (item.name === 'Projects') {
            isActive = pathname === '/projects' || (hash === '#projects' && !isContact);
          } else if (item.name === '3D Models') {
            isActive = pathname === '/3d-models' && !isContact;
          } else if (item.name === 'Manuals') {
            isActive = (pathname === '/manuals' || pathname?.startsWith('/manuals/')) && !isContact;
          } else {
            isActive = pathname === item.path && !isContact;
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
