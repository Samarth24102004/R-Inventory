"use client";

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  ImageIcon, 
  Upload, 
  Trash2, 
  Plus, 
  BarChart3, 
  CircuitBoard, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Link as LinkIcon, 
  Sparkles,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import AdminHeaderLayout from '@/components/AdminHeaderLayout';

export default function AdminSlideshowPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Upload Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [badgeText, setBadgeText] = useState('Featured');
  const [linkUrl, setLinkUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBanners = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('slideshow_banners')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching banners:", error);
    } else {
      setBanners(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleUploadBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return alert("Please enter a title for the slideshow banner.");
    if (!imageFile) return alert("Please upload a banner image.");

    setIsSubmitting(true);

    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `slide_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('homepage_slideshow')
        .upload(fileName, imageFile);

      if (uploadError) {
        // Fallback to project_previews if homepage_slideshow bucket doesn't exist yet
        const { error: fallbackErr } = await supabase.storage
          .from('project_previews')
          .upload(fileName, imageFile);

        if (fallbackErr) throw new Error(fallbackErr.message);
      }

      // Get Public URL
      const { data: urlData } = supabase.storage
        .from('homepage_slideshow')
        .getPublicUrl(fileName);

      const finalUrl = urlData?.publicUrl || '';

      // 2. Insert into DB
      const { error: dbError } = await supabase
        .from('slideshow_banners')
        .insert([
          {
            title: title,
            subtitle: subtitle,
            badge_text: badgeText || 'Featured',
            link_url: linkUrl || null,
            image_url: finalUrl,
            is_active: true
          }
        ]);

      if (dbError) throw new Error(dbError.message);

      alert("Success! Slideshow banner uploaded successfully.");
      setTitle('');
      setSubtitle('');
      setBadgeText('Featured');
      setLinkUrl('');
      setImageFile(null);
      fetchBanners();

    } catch (err: any) {
      console.error("Upload error:", err);
      alert(`Upload failed: ${err.message || err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleActiveStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('slideshow_banners')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (error) {
      alert("Failed to update status");
    } else {
      setBanners(banners.map(b => b.id === id ? { ...b, is_active: !currentStatus } : b));
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this slideshow banner?")) return;

    const { error } = await supabase
      .from('slideshow_banners')
      .delete()
      .eq('id', id);

    if (error) {
      alert(`Delete failed: ${error.message}`);
    } else {
      setBanners(banners.filter(b => b.id !== id));
    }
  };

  return (
    <AdminHeaderLayout
      title="Homepage Slideshow Manager"
      subtitle="Upload and customize promotional banner slides for the main homepage slideshow."
    >

        {/* Upload New Banner Form */}
        <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-xl shadow-lg space-y-6">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-purple-400" /> Upload New Slideshow Banner
          </h2>

          <form onSubmit={handleUploadBanner} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block">Banner Title *</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Next-Gen ROS 2 Navigation Robot"
                  className="w-full bg-black/50 border border-white/20 rounded-md px-4 py-3 text-white text-sm focus:outline-none focus:border-white transition-colors"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block">Badge Text (Optional)</label>
                <input 
                  type="text" 
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  placeholder="e.g. Featured, New Release, Trending"
                  className="w-full bg-black/50 border border-white/20 rounded-md px-4 py-3 text-white text-sm focus:outline-none focus:border-white transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block">Target Link URL (Optional)</label>
                <input 
                  type="text" 
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="e.g. /projects/ai-assistant-v1-0 or #projects"
                  className="w-full bg-black/50 border border-white/20 rounded-md px-4 py-3 text-white text-sm focus:outline-none focus:border-white transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block">Subtitle / Description (Optional)</label>
                <input 
                  type="text" 
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Complete source code, hardware diagrams & ROS 2 packages."
                  className="w-full bg-black/50 border border-white/20 rounded-md px-4 py-3 text-white text-sm focus:outline-none focus:border-white transition-colors"
                />
              </div>
            </div>

            {/* Image File Dropzone */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block">Banner Image File *</label>
              <div 
                className="border border-dashed border-white/20 rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer group"
                onClick={() => imageInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={imageInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setImageFile(e.target.files[0]);
                    }
                  }}
                />
                {imageFile ? (
                  <div className="text-white flex flex-col items-center">
                    <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
                    <p className="text-sm font-medium">{imageFile.name}</p>
                    <p className="text-xs text-gray-400 mt-1">Click to change image</p>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2 group-hover:text-purple-400 transition-colors" strokeWidth={1.5} />
                    <p className="text-sm text-gray-300 group-hover:text-white transition-colors font-medium">Click to select banner image (.png, .jpg, .webp)</p>
                    <p className="text-xs text-gray-500 mt-1">Recommended size: 1920x1080 (HD / High-Resolution landscape)</p>
                  </>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-white text-black hover:bg-gray-200 disabled:opacity-50 rounded-md font-semibold text-sm transition-colors flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Uploading Slide...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" /> Save & Publish Slide
                </>
              )}
            </button>
          </form>
        </div>

        {/* Existing Banners Management Section */}
        <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-xl shadow-lg space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" /> Active Homepage Slides
            </h2>
            <span className="text-xs text-gray-400">{banners.length} total slides</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-500 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading slides...
            </div>
          ) : banners.length === 0 ? (
            <div className="py-12 text-center text-gray-500 border border-dashed border-white/10 rounded-lg">
              No custom slideshow banners uploaded yet. Upload your first slide above!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {banners.map((banner) => (
                <div key={banner.id} className="bg-black/60 border border-white/10 rounded-lg overflow-hidden group flex flex-col justify-between">
                  <div className="relative h-44 w-full bg-black/40">
                    <Image 
                      src={banner.image_url} 
                      alt={banner.title} 
                      fill 
                      className={`object-cover ${banner.is_active ? 'opacity-85' : 'opacity-30'}`}
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-2.5 py-0.5 bg-black/80 backdrop-blur-md text-white border border-white/20 rounded-full text-[10px] uppercase font-semibold">
                        {banner.badge_text || 'Featured'}
                      </span>
                      {!banner.is_active && (
                        <span className="px-2.5 py-0.5 bg-red-950/80 text-red-400 border border-red-500/30 rounded-full text-[10px] uppercase font-semibold">
                          Disabled
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 flex flex-col grow justify-between space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white line-clamp-1">{banner.title}</h3>
                      {banner.subtitle && (
                        <p className="text-xs text-gray-400 line-clamp-2 mt-1">{banner.subtitle}</p>
                      )}
                      {banner.link_url && (
                        <p className="text-[11px] text-purple-400 mt-2 flex items-center gap-1">
                          <LinkIcon className="w-3 h-3" /> {banner.link_url}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                      <button
                        onClick={() => toggleActiveStatus(banner.id, banner.is_active)}
                        className={`text-xs px-3 py-1.5 rounded-md border flex items-center gap-1.5 transition-colors ${
                          banner.is_active 
                            ? 'bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20' 
                            : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {banner.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        {banner.is_active ? 'Active' : 'Disabled'}
                      </button>

                      <button
                        onClick={() => handleDeleteBanner(banner.id)}
                        className="text-xs px-3 py-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 border border-transparent hover:border-red-400/20 rounded-md transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
    </AdminHeaderLayout>
  );
}
