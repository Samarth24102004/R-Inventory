"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, ArrowRight, Sparkles, Video, CircuitBoard, CheckCircle } from 'lucide-react';
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
        // 1. Try custom admin uploaded banners
        const { data: customBanners } = await supabase
          .from('slideshow_banners')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (customBanners && customBanners.length > 0) {
          setSlides(customBanners.map(b => ({
            id: b.id,
            title: b.title,
            short_description: b.subtitle || 'Featured Showcase',
            category: b.badge_text || 'Featured',
            image_url: b.image_url,
            link_url: b.link_url || '#projects',
            isCustomBanner: true
          })));
        } else {
          // 2. Fallback to latest projects
          const { data: projects } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);

          if (projects && projects.length > 0) {
            setSlides(projects);
          } else {
            setSlides([
              {
                id: '1',
                title: 'AI Assistant v1.0',
                slug: 'ai-assistant-v1-0',
                short_description: 'Raspberry Pi-powered desktop robot assistant that combines voice control with ROS 2 kinematics.',
                price: 699,
                category: 'Robotics',
                difficulty: 'Beginner',
                ros_version: 'ROS Humble',
                thumbnail: '/placeholder.jpg',
                preview_video_url: null
              }
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
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  if (loading || slides.length === 0) return null;

  const currentSlide = slides[currentIndex];
  const coverImage = currentSlide.image_url || (currentSlide.preview_images && currentSlide.preview_images.length > 0 
    ? currentSlide.preview_images[0] 
    : currentSlide.thumbnail !== '/placeholder.jpg' ? currentSlide.thumbnail : null);
  const previewVideo = currentSlide.preview_video_url || currentSlide.previewVideoUrl;
  const targetLink = currentSlide.link_url || (currentSlide.slug ? `/projects/${currentSlide.slug}` : '#projects');

  return (
    <section 
      className="relative w-full z-20"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <div className="flex items-center justify-between mb-3 bg-black/60 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 shadow-lg">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
          <h2 className="text-sm font-bold tracking-wider uppercase text-white">Featured Showcase</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <button 
            onClick={prevSlide}
            className="p-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={nextSlide}
            className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Slideshow Frame */}
      <div className="relative w-full h-[360px] md:h-[400px] rounded-2xl overflow-hidden bg-[#0a0a0a]/90 backdrop-blur-md border border-white/20 shadow-2xl group flex flex-col justify-end">
        
        {/* Background Video or Image */}
        <div className="absolute inset-0 z-0">
          {previewVideo ? (
            <video 
              src={previewVideo} 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="w-full h-full object-cover opacity-60 group-hover:opacity-70 transition-opacity duration-700 pointer-events-none"
            />
          ) : coverImage ? (
            <Image 
              src={coverImage} 
              alt={currentSlide.title} 
              fill
              className="object-cover opacity-50 group-hover:opacity-65 transition-all duration-700" 
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-purple-900/30 via-black to-cyan-900/30 flex items-center justify-center">
              <CircuitBoard className="w-32 h-32 text-white/10" />
            </div>
          )}
          {/* Gradient Overlays for contrast */}
          <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0a] via-[#0a0a0a]/70 to-transparent"></div>
          <div className="absolute inset-0 bg-linear-to-r from-[#0a0a0a]/90 via-[#0a0a0a]/40 to-transparent"></div>
        </div>

        {/* Content Box */}
        <div className="relative z-10 p-5 md:p-6 space-y-3">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="px-2.5 py-0.5 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full text-[11px] font-semibold uppercase tracking-wider">
              {currentSlide.category || 'Featured'}
            </span>
            {currentSlide.ros_version && (
              <span className="px-2.5 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full text-[11px] font-medium uppercase tracking-wider">
                {currentSlide.ros_version}
              </span>
            )}
            {currentSlide.difficulty && (
              <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[11px] font-medium uppercase tracking-wider">
                {currentSlide.difficulty}
              </span>
            )}
          </div>

          <h3 className="text-xl md:text-2xl font-black text-white tracking-tight leading-tight line-clamp-1">
            {currentSlide.title}
          </h3>

          <p className="text-gray-300 text-xs md:text-sm leading-relaxed line-clamp-2">
            {currentSlide.short_description || currentSlide.subtitle || currentSlide.description}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link 
              href={targetLink}
              className="px-5 py-2.5 bg-white text-black hover:bg-gray-200 rounded-md font-bold text-xs transition-colors flex items-center gap-1.5 shadow-lg"
            >
              <span>Explore Showcase</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {currentSlide.price && (
              <div className="text-sm font-extrabold text-white bg-white/10 backdrop-blur-md px-3 py-2 rounded-md border border-white/15">
                ₹{currentSlide.price}
              </div>
            )}
          </div>
        </div>

        {/* Dots Indicators */}
        <div className="absolute bottom-6 right-6 z-20 flex space-x-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
