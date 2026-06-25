"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AuthModal from './AuthModal';
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
      <div className="fixed top-8 right-[5%] z-50">
        {user ? (
          <div className="relative">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 bg-[#0a0a0a]/80 border border-white/20 text-white rounded-full text-sm font-medium hover:bg-white/10 transition-colors backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex items-center gap-2 group relative"
            >
              <div className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-20"></div>
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-9 h-9 rounded-full bg-black/50 border border-white/10 group-hover:border-white transition-colors" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-black/50 border border-white/10 flex items-center justify-center group-hover:border-white transition-colors">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
              <svg className={`w-4 h-4 mr-2 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-3 w-48 bg-[#0a0a0a] border border-white/20 rounded-xl shadow-xl overflow-hidden py-1">
                <Link
                  href="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-left px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  My Profile
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-left px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  My Products
                </Link>
                <div className="w-full h-px bg-white/10"></div>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  Sign Out
                </button>
                <div className="w-full h-px bg-white/10"></div>
                <button
                  onClick={handleDeleteAccount}
                  className="w-full text-left px-4 py-3 text-sm text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors font-medium"
                >
                  Delete Account
                </button>
              </div>
            )}
          </div>
        ) : (
          <button 
            onClick={() => setModalOpen(true)}
            className="px-5 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-gray-200 transition-colors shadow-[0_4px_20px_rgba(255,255,255,0.2)]"
          >
            Log In
          </button>
        )}
      </div>
      <AuthModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
      <OnboardingModal isOpen={isOnboardingOpen} userId={user?.id || null} onClose={() => setIsOnboardingOpen(false)} />
    </>
  );
}
