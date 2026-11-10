"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Project } from '@/lib/data';
import { supabase } from '@/lib/supabase';
import { Lock, Unlock, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import AuthModal from './AuthModal';

export default function LockedProjectCard({
  project,
  className = "w-full h-96 shrink-0",
  videoHeight = "h-40",
  showTags = true,
}: {
  project: Project;
  className?: string;
  videoHeight?: string;
  showTags?: boolean;
}) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Cover image / preview
  const coverImage = project.preview_images && project.preview_images.length > 0 
    ? project.preview_images[0] 
    : (project.heroImage && project.heroImage !== '/placeholder.jpg' ? project.heroImage : null);

  const isFree = Number(project.price || 0) <= 0;

  useEffect(() => {
    let isMounted = true;

    const checkOwnership = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!isMounted) return;
        setUser(currentUser);

        if (isFree) {
          setIsUnlocked(true);
          return;
        }

        if (currentUser) {
          const { data: purchase } = await supabase
            .from('purchases')
            .select('id')
            .eq('user_id', currentUser.id)
            .eq('project_id', project.id)
            .maybeSingle();

          if (isMounted && purchase) {
            setIsUnlocked(true);
          }
        }
      } catch (err) {
        console.error("Error checking ownership:", err);
      }
    };

    checkOwnership();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setUser(session?.user || null);
      if (session?.user && !isFree) {
        supabase
          .from('purchases')
          .select('id')
          .eq('user_id', session.user.id)
          .eq('project_id', project.id)
          .maybeSingle()
          .then(({ data }) => {
            if (isMounted && data) setIsUnlocked(true);
          });
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [project.id, isFree]);

  const handleUnlockClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isUnlocked) {
      router.push(`/projects/${project.slug}`);
      return;
    }

    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    setActionLoading(true);
    router.push(`/projects/${project.slug}`);
  };

  return (
    <>
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`${className} relative rounded-2xl bg-white border-2 transition-all duration-300 shadow-md hover:shadow-2xl overflow-hidden flex flex-col group cursor-pointer ${
          isUnlocked 
            ? 'border-emerald-400/80 hover:border-emerald-500 shadow-emerald-500/10' 
            : 'border-[#687EFF]/40 hover:border-[#687EFF] shadow-[#687EFF]/15'
        }`}
        onClick={() => router.push(`/projects/${project.slug}`)}
      >
        {/* Cover Section with Frosted Lock Effect */}
        <div className={`${videoHeight} w-full relative bg-[#0B2447] overflow-hidden shrink-0 border-b border-[#687EFF]/20`}>
          {coverImage ? (
            <Image
              src={coverImage}
              alt={project.title}
              fill
              className={`object-cover transition-all duration-700 ${
                isUnlocked 
                  ? 'opacity-90 group-hover:scale-105' 
                  : 'opacity-40 blur-[1.5px] scale-105'
              }`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-radial from-[#19376D] to-[#0B2447] text-[#B6FFFA]/40 font-mono text-xs">
              ROS 2 PACKAGE
            </div>
          )}

          {/* Frosted Glass Overlay for Locked State */}
          {!isUnlocked && (
            <div className="absolute inset-0 bg-[#0B2447]/50 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 transition-all duration-300 group-hover:bg-[#0B2447]/40">
              <div className="w-12 h-12 rounded-2xl bg-[#0B2447]/90 border border-[#687EFF] flex items-center justify-center text-[#B6FFFA] shadow-lg mb-1.5 transition-transform duration-300 group-hover:scale-110">
                {isHovered ? (
                  <Unlock className="w-6 h-6 text-[#B6FFFA] transition-transform duration-300 animate-pulse" />
                ) : (
                  <Lock className="w-6 h-6 text-[#687EFF]" />
                )}
              </div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#B6FFFA] uppercase">
                {isHovered ? "Ready to Unlock" : "Locked Content"}
              </span>
            </div>
          )}

          {/* Floating Status Pill */}
          <div className="absolute top-3 left-3 z-20">
            {isUnlocked ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-400 text-emerald-300 text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md shadow-md">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Unlocked</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0B2447]/90 border border-[#687EFF] text-[#B6FFFA] text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md shadow-md">
                <Lock className="w-3 h-3 text-[#687EFF]" />
                <span>Premium Project</span>
              </span>
            )}
          </div>

          {/* Price Tag Badge */}
          <div className="absolute top-3 right-3 z-20">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/95 text-[#0B2447] text-xs font-extrabold shadow-md">
              {isFree ? 'Free' : `₹${project.price}`}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="relative z-10 flex flex-col grow p-5 sm:p-6 bg-white">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg sm:text-xl font-bold text-[#0B2447] leading-snug group-hover:text-[#687EFF] transition-colors line-clamp-1">
              {project.title}
            </h3>
          </div>

          {/* Tags */}
          {showTags && project.tags && Array.isArray(project.tags) && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {project.tags.slice(0, 3).map((tag: string, idx: number) => (
                <span
                  key={idx}
                  className="bg-[#687EFF]/10 text-[#687EFF] border border-[#687EFF]/25 px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <p className="text-[#0B2447]/70 text-xs leading-relaxed line-clamp-2 mb-4">
            {(project as any).short_description || project.shortDescription || "Complete ROS 2 robotics architecture with verified hardware BOM and circuits."}
          </p>

          {/* Feature Checklist */}
          <div className="grid grid-cols-2 gap-y-1.5 py-3 border-y border-[#687EFF]/15 text-[10px] text-[#0B2447]/75 font-medium mb-4">
            <div className="flex items-center gap-1.5">
              <span className="text-[#687EFF] font-bold">✓</span> Components List
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[#687EFF] font-bold">✓</span> Circuit Schematics
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[#687EFF] font-bold">✓</span> Launch Commands
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[#687EFF] font-bold">✓</span> Source Code .ZIP
            </div>
          </div>

          {/* Interactive Unlock Button */}
          <div className="mt-auto">
            {isUnlocked ? (
              <button
                type="button"
                onClick={handleUnlockClick}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-98"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Unlocked • View Package</span>
                <ArrowRight className="w-3.5 h-3.5 ml-auto" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleUnlockClick}
                disabled={actionLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#0B2447] hover:bg-[#19376D] text-[#B6FFFA] text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:shadow-[#687EFF]/25 cursor-pointer active:scale-98 group/btn"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#687EFF]" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <div className="w-5 h-5 rounded-md bg-[#687EFF]/20 border border-[#687EFF]/40 flex items-center justify-center group-hover/btn:bg-[#687EFF] group-hover/btn:text-white transition-colors">
                      <Unlock className="w-3 h-3 text-[#B6FFFA]" />
                    </div>
                    <span>{isFree ? "Unlock Free Project" : `Unlock Project • ₹${project.price}`}</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-auto text-[#687EFF] group-hover/btn:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Auth Modal Trigger if user clicks Unlock while unauthenticated */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          setAuthModalOpen(false);
          router.push(`/projects/${project.slug}`);
        }}
      />
    </>
  );
}

