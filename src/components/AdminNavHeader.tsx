"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, ImageIcon, CircuitBoard, Plus, Mail } from 'lucide-react';

export default function AdminNavHeader() {
  const pathname = usePathname();

  const tabs = [
    { name: 'Analytics Dashboard', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Homepage Slideshow', path: '/admin/slideshow', icon: ImageIcon },
    { name: 'Manage Content', path: '/admin/projects', icon: CircuitBoard },
    { name: 'Upload New', path: '/admin/upload', icon: Plus },
    { name: 'Inbox', path: '/admin/inbox', icon: Mail },
  ];

  return (
    <div className="flex space-x-6 border-b border-white/10 pb-px mb-8 overflow-x-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.path || (pathname === '/admin' && tab.path === '/admin/analytics');

        return (
          <Link
            key={tab.path}
            href={tab.path}
            className={`pb-4 px-2 text-sm font-medium transition-all duration-200 border-b-2 whitespace-nowrap flex items-center gap-2 ${
              isActive
                ? 'border-white text-white font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500'}`} />
            <span>{tab.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
