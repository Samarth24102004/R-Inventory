"use client";

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Lock, Mail, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(signInError.message || "Invalid email or password.");
        setLoading(false);
        return;
      }

      router.push(redirectUrl);
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during login.");
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}${redirectUrl}` : undefined,
        },
      });
      if (error) {
        setError(error.message);
        setLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || "Google sign-in failed.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Top Navigation Back Button */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => {
            if (window.history.length > 1) {
              router.back();
            } else {
              router.push('/');
            }
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/80 hover:bg-white text-[#0B2447] text-xs sm:text-sm font-semibold border border-[#687EFF]/20 hover:border-[#687EFF] shadow-xs transition-all duration-200 active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#687EFF]" />
          <span>Back to previous page</span>
        </button>
      </div>

      {/* Main Login Card */}
      <div className="bg-white/90 backdrop-blur-xl border border-[#687EFF]/25 rounded-3xl p-7 sm:p-9 shadow-xl relative overflow-hidden">
        {/* Subtle top ambient accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-[#687EFF] via-[#B6FFFA] to-[#687EFF]"></div>

        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#687EFF]/15 border border-[#687EFF]/30 flex items-center justify-center text-[#687EFF] mb-4 shadow-xs">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2447] tracking-tight">
            Welcome Back
          </h1>
          <p className="text-xs sm:text-sm text-[#0B2447]/70 mt-1.5">
            Log in to access your ROS 2 projects, 3D CAD models, and manuals.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200/80 text-red-700 text-xs sm:text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
          {/* Email field */}
          <div className="space-y-1.5">
            <label className="text-[11px] sm:text-xs font-bold tracking-wider text-[#0B2447]/80 uppercase">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#0B2447]/40 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@robotics.com"
                className="w-full bg-[#EAF8FF]/60 border border-[#687EFF]/25 focus:border-[#687EFF] focus:bg-white rounded-xl py-3 pl-11 pr-4 text-xs sm:text-sm text-[#0B2447] placeholder:text-[#0B2447]/40 outline-none transition-all"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] sm:text-xs font-bold tracking-wider text-[#0B2447]/80 uppercase">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#0B2447]/40 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-[#EAF8FF]/60 border border-[#687EFF]/25 focus:border-[#687EFF] focus:bg-white rounded-xl py-3 pl-11 pr-11 text-xs sm:text-sm text-[#0B2447] placeholder:text-[#0B2447]/40 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#0B2447]/40 hover:text-[#0B2447] p-1 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-[#0B2447] hover:bg-[#19376D] text-[#B6FFFA] font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Log In</span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#687EFF]/20"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-wider">
            <span className="bg-white px-3 text-[#0B2447]/50 font-semibold">Or continue with</span>
          </div>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-white hover:bg-[#EAF8FF] border border-[#687EFF]/25 hover:border-[#687EFF] text-[#0B2447] text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-3 shadow-xs active:scale-[0.99] cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Link to Registration */}
        <div className="mt-8 text-center pt-6 border-t border-[#687EFF]/15">
          <p className="text-xs sm:text-sm text-[#0B2447]/70">
            Don&apos;t have an account?{" "}
            <Link
              href={`/signup${redirectUrl !== '/' ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
              className="font-bold text-[#687EFF] hover:text-[#0B2447] underline underline-offset-4 transition-colors ml-1"
            >
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#B6FFFA] text-[#0B2447] pt-28 pb-16 px-4 sm:px-6 lg:px-8 flex flex-col justify-center relative overflow-hidden">
      {/* Background Drone Graphic Overlay */}
      <div
        className="fixed inset-0 z-0 opacity-15 pointer-events-none mix-blend-multiply"
        style={{
          backgroundImage: 'url("/drone-bg.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundAttachment: 'fixed',
        }}
      />
      <div className="fixed inset-0 bg-linear-to-b from-[#B6FFFA]/90 via-[#B6FFFA]/80 to-[#B6FFFA] z-0 pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto flex items-center justify-center">
        <Suspense fallback={
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 text-[#687EFF] animate-spin" />
          </div>
        }>
          <LoginFormContent />
        </Suspense>
      </div>
    </main>
  );
}

