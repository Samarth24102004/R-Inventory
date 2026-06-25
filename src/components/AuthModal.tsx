"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Lock } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAwaitingOtp, setIsAwaitingOtp] = useState(false);
  const [otp, setOtp] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let authError = null;

    if (isLogin) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
      } else {
        setLoading(false);
        if (onSuccess) onSuccess();
        onClose();
      }
    } else {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) {
        console.error("Sign Up Error Details:", signUpError);
        const errorMessage = typeof signUpError.message === 'string' && signUpError.message.trim() !== '' && signUpError.message !== '{}'
          ? signUpError.message
          : JSON.stringify(signUpError);
        setError(errorMessage);
        setLoading(false);
      } else if (data?.user?.identities && data.user.identities.length === 0) {
        // Supabase returns an empty identities array if the email is already in use
        setError("An account with this email already exists. Please log in.");
        setLoading(false);
      } else {
        setIsAwaitingOtp(true);
        setLoading(false);
      }
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'signup'
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setLoading(false);
      if (onSuccess) onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-100 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#0a0a0a] border border-white/20 rounded-xl p-8 relative shadow-lg">
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 p-2 rounded-full border border-transparent hover:border-white/20 text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center mb-8">
          <div className="p-4 border border-white/20 rounded-full text-white mb-4">
            <Lock className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-semibold text-white tracking-tight">
            {isAwaitingOtp ? 'Check Your Email' : (isLogin ? 'Welcome Back' : 'Create an Account')}
          </h2>
          <p className="text-sm text-gray-400 mt-2 text-center">
            {isAwaitingOtp 
              ? `We sent a verification code to ${email}` 
              : (isLogin ? 'Log in to access your projects' : 'Sign up to purchase projects')}
          </p>
        </div>

        {isAwaitingOtp ? (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-6">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 tracking-wider uppercase">Verification Code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full bg-transparent border border-white/20 rounded-md px-4 py-3 text-white outline-none focus:border-white transition-colors text-center tracking-[0.5em] font-mono text-xl"
                required
                maxLength={8}
                placeholder="------"
              />
            </div>
            
            {error && <p className="text-red-500 text-xs font-medium text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full py-3 bg-white text-black text-sm font-medium rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
            <button
              type="button"
              onClick={() => setIsAwaitingOtp(false)}
              className="text-sm text-gray-400 hover:text-white transition-colors underline mt-2 text-center"
            >
              Back to Sign Up
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 tracking-wider uppercase">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border border-white/20 rounded-md px-4 py-3 text-sm text-white outline-none focus:border-white transition-colors"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 tracking-wider uppercase">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border border-white/20 rounded-md px-4 py-3 text-sm text-white outline-none focus:border-white transition-colors"
                required
                minLength={6}
              />
            </div>

            {error && <p className="text-red-500 text-xs font-medium text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-3 bg-white text-black text-sm font-medium rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
            </button>
          </form>
        )}

        {!isAwaitingOtp && (
          <>
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#0a0a0a] px-2 text-gray-500 uppercase tracking-widest">Or continue with</span>
              </div>
            </div>

            <button
              onClick={async () => {
                setLoading(true);
                const { error } = await supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: {
                    redirectTo: window.location.origin,
                  },
                });
                if (error) {
                  setError(error.message);
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="w-full py-3 bg-transparent border border-white/20 text-white text-sm font-medium rounded-md hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>

            <div className="mt-8 text-center">
              <button 
                onClick={() => { setIsLogin(!isLogin); setError(null); }}
                className="text-sm text-gray-400 hover:text-white transition-colors underline underline-offset-4"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
