"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import AuthButton from './AuthButton';

export default function Navbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [hash, setHash] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setHash(window.location.hash);
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [pathname, searchParams]);

  // Close mobile menu on route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname, searchParams]);

  // Hide on admin routes
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const isContact = searchParams.get('contact') === 'true' || searchParams.get('idea') === 'true';

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Projects', href: '/projects' },
    { name: '3D Models', href: '/3d-models' },
    { name: 'Manuals', href: '/manuals' },
    { name: 'Contact Me', href: '/?contact=true' },
  ];

  const checkIsActive = (link: typeof navLinks[0]) => {
    if (link.name === 'Contact Me') return isContact;
    if (isContact) return false;
    if (link.name === 'Home') return pathname === '/' && hash !== '#projects';
    if (link.name === 'Projects') return pathname === '/projects' || (pathname === '/' && hash === '#projects');
    if (link.name === '3D Models') return pathname === '/3d-models';
    if (link.name === 'Manuals') return pathname === '/manuals' || pathname?.startsWith('/manuals/');
    return pathname === link.href;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#B6FFFA]/85 backdrop-blur-md border-b border-[#687EFF]/15 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo - Top Left */}
        <Link href="/" className="flex flex-col items-start select-none group cursor-pointer shrink-0">
          <div className="flex items-center gap-0.5">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-[#0B2447] group-hover:text-[#687EFF] transition-colors" style={{ fontFamily: 'sans-serif' }}>
              ROS
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#8ba4ff] shadow-[0_0_8px_#8ba4ff] inline-block ml-0.5 mb-1"></span>
          </div>
          <span className="text-[9px] font-bold tracking-[0.25em] text-[#0B2447]/70 -mt-1.5 uppercase">
            INVENTORY
          </span>
        </Link>

        {/* Center Navigation Links - Floating Pill */}
        <nav className="hidden md:flex items-center gap-1 bg-white/80 backdrop-blur-md border border-white/90 rounded-full p-1.5 shadow-sm">
          {navLinks.map((link) => {
            const active = checkIsActive(link);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`px-4 py-1.5 rounded-full text-xs lg:text-sm font-semibold transition-all duration-200 ${
                  active
                    ? 'bg-[#0B2447] text-[#B6FFFA] shadow-xs'
                    : 'text-[#0B2447]/75 hover:text-[#0B2447] hover:bg-white'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Auth & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <AuthButton />

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full text-[#0B2447] hover:bg-white/80 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#B6FFFA]/95 backdrop-blur-xl border-b border-[#687EFF]/20 px-4 pt-2 pb-5 space-y-1.5 shadow-xl">
          {navLinks.map((link) => {
            const active = checkIsActive(link);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`block px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  active
                    ? 'bg-[#0B2447] text-[#B6FFFA]'
                    : 'text-[#0B2447]/80 hover:text-[#0B2447] hover:bg-white/80'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
