"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { User, Mail, Box, Shield, LogOut, ArrowLeft, ExternalLink, Download } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/Footer';
import { demoProjects } from '@/lib/data';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // 1. Get current auth user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        router.push('/');
        return;
      }
      setUser(currentUser);

      // 2. Fetch Profile Data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      setProfile(profileData);

      // 3. Fetch Purchases with related Project & STL Model data
      const { data: purchaseData } = await supabase
        .from('purchases')
        .select('*, projects(*), stl_models(*)')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (purchaseData) {
        setPurchases(purchaseData);
      }

      setLoading(false);
    };

    fetchDashboardData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex items-center justify-center">
        <div className="w-12 h-12 border-t-2 border-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-[#B6FFFA] text-[#0B2447] pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

        {/* Back Button */}
        <Link href="/" className="inline-flex items-center text-[#0B2447]/70 hover:text-[#0B2447] font-semibold transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Profile Info */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-[#687EFF]/20 rounded-3xl p-8 sticky top-32 shadow-md">
              <div className="flex flex-col items-center">

                {/* Animated Avatar */}
                <div className="relative group mb-6">
                  <div className="absolute -inset-1 bg-linear-to-r from-[#687EFF] to-[#B6FFFA] rounded-full blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                  {profile?.avatar_url ? (
                    <Image src={profile.avatar_url} alt="Profile" width={128} height={128} className="relative w-32 h-32 rounded-full border-2 border-[#687EFF]/40 bg-[#B6FFFA]/50 object-cover" />
                  ) : (
                    <div className="relative w-32 h-32 rounded-full border-2 border-[#687EFF]/40 bg-[#B6FFFA]/50 flex items-center justify-center">
                      <User className="w-12 h-12 text-[#0B2447]/60" />
                    </div>
                  )}
                </div>

                <h2 className="text-2xl font-bold text-[#0B2447] mb-1">
                  {profile?.username || "RoS User"}
                </h2>
                <div className="flex items-center text-sm text-[#0B2447]/70 mb-8 font-medium">
                  <Mail className="w-4 h-4 mr-2 text-[#687EFF]" />
                  {user?.email}
                </div>

                <div className="w-full space-y-4 border-t border-[#687EFF]/15 pt-6">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#0B2447]/60">Gender</span>
                    <span className="text-[#0B2447] font-semibold">{profile?.gender || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#0B2447]/60">Member Since</span>
                    <span className="text-[#0B2447] font-semibold">
                      {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Today'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#0B2447]/60">Account Status</span>
                    <span className="flex items-center text-emerald-600 font-semibold">
                      <Shield className="w-3.5 h-3.5 mr-1" /> Active
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Right Column: My Products */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-extrabold tracking-tight text-[#0B2447]">
                My Products
              </h1>
              <div className="bg-[#0B2447] text-[#B6FFFA] px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm">
                {purchases.length} Item{purchases.length !== 1 ? 's' : ''}
              </div>
            </div>

            {purchases.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-[#687EFF]/30 rounded-3xl p-12 text-center shadow-sm">
                <div className="w-20 h-20 bg-[#687EFF]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Box className="w-10 h-10 text-[#687EFF]" />
                </div>
                <h3 className="text-xl font-bold text-[#0B2447] mb-2">No purchases yet</h3>
                <p className="text-[#0B2447]/70 mb-8 max-w-md mx-auto text-sm">
                  You haven't added any premium projects to your inventory yet. Explore the marketplace to find your next tool.
                </p>
                <Link
                  href="/#projects"
                  className="inline-flex items-center justify-center px-8 py-3.5 bg-[#0B2447] hover:bg-[#19376D] text-[#B6FFFA] font-bold rounded-full transition-all shadow-md active:scale-95"
                >
                  Explore Projects
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {purchases.map((purchase: any, index: number) => {
                  const proj = purchase.projects || demoProjects.find(p => p.id === purchase.project_id);
                  const stl = purchase.stl_models;

                  const itemTitle = proj?.title || stl?.title || (purchase.project_id ? 'Premium Project' : '3D Model');
                  const itemDesc = proj?.short_description || stl?.short_description || 'Lifetime access unlocked.';
                  const purchaseDate = purchase.created_at ? new Date(purchase.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
                  const pricePaid = purchase.amount || proj?.price || stl?.price || 0;
                  const projectSlug = proj?.slug;
                  const githubLink = proj?.github_link;
                  const stlModelId = purchase.model_id;

                  return (
                    <div key={index} className="bg-white border border-[#687EFF]/20 rounded-2xl p-6 group hover:border-[#687EFF] transition-all shadow-md relative overflow-hidden flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-start justify-between mb-4 relative z-10">
                          <div className="p-3 bg-[#687EFF]/10 rounded-xl">
                            <Box className="w-6 h-6 text-[#687EFF]" />
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-semibold text-emerald-600 block">✓ Purchased</span>
                            {purchaseDate && <span className="text-[10px] text-[#0B2447]/50 block mt-0.5">{purchaseDate}</span>}
                          </div>
                        </div>

                        <h3 className="text-xl font-bold text-[#0B2447] mb-2 relative z-10">
                          {itemTitle}
                        </h3>
                        <p className="text-xs text-[#0B2447]/70 line-clamp-2 relative z-10">
                          {itemDesc}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#687EFF]/15 relative z-10">
                        <span className="text-base font-bold text-[#0B2447]">₹{pricePaid}</span>
                        <div className="flex items-center gap-2">
                          {projectSlug && (
                            <Link 
                              href={`/projects/${projectSlug}`}
                              className="px-3 py-2 bg-[#687EFF]/10 hover:bg-[#687EFF]/20 text-[#687EFF] rounded-lg text-xs font-semibold transition-colors"
                            >
                              View Project
                            </Link>
                          )}
                          {githubLink ? (
                            <a 
                              href={githubLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-[#0B2447] hover:bg-[#19376D] text-[#B6FFFA] rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download ZIP</span>
                            </a>
                          ) : stlModelId ? (
                            <a 
                              href={`/api/download-stl?modelId=${stlModelId}`}
                              download
                              className="px-4 py-2 bg-[#0B2447] hover:bg-[#19376D] text-[#B6FFFA] rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download STL</span>
                            </a>
                          ) : (
                            <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold">
                              Unlocked
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
