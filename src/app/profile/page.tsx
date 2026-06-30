"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { User, Mail, Box, Shield, LogOut, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/Footer';

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

      // 3. Fetch Purchases
      // We assume there's a `purchases` table linking user_id to project_id
      // and we join it with the `projects` table (if we had a real projects table)
      // Since projects are hardcoded in page.tsx for now, we will fetch purchase records
      // and map them to hardcoded project details for the demo.
      const { data: purchaseData } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', currentUser.id);

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
      <main className="min-h-screen pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

        {/* Back Button */}
        <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Profile Info */}
          <div className="lg:col-span-4">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 sticky top-32 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <div className="flex flex-col items-center">

                {/* Animated Avatar */}
                <div className="relative group mb-6">
                  <div className="absolute -inset-1 bg-linear-to-r from-gray-500 to-white rounded-full blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Profile" className="relative w-32 h-32 rounded-full border-2 border-white/20 bg-black/50 object-cover" />
                  ) : (
                    <div className="relative w-32 h-32 rounded-full border-2 border-white/20 bg-black/50 flex items-center justify-center">
                      <User className="w-12 h-12 text-gray-500" />
                    </div>
                  )}
                </div>

                <h2 className="text-2xl font-bold text-white mb-1">
                  {profile?.username || "RoS User"}
                </h2>
                <div className="flex items-center text-sm text-gray-400 mb-8">
                  <Mail className="w-4 h-4 mr-2" />
                  {user?.email}
                </div>

                <div className="w-full space-y-4 border-t border-white/10 pt-6">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Gender</span>
                    <span className="text-white font-medium">{profile?.gender || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Member Since</span>
                    <span className="text-white font-medium">
                      {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Today'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Account Status</span>
                    <span className="flex items-center text-green-400 font-medium">
                      <Shield className="w-3 h-3 mr-1" /> Active
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Right Column: My Products */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-black tracking-tighter text-white">
                My Products
              </h1>
              <div className="bg-white/10 text-white px-4 py-1.5 rounded-full text-sm font-medium border border-white/10">
                {purchases.length} Item{purchases.length !== 1 ? 's' : ''}
              </div>
            </div>

            {purchases.length === 0 ? (
              <div className="bg-[#0a0a0a] border border-white/10 border-dashed rounded-3xl p-12 text-center">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Box className="w-10 h-10 text-gray-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No purchases yet</h3>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  You haven't added any premium projects to your inventory yet. Explore the marketplace to find your next tool.
                </p>
                <Link
                  href="/#projects"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                  Explore Projects
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {purchases.map((purchase: any, index: number) => (
                  <div key={index} className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 group hover:border-white/30 transition-colors relative overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    <div className="flex items-start justify-between mb-4 relative z-10">
                      <div className="p-3 bg-white/10 rounded-xl">
                        <Box className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-xs font-mono text-gray-500">
                        ID: {(purchase.project_id || purchase.model_id || '').split('-')[0]}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 relative z-10">
                      {/* Fallback names since project_id is usually a UUID, you would normally join this with a projects table */}
                      {purchase.model_id ? "3D Model Unlock" : "Premium Project Unlock"}
                    </h3>

                    <div className="flex items-center justify-between mt-6 relative z-10">
                      <div className="text-sm text-green-400 font-medium">✓ Purchased</div>
                      <button className="px-4 py-2 bg-white/10 hover:bg-white text-white hover:text-black rounded-lg text-sm font-medium transition-colors">
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
