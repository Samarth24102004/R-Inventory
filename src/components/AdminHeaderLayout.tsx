"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, ImageIcon, CircuitBoard, Plus, ShieldCheck, Mail } from 'lucide-react';

interface AdminHeaderLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export default function AdminHeaderLayout({ title, subtitle, children }: AdminHeaderLayoutProps) {
  const pathname = usePathname();

  const tabs = [
    { name: 'Analytics Dashboard', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Manage Content', path: '/admin/projects', icon: CircuitBoard },
    { name: 'Upload New', path: '/admin/upload', icon: Plus },
    { name: 'Inbox', path: '/admin/inbox', icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-black text-white pt-28 pb-20 px-[5%] font-sans">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Standardized Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-white" strokeWidth={1.5} />
              <h1 className="text-3xl font-semibold text-white tracking-tight">
                {title}
              </h1>
            </div>
            <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
          </div>
        </div>

        {/* Standardized Tab Navigation Bar (Identical Position & Width Across All Pages) */}
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

        {/* Page Main Content */}
        {children}

      </div>
    </div>
  );
}
