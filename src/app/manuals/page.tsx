"use client";

import React, { useState, useEffect } from 'react';
import { manualCategories, ManualPost } from '@/lib/manualsData';
import { supabase } from '@/lib/supabase';
import { Search, BookOpen, ChevronRight, Copy, Check, Info, Menu, X, Terminal } from 'lucide-react';
import Footer from '@/components/Footer';

export default function ManualsPage() {
  const [manuals, setManuals] = useState<ManualPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSlug, setSelectedSlug] = useState<string>('');
  const [activeTabMap, setActiveTabMap] = useState<{ [key: string]: string }>({});
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchManuals = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('manuals')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        const mappedData: ManualPost[] = data.map((item) => ({
          id: item.id,
          slug: item.slug || item.id,
          title: item.title,
          category: item.category || 'SETUP',
          categoryLabel: item.category_label || item.category || 'SETUP',
          breadcrumbs: Array.isArray(item.breadcrumbs)
            ? item.breadcrumbs
            : ['software', `${(item.title || 'manual').toLowerCase().replace(/\s+/g, '_')}.md`],
          summary: item.summary || '',
          sections: Array.isArray(item.sections)
            ? item.sections
            : [
                {
                  title: item.title,
                  description: item.summary,
                  code: item.content || item.code || '',
                  language: 'bash'
                }
              ]
        }));
        setManuals(mappedData);
        setSelectedSlug(mappedData[0].slug);
      } else {
        setManuals([]);
      }
      setLoading(false);
    };

    fetchManuals();
  }, []);

  const activeManual = manuals.find((m) => m.slug === selectedSlug) || (manuals.length > 0 ? manuals[0] : null);

  // Filter manuals based on search
  const filteredManuals = manuals.filter((m) =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Next / Prev manual navigation
  const currentIndex = manuals.findIndex((m) => m.slug === selectedSlug);
  const prevManual = currentIndex > 0 ? manuals[currentIndex - 1] : null;
  const nextManual = currentIndex < manuals.length - 1 ? manuals[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-[#27005D] text-white selection:bg-[#9400FF]/40 flex flex-col">
      {/* Top Header Background Mask */}
      <div className="fixed top-0 left-0 right-0 h-28 bg-transparent backdrop-blur-md z-40 mask-[linear-gradient(to_bottom,#27005D_60%,transparent_100%)] pointer-events-none" />

      {/* Main Documentation Container */}
      <div className="pt-28 grow flex flex-col md:flex-row w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Mobile Sidebar Toggle Button */}
        {manuals.length > 0 && (
          <div className="md:hidden flex items-center justify-between py-3 px-4 mb-4 bg-[#1a003f] border border-[#9400FF]/30 rounded-2xl shadow-lg">
            <div className="flex items-center gap-2 text-xs font-mono text-[#9400FF]">
              <BookOpen className="w-4 h-4" />
              <span className="font-semibold">ROS Manuals Navigation</span>
            </div>
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="p-2 text-white/70 hover:text-white rounded-lg bg-[#9400FF]/20 border border-[#9400FF]/30"
            >
              {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        )}

        {/* Left Documentation Sidebar Navigation */}
        {manuals.length > 0 && (
          <aside
            className={`w-full md:w-72 shrink-0 md:border-r border-[#9400FF]/25 pr-0 md:pr-6 py-4 md:block transition-all ${
              mobileSidebarOpen ? 'block' : 'hidden md:block'
            }`}
          >
            <div className="sticky top-32 space-y-6">
              {/* Docs Search Box */}
              <div className="relative group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 group-focus-within:text-[#9400FF] transition-colors" />
                <input
                  type="text"
                  placeholder="Search docs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1a003f] border border-[#9400FF]/30 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#9400FF] transition-all"
                />
              </div>

              {/* Categorized Docs Menu */}
              <nav className="space-y-6 max-h-[calc(100vh-220px)] overflow-y-auto pr-2 custom-scrollbar">
                {manualCategories.map((category) => {
                  const categoryPosts = filteredManuals.filter((m) => m.category === category.id);
                  if (categoryPosts.length === 0) return null;

                  return (
                    <div key={category.id} className="space-y-2">
                      <h4 className="text-[11px] font-mono tracking-widest text-[#9400FF] uppercase font-bold px-2">
                        {category.label}
                      </h4>
                      <ul className="space-y-1">
                        {categoryPosts.map((post, idx) => {
                          const isActive = post.slug === selectedSlug;
                          return (
                            <li key={post.id}>
                              <button
                                onClick={() => {
                                  setSelectedSlug(post.slug);
                                  setMobileSidebarOpen(false);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between group ${
                                  isActive
                                    ? 'bg-[#9400FF] text-white font-semibold shadow-[0_0_15px_rgba(148,0,255,0.4)]'
                                    : 'text-white/70 hover:text-white hover:bg-[#9400FF]/20 border border-transparent'
                                }`}
                              >
                                <span className="line-clamp-1">
                                  {idx + 1}. {post.title}
                                </span>
                                {isActive && <ChevronRight className="w-3.5 h-3.5 text-white shrink-0 ml-1" />}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
              </nav>
            </div>
          </aside>
        )}

        {/* Right Main Manual Article Content */}
        <main className={`grow ${manuals.length > 0 ? 'md:pl-8' : ''} py-4 pb-24 min-w-0`}>
          {loading ? (
            <div className="text-center py-20 text-white/50 font-mono text-xs animate-pulse">
              Loading ROS manuals...
            </div>
          ) : activeManual ? (
            <article className="space-y-8 animate-fadeIn">
              
              {/* Breadcrumbs */}
              <div className="flex items-center gap-2 text-xs font-mono text-white/60">
                <span>software</span>
                <span>/</span>
                <span className="text-[#9400FF] font-bold">{activeManual.breadcrumbs.join(' / ')}</span>
              </div>

              {/* Document Header */}
              <div className="border-b border-[#9400FF]/25 pb-6">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#9400FF]/20 border border-[#9400FF]/40 text-[#9400FF] text-[10px] font-mono uppercase tracking-widest mb-3 font-semibold">
                  <Terminal className="w-3 h-3" />
                  <span>{activeManual.categoryLabel}</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
                  {activeManual.title}
                </h1>
                <p className="text-sm text-white/80 leading-relaxed max-w-3xl">
                  {activeManual.summary}
                </p>
              </div>

              {/* Manual Content Sections */}
              <div className="space-y-10">
                {activeManual.sections.map((section, sIdx) => (
                  <section key={sIdx} className="space-y-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                      <span className="text-[#9400FF] font-mono text-base font-bold">{sIdx + 1}.</span>
                      <span>{section.title}</span>
                    </h2>

                    {section.description && (
                      <p className="text-sm text-white/80 leading-relaxed">
                        {section.description}
                      </p>
                    )}

                    {/* Info Callout Box */}
                    {section.note && (
                      <div className="p-4 rounded-xl bg-[#9400FF]/15 border border-[#9400FF]/30 text-white text-xs sm:text-sm leading-relaxed flex items-start gap-3 shadow-lg">
                        <Info className="w-5 h-5 text-[#9400FF] shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-semibold text-white block mb-0.5">Note</strong>
                          {section.note}
                        </div>
                      </div>
                    )}

                    {/* Optional Section Image */}
                    {section.image_url && (
                      <div className="relative my-4 rounded-xl overflow-hidden border border-[#9400FF]/30 bg-[#130030] shadow-xl">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={section.image_url}
                          alt={section.title || 'Manual Diagram'}
                          className="w-full max-h-96 object-contain p-2"
                        />
                      </div>
                    )}

                    {/* Subsections with Version Tabs */}
                    {section.subsections && section.subsections.map((sub, subIdx) => (
                      <div key={subIdx} className="space-y-3 pt-2">
                        {sub.title && <h3 className="text-base font-semibold text-white">{sub.title}</h3>}
                        
                        {sub.tabs && sub.snippets && (
                          <div className="space-y-2">
                            {/* Version Tabs Bar */}
                            <div className="flex border-b border-[#9400FF]/25 gap-2">
                              {sub.tabs.map((tabName) => {
                                const activeTab = activeTabMap[`${sIdx}-${subIdx}`] || sub.tabs![0];
                                const isSelected = activeTab === tabName;
                                return (
                                  <button
                                    key={tabName}
                                    onClick={() =>
                                      setActiveTabMap((prev) => ({
                                        ...prev,
                                        [`${sIdx}-${subIdx}`]: tabName,
                                      }))
                                    }
                                    className={`px-4 py-2 text-xs font-mono tracking-wider font-semibold border-b-2 transition-all ${
                                      isSelected
                                        ? 'border-[#9400FF] text-[#9400FF] bg-[#9400FF]/15'
                                        : 'border-transparent text-white/60 hover:text-white'
                                    }`}
                                  >
                                    {tabName}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Tab Code Snippet */}
                            {(() => {
                              const activeTab = activeTabMap[`${sIdx}-${subIdx}`] || sub.tabs![0];
                              const snippet = (sub.snippets as any)[activeTab];
                              if (!snippet) return null;

                              return (
                                <div className="relative group rounded-xl bg-[#130030] border border-[#9400FF]/30 overflow-hidden mt-3 shadow-lg">
                                  <div className="flex justify-between items-center px-4 py-2 bg-[#0e0024] border-b border-[#9400FF]/30 text-xs font-mono text-white/70">
                                    <span>{snippet.language || 'bash'}</span>
                                    <button
                                      onClick={() => handleCopy(snippet.code)}
                                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#9400FF]/20 hover:bg-[#9400FF]/40 text-white transition-colors"
                                    >
                                      {copiedCode === snippet.code ? (
                                        <>
                                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                                          <span className="text-emerald-400">Copied</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-3.5 h-3.5" />
                                          <span>Copy</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                  <pre className="p-4 text-xs sm:text-sm font-mono text-[#D8B4FE] overflow-x-auto leading-relaxed">
                                    <code>{snippet.code}</code>
                                  </pre>
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Standard Code Snippet Block */}
                    {section.code && (
                      <div className="relative group rounded-xl bg-[#130030] border border-[#9400FF]/30 overflow-hidden mt-3 shadow-lg">
                        <div className="flex justify-between items-center px-4 py-2 bg-[#0e0024] border-b border-[#9400FF]/30 text-xs font-mono text-white/70">
                          <span>{section.language || 'bash'}</span>
                          <button
                            onClick={() => handleCopy(section.code!)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#9400FF]/20 hover:bg-[#9400FF]/40 text-white transition-colors"
                          >
                            {copiedCode === section.code ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="p-4 text-xs sm:text-sm font-mono text-[#D8B4FE] overflow-x-auto leading-relaxed">
                          <code>{section.code}</code>
                        </pre>
                      </div>
                    )}
                  </section>
                ))}
              </div>

              {/* Prev / Next Manual Navigation Buttons */}
              <div className="pt-10 border-t border-[#9400FF]/25 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {prevManual ? (
                  <button
                    onClick={() => {
                      setSelectedSlug(prevManual.slug);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="p-4 rounded-2xl bg-[#1a003f] border border-[#9400FF]/30 hover:border-[#9400FF] text-left transition-all group shadow-md hover:shadow-[0_0_15px_rgba(148,0,255,0.25)]"
                  >
                    <div className="text-[10px] font-mono uppercase text-white/60 mb-1">Previous Manual</div>
                    <div className="text-sm font-semibold text-white group-hover:text-[#9400FF] transition-colors line-clamp-1">
                      &larr; {prevManual.title}
                    </div>
                  </button>
                ) : <div />}

                {nextManual && (
                  <button
                    onClick={() => {
                      setSelectedSlug(nextManual.slug);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="p-4 rounded-2xl bg-[#1a003f] border border-[#9400FF]/30 hover:border-[#9400FF] text-right transition-all group shadow-md hover:shadow-[0_0_15px_rgba(148,0,255,0.25)]"
                  >
                    <div className="text-[10px] font-mono uppercase text-white/60 mb-1">Next Manual</div>
                    <div className="text-sm font-semibold text-white group-hover:text-[#9400FF] transition-colors line-clamp-1">
                      {nextManual.title} &rarr;
                    </div>
                  </button>
                )}
              </div>

            </article>
          ) : (
            <div className="text-center py-24 px-6 rounded-3xl bg-[#1a003f] border border-[#9400FF]/30 max-w-xl mx-auto shadow-xl">
              <BookOpen className="w-12 h-12 text-[#9400FF]/50 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Manuals Published Yet</h3>
              <p className="text-sm text-white/70 mb-6">
                Manuals and ROS setup commands can be created and managed by administrators through the Admin Portal.
              </p>
            </div>
          )}
        </main>

      </div>

      <Footer />
    </div>
  );
}
