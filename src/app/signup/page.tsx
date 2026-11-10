"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, UserPlus, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';

function SignUpFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // OTP Verification State
  const [isAwaitingOtp, setIsAwaitingOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSuccessMessage, setOtpSuccessMessage] = useState<string | null>(null);

  // Restore preserved draft email from sessionStorage if user previously started filling it
  useEffect(() => {
    try {
      const savedEmail = sessionStorage.getItem('ros_signup_draft_email');
      if (savedEmail) {
        setEmail(savedEmail);
      }
    } catch {
      // Ignore sessionStorage issues
    }
  }, []);

  const handleEmailChange = (val: string) => {
    setEmail(val);
    try {
      sessionStorage.setItem('ros_signup_draft_email', val);
    } catch {
      // Ignore sessionStorage issues
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (!email.trim()) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify both fields.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}${redirectUrl}` : undefined,
        }
      });

      if (signUpError) {
        const errorMsg = typeof signUpError.message === 'string' && signUpError.message.trim()
          ? signUpError.message
          : "Sign up failed. Please try again.";
        setError(errorMsg);
        setLoading(false);
        return;
      }

      // Check if user already exists
      if (data?.user?.identities && data.user.identities.length === 0) {
        setError("An account with this email already exists. Please log in instead.");
        setLoading(false);
        return;
      }

      // If user is immediately confirmed (e.g. email confirmations disabled in Supabase)
      if (data?.session) {
        sessionStorage.removeItem('ros_signup_draft_email');
        router.push(redirectUrl);
        return;
      }

      // Otherwise, transition to OTP / email verification step
      setIsAwaitingOtp(true);
      setOtpSuccessMessage(`We have sent a 6-digit confirmation code to ${email.trim()}.`);
      setLoading(false);
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during registration.");
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: otpError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otp.trim(),
        type: 'signup'
      });

      if (otpError) {
        setError(otpError.message || "Invalid or expired verification code.");
        setLoading(false);
        return;
      }

      // Successful verification
      sessionStorage.removeItem('ros_signup_draft_email');
      router.push(redirectUrl);
    } catch (err: any) {
      setError(err?.message || "Failed to verify code.");
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
      {/* Top Navigation Row: Back Buttons */}
      <div className="flex items-center justify-between mb-6 gap-3">
        <button
          type="button"
          onClick={() => {
            if (isAwaitingOtp) {
              setIsAwaitingOtp(false);
            } else if (window.history.length > 1) {
              router.back();
            } else {
              router.push('/login');
            }
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/80 hover:bg-white text-[#0B2447] text-xs sm:text-sm font-semibold border border-[#687EFF]/20 hover:border-[#687EFF] shadow-xs transition-all duration-200 active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#687EFF]" />
          <span>{isAwaitingOtp ? "Back to registration" : "Back to previous page"}</span>
        </button>

        <Link
          href={`/login${redirectUrl !== '/' ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[#0B2447]/80 hover:text-[#0B2447] hover:bg-white/80 transition-colors"
        >
          <span>Already have an account?</span>
          <span className="font-bold text-[#687EFF]">Log In</span>
        </Link>
      </div>

      {/* Main Registration Card */}
      <div className="bg-white/90 backdrop-blur-xl border border-[#687EFF]/25 rounded-3xl p-7 sm:p-9 shadow-xl relative overflow-hidden">
        {/* Subtle top ambient accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-[#687EFF] via-[#B6FFFA] to-[#687EFF]"></div>

        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#687EFF]/15 border border-[#687EFF]/30 flex items-center justify-center text-[#687EFF] mb-4 shadow-xs">
            {isAwaitingOtp ? <ShieldCheck className="w-7 h-7" /> : <UserPlus className="w-7 h-7" />}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2447] tracking-tight">
            {isAwaitingOtp ? "Verify Email" : "Create Account"}
          </h1>
          <p className="text-xs sm:text-sm text-[#0B2447]/70 mt-1.5">
            {isAwaitingOtp
              ? otpSuccessMessage
              : "Join RoS Inventory to access and download open-source robotics projects."}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200/80 text-red-700 text-xs sm:text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        {isAwaitingOtp ? (
          /* OTP Verification Form */
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[11px] sm:text-xs font-bold tracking-wider text-[#0B2447]/80 uppercase block text-center">
                Enter 6-Digit Code
              </label>
              <input
                type="text"
                required
                maxLength={8}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="------"
                className="w-full bg-[#EAF8FF]/60 border border-[#687EFF]/25 focus:border-[#687EFF] focus:bg-white rounded-xl py-3 px-4 text-center tracking-[0.4em] font-mono text-xl sm:text-2xl text-[#0B2447] placeholder:text-[#0B2447]/30 outline-none transition-all"
                autoFocus
              />
              <p className="text-[11px] text-[#0B2447]/60 text-center">
                Sent to <span className="font-semibold text-[#0B2447]">{email}</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.trim().length < 6}
              className="w-full py-3.5 px-4 rounded-xl bg-[#0B2447] hover:bg-[#19376D] text-[#B6FFFA] font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying code...</span>
                </>
              ) : (
                <span>Verify & Complete Registration</span>
              )}
            </button>

            <div className="pt-4 text-center border-t border-[#687EFF]/15">
              <button
                type="button"
                onClick={() => setIsAwaitingOtp(false)}
                className="text-xs sm:text-sm text-[#687EFF] hover:text-[#0B2447] font-semibold underline underline-offset-4 cursor-pointer"
              >
                Entered the wrong email? Edit email address
              </button>
            </div>
          </form>
        ) : (
          /* Standard Sign Up Form */
          <form onSubmit={handleSignUp} className="space-y-4 sm:space-y-5">
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
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="developer@robotics.com"
                  className="w-full bg-[#EAF8FF]/60 border border-[#687EFF]/25 focus:border-[#687EFF] focus:bg-white rounded-xl py-3 pl-11 pr-4 text-xs sm:text-sm text-[#0B2447] placeholder:text-[#0B2447]/40 outline-none transition-all"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <label className="text-[11px] sm:text-xs font-bold tracking-wider text-[#0B2447]/80 uppercase">
                Password (min 6 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#0B2447]/40 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a secure password"
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

            {/* Confirm Password field */}
            <div className="space-y-1.5">
              <label className="text-[11px] sm:text-xs font-bold tracking-wider text-[#0B2447]/80 uppercase">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#0B2447]/40 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full bg-[#EAF8FF]/60 border border-[#687EFF]/25 focus:border-[#687EFF] focus:bg-white rounded-xl py-3 pl-11 pr-11 text-xs sm:text-sm text-[#0B2447] placeholder:text-[#0B2447]/40 outline-none transition-all"
                />
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
                  <span>Creating your account...</span>
                </>
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </form>
        )}

        {!isAwaitingOtp && (
          <>
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

            {/* Back to Login link */}
            <div className="mt-8 text-center pt-6 border-t border-[#687EFF]/15">
              <p className="text-xs sm:text-sm text-[#0B2447]/70">
                Already have an account?{" "}
                <Link
                  href={`/login${redirectUrl !== '/' ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
                  className="font-bold text-[#687EFF] hover:text-[#0B2447] underline underline-offset-4 transition-colors ml-1"
                >
                  Log In
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-[#B6FFFA] text-[#0B2447] pt-28 pb-16 px-4 sm:px-6 lg:px-8 flex flex-col justify-center relative overflow-x-clip">
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
          <SignUpFormContent />
        </Suspense>
      </div>
    </main>
  );
}

