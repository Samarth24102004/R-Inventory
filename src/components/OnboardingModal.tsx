"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Sparkles, Check, RefreshCw } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  userId: string | null;
  onClose: () => void;
}

export default function OnboardingModal({ isOpen, userId, onClose }: OnboardingModalProps) {
  const [username, setUsername] = useState('');
  const [gender, setGender] = useState('Prefer not to say');
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');
  const [avatarOptions, setAvatarOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate random avatar options
  const generateAvatars = () => {
    const options = [];
    for (let i = 0; i < 4; i++) {
      const seed = Math.random().toString(36).substring(7);
      options.push(`https://api.dicebear.com/7.x/bottts/svg?seed=${seed}&backgroundColor=0a0a0a,ffffff&radius=10`);
    }
    setAvatarOptions(options);
    setSelectedAvatar(options[0]);
  };

  useEffect(() => {
    if (isOpen) {
      generateAvatars();
    }
  }, [isOpen]);

  if (!isOpen || !userId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: insertError } = await supabase.from('profiles').insert([
      {
        id: userId,
        username,
        gender,
        avatar_url: selectedAvatar,
      }
    ]);

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
    } else {
      setLoading(false);
      onClose(); // Successfully completed onboarding
    }
  };

  return (
    <div className="fixed inset-0 z-120 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#0a0a0a] border border-white/20 rounded-2xl p-8 relative shadow-[0_0_50px_rgba(255,255,255,0.05)]">
        
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 border border-white/20 rounded-full text-white mb-4 bg-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Sparkles className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Welcome to RoS Inventory!
          </h2>
          <p className="text-sm text-gray-400 mt-2 text-center">
            Let's set up your premium profile
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <label className="text-xs font-semibold text-gray-400 tracking-widest uppercase">Choose an Avatar</label>
              <button 
                type="button" 
                onClick={generateAvatars}
                className="text-xs text-gray-500 hover:text-white flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {avatarOptions.map((avatar, index) => (
                <div 
                  key={index}
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                    selectedAvatar === avatar 
                      ? 'border-white scale-105 shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                      : 'border-white/10 hover:border-white/40'
                  }`}
                >
                  <img src={avatar} alt={`Avatar option ${index + 1}`} className="w-full h-auto bg-black" />
                  {selectedAvatar === avatar && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="bg-white rounded-full p-1">
                        <Check className="w-3 h-3 text-black" strokeWidth={3} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 mt-2">
            <label className="text-xs font-semibold text-gray-400 tracking-widest uppercase">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black border border-white/20 rounded-lg pl-11 pr-4 py-3 text-sm text-white outline-none focus:border-white transition-colors"
                required
                placeholder="cyber_hacker_99"
                minLength={3}
                maxLength={20}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 tracking-widest uppercase">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-white transition-colors appearance-none cursor-pointer"
            >
              <option value="Prefer not to say">Prefer not to say</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          {error && <p className="text-red-500 text-xs font-medium text-center bg-red-500/10 py-2 rounded">{error}</p>}

          <button
            type="submit"
            disabled={loading || !username || !selectedAvatar}
            className="w-full py-4 bg-white text-black text-sm font-bold rounded-lg hover:bg-gray-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
          >
            {loading ? 'Creating Profile...' : 'Enter RoS Inventory'}
          </button>
        </form>
      </div>
    </div>
  );
}
