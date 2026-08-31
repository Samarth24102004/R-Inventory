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
import AdminHeaderLayout from '@/components/AdminHeaderLayout';

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [itemFilter, setItemFilter] = useState<'ALL' | 'PROJECT' | 'MODEL'>('ALL');

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

  const filteredItems = analytics?.itemSalesList.filter(item => {
    if (itemFilter === 'PROJECT') return item.type === 'Project';
    if (itemFilter === 'MODEL') return item.type === '3D Model';
    return true;
  }) || [];

  return (
    <AdminHeaderLayout 
      title="Platform Sales & Analytics" 
      subtitle="Real-time record of project sales, 3D model downloads, revenue per item, and buyer logs."
    >
      <div className="flex justify-end mb-4">
        <button
          onClick={loadData}
          disabled={refreshing}
          className="flex items-center px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-md text-xs font-semibold text-gray-300 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

        {loading ? (
          <div className="py-20 text-center text-gray-500 flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-white/40" />
            <p className="text-sm">Calculating real-time sales and revenue metrics...</p>
          </div>
        ) : (
          <div className="space-y-10">
            
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
                  <span>{analytics?.totalPurchases} total purchases</span>
                </div>
              </div>

              {/* Card 2: Projects Sold */}
              <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-xl shadow-lg relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Projects Sold</span>
                  <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
                    <CircuitBoard className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-2">{analytics?.totalProjectsSold.toLocaleString()}</div>
                <div className="flex items-center text-xs text-purple-400 font-medium">
                  <span>ROS 2 Project packages</span>
                </div>
              </div>

              {/* Card 3: 3D Models Sold */}
              <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-xl shadow-lg relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">3D Models Sold</span>
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-2">{analytics?.totalModelsSold.toLocaleString()}</div>
                <div className="flex items-center text-xs text-amber-400 font-medium">
                  <span>3D printable STL files</span>
                </div>
              </div>

              {/* Card 4: Website Views */}
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

            </div>

            {/* Main Item-by-Item Sales Record Section (Requested by User) */}
            <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-xl shadow-lg space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" /> Sales Breakdown by Item Name
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Complete count of copies sold for every ROS 2 project and 3D STL model.
                  </p>
                </div>

                {/* Filter Sub-Tabs */}
                <div className="flex bg-white/5 p-1 rounded-md border border-white/10 self-start md:self-auto">
                  <button
                    onClick={() => setItemFilter('ALL')}
                    className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                      itemFilter === 'ALL' ? 'bg-white text-black font-semibold' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    All Items ({analytics?.itemSalesList.length || 0})
                  </button>
                  <button
                    onClick={() => setItemFilter('PROJECT')}
                    className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                      itemFilter === 'PROJECT' ? 'bg-white text-black font-semibold' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Projects Only
                  </button>
                  <button
                    onClick={() => setItemFilter('MODEL')}
                    className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                      itemFilter === 'MODEL' ? 'bg-white text-black font-semibold' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    3D Models Only
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 text-xs uppercase tracking-wider">
                      <th className="py-3 px-4">Item Name</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Price / Copy</th>
                      <th className="py-3 px-4">Copies Sold</th>
                      <th className="py-3 px-4 text-right">Total Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-300">
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-white">
                          {item.title}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border ${
                            item.type === 'Project'
                              ? 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                              : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                          }`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-gray-300">
                          ₹{item.price}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded text-xs font-semibold ${
                            item.salesCount > 0 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                              : 'bg-white/5 text-gray-500'
                          }`}>
                            {item.salesCount} {item.salesCount === 1 ? 'copy sold' : 'copies sold'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-white font-mono">
                          ₹{item.totalRevenue.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {filteredItems.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-500 italic">
                          No items found matching the selected filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2 Columns: Top Searches & Top Selling Items */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Left Box: Popular Search Queries */}
              <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-xl shadow-lg">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Search className="w-5 h-5 text-purple-400" /> Top Buyer Search Keywords
                  </h2>
                  <span className="text-xs text-gray-500">What buyers search for</span>
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

              {/* Right Box: Best Selling Items */}
              <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-xl shadow-lg">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" /> Top Revenue Earners
                  </h2>
                  <span className="text-xs text-gray-500">Ranked by total revenue</span>
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
                    <p className="text-sm text-gray-500 italic py-4 text-center">No sales recorded yet.</p>
                  )}
                </div>
              </div>

            </div>

            {/* Bottom Box: Recent Purchases Activity Table */}
            <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-xl shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-amber-400" /> Live Transaction Log
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">Real-time payment history and buyer audit log.</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 text-xs uppercase tracking-wider">
                      <th className="py-3 px-4">Buyer Email</th>
                      <th className="py-3 px-4">Purchased Item</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Date & Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-300">
                    {analytics?.recentPurchases.map((purchase) => {
                      const itemTitle = purchase.projects?.title || purchase.stl_models?.title || 'RoS Item';
                      const itemType = purchase.stl_models ? '3D Model' : 'Project';
                      const price = purchase.amount || purchase.projects?.price || purchase.stl_models?.price || '0';

                      return (
                        <tr key={purchase.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3.5 px-4 font-mono text-xs text-white">{purchase.user_email || 'Buyer'}</td>
                          <td className="py-3.5 px-4 font-medium text-white">{itemTitle}</td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                              itemType === 'Project' ? 'bg-purple-500/20 text-purple-300' : 'bg-amber-500/20 text-amber-300'
                            }`}>
                              {itemType}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-white font-semibold font-mono">₹{price}</td>
                          <td className="py-3.5 px-4 text-xs text-gray-400">
                            {new Date(purchase.created_at).toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short'
                            })}
                          </td>
                        </tr>
                      );
                    })}
                    {(!analytics?.recentPurchases || analytics.recentPurchases.length === 0) && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-500 italic">
                          No transaction records logged yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}
    </AdminHeaderLayout>
  );
}
