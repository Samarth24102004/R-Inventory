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
        const { data: projects } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (projects && projects.length > 0) {
          setSlides(projects);
        } else {
          // Default showcase fallback slides if DB is empty
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
            },
            {
              id: '2',
              title: 'Autonomous Navigation Rover',
              slug: 'autonomous-navigation-rover',
              short_description: 'Full Navigation2 & SLAM toolbox integration for differential drive mobile robots.',
              price: 999,
              category: 'Autonomous Driving',
              difficulty: 'Intermediate',
              ros_version: 'ROS Jazzy',
              thumbnail: '/placeholder.jpg',
              preview_video_url: null
            }
          ]);
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
  const coverImage = currentSlide.preview_images && currentSlide.preview_images.length > 0 
    ? currentSlide.preview_images[0] 
    : currentSlide.thumbnail !== '/placeholder.jpg' ? currentSlide.thumbnail : null;
  const previewVideo = currentSlide.preview_video_url || currentSlide.previewVideoUrl;

  return (
    <section 
      className="relative w-full max-w-6xl mx-auto px-4 py-12 z-20"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">Featured Robotics Showcase</h2>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={prevSlide}
            className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/15 text-white transition-colors cursor-pointer"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={nextSlide}
            className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/15 text-white transition-colors cursor-pointer"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Slideshow Frame */}
      <div className="relative w-full h-[420px] md:h-[480px] rounded-2xl overflow-hidden bg-[#0a0a0a] border border-white/10 shadow-2xl group flex flex-col justify-end">
        
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
        <div className="relative z-10 p-6 md:p-10 max-w-2xl space-y-4">
          <div className="flex flex-wrap gap-2.5 items-center">
            <span className="px-3 py-1 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full text-xs font-semibold uppercase tracking-wider">
              {currentSlide.category || 'Robotics'}
            </span>
            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full text-xs font-medium uppercase tracking-wider">
              {currentSlide.ros_version || currentSlide.rosVersion || 'ROS 2'}
            </span>
            <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-medium uppercase tracking-wider">
              {currentSlide.difficulty || 'Beginner'}
            </span>
          </div>

          <h3 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            {currentSlide.title}
          </h3>

          <p className="text-gray-300 text-sm md:text-base leading-relaxed line-clamp-2">
            {currentSlide.short_description || currentSlide.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-3">
            <Link 
              href={`/projects/${currentSlide.slug}`}
              className="px-6 py-3 bg-white text-black hover:bg-gray-200 rounded-md font-semibold text-sm transition-colors flex items-center gap-2 shadow-lg"
            >
              <span>Explore Project</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="text-xl font-bold text-white bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-md border border-white/15">
              ₹{currentSlide.price}
            </div>
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
