"use client";
import React from 'react';
import { Project } from '@/lib/data';
import Link from 'next/link';
import Image from 'next/image';

function getYouTubeEmbedUrl(url: string | undefined): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);

  if (match && match[2].length === 11) {
    const videoId = match[2];
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&modestbranding=1&rel=0&playsinline=1`;
  }
  return null;
}

export default function PremiumProjectCard({ 
  project,
  className = "w-full h-96 shrink-0",
  videoHeight = "h-40"
}: { 
  project: Project;
  className?: string;
  videoHeight?: string;
}) {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Use the first preview image if available, else null
  const coverImage = project.preview_images && project.preview_images.length > 0 
    ? project.preview_images[0] 
    : null;

  const previewVideo = project.preview_video_url || (project as any).previewVideoUrl || project.video_url || (project as any).videoUrl;
  const ytEmbed = previewVideo ? getYouTubeEmbedUrl(previewVideo) : null;

  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {
        // Autoplay may be restricted until user interacts, but defaultMuted helps prevent block
      });
    }
  }, [previewVideo]);

  return (
    <Link href={`/projects/${project.slug}`}>
      <div
        className={`${className} relative rounded-2xl bg-[#222831] border border-[#393E46] group hover:border-[#FD7014]/60 transition-all shadow-xl overflow-hidden cursor-pointer flex flex-col`}
      >
        {/* Cover Section: Video or Image */}
        <div className={`${videoHeight} w-full relative bg-[#1a1e24] overflow-hidden shrink-0 border-b border-[#393E46]`}>
          {ytEmbed ? (
            <div className="w-full h-full relative overflow-hidden pointer-events-none">
              <iframe
                src={ytEmbed}
                title={project.title}
                className="w-[160%] h-[160%] absolute -top-[30%] -left-[30%] object-cover opacity-90 group-hover:opacity-100 transition-all duration-500 border-0"
                allow="autoplay; encrypted-media"
              />
            </div>
          ) : previewVideo ? (
            <video 
              ref={videoRef}
              src={previewVideo} 
              autoPlay 
              loop 
              muted 
              playsInline 
              preload="auto"
              className="object-cover w-full h-full opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 pointer-events-none"
            />
          ) : coverImage ? (
            <Image 
              src={coverImage} 
              alt={project.title} 
              fill
              className="object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#EEEEEE]/30">
              No Preview
            </div>
          )}
          {/* Subtle gradient overlay to blend into the card body */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-[#222831] to-transparent pointer-events-none"></div>
        </div>

        {/* Animated Glow on Hover */}
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-[#FD7014]/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"></div>
        
        {/* Card Body */}
        <div className="relative z-10 flex flex-col grow p-6">
          
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xl font-semibold text-[#EEEEEE] leading-tight group-hover:text-[#FD7014] transition-colors line-clamp-2">
              {project.title}
            </h3>
            <span className="text-lg font-bold text-[#FD7014] ml-4 shrink-0">₹{project.price}</span>
          </div>

          {project.tags && Array.isArray(project.tags) && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {project.tags.map((tag: string, idx: number) => (
                <span key={idx} className="bg-[#FD7014]/10 text-[#FD7014] border border-[#FD7014]/30 px-2 py-0.5 rounded text-[10px] font-sans font-semibold tracking-wide uppercase">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <p className="text-[#EEEEEE]/70 text-xs leading-relaxed line-clamp-2 mb-4">
            {(project as any).short_description || project.shortDescription}
          </p>

          <div className="mt-auto grid grid-cols-2 gap-y-2 pt-4 border-t border-[#393E46]">
            <div className="flex items-center text-[10px] text-[#EEEEEE]/60"><span className="text-[#FD7014] mr-1.5 text-xs font-bold">✓</span> Components</div>
            <div className="flex items-center text-[10px] text-[#EEEEEE]/60"><span className="text-[#FD7014] mr-1.5 text-xs font-bold">✓</span> Circuit</div>
            <div className="flex items-center text-[10px] text-[#EEEEEE]/60"><span className="text-[#FD7014] mr-1.5 text-xs font-bold">✓</span> Commands</div>
            <div className="flex items-center text-[10px] text-[#EEEEEE]/60"><span className="text-[#FD7014] mr-1.5 text-xs font-bold">✓</span> Code</div>
          </div>
        </div>
      </div>
    </Link>
  );
}
