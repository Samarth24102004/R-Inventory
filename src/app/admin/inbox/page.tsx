"use client";

import React, { useState, useEffect, useRef } from 'react';
import AdminHeaderLayout from '@/components/AdminHeaderLayout';
import { supabase } from '@/lib/supabase';
import { 
  Mail, 
  Send, 
  Trash2, 
  RefreshCw, 
  Clock, 
  CheckCircle2, 
  User, 
  Bot, 
  MessageSquare, 
  Search, 
  Filter, 
  Check, 
  Copy,
  Inbox as InboxIcon,
  Sparkles
} from 'lucide-react';

interface ChatMessage {
  id: string;
  session_id: string;
  sender: 'user' | 'admin';
  message: string;
  user_email?: string;
  created_at: string;
  is_read?: boolean;
}

interface ConversationThread {
  session_id: string;
  user_email?: string;
  last_message: string;
  last_activity: string;
  has_unreplied: boolean;
  messages: ChatMessage[];
}

export default function AdminInboxPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unreplied' | 'replied'>('all');
  const [copiedSession, setCopiedSession] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchAllMessages = async () => {
    setLoading(true);
    try {
      // 1. Fetch from contact_messages
      const { data: cmData, error: cmError } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: true });

      let combined: ChatMessage[] = [];

      if (!cmError && cmData && cmData.length > 0) {
        combined = cmData;
      } else {
        // Fallback: Check project_ideas table if contact_messages is empty
        const { data: piData } = await supabase
          .from('project_ideas')
          .select('*')
          .order('created_at', { ascending: true });

        if (piData && piData.length > 0) {
          combined = piData.map((item) => ({
            id: item.id,
            session_id: `legacy_${item.id.substring(0, 8)}`,
            sender: 'user' as const,
            message: item.idea,
            created_at: item.created_at,
            is_read: item.is_done,
          }));
        }
      }

      setMessages(combined);

      // Auto-select first thread if none selected
      if (!selectedSessionId && combined.length > 0) {
        // Group and pick the latest
        const latestMsg = combined[combined.length - 1];
        setSelectedSessionId(latestMsg.session_id);
      }
    } catch (err) {
      console.error("Error loading inbox messages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllMessages();

    // Auto-poll every 5 seconds for new visitor messages
    const pollInterval = setInterval(() => {
      fetchAllMessages();
    }, 5000);

    return () => clearInterval(pollInterval);
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedSessionId, messages]);

  // Group messages into conversation threads
  const threadsMap = new Map<string, ConversationThread>();

  messages.forEach((msg) => {
    const sId = msg.session_id || 'unknown';
    if (!threadsMap.has(sId)) {
      threadsMap.set(sId, {
        session_id: sId,
        user_email: msg.user_email,
        last_message: msg.message,
        last_activity: msg.created_at,
        has_unreplied: msg.sender === 'user',
        messages: [msg],
      });
    } else {
      const t = threadsMap.get(sId)!;
      t.messages.push(msg);
      t.last_message = msg.message;
      t.last_activity = msg.created_at;
      if (msg.user_email) t.user_email = msg.user_email;
      // If the latest message is from user, mark as unreplied
      t.has_unreplied = msg.sender === 'user';
    }
  });

  const threads = Array.from(threadsMap.values()).sort((a, b) => 
    new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime()
  );

  const filteredThreads = threads.filter((t) => {
    const matchesSearch = 
      t.session_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.user_email && t.user_email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      t.last_message.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filter === 'unreplied') return t.has_unreplied;
    if (filter === 'replied') return !t.has_unreplied;
    return true;
  });

  const activeThread = threads.find(t => t.session_id === selectedSessionId) || (filteredThreads.length > 0 ? filteredThreads[0] : null);

  const handleSendReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!replyText.trim() || !activeThread || sendingReply) return;

    setSendingReply(true);
    const cleanReply = replyText.trim();
    setReplyText('');

    const optimistic: ChatMessage = {
      id: `admin_${Date.now()}`,
      session_id: activeThread.session_id,
      sender: 'admin',
      message: cleanReply,
      user_email: activeThread.user_email,
      created_at: new Date().toISOString(),
      is_read: true,
    };

    setMessages(prev => [...prev, optimistic]);

    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert([{
          session_id: activeThread.session_id,
          sender: 'admin',
          message: cleanReply,
          user_email: activeThread.user_email || null,
          is_read: true,
        }]);

      if (error) {
        console.error("Failed to send admin reply:", error);
        alert("Failed to send reply to Supabase: " + error.message);
      } else {
        fetchAllMessages();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSendingReply(false);
    }
  };

  const deleteThread = async (sessionIdToDelete: string) => {
    if (!window.confirm("Are you sure you want to delete this entire conversation thread?")) return;

    try {
      await supabase
        .from('contact_messages')
        .delete()
        .eq('session_id', sessionIdToDelete);

      setMessages(prev => prev.filter(m => m.session_id !== sessionIdToDelete));
      if (selectedSessionId === sessionIdToDelete) {
        setSelectedSessionId(null);
      }
    } catch (err) {
      console.error("Failed to delete thread:", err);
    }
  };

  const emptyInbox = async () => {
    if (!window.confirm("Are you sure you want to delete ALL conversations and messages? This cannot be undone.")) return;

    try {
      await supabase
        .from('contact_messages')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      await supabase
        .from('project_ideas')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      setMessages([]);
      setSelectedSessionId(null);
    } catch (err) {
      console.error("Failed to empty inbox:", err);
    }
  };

  const totalThreads = threads.length;
  const unrepliedCount = threads.filter(t => t.has_unreplied).length;
  const repliedCount = totalThreads - unrepliedCount;

  return (
    <AdminHeaderLayout
      title="Live Messages & Chat Inbox"
      subtitle="Reply directly to customer questions, custom robotics inquiries, and contact requests in real-time"
    >
      <div className="space-y-6">

        {/* Top Metric Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#0a0a0a] border border-white/10 p-5 rounded-2xl flex items-center justify-between shadow-lg">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-gray-400">Total Conversations</p>
              <h3 className="text-2xl font-bold text-white mt-1">{totalThreads}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
              <InboxIcon className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#0a0a0a] border border-white/10 p-5 rounded-2xl flex items-center justify-between shadow-lg">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-amber-400">Awaiting Reply</p>
              <h3 className="text-2xl font-bold text-amber-400 mt-1">{unrepliedCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#0a0a0a] border border-white/10 p-5 rounded-2xl flex items-center justify-between shadow-lg">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-[#84cc16]">Answered</p>
              <h3 className="text-2xl font-bold text-[#84cc16] mt-1">{repliedCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#84cc16]/10 border border-[#84cc16]/20 flex items-center justify-center text-[#84cc16]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Main 2-Column Chat Layout */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 min-h-[640px] max-h-[750px]">
          
          {/* Left Column: Threads Sidebar (4 Cols) */}
          <div className="lg:col-span-4 border-r border-white/10 flex flex-col bg-white/[0.01]">
            
            {/* Sidebar Search & Controls */}
            <div className="p-4 border-b border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#84cc16]" /> Conversations
                </h3>
                <div className="flex items-center gap-1">
                  <button
                    onClick={fetchAllMessages}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all text-xs"
                    title="Refresh threads"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                  {threads.length > 0 && (
                    <button
                      onClick={emptyInbox}
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition-all text-xs"
                      title="Empty all messages"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by message or email..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#84cc16]/50"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-1 pt-1">
                {(['all', 'unreplied', 'replied'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`flex-1 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all ${
                      filter === f
                        ? 'bg-white text-black font-bold'
                        : 'text-gray-400 hover:text-white bg-white/5'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Threads List */}
            <div className="flex-1 overflow-y-auto divide-y divide-white/5 custom-scrollbar">
              {loading && threads.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-500">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-gray-400" />
                  Loading threads...
                </div>
              ) : filteredThreads.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-500">
                  No conversations match your filter.
                </div>
              ) : (
                filteredThreads.map((thread) => {
                  const isSelected = activeThread?.session_id === thread.session_id;
                  const displayIdentifier = thread.user_email 
                    ? thread.user_email 
                    : `Visitor #${thread.session_id.substring(thread.session_id.length - 6)}`;
                  
                  const formattedTime = new Date(thread.last_activity).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <button
                      key={thread.session_id}
                      onClick={() => setSelectedSessionId(thread.session_id)}
                      className={`w-full p-3.5 text-left transition-all flex items-start gap-3 cursor-pointer ${
                        isSelected 
                          ? 'bg-white/10 border-l-4 border-l-[#84cc16]' 
                          : 'hover:bg-white/5 border-l-4 border-l-transparent'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-white shrink-0 mt-0.5">
                        <User className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-semibold text-white truncate block">
                            {displayIdentifier}
                          </span>
                          <span className="text-[10px] text-gray-500 font-mono shrink-0">
                            {formattedTime}
                          </span>
                        </div>

                        <p className="text-xs text-gray-400 truncate leading-relaxed">
                          {thread.last_message}
                        </p>

                        <div className="flex items-center gap-2 mt-2">
                          {thread.has_unreplied ? (
                            <span className="inline-flex items-center gap-1 text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-400/15 text-amber-400 font-semibold">
                              Needs Reply
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#84cc16]/15 text-[#84cc16] font-semibold">
                              Replied
                            </span>
                          )}
                          <span className="text-[10px] text-gray-500 font-mono">
                            {thread.messages.length} {thread.messages.length === 1 ? 'msg' : 'msgs'}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

          </div>

          {/* Right Column: Active Conversation (8 Cols) */}
          <div className="lg:col-span-8 flex flex-col bg-[#050505] min-h-[500px]">
            {activeThread ? (
              <>
                {/* Active Chat Header */}
                <div className="p-4 px-6 border-b border-white/10 bg-[#0a0a0a] flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-white">
                          {activeThread.user_email || `Visitor (${activeThread.session_id})`}
                        </h3>
                        {activeThread.user_email && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-500/15 text-cyan-400">
                            Email Verified
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 font-mono">
                        Session: {activeThread.session_id}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {activeThread.user_email && (
                      <a
                        href={`mailto:${activeThread.user_email}?subject=Regarding your message on RoS Inventory`}
                        className="p-2 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 text-xs font-medium flex items-center gap-1.5 transition-all"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Direct Email</span>
                      </a>
                    )}
                    <button
                      onClick={() => deleteThread(activeThread.session_id)}
                      className="p-2 rounded-xl text-red-400 hover:bg-red-500/15 border border-red-500/15 text-xs transition-all"
                      title="Delete this conversation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Chat Messages Log */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
                  {activeThread.messages.map((msg) => {
                    const isAdmin = msg.sender === 'admin';
                    const formattedDate = new Date(msg.created_at).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-end gap-2 max-w-[85%]">
                          {!isAdmin && (
                            <div className="w-7 h-7 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white shrink-0 mb-1">
                              <User className="w-3.5 h-3.5" />
                            </div>
                          )}

                          <div
                            className={`p-3.5 sm:px-5 sm:py-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words ${
                              isAdmin
                                ? 'bg-[#84cc16] text-black rounded-br-xs font-medium shadow-lg'
                                : 'bg-[#111] border border-white/10 text-white rounded-bl-xs shadow-md'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1.5 opacity-70">
                              <span className="text-[10px] font-mono uppercase tracking-wider font-bold">
                                {isAdmin ? 'You (Admin)' : 'Visitor'}
                              </span>
                            </div>
                            <p>{msg.message}</p>
                          </div>

                          {isAdmin && (
                            <div className="w-7 h-7 rounded-xl bg-[#84cc16]/20 border border-[#84cc16]/40 flex items-center justify-center text-[#84cc16] shrink-0 mb-1">
                              <Bot className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>

                        <span className="text-[10px] text-gray-500 font-mono mt-1 px-9">
                          {formattedDate}
                        </span>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>

                {/* Reply Bar */}
                <form
                  onSubmit={handleSendReply}
                  className="p-4 bg-[#0a0a0a] border-t border-white/10 flex items-center gap-3 shrink-0"
                >
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply to this visitor... (Enter to send)"
                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#84cc16]/60 transition-all"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim() || sendingReply}
                    className="px-5 py-3 rounded-2xl bg-[#84cc16] hover:bg-[#74b313] text-black font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0 shadow-lg"
                  >
                    <span>Send Reply</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-500">
                <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 mb-4">
                  <InboxIcon className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-white mb-1">Select a Conversation</h3>
                <p className="text-xs text-gray-400 max-w-sm">
                  Choose a visitor from the list on the left to read their message history and send direct replies.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </AdminHeaderLayout>
  );
}
