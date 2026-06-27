"use client";
import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

import Script from 'next/script';



const frameCount = 240;
const currentFrame = (index: number) =>
  `https://hwyilzbmlscpaqftlfif.supabase.co/storage/v1/object/public/frames/frame_${index.toString().padStart(4, '0')}.webp`;

export default function HeroScrollAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollFraction, setScrollFraction] = useState(0);

  // Preload images
  useEffect(() => {
    const loadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;

    let timerFinished = false;
    let imagesFinished = false;

    const checkDone = () => {
      if (timerFinished && imagesFinished) {
        setIsLoaded(true);
      }
    };

    // Enforce a minimum loading time of 1.5 seconds so the animation can be seen
    setTimeout(() => {
      timerFinished = true;
      checkDone();
    }, 1500);

    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.src = currentFrame(i);
      img.onload = () => {
        loadedCount++;
        if (loadedCount === frameCount) {
          imagesFinished = true;
          checkDone();
        }
      };
      img.onerror = () => {
        console.error(`Failed to load frame: ${img.src}`);
        loadedCount++; // Increment anyway so it doesn't hang forever
        if (loadedCount === frameCount) {
          imagesFinished = true;
          checkDone();
        }
      };
      loadedImages.push(img);
    }
    setImages(loadedImages);
  }, []);

  // Handle scroll and drawing to canvas
  useEffect(() => {
    if (!isLoaded || !canvasRef.current || images.length === 0) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = images[0].width;
    canvas.height = images[0].height;

    const render = () => {
      const scrollTop = document.documentElement.scrollTop;
      const maxScrollTop = document.documentElement.scrollHeight - window.innerHeight;
      
      const fraction = maxScrollTop > 0 ? scrollTop / maxScrollTop : 0;
      setScrollFraction(fraction);
      
      const frameIndex = Math.min(
        frameCount - 1,
        Math.max(0, Math.floor(fraction * frameCount))
      );

      requestAnimationFrame(() => {
        if (images[frameIndex] && images[frameIndex].complete) {
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.drawImage(images[frameIndex], 0, 0);
        }
      });
    };

    window.addEventListener('scroll', render);
    render();

    return () => window.removeEventListener('scroll', render);
  }, [isLoaded, images]);

  // Helper to calculate opacity based on scroll fraction
  const getOpacity = (fraction: number, startFadeIn: number, endFadeIn: number, startFadeOut: number, endFadeOut: number) => {
    if (fraction < startFadeIn || fraction > endFadeOut) return 0;
    if (fraction >= endFadeIn && fraction <= startFadeOut) return 1;
    if (fraction >= startFadeIn && fraction < endFadeIn) {
      return (fraction - startFadeIn) / (endFadeIn - startFadeIn);
    }
    if (fraction > startFadeOut && fraction <= endFadeOut) {
      return 1 - ((fraction - startFadeOut) / (endFadeOut - startFadeOut));
    }
    return 0;
  };

  const text1Opacity = getOpacity(scrollFraction, 0.03, 0.08, 0.15, 0.25);
  const text2Opacity = getOpacity(scrollFraction, 0.3, 0.4, 0.55, 0.65);
  const text3Opacity = getOpacity(scrollFraction, 0.7, 0.8, 0.9, 1.0);

  return (
    <div ref={containerRef} className="h-screen sticky top-0 flex justify-center items-center overflow-hidden z-0 bg-black">
      
      <canvas
        ref={canvasRef}
        className={`w-full h-full object-cover object-[40%_center] md:object-center transition-opacity duration-1000 ease-in-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      />
      {!isLoaded && (
        <div className="absolute flex flex-col items-center justify-center space-y-4">
          <iframe 
            src="https://lottie.host/embed/092a0821-d7cf-48c1-bdc9-96f409a15629/VTQyxFR2t2.lottie" 
            style={{ width: '300px', height: '300px', border: 'none', background: 'transparent' }} 
            className="brightness-0 invert pointer-events-none"
          />
        </div>
      )}
      
      {/* Floating Text Overlay - Multiple Positions & Sizes */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        
        {/* Text 1: Left Center (Large) - Adjusted Alignment */}
        <div 
          style={{ opacity: text1Opacity, transition: 'opacity 0.1s ease-out' }} 
          className="absolute left-12 md:left-32 top-1/2 transform -translate-y-1/2 w-96 text-left text-white font-(family-name:--font-orbitron) tracking-widest"
        >
          <div className="text-6xl md:text-8xl font-black mb-4 drop-shadow-lg tracking-widest ml-[-0.05em]">ROS2</div>
          <div className="text-2xl opacity-80 mb-2 tracking-[0.3em]">SYS_CORE</div>
          <div className="text-sm font-mono opacity-60">STATUS // ONLINE</div>
        </div>

        {/* Text 2: Right Bottom (Medium) */}
        <div 
          style={{ opacity: text2Opacity, transition: 'opacity 0.1s ease-out' }} 
          className="absolute right-8 md:right-24 bottom-24 w-80 text-right text-white font-(family-name:--font-orbitron) tracking-widest"
        >
          <div className="text-4xl md:text-5xl font-bold mb-3 drop-shadow-md">CALIBRATING</div>
          <div className="text-xl opacity-80 mb-2 tracking-[0.2em]">KINEMATICS</div>
          <div className="text-xs font-mono opacity-60">JOINTS // SECURED</div>
        </div>

        {/* Text 3: Top Center (Huge) */}
        <div 
          style={{ opacity: text3Opacity, transition: 'opacity 0.1s ease-out' }} 
          className="absolute left-1/2 top-16 transform -translate-x-1/2 w-full text-center text-white font-(family-name:--font-orbitron) tracking-widest"
        >
          <div className="text-5xl md:text-7xl font-black mb-2 tracking-[0.2em] drop-shadow-xl">ENGAGING</div>
          <div className="text-2xl opacity-80 tracking-[0.4em] mb-2">AUTO_ROUTINE</div>
          <div className="text-sm font-mono opacity-60">TASK_ID: 9942 // EXECUTING</div>
        </div>

      </div>
    </div>
  );
}
