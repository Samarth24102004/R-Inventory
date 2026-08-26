"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
            link_url: b.link_url || '#projects'
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
                link_url: `/projects/${p.slug}`
              };
            }).filter(s => s.image_url && s.image_url !== '/placeholder.jpg');

            setSlides(extractedSlides.length > 0 ? extractedSlides : [
              { id: '1', image_url: '/placeholder.jpg', link_url: '#' }
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
    }, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  if (loading || slides.length === 0) return null;

  // Preset realistic fan-out photo stack angles & offsets
  const stackPositions = [
    { rotate: 0, scale: 1, x: 0, y: 0, opacity: 1, zIndex: 40 },
    { rotate: 12, scale: 0.96, x: 22, y: -12, opacity: 0.92, zIndex: 30 },
    { rotate: -15, scale: 0.92, x: -28, y: 15, opacity: 0.85, zIndex: 20 },
    { rotate: 7, scale: 0.88, x: 14, y: 28, opacity: 0.7, zIndex: 10 },
  ];

  return (
    <div 
      className="relative w-full h-[320px] sm:h-[360px] md:h-[400px] flex items-center justify-center cursor-pointer select-none"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
      onClick={() => setCurrentIndex((prev) => (prev + 1) % slides.length)}
    >
      {slides.map((slide, index) => {
        // Calculate relative offset position in cycle (0 = Front card)
        const posIndex = (index - currentIndex + slides.length) % slides.length;

        // Render top 4 cards in the fan stack
        if (posIndex > 3) return null;

        const config = stackPositions[posIndex];
        const isTop = posIndex === 0;

        return (
          <motion.div
            key={slide.id || index}
            className="absolute w-[85%] sm:w-[90%] h-[80%] sm:h-[85%] bg-white p-2.5 sm:p-3 rounded-xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] border border-white/40"
            initial={false}
            animate={{
              rotate: config.rotate,
              scale: config.scale,
              x: config.x,
              y: config.y,
              opacity: config.opacity,
              zIndex: config.zIndex,
            }}
            transition={{
              type: "spring",
              stiffness: 280,
              damping: 22,
            }}
            whileHover={isTop ? { scale: 1.04, rotate: -2 } : {}}
          >
            {/* Pure Framed Photo (No Text, No Titles) */}
            <div className="relative w-full h-full rounded-lg overflow-hidden bg-black">
              <Image
                src={slide.image_url}
                alt="Showcase Photo"
                fill
                priority={isTop}
                className="object-cover"
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
