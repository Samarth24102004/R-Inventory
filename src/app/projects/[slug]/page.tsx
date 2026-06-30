"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Lock, Code, CheckCircle, ArrowLeft, ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import Link from 'next/link';
import AuthModal from '@/components/AuthModal';

export default function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = React.use(params);
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    if (project?.preview_images?.length) {
      setCurrentImageIndex((prev) => (prev + 1) % project.preview_images.length);
    }
  };

  const prevImage = () => {
    if (project?.preview_images?.length) {
      setCurrentImageIndex((prev) => (prev - 1 + project.preview_images.length) % project.preview_images.length);
    }
  };

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
    
    // 1. Get Project
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('slug', resolvedParams.slug)
      .single();

    if (projectError || !projectData) {
      console.error(projectError);
      setLoading(false);
      return;
    }
    setProject(projectData);

    // 2. Get User
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    setUser(currentUser);

    // 3. Check Purchase if User logged in
    if (currentUser) {
      const { data: purchaseData } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('project_id', projectData.id)
        .single();
      
      if (purchaseData) {
        setHasPurchased(true);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [resolvedParams.slug]);

  const handleBuy = async () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    setPurchasing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) throw new Error("No auth token");

      // 1. Create Order
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ projectId: project.id })
      });

      const orderData = await res.json();
      if (orderData.error) throw new Error(orderData.error);

      // 2. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Vault Platform",
        description: `Lifetime access to ${project.title}`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          // 3. Verify Payment
          const verifyRes = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              projectId: project.id
            })
          });

          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            setHasPurchased(true);
            alert("Payment Successful! You now have full access.");
          } else {
            alert(`Payment Verification Failed: ${verifyData.error || 'Unknown error'}`);
          }
        },
        prefill: {
          email: user.email,
        },
        theme: {
          color: "#0a0a0a"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (err: any) {
      console.error(err);
      alert(err.message || "Something went wrong");
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;
  }

  if (!project) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Project not found</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white pb-32">
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} onSuccess={fetchData} />

      {/* Header */}
      <div className="border-b border-white/10 bg-[#050505] pt-24 pb-12 px-[5%]">
        <div className="max-w-5xl mx-auto">
          <Link href="/#projects" className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Projects
          </Link>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">{project.title}</h1>
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="bg-white/10 text-gray-300 border border-white/20 px-3 py-1 rounded text-xs font-medium uppercase tracking-wide">
                  {project.category}
                </span>
                <span className="bg-white/10 text-gray-300 border border-white/20 px-3 py-1 rounded text-xs font-medium uppercase tracking-wide">
                  {project.difficulty}
                </span>
                <span className="bg-white/10 text-gray-300 border border-white/20 px-3 py-1 rounded text-xs font-medium uppercase tracking-wide">
                  {project.ros_version}
                </span>
              </div>
              <p className="text-gray-400 text-lg max-w-2xl">{project.short_description}</p>
            </div>
            
            <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-xl min-w-[300px] shrink-0">
              <div className="text-3xl font-semibold mb-6">₹{project.price}</div>
              {hasPurchased ? (
                <div className="w-full py-3 bg-green-900/20 text-green-400 border border-green-500/30 rounded-md font-medium text-center flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 mr-2" /> Purchased
                </div>
              ) : (
                <button 
                  onClick={handleBuy}
                  disabled={purchasing}
                  className="w-full py-3 bg-white text-black hover:bg-gray-200 rounded-md font-medium transition-colors disabled:opacity-50"
                >
                  {purchasing ? "Processing..." : "Buy Lifetime Access"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-[5%] py-12">
        <h2 className="text-2xl font-semibold mb-6">Project Overview</h2>
        
        {hasPurchased ? (
          <div className="space-y-8">
            
            {/* 1. Top Section: Preview Images (PImg) */}
            {project.preview_images && project.preview_images.length > 0 && (
              <div className="bg-[#0a0a0a] border border-white/10 p-6 md:p-8 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <ImageIcon className="w-6 h-6 mr-3" /> Project Gallery
                </h3>
                <div className="relative rounded-lg overflow-hidden border border-white/10 bg-black/50 aspect-video group flex items-center justify-center">
                  <img 
                    src={project.preview_images[currentImageIndex]} 
                    alt={`Preview ${currentImageIndex + 1}`} 
                    className="w-full h-full object-contain"
                  />
                  
                  {project.preview_images.length > 1 && (
                    <>
                      <button 
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button 
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                      
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                        {project.preview_images.map((_: any, idx: number) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`w-2.5 h-2.5 rounded-full transition-colors ${idx === currentImageIndex ? 'bg-white' : 'bg-white/30 hover:bg-white/50'}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* 2. Bottom Section: 2 Columns for Circuit Diagram & Description */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              
              {/* Left Column: Circuit Diagram (C:D) */}
              <div className="bg-[#0a0a0a] border border-white/10 p-6 md:p-8 rounded-xl shadow-lg flex flex-col h-full">
                <h3 className="text-xl font-semibold mb-4 flex items-center text-white">
                  <CheckCircle className="w-6 h-6 mr-3" /> Circuit Diagram
                </h3>
                {project.circuit_diagram_url ? (
                  <>
                    <p className="text-gray-400 mb-6 text-sm">Hardware wiring and architecture reference.</p>
                    <div className="rounded-lg overflow-hidden border border-white/10 bg-black/50 p-2 flex items-center justify-center grow">
                      <img 
                        src={project.circuit_diagram_url} 
                        alt="Circuit Diagram" 
                        className="w-full h-auto max-h-[450px] object-contain rounded-md"
                      />
                    </div>
                  </>
                ) : (
                  <div className="text-gray-500 italic grow flex items-center justify-center py-12 bg-white/5 rounded-lg border border-white/10">
                    No circuit diagram provided.
                  </div>
                )}
              </div>

              {/* Right Column: Description (Descri) & GitHub */}
              <div className="bg-[#0a0a0a] border border-white/10 p-6 md:p-8 rounded-xl shadow-lg flex flex-col h-full">
                <h3 className="text-xl font-semibold mb-4 text-white">Project Description</h3>
                <div className="prose prose-invert max-w-none text-gray-300 mb-8 grow">
                  {project.description.split('\n').map((paragraph: string, idx: number) => (
                    <p key={idx} className="mb-4 text-sm md:text-base leading-relaxed">{paragraph}</p>
                  ))}
                </div>

                {project.github_link && (
                  <div className="pt-6 border-t border-white/10 mt-auto">
                    <h4 className="text-lg font-medium mb-3 flex items-center text-white">
                      <Code className="w-5 h-5 mr-2" /> Source Code (Drive Link)
                    </h4>
                    <p className="text-gray-400 text-sm mb-4">You have full access to the source code for this project.</p>
                    <a 
                      href={project.github_link} 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center w-full justify-center px-6 py-3 bg-white text-black rounded-md font-medium hover:bg-gray-200 transition-colors"
                    >
                      Open in Drive
                    </a>
                  </div>
                )}
              </div>
              
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="prose prose-invert max-w-none text-gray-300 blur-sm select-none pointer-events-none opacity-50 h-64 overflow-hidden">
              <p>This is a premium project section. The full architecture details, setup instructions, hardware requirements, and circuit diagrams are locked. When you purchase the project, this section will automatically unlock, giving you step-by-step guidance on how to integrate the ROS 2 packages with your robotic hardware.</p>
              <p>The code repository contains ready-to-deploy launch files, customized configuration nodes, and comprehensive documentation to get your robot up and running immediately.</p>
            </div>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
              <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-xl text-center max-w-md shadow-2xl">
                <Lock className="w-10 h-10 text-gray-400 mx-auto mb-4" strokeWidth={1.5} />
                <h3 className="text-xl font-semibold mb-2">Premium Content Locked</h3>
                <p className="text-sm text-gray-400 mb-6">Purchase this project to unlock the full architecture description, circuit diagrams, and source code Drive link.</p>
                <button 
                  onClick={handleBuy}
                  disabled={purchasing}
                  className="w-full py-3 bg-white text-black hover:bg-gray-200 rounded-md font-medium transition-colors"
                >
                  Unlock for ₹{project.price}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
