"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { X, Send, Lightbulb } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function NeededProjectModal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isOpen = searchParams.get('idea') === 'true';
  const [idea, setIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setIdea('');
      setSuccess(false);
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) return;

    setLoading(true);
    setError('');

    const { error: sbError } = await supabase
      .from('project_ideas')
      .insert([{ idea: idea.trim() }]);

    if (sbError) {
      console.error(sbError);
      setError('Failed to submit idea. Please try again.');
      setLoading(false);
    } else {
      setSuccess(true);
      setIdea('');
      setLoading(false);
      // Optional: Auto close after a few seconds
      setTimeout(() => {
        router.push(pathname);
      }, 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-[#0a0a0a] border border-white/20 rounded-xl p-8 relative shadow-lg">
        <button 
          onClick={() => router.push(pathname)} 
          className="absolute top-6 right-6 p-2 rounded-full border border-transparent hover:border-white/20 text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 border border-white/20 rounded-md text-white">
            <Lightbulb className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-semibold text-white tracking-tight">Needed Project</h2>
        </div>

        <p className="text-sm text-gray-400 mb-8">
          Have an idea for a project? Let us know what you need, and we'll work on building it for you!
        </p>

        {success ? (
          <div className="bg-transparent border border-white/20 text-white p-6 rounded-md text-center">
            <h3 className="text-lg font-medium mb-2">Idea Submitted Successfully!</h3>
            <p className="text-sm text-gray-400">Thank you! We've received your request and will review it shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <textarea
              autoFocus
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Describe the project you need..."
              className="w-full bg-transparent border border-white/20 rounded-md p-6 text-sm text-white outline-none focus:border-white transition-colors min-h-[160px] resize-none"
              required
            />
            {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
            <button
              type="submit"
              disabled={loading || !idea.trim()}
              className="flex items-center justify-center gap-2 w-full py-3 bg-white text-black text-sm font-medium rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : (
                <>
                  Submit Idea <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
