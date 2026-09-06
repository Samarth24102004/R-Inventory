"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { X, Send, Mail, Bot, User, Check, RefreshCw, MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ChatMessage {
  id: string;
  session_id: string;
  sender: 'user' | 'admin';
  message: string;
  user_email?: string;
  created_at: string;
}

export default function NeededProjectModal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isOpen = searchParams.get('contact') === 'true' || searchParams.get('idea') === 'true';

  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [emailSaved, setEmailSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize or restore session ID
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let storedSession = localStorage.getItem('ros_chat_session_id');
      if (!storedSession) {
        storedSession = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem('ros_chat_session_id', storedSession);
      }
      setSessionId(storedSession);

      const storedEmail = localStorage.getItem('ros_chat_user_email');
      if (storedEmail) {
        setUserEmail(storedEmail);
        setEmailSaved(true);
      }
    }
  }, []);

  // Fetch messages for this session
  const fetchMessages = async (currentSession: string) => {
    if (!currentSession) return;
    try {
      // 1. Try to fetch from contact_messages
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .eq('session_id', currentSession)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data);
      } else if (error) {
        // Fallback: If table doesn't exist yet, query project_ideas
        const { data: fallbackData } = await supabase
          .from('project_ideas')
          .select('*')
          .order('created_at', { ascending: true });

        if (fallbackData) {
          const mapped = fallbackData.map((d) => ({
            id: d.id,
            session_id: currentSession,
            sender: 'user' as const,
            message: d.idea,
            created_at: d.created_at,
          }));
          setMessages(mapped);
        }
      }
    } catch (err) {
      console.error("Error fetching chat messages:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and auto-polling when modal is open
  useEffect(() => {
    if (isOpen && sessionId) {
      setLoading(true);
      fetchMessages(sessionId);

      // Poll every 3 seconds for new admin replies
      const interval = setInterval(() => {
        fetchMessages(sessionId);
      }, 3500);

      return () => clearInterval(interval);
    }
  }, [isOpen, sessionId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSaveEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (userEmail.trim()) {
      localStorage.setItem('ros_chat_user_email', userEmail.trim());
      setEmailSaved(true);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanMsg = inputText.trim();
    if (!cleanMsg || !sessionId || sending) return;

    setSending(true);
    setInputText('');

    const optimisticMsg: ChatMessage = {
      id: `temp_${Date.now()}`,
      session_id: sessionId,
      sender: 'user',
      message: cleanMsg,
      user_email: userEmail || undefined,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, optimisticMsg]);

    try {
      // 1. Try inserting to contact_messages
      const { error: insertError } = await supabase
        .from('contact_messages')
        .insert([{
          session_id: sessionId,
          sender: 'user',
          message: cleanMsg,
          user_email: userEmail.trim() || null,
        }]);

      if (insertError) {
        // 2. Fallback to project_ideas if contact_messages not created yet
        await supabase
          .from('project_ideas')
          .insert([{ idea: userEmail ? `[${userEmail}] ${cleanMsg}` : cleanMsg }]);
      }

      // Re-fetch to sync IDs
      fetchMessages(sessionId);
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 bg-[#222831]/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-xl h-[600px] max-h-[90vh] bg-[#222831] border border-[#393E46] rounded-3xl flex flex-col overflow-hidden shadow-2xl relative">
        
        {/* Chat Header */}
        <div className="p-4 sm:px-6 py-4 bg-[#393E46]/30 border-b border-[#393E46] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-[#FD7014]/10 border border-[#FD7014]/30 flex items-center justify-center text-[#FD7014]">
                <MessageSquare className="w-5 h-5" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#FD7014] border-2 border-[#222831] rounded-full"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-[#EEEEEE] tracking-tight">Direct Support & Contact</h3>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-[#FD7014]/10 text-[#FD7014] font-semibold">
                  Online
                </span>
              </div>
              <p className="text-xs text-[#EEEEEE]/70">Ask questions, request custom robotics projects, or get help</p>
            </div>
          </div>

          <button
            onClick={() => router.push(pathname)}
            className="p-2 rounded-xl text-[#EEEEEE]/70 hover:text-[#EEEEEE] hover:bg-[#393E46] transition-all cursor-pointer"
            title="Close chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Optional Email Notification Bar */}
        <div className="bg-[#393E46]/40 px-4 py-2 border-b border-[#393E46] flex items-center justify-between text-xs text-[#EEEEEE]/70 shrink-0">
          {emailSaved ? (
            <div className="flex items-center justify-between w-full">
              <span className="flex items-center gap-1.5 text-[#EEEEEE]/80">
                <Check className="w-3.5 h-3.5 text-[#FD7014]" /> Email linked: <span className="text-[#EEEEEE] font-mono">{userEmail}</span>
              </span>
              <button 
                onClick={() => setEmailSaved(false)}
                className="text-[11px] text-[#EEEEEE]/70 hover:text-[#EEEEEE] underline cursor-pointer"
              >
                Change
              </button>
            </div>
          ) : (
            <form onSubmit={handleSaveEmail} className="flex items-center gap-2 w-full">
              <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="Leave email to get reply notifications..."
                className="bg-transparent border-0 outline-none text-xs text-white placeholder:text-gray-500 flex-1"
              />
              <button
                type="submit"
                disabled={!userEmail.trim()}
                className="text-[11px] px-2 py-0.5 rounded bg-white/10 text-white hover:bg-white/20 transition-all disabled:opacity-30 cursor-pointer"
              >
                Save
              </button>
            </form>
          )}
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {loading && messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
              <p className="text-xs">Connecting to support...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 mb-3">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-white mb-1">Start a Conversation</h4>
              <p className="text-xs text-gray-400 max-w-xs mb-4">
                Have an idea, need custom ROS packages, or want assistance? Send a message and our team will reply directly here!
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => setInputText("Hi! I have a question about ROS 2 packages.")}
                  className="text-[11px] bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 px-3 py-1 rounded-full transition-all"
                >
                  ROS 2 Questions
                </button>
                <button
                  onClick={() => setInputText("Can you build a custom robot project for me?")}
                  className="text-[11px] bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 px-3 py-1 rounded-full transition-all"
                >
                  Custom Project Request
                </button>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isUser = msg.sender === 'user';
              const formattedTime = new Date(msg.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[75%]">
                    {!isUser && (
                      <div className="w-7 h-7 rounded-xl bg-[#FD7014]/15 border border-[#FD7014]/30 flex items-center justify-center text-[#FD7014] shrink-0 mb-1">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div
                      className={`p-3 sm:px-4 sm:py-3 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words ${
                        isUser
                          ? 'bg-[#393E46] text-[#EEEEEE] rounded-br-xs border border-[#393E46]'
                          : 'bg-[#222831] border border-[#FD7014]/40 text-[#EEEEEE] rounded-bl-xs shadow-lg'
                      }`}
                    >
                      {!isUser && (
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#FD7014]">
                            Admin / Support
                          </span>
                        </div>
                      )}
                      <p>{msg.message}</p>
                    </div>

                    {isUser && (
                      <div className="w-7 h-7 rounded-xl bg-[#393E46] border border-[#393E46] flex items-center justify-center text-[#EEEEEE] shrink-0 mb-1">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] text-[#EEEEEE]/50 font-mono mt-1 px-9">
                    {formattedTime}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 sm:p-4 bg-[#393E46]/20 border-t border-[#393E46] flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Enter to send)"
            className="flex-1 bg-[#222831] border border-[#393E46] rounded-2xl px-4 py-3 text-xs sm:text-sm text-[#EEEEEE] placeholder:text-[#EEEEEE]/40 focus:outline-none focus:border-[#FD7014] transition-all"
            autoFocus
          />
          <button
            type="submit"
            disabled={!inputText.trim() || sending}
            className="w-11 h-11 rounded-2xl bg-[#FD7014] hover:bg-[#FD7014]/80 text-black flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0 shadow-lg"
            title="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
