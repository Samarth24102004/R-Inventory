"use client";

import React, { useState, useEffect } from 'react';
import { getAnalyticsSummary, AnalyticsSummary } from '@/lib/analytics';
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  Users, 
  Search, 
  ShoppingBag, 
  DollarSign, 
  RefreshCw, 
  Plus, 
  CircuitBoard, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    setRefreshing(true);
    try {
      const summary = await getAnalyticsSummary();
      setAnalytics(summary);
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white pt-28 pb-20 px-[5%] font-sans">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-white" strokeWidth={1.5} />
              <h1 className="text-3xl font-semibold text-white tracking-tight">
                Platform Analytics
              </h1>
            </div>
            <p className="text-sm text-gray-400 mt-1">Real-time stats on website views, searches, project sales, and active users.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              disabled={refreshing}
              className="flex items-center px-4 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-md text-sm text-gray-300 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Data
            </button>

            <Link href="/admin/upload" className="flex items-center px-5 py-2.5 bg-white text-black hover:bg-gray-200 rounded-md text-sm font-medium transition-colors">
              <Plus className="w-4 h-4 mr-2" /> Upload Project
            </Link>
          </div>
        </div>

        {/* Top Admin Navigation Tabs */}
        <div className="flex space-x-6 border-b border-white/10 pb-px">
          <Link
            href="/admin/analytics"
            className="pb-4 px-2 text-sm font-medium transition-colors border-b-2 border-white text-white flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Analytics Dashboard
          </Link>
          <Link
            href="/admin/projects"
            className="pb-4 px-2 text-sm font-medium transition-colors border-b-2 border-transparent text-gray-500 hover:text-gray-300 flex items-center gap-2"
          >
            <CircuitBoard className="w-4 h-4" />
            Manage Content
          </Link>
          <Link
            href="/admin/upload"
            className="pb-4 px-2 text-sm font-medium transition-colors border-b-2 border-transparent text-gray-500 hover:text-gray-300 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Upload New
          </Link>
        </div>

        {loading ? (
          <div className="py-20 text-center text-gray-500 flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-white/40" />
            <p className="text-sm">Calculating real-time platform metrics...</p>
          </div>
        ) : (
          <>
            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Card 1: Total Revenue */}
              <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-xl shadow-lg relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Revenue</span>
                  <div className="p-2.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-2">₹{analytics?.totalRevenue.toLocaleString()}</div>
                <div className="flex items-center text-xs text-green-400 font-medium">
                  <TrendingUp className="w-3.5 h-3.5 mr-1" />
                  <span>{analytics?.totalPurchases} total project sales</span>
                </div>
              </div>

              {/* Card 2: Website Views */}
              <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-xl shadow-lg relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Website Views</span>
                  <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    <Eye className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-2">{analytics?.totalPageViews.toLocaleString()}</div>
                <div className="flex items-center text-xs text-gray-400">
                  <Users className="w-3.5 h-3.5 mr-1 text-blue-400" />
                  <span>{analytics?.activeVisitors} unique visitors</span>
                </div>
              </div>

              {/* Card 3: Search Queries */}
              <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-xl shadow-lg relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Searches Performed</span>
                  <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
                    <Search className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-2">{analytics?.totalSearches.toLocaleString()}</div>
                <div className="flex items-center text-xs text-purple-400 font-medium">
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  <span>{analytics?.topSearches.length} active search keywords</span>
                </div>
              </div>

              {/* Card 4: Total Buys */}
              <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-xl shadow-lg relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Project Buys</span>
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-2">{analytics?.totalPurchases}</div>
                <div className="flex items-center text-xs text-amber-400 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                  <span>100% verified access orders</span>
                </div>
              </div>

            </div>

            {/* 2 Columns: Top Searches & Top Selling Projects */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Left Box: Popular Search Queries */}
              <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-xl shadow-lg">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Search className="w-5 h-5 text-purple-400" /> Top Buyer Search Keywords
                  </h2>
                  <span className="text-xs text-gray-500">What buyers are looking for</span>
                </div>

                <div className="space-y-3">
                  {analytics?.topSearches.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 bg-white/5 border border-white/10 rounded-lg hover:border-white/20 transition-colors">
                      <div className="flex items-center space-x-3">
                        <span className="w-6 h-6 rounded-full bg-white/10 text-xs text-gray-300 font-medium flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-sm font-medium text-white capitalize">{item.query}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-xs text-gray-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                          {item.count} {item.count === 1 ? 'search' : 'searches'}
                        </span>
                      </div>
                    </div>
                  ))}
                  {(!analytics?.topSearches || analytics.topSearches.length === 0) && (
                    <p className="text-sm text-gray-500 italic py-4 text-center">No search terms logged yet.</p>
                  )}
                </div>
              </div>

              {/* Right Box: Top Selling Projects */}
              <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-xl shadow-lg">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" /> Best Performing Projects
                  </h2>
                  <span className="text-xs text-gray-500">Ranked by revenue</span>
                </div>

                <div className="space-y-3">
                  {analytics?.topProjects.map((project, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 bg-white/5 border border-white/10 rounded-lg hover:border-white/20 transition-colors">
                      <div className="flex items-center space-x-3">
                        <span className="w-6 h-6 rounded-full bg-green-500/20 text-xs text-green-400 font-semibold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-white">{project.title}</p>
                          <p className="text-xs text-gray-400">{project.sales} sales @ ₹{project.price}</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-white">₹{project.revenue}</span>
                    </div>
                  ))}
                  {(!analytics?.topProjects || analytics.topProjects.length === 0) && (
                    <p className="text-sm text-gray-500 italic py-4 text-center">No project sales recorded yet.</p>
                  )}
                </div>
              </div>

            </div>

            {/* Bottom Box: Recent Purchases Activity Table */}
            <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-xl shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-amber-400" /> Recent Purchases Activity
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">Live feed of buyers who unlocked lifetime project access.</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 text-xs uppercase tracking-wider">
                      <th className="py-3 px-4">Buyer Email</th>
                      <th className="py-3 px-4">Project Title</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Date & Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-300">
                    {analytics?.recentPurchases.map((purchase) => (
                      <tr key={purchase.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-xs text-white">{purchase.user_email}</td>
                        <td className="py-3.5 px-4 font-medium text-white">{purchase.projects?.title || 'ROS 2 Package'}</td>
                        <td className="py-3.5 px-4 text-white font-semibold">₹{purchase.amount || purchase.projects?.price || '0'}</td>
                        <td className="py-3.5 px-4 text-xs text-gray-400">
                          {new Date(purchase.created_at).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}
                        </td>
                      </tr>
                    ))}
                    {(!analytics?.recentPurchases || analytics.recentPurchases.length === 0) && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-gray-500 italic">
                          No purchases recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </>
        )}

      </div>
    </div>
  );
}
