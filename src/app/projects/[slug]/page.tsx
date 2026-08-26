"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Lock, Code, CheckCircle, ArrowLeft, ChevronLeft, ChevronRight, ImageIcon, Video, Cpu, Code2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import AuthModal from '@/components/AuthModal';
import { parseProjectDescription } from '@/lib/data';

function renderVideoPlayer(url: string) {
  if (!url) return null;
  
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${ytMatch[1]}`}
        title="Project Video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full aspect-video rounded-lg border border-white/10"
      />
    );
  }

  const vimeoMatch = url.match(/vimeo\.com\/(?:.*\/)?(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return (
      <iframe
        src={`https://player.vimeo.com/video/${vimeoMatch[1]}`}
        title="Project Video"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        className="w-full aspect-video rounded-lg border border-white/10"
      />
    );
  }

  return (
    <video
      controls
      className="w-full aspect-video rounded-lg border border-white/10 bg-black/80 object-contain"
      src={url}
    >
      Your browser does not support the video tag.
    </video>
  );
}

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
        name: "RoS Inventory",
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
      <div className="max-w-5xl mx-auto px-[5%] py-12 space-y-8">
        <h2 className="text-2xl font-semibold mb-6">Project Overview</h2>
        
        {/* 1. Demonstration Video (Always visible if video exists) */}
        {(project.video_url || project.videoUrl) && (
          <div className="bg-[#0a0a0a] border border-white/10 p-6 md:p-8 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4 flex items-center text-purple-400">
              <Video className="w-6 h-6 mr-3 text-purple-400" /> Demonstration Video
            </h3>
            {renderVideoPlayer(project.video_url || project.videoUrl)}
          </div>
        )}

        {/* 2. Project Gallery (Always visible if images exist) */}
        {project.preview_images && project.preview_images.length > 0 && (
          <div className="bg-[#0a0a0a] border border-white/10 p-6 md:p-8 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <ImageIcon className="w-6 h-6 mr-3 text-gray-300" /> Project Gallery
            </h3>
            <div className="relative rounded-lg overflow-hidden border border-white/10 bg-black/50 aspect-video group flex items-center justify-center">
              <Image 
                src={project.preview_images[currentImageIndex]} 
                alt={`Preview ${currentImageIndex + 1}`}
                fill
                className="object-contain"
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

        {/* 3. Software Architecture & Hardware Architecture Overview */}
        {(() => {
          const parsedDesc = parseProjectDescription(project.description || '');
          const softwareText = project.software_description || parsedDesc.software;
          const hardwareText = project.hardware_description || parsedDesc.hardware;

          return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              
              {/* Left Column: SOFTWARE Overview & Code Download / Lock */}
              <div className="bg-[#0a0a0a] border border-white/10 p-6 md:p-8 rounded-xl shadow-lg flex flex-col h-full">
                <h3 className="text-xl font-semibold mb-4 flex items-center text-white">
                  <Code2 className="w-6 h-6 mr-3 text-white" /> SOFTWARE Architecture
                </h3>
                <div className="text-gray-300 mb-6 grow space-y-3">
                  {softwareText ? (
                    softwareText.split('\n').map((paragraph: string, idx: number) => (
                      <p key={idx} className="text-sm md:text-base leading-relaxed">{paragraph}</p>
                    ))
                  ) : (
                    <p className="text-gray-500 italic text-sm">No software details specified.</p>
                  )}
                </div>

                {/* Source Code Section (Locked until purchase) */}
                <div className="pt-6 border-t border-white/10 mt-auto">
                  <h4 className="text-lg font-medium mb-3 flex items-center text-white">
                    <Code className="w-5 h-5 mr-2 text-white" /> Source Code (.ZIP)
                  </h4>
                  
                  {hasPurchased ? (
                    <div>
                      <p className="text-gray-400 text-sm mb-4">You have full access to the source code for this project.</p>
                      {project.github_link ? (
                        <a 
                          href={project.github_link} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center w-full justify-center px-6 py-3 bg-white text-black rounded-md font-medium hover:bg-gray-200 transition-colors"
                        >
                          Download .ZIP
                        </a>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No source code URL attached yet.</p>
                      )}
                    </div>
                  ) : (
                    <div className="p-5 bg-white/5 border border-white/10 rounded-lg text-center">
                      <Lock className="w-6 h-6 text-white mx-auto mb-2" />
                      <p className="text-xs font-medium text-white mb-1">Source Code Locked</p>
                      <p className="text-[11px] text-gray-400 mb-4">A single payment unlocks full access to both Source Code .ZIP & Circuit Diagrams.</p>
                      <button 
                        onClick={handleBuy}
                        disabled={purchasing}
                        className="w-full py-2.5 bg-white text-black hover:bg-gray-200 rounded-md text-xs font-semibold transition-colors"
                      >
                        {purchasing ? "Processing..." : `Unlock Full Project for ₹${project.price}`}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: HARDWARE Overview & Circuit Diagram / Lock */}
              <div className="bg-[#0a0a0a] border border-white/10 p-6 md:p-8 rounded-xl shadow-lg flex flex-col h-full">
                <h3 className="text-xl font-semibold mb-4 flex items-center text-white">
                  <Cpu className="w-6 h-6 mr-3 text-white" /> HARDWARE Architecture
                </h3>
                <div className="text-gray-300 mb-6 grow space-y-3">
                  {hardwareText ? (
                    hardwareText.split('\n').map((paragraph: string, idx: number) => (
                      <p key={idx} className="text-sm md:text-base leading-relaxed">{paragraph}</p>
                    ))
                  ) : (
                    <p className="text-gray-500 italic text-sm">No hardware details specified.</p>
                  )}
                </div>

                {/* Circuit Diagram Section (Locked until purchase) */}
                <div className="pt-6 border-t border-white/10 mt-auto">
                  <h4 className="text-sm font-medium mb-3 flex items-center text-gray-300">
                    <CheckCircle className="w-4 h-4 mr-2 text-white" /> Circuit & Wiring Diagram
                  </h4>
                  
                  {hasPurchased ? (
                    project.circuit_diagram_url ? (
                      <div className="rounded-lg overflow-hidden border border-white/10 bg-black/50 p-2 flex items-center justify-center">
                        <Image 
                          src={project.circuit_diagram_url} 
                          alt="Circuit Diagram"
                          width={800}
                          height={350} 
                          className="w-full h-auto max-h-[350px] object-contain rounded-md"
                        />
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No circuit diagram provided for this project.</p>
                    )
                  ) : (
                    <div className="p-5 bg-white/5 border border-white/10 rounded-lg text-center">
                      <Lock className="w-6 h-6 text-white mx-auto mb-2" />
                      <p className="text-xs font-medium text-white mb-1">Circuit Diagram Locked</p>
                      <p className="text-[11px] text-gray-400 mb-4">A single payment unlocks full access to both Circuit Diagrams & Source Code .ZIP.</p>
                      <button 
                        onClick={handleBuy}
                        disabled={purchasing}
                        className="w-full py-2.5 bg-white text-black hover:bg-gray-200 rounded-md text-xs font-semibold transition-colors"
                      >
                        {purchasing ? "Processing..." : `Unlock Full Project for ₹${project.price}`}
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          );
        })()}
      </div>

    </div>
  );
}
