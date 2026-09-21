"use client";

import React, { useState, useEffect } from 'react';
import { Box, Search, Download, ShoppingCart, Star, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import AuthModal from '@/components/AuthModal';
import Footer from '@/components/Footer';

export default function ThreeDModelsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [purchases, setPurchases] = useState<string[]>([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [purchasingModelId, setPurchasingModelId] = useState<string | null>(null);
  const [downloadingModelId, setDownloadingModelId] = useState<string | null>(null);

  useEffect(() => {
    // Load Razorpay Script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // Fetch models
    const { data: modelsData } = await supabase
      .from('stl_models')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (modelsData) {
      setModels(modelsData);
    }

    // Fetch user and purchases
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    setUser(currentUser);

    if (currentUser) {
      const { data: purchasesData } = await supabase
        .from('purchases')
        .select('model_id')
        .eq('user_id', currentUser.id)
        .not('model_id', 'is', null);

      if (purchasesData) {
        setPurchases(purchasesData.map(p => p.model_id));
      }
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter models based on search
  const filteredModels = models.filter(model =>
    (model.title?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
    (model.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
  );

  const handlePurchase = async (model: any) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    setPurchasingModelId(model.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("No auth token");

      // 1. Create Order
      const res = await fetch('/api/razorpay/create-order-stl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ modelId: model.id })
      });

      const orderData = await res.json();
      if (orderData.error) throw new Error(orderData.error);

      // 2. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "RoS Inventory",
        description: `Lifetime access to ${model.title}`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          // 3. Verify Payment
          const verifyRes = await fetch('/api/razorpay/verify-stl', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              modelId: model.id
            })
          });

          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            setPurchases(prev => [...prev, model.id]);
            alert("Payment Successful! You can now download the STL file.");
          } else {
            alert(`Payment Verification Failed: ${verifyData.error || 'Unknown error'}`);
          }
        },
        prefill: { email: user.email },
        theme: { color: "#0a0a0a" }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (err: any) {
      console.error(err);
      alert(err.message || "Something went wrong");
    } finally {
      setPurchasingModelId(null);
    }
  };

  const handleDownload = async (modelId: string, modelTitle: string) => {
    setDownloadingModelId(modelId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("No auth token");

      const res = await fetch('/api/download-stl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ modelId })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = data.signedUrl;
      link.download = `${modelTitle.replace(/\s+/g, '_')}.stl`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to download file");
    } finally {
      setDownloadingModelId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#B6FFFA] text-[#0B2447] pt-24 relative flex flex-col justify-between">
      {/* Background Image */}
      <div 
        className="fixed inset-0 z-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: 'url("/models-bg.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      />
      <div className="fixed inset-0 bg-linear-to-b from-transparent via-[#B6FFFA]/50 to-[#B6FFFA] z-0 pointer-events-none"></div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} onSuccess={fetchData} />
      <div className="max-w-6xl mx-auto flex flex-col gap-12 relative z-10 px-6 pb-28 w-full grow">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mt-8">
          <div className="flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B2447] border border-[#687EFF]/30 w-fit shadow-sm">
              <Box className="w-4 h-4 text-[#687EFF]" />
              <span className="text-xs font-semibold tracking-wider text-[#B6FFFA] uppercase">Premium Models</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#0B2447]">3D Print <span className="text-[#687EFF]">Inventory</span></h1>
            <p className="text-[#0B2447]/70 max-w-lg text-lg">
              Download high-quality, print-ready STL files for your next 3D printing project.
            </p>
          </div>

          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0B2447]/40 group-focus-within:text-[#687EFF] transition-colors" />
            <input
              type="text"
              placeholder="Search models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#687EFF]/20 rounded-2xl py-3 pl-12 pr-4 text-[#0B2447] placeholder:text-[#0B2447]/40 focus:outline-none focus:border-[#687EFF] shadow-sm transition-all"
            />
          </div>
        </div>

        {/* Models Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModels.map((model) => (
            <div
              key={model.id}
              className="group relative flex flex-col bg-white rounded-3xl overflow-hidden border border-[#687EFF]/20 hover:border-[#687EFF] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#687EFF]/15 shadow-md"
            >
              {/* Image Container */}
              <div className="relative h-64 overflow-hidden bg-[#EAF8FF]">
                <div className="absolute inset-0 bg-linear-to-t from-white to-transparent z-10 opacity-60"></div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={model.image_url}
                  alt={model.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0B2447] border border-[#0B2447] shadow-sm">
                  <Star className="w-3.5 h-3.5 text-[#687EFF] fill-[#687EFF]" />
                  <span className="text-xs font-semibold text-[#B6FFFA]">{model.rating || '5.0'}</span>
                </div>
              </div>

              {/* Content Container */}
              <div className="flex flex-col flex-1 p-6 z-20 relative">
                <div className="flex justify-between items-start gap-4 mb-3">
                  <h3 className="text-xl font-bold tracking-tight text-[#0B2447] line-clamp-1">{model.title}</h3>
                  <span className="text-lg font-bold whitespace-nowrap text-[#0B2447]">₹{model.price}</span>
                </div>

                <p className="text-sm text-[#0B2447]/70 line-clamp-2 mb-6 flex-1">
                  {model.description}
                </p>

                <div className="flex flex-col gap-3 mt-auto">
                  {purchases.includes(model.id) ? (
                    <button
                      onClick={() => handleDownload(model.id, model.title)}
                      disabled={downloadingModelId === model.id}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-md cursor-pointer"
                    >
                      {downloadingModelId === model.id ? (
                        "Preparing..."
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Download STL
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handlePurchase(model)}
                        disabled={purchasingModelId === model.id}
                        className="flex-1 bg-[#0B2447] hover:bg-[#19376D] text-[#B6FFFA] font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-sm cursor-pointer"
                      >
                        {purchasingModelId === model.id ? "Processing..." : (
                          <>
                            <ShoppingCart className="w-4 h-4" />
                            Buy STL
                          </>
                        )}
                      </button>
                      <button className="p-3 rounded-xl bg-white border border-[#687EFF]/30 text-[#0B2447]/60 hover:text-[#0B2447] hover:bg-[#687EFF]/10 transition-colors cursor-pointer" title="Add to wishlist (coming soon)">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredModels.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#687EFF]/20 shadow-sm">
            <Box className="w-12 h-12 text-[#0B2447]/40 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#0B2447]">No models found</h3>
            <p className="text-[#0B2447]/60 mt-2">Try adjusting your search terms.</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-20 text-[#0B2447]/60">Loading models...</div>
        )}

      </div>
      <Footer />
    </div>
  );
}
