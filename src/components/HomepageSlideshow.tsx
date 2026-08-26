"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

export default function HomepageSlideshow() {
  const [slides, setSlides] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        // 1. Check custom admin uploaded banners
        const { data: customBanners } = await supabase
          .from('slideshow_banners')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (customBanners && customBanners.length > 0) {
          setSlides(customBanners.map(b => ({
            id: b.id,
            image_url: b.image_url,
            link_url: b.link_url || '#projects',
            title: b.title
          })));
        } else {
          // 2. Fallback to latest projects images
          const { data: projects } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(6);

          if (projects && projects.length > 0) {
            const extractedSlides = projects.map(p => {
              const cover = p.preview_images && p.preview_images.length > 0 
                ? p.preview_images[0] 
                : p.thumbnail;
              return {
                id: p.id,
                image_url: cover,
                link_url: `/projects/${p.slug}`,
                title: p.title
              };
            }).filter(s => s.image_url && s.image_url !== '/placeholder.jpg');

            setSlides(extractedSlides.length > 0 ? extractedSlides : [
              { id: '1', image_url: '/placeholder.jpg', link_url: '#', title: 'Featured Showcase' }
            ]);
          }
        }
      } catch (err) {
        console.error("Error fetching slides:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  // Auto-play timer
  useEffect(() => {
    if (!isAutoPlaying || slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  if (loading || slides.length === 0) return null;

  return (
    <section 
      className="relative w-full z-20"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Header bar with controls */}
      <div className="flex items-center justify-between mb-4 bg-black/60 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 shadow-lg">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
          <span className="text-xs font-bold tracking-wider uppercase text-white">Showcase Stack</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={prevSlide}
            className="p-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={nextSlide}
            className="p-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3D Stacked Cards Container */}
      <div className="relative w-full h-[320px] sm:h-[360px] md:h-[390px] flex items-center justify-center">
        {slides.map((slide, index) => {
          // Calculate relative position in cycle (0 = Top/Front, 1 = Middle, 2 = Bottom)
          const position = (index - currentIndex + slides.length) % slides.length;

          // Only render top 3 stacked cards for performance & clean look
          if (position > 2) return null;

          const isTop = position === 0;

          return (
            <motion.div
              key={slide.id || index}
              className="absolute w-full h-full rounded-2xl overflow-hidden shadow-2xl cursor-pointer group border border-white/20"
              initial={false}
              animate={{
                scale: 1 - position * 0.06,
                y: position * 18,
                zIndex: slides.length - position,
                opacity: position === 0 ? 1 : position === 1 ? 0.8 : 0.45,
                rotate: position === 0 ? 0 : position === 1 ? 2 : -2,
              }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 24,
              }}
              onClick={() => {
                if (isTop && slide.link_url) {
                  window.location.href = slide.link_url;
                } else {
                  setCurrentIndex(index);
                }
              }}
            >
              {/* Clean Image Only */}
              <div className="relative w-full h-full bg-[#0a0a0a]">
                <Image
                  src={slide.image_url}
                  alt={slide.title || "Slideshow Image"}
                  fill
                  priority={isTop}
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* Subtle Hover overlay link icon for top image */}
                {isTop && (
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="p-3 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/40 shadow-xl">
                      <ExternalLink className="w-6 h-6" />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Slide Indicators Dots */}
      <div className="flex justify-center items-center gap-1.5 mt-6">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/30 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
