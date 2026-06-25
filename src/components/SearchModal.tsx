"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import PremiumProjectCard from './PremiumProjectCard';

export default function SearchModal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isOpen = searchParams.get('search') === 'true';
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      setSearched(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim()) {
        setLoading(true);
        setSearched(true);
        // Assuming title search for simplicity
        const { data } = await supabase
          .from('projects')
          .select('*')
          .ilike('title', `%${query}%`);

        setResults(data || []);
        setLoading(false);
      } else {
        setResults([]);
        setSearched(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 bg-black/90 backdrop-blur-md flex flex-col items-center pt-24 px-4 overflow-y-auto">
      <div className="w-full max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold text-white tracking-tight">Search Projects</h2>
          <button 
            onClick={() => router.push(pathname)} 
            className="p-2 rounded-full border border-transparent hover:border-white/20 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="relative mb-12">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by project name..."
            className="w-full bg-transparent border border-white/20 rounded-md py-4 pl-12 pr-6 text-sm text-white outline-none focus:border-white transition-colors shadow-sm"
          />
        </div>

        {loading ? (
          <div className="text-center text-sm text-gray-400">Searching...</div>
        ) : (
          <div className="flex flex-col gap-6 w-full items-center pb-32">
            {results.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full justify-items-center">
                {results.map((project) => (
                  <div key={project.id} className="scale-90 origin-top">
                    <PremiumProjectCard project={project} />
                  </div>
                ))}
              </div>
            ) : searched && !loading ? (
              <div className="text-center bg-transparent border border-white/10 p-12 rounded-md w-full">
                <p className="text-sm text-gray-400">No project now but we'll work on it.</p>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
