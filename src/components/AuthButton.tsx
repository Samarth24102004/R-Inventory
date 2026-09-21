"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AuthModal from './AuthModal';
import Image from 'next/image';
import OnboardingModal from './OnboardingModal';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function AuthButton() {
  const [user, setUser] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const checkProfile = async (currentUser: any) => {
    if (!currentUser) return;
    const { data, error } = await supabase.from('profiles').select('id, avatar_url').eq('id', currentUser.id).single();
    if (error && error.code === 'PGRST116') {
      // Profile not found
      setIsOnboardingOpen(true);
    } else if (data) {
      setAvatarUrl(data.avatar_url);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) checkProfile(user);
    };
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        checkProfile(session.user);
      } else {
        setIsOnboardingOpen(false);
        setAvatarUrl(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const handleDeleteAccount = async () => {
    if (confirm("Are you sure you want to permanently delete your account? This action cannot be undone.")) {
      await supabase.rpc('delete_user');
      await supabase.auth.signOut();
      window.location.reload();
    }
  };

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <div className="relative flex items-center gap-2.5 sm:gap-3">
        {/* Projects Section Header Button */}
        <Link
          href="/projects"
          className={`h-11 px-4 rounded-full border text-xs sm:text-sm font-medium transition-all backdrop-blur-md flex items-center gap-2.5 group active:scale-95 ${
            pathname === '/projects'
              ? 'bg-[#687EFF] text-white border-[#687EFF] shadow-[0_0_20px_rgba(104,126,255,0.4)]'
              : 'bg-[#0B2447] hover:bg-[#19376D] text-[#B6FFFA] border border-[#0B2447]/20 shadow-[0_4px_20px_rgba(11,36,71,0.2)]'
          }`}
          title="ROS Projects"
        >
          <span className="inline-flex items-center justify-center shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/projects-icon.png"
              alt="Projects"
              className={`w-[20px] h-[15px] object-contain transition-transform group-hover:scale-110 ${
                pathname === '/projects' ? 'opacity-100' : 'opacity-85 group-hover:opacity-100'
              }`}
            />
          </span>
          <span className="font-semibold tracking-tight">Projects</span>
        </Link>

        <div className="relative">
          <button 
            onClick={() => user ? setIsMenuOpen(!isMenuOpen) : setModalOpen(true)}
            className="h-11 px-2.5 bg-[#0B2447] hover:bg-[#19376D] border border-[#0B2447]/20 text-[#B6FFFA] rounded-full text-sm font-medium transition-all backdrop-blur-md shadow-[0_4px_20px_rgba(11,36,71,0.2)] flex items-center gap-2 group relative cursor-pointer"
            title={user ? "Account" : "Sign In"}
          >
            {user && <div className="absolute inset-0 rounded-full bg-[#687EFF]/30 animate-ping opacity-20 pointer-events-none"></div>}
            {user && avatarUrl ? (
              <Image src={avatarUrl} alt="Avatar" width={30} height={30} className="w-[30px] h-[30px] rounded-full bg-[#0B2447] border border-[#687EFF]/30 group-hover:border-[#687EFF] transition-colors object-cover" />
            ) : (
              <div className="w-[28px] h-[28px] rounded-full bg-[#0B2447] border border-[#687EFF]/30 flex items-center justify-center group-hover:border-[#687EFF] transition-colors">
                <svg className="w-4 h-4 text-[#B6FFFA]/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
            <svg className={`w-3.5 h-3.5 mr-0.5 text-[#B6FFFA]/70 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {user && isMenuOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-[#0B2447] border border-[#687EFF]/30 rounded-xl shadow-2xl overflow-hidden py-1 z-50">
              <Link
                href="/projects"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2.5 w-full text-left px-4 py-3 text-sm text-[#B6FFFA]/80 hover:text-white hover:bg-[#687EFF]/20 transition-colors"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/projects-icon.png"
                  alt="Projects"
                  className="w-[18px] h-[13px] object-contain opacity-80"
                />
                <span>Projects</span>
              </Link>
              <div className="w-full h-px bg-[#687EFF]/20"></div>
              <Link
                href="/profile"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full text-left px-4 py-3 text-sm text-[#B6FFFA]/80 hover:text-white hover:bg-[#687EFF]/20 transition-colors"
              >
                My Profile
              </Link>
              <Link
                href="/profile"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full text-left px-4 py-3 text-sm text-[#B6FFFA]/80 hover:text-white hover:bg-[#687EFF]/20 transition-colors"
              >
                My Products
              </Link>
              <div className="w-full h-px bg-[#687EFF]/20"></div>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-3 text-sm text-[#B6FFFA]/80 hover:text-white hover:bg-[#687EFF]/20 transition-colors cursor-pointer"
              >
                Sign Out
              </button>
              <div className="w-full h-px bg-[#687EFF]/20"></div>
              <button
                onClick={handleDeleteAccount}
                className="w-full text-left px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors font-medium cursor-pointer"
              >
                Delete Account
              </button>
            </div>
          )}
        </div>
      </div>
      <AuthModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
      <OnboardingModal isOpen={isOnboardingOpen} userId={user?.id || null} onClose={() => setIsOnboardingOpen(false)} />
    </>
  );
}
