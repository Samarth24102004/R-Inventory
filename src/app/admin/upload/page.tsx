"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Upload, Plus, CircuitBoard, Lightbulb, CheckCircle2, Box, Image as ImageIcon, FileBox, Loader2, Video, Cpu, Code2, Film, BarChart3, Trash2, ExternalLink, BookOpen } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatProjectDescription } from '@/lib/data';
import AdminHeaderLayout from '@/components/AdminHeaderLayout';

export default function AdminUploadPage() {
  const [uploadType, setUploadType] = useState<'project' | 'model' | 'manual'>('project');

  // Shared States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [softwareDescription, setSoftwareDescription] = useState('');
  const [hardwareDescription, setHardwareDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [hardwareList, setHardwareList] = useState<{ component: string; quantity: string; description: string; buy_url: string }[]>([
    { component: '', quantity: '1', description: '', buy_url: '' }
  ]);

  // Manual Specific States
  const [manualTitle, setManualTitle] = useState('');
  const [manualCategory, setManualCategory] = useState<'SETUP' | 'COMMANDS' | 'HARDWARE' | 'TUTORIALS' | 'TROUBLESHOOTING'>('SETUP');
  const [manualSummary, setManualSummary] = useState('');
  const [manualNote, setManualNote] = useState('');
  const [manualSectionTitle, setManualSectionTitle] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [manualLanguage, setManualLanguage] = useState('bash');
  const [manualExtraTitle, setManualExtraTitle] = useState('');
  const [manualExtraCode, setManualExtraCode] = useState('');
  const [manualImageFile, setManualImageFile] = useState<File | null>(null);
  const manualImageRef = useRef<HTMLInputElement>(null);
  const [manualExtraImageFile, setManualExtraImageFile] = useState<File | null>(null);
  const manualExtraImageRef = useRef<HTMLInputElement>(null);

  const addHardwareRow = () => {
    setHardwareList([...hardwareList, { component: '', quantity: '1', description: '', buy_url: '' }]);
  };

  const updateHardwareRow = (index: number, field: string, value: string) => {
    const updated = [...hardwareList];
    updated[index] = { ...updated[index], [field]: value };
    setHardwareList(updated);
  };

  const removeHardwareRow = (index: number) => {
    setHardwareList(hardwareList.filter((_, i) => i !== index));
  };

  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const videoFileRef = useRef<HTMLInputElement>(null);
  const [previewVideoUrlInput, setPreviewVideoUrlInput] = useState('');
  const [previewVideoFile, setPreviewVideoFile] = useState<File | null>(null);
  const previewVideoFileRef = useRef<HTMLInputElement>(null);
  const [price, setPrice] = useState('0');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Project Specific States
  const [codeFile, setCodeFile] = useState<File | null>(null);
  const codeFileRef = useRef<HTMLInputElement>(null);
  const [circuitFile, setCircuitFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [previewImages, setPreviewImages] = useState<File[]>([]);
  const previewImagesRef = useRef<HTMLInputElement>(null);
  
  // Model Specific States
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [stlFile, setStlFile] = useState<File | null>(null);

  // Ideas State
  const [ideas, setIdeas] = useState<any[]>([]);
  const [loadingIdeas, setLoadingIdeas] = useState(true);

  useEffect(() => {
    const fetchIdeas = async () => {
      const { data, error } = await supabase
        .from('project_ideas')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching ideas:", error);
      }
      
      if (data) {
        setIdeas(data);
      }
      setLoadingIdeas(false);
    };

    fetchIdeas();
  }, []);

  const markAsDone = async (id: string) => {
    setIdeas(ideas.map(i => i.id === id ? { ...i, is_done: true } : i));
    
    const { error } = await supabase
      .from('project_ideas')
      .update({ is_done: true })
      .eq('id', id);
      
    if (error) {
      alert("Failed to update status");
    }
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return alert("Please fill project title");
    if (!softwareDescription && !hardwareDescription && !description) {
      return alert("Please fill at least one description section (Software or Hardware)");
    }
    
    setIsSubmitting(true);
    
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const finalOverview = description.trim() || formatProjectDescription(softwareDescription, hardwareDescription);
    const shortDesc = (description.trim() || softwareDescription.trim() || hardwareDescription.trim()).substring(0, 120) + '...';

    // 1. Upload Full Demo Video if selected
    let finalVideoUrl = videoUrlInput.trim();
    if (videoFile) {
      const fileExt = videoFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: videoUploadErr } = await supabase.storage
        .from('project_videos')
        .upload(fileName, videoFile);
        
      if (!videoUploadErr) {
        const { data: urlData } = supabase.storage
          .from('project_videos')
          .getPublicUrl(fileName);
        finalVideoUrl = urlData.publicUrl;
      } else {
        console.error("Video upload error:", videoUploadErr);
        const { error: fallbackErr } = await supabase.storage
          .from('diagrams')
          .upload(fileName, videoFile);
        if (!fallbackErr) {
          const { data: fallbackUrlData } = supabase.storage
            .from('diagrams')
            .getPublicUrl(fileName);
          finalVideoUrl = fallbackUrlData.publicUrl;
        }
      }
    }

    // 2. Upload Preview Video if selected
    let finalPreviewVideoUrl = previewVideoUrlInput.trim();
    if (previewVideoFile) {
      const fileExt = previewVideoFile.name.split('.').pop();
      const fileName = `preview_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: videoUploadErr } = await supabase.storage
        .from('project_videos')
        .upload(fileName, previewVideoFile);
        
      if (!videoUploadErr) {
        const { data: urlData } = supabase.storage
          .from('project_videos')
          .getPublicUrl(fileName);
        finalPreviewVideoUrl = urlData.publicUrl;
      } else {
        const { error: fallbackErr } = await supabase.storage
          .from('project_previews')
          .upload(fileName, previewVideoFile);
        if (!fallbackErr) {
          const { data: fallbackUrlData } = supabase.storage
            .from('project_previews')
            .getPublicUrl(fileName);
          finalPreviewVideoUrl = fallbackUrlData.publicUrl;
        }
      }
    }

    let uploaded_code_url = '';
    if (codeFile) {
      const fileExt = codeFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project_code')
        .upload(fileName, codeFile);
        
      if (uploadError) {
        alert(`Failed to upload code file: ${uploadError.message}`);
        setIsSubmitting(false);
        return;
      }
      
      const { data: urlData } = supabase.storage
        .from('project_code')
        .getPublicUrl(fileName);
        
      uploaded_code_url = urlData.publicUrl;
    }

    let circuit_diagram_url = null;
    if (circuitFile) {
      const fileExt = circuitFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('diagrams')
        .upload(fileName, circuitFile);
        
      if (uploadError) {
        alert(`Failed to upload diagram: ${uploadError.message}`);
        setIsSubmitting(false);
        return;
      }
      
      const { data: urlData } = supabase.storage
        .from('diagrams')
        .getPublicUrl(fileName);
        
      circuit_diagram_url = urlData.publicUrl;
    }

    let uploaded_preview_urls: string[] = [];
    if (previewImages.length > 0) {
      for (const img of previewImages) {
        const fileExt = img.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('project_previews')
          .upload(fileName, img);
          
        if (uploadError) {
          console.error("Preview image upload error:", uploadError);
        } else {
          const { data: urlData } = supabase.storage
            .from('project_previews')
            .getPublicUrl(fileName);
          uploaded_preview_urls.push(urlData.publicUrl);
        }
      }
    }

    const tagsArray = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const cleanHardware = hardwareList
      .filter(h => h.component.trim() !== '')
      .map(h => ({
        component: h.component.trim(),
        quantity: h.quantity || '1',
        description: h.description.trim(),
        buy_url: h.buy_url.trim()
      }));

    const { error } = await supabase.from('projects').insert([
      {
        title: title,
        slug: slug,
        description: finalOverview,
        software_description: softwareDescription,
        hardware_description: hardwareDescription,
        short_description: shortDesc,
        price: parseFloat(price) || 0,
        github_link: uploaded_code_url,
        video_url: finalVideoUrl || null,
        preview_video_url: finalPreviewVideoUrl || null,
        circuit_diagram_url: circuit_diagram_url,
        preview_images: uploaded_preview_urls,
        tags: tagsArray,
        hardware: cleanHardware,
        category: 'Uncategorized',
        difficulty: 'Beginner',
        ros_version: 'ROS Humble',
        thumbnail: '/placeholder.jpg',
        hero_image: '/placeholder.jpg'
      }
    ]);

    setIsSubmitting(false);

    if (error) {
      alert(`Database Error: ${error.message}`);
    } else {
      alert('Success! Your project has been uploaded to RoS Inventory.');
      setTitle('');
      setDescription('');
      setSoftwareDescription('');
      setHardwareDescription('');
      setVideoUrlInput('');
      setVideoFile(null);
      setPreviewVideoUrlInput('');
      setPreviewVideoFile(null);
      setPrice('0');
      setCodeFile(null);
      setCircuitFile(null);
      setPreviewImages([]);
    }
  };

  const handleModelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!title || !description || !price || !imageFile || !stlFile) {
        throw new Error("Please fill in all fields and select both files.");
      }

      const timestamp = Date.now();
      const imageFileName = `${timestamp}-${imageFile.name}`;
      const stlFileName = `${timestamp}-${stlFile.name}`;

      // 1. Upload Preview Image
      const { data: imageData, error: imageError } = await supabase.storage
        .from('model_images')
        .upload(imageFileName, imageFile);

      if (imageError) throw new Error(`Image Upload Error: ${imageError.message}`);

      const { data: publicUrlData } = supabase.storage
        .from('model_images')
        .getPublicUrl(imageFileName);

      // 2. Upload STL file
      const { data: stlData, error: stlError } = await supabase.storage
        .from('stl_files')
        .upload(stlFileName, stlFile);

      if (stlError) throw new Error(`STL Upload Error: ${stlError.message}`);

      // 3. Insert record
      const { error: dbError } = await supabase
        .from('stl_models')
        .insert([
          {
            title,
            description,
            price: parseInt(price, 10),
            image_url: publicUrlData.publicUrl,
            stl_file_path: stlFileName,
          }
        ]);

      if (dbError) throw new Error(`Database Error: ${dbError.message}`);

      alert('3D Model uploaded successfully!');
      setTitle('');
      setDescription('');
      setPrice('0');
      setImageFile(null);
      setStlFile(null);

    } catch (err: any) {
      console.error("Upload process failed:", err);
      alert(err.message || "An error occurred during upload.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle || !manualSummary) return alert("Please fill in manual title and summary");

    setIsSubmitting(true);
    const slug = manualTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const categoryLabels: Record<string, string> = {
      SETUP: 'SETUP',
      COMMANDS: 'USEFUL COMMANDS',
      HARDWARE: 'HARDWARE & EMBEDDED',
      TUTORIALS: 'TUTORIALS',
      TROUBLESHOOTING: 'TROUBLESHOOTING'
    };

    let section1ImageUrl: string | undefined = undefined;
    if (manualImageFile) {
      const fileExt = manualImageFile.name.split('.').pop();
      const fileName = `manual_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { error: uploadErr } = await supabase.storage.from('manual_images').upload(fileName, manualImageFile);
      if (!uploadErr) {
        const { data: urlData } = supabase.storage.from('manual_images').getPublicUrl(fileName);
        section1ImageUrl = urlData.publicUrl;
      } else {
        const { error: fallbackErr } = await supabase.storage.from('diagrams').upload(fileName, manualImageFile);
        if (!fallbackErr) {
          const { data: fallbackUrlData } = supabase.storage.from('diagrams').getPublicUrl(fileName);
          section1ImageUrl = fallbackUrlData.publicUrl;
        }
      }
    }

    let section2ImageUrl: string | undefined = undefined;
    if (manualExtraImageFile) {
      const fileExt = manualExtraImageFile.name.split('.').pop();
      const fileName = `manual_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { error: uploadErr } = await supabase.storage.from('manual_images').upload(fileName, manualExtraImageFile);
      if (!uploadErr) {
        const { data: urlData } = supabase.storage.from('manual_images').getPublicUrl(fileName);
        section2ImageUrl = urlData.publicUrl;
      } else {
        const { error: fallbackErr } = await supabase.storage.from('diagrams').upload(fileName, manualExtraImageFile);
        if (!fallbackErr) {
          const { data: fallbackUrlData } = supabase.storage.from('diagrams').getPublicUrl(fileName);
          section2ImageUrl = fallbackUrlData.publicUrl;
        }
      }
    }

    const sectionsData: any[] = [
      {
        title: manualSectionTitle || "Overview & Setup Instructions",
        description: manualSummary,
        note: manualNote.trim() || undefined,
        image_url: section1ImageUrl,
        code: manualCode.trim() || undefined,
        language: manualLanguage || 'bash'
      }
    ];

    if (manualExtraCode.trim() || manualExtraTitle.trim() || section2ImageUrl) {
      sectionsData.push({
        title: manualExtraTitle || "Additional Execution & Commands",
        description: "Run the following commands in terminal:",
        note: undefined,
        image_url: section2ImageUrl,
        code: manualExtraCode.trim() || undefined,
        language: manualLanguage || 'bash'
      });
    }

    const { error } = await supabase.from('manuals').insert([
      {
        title: manualTitle,
        slug: slug,
        category: manualCategory,
        category_label: categoryLabels[manualCategory] || manualCategory,
        breadcrumbs: [manualCategory.toLowerCase(), `${slug}.md`],
        summary: manualSummary,
        sections: sectionsData
      }
    ]);

    setIsSubmitting(false);

    if (error) {
      alert(`Database Error: ${error.message}`);
    } else {
      alert('Success! Manual post published to RoS Inventory.');
      setManualTitle('');
      setManualSummary('');
      setManualNote('');
      setManualSectionTitle('');
      setManualCode('');
      setManualExtraTitle('');
      setManualExtraCode('');
      setManualImageFile(null);
      setManualExtraImageFile(null);
    }
  };

  return (
    <AdminHeaderLayout
      title="Upload Content"
      subtitle="Upload new ROS 2 projects, hardware architectures, code ZIPs, 3D STL models, and manual guides."
    >
      <div className="space-y-8">
        <div className="bg-[#0a0a0a] p-10 rounded-xl border border-white/10 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-white/10 pb-6 gap-6">
            <h2 className="text-xl font-semibold text-white tracking-tight">Select Content Type</h2>
            <div className="flex bg-white/5 rounded-md p-1 border border-white/10">
              <button 
                onClick={() => setUploadType('project')}
                className={`px-4 py-2 rounded-sm text-sm font-medium transition-colors flex items-center gap-2 ${uploadType === 'project' ? 'bg-white text-black font-semibold' : 'text-gray-400 hover:text-white'}`}
              >
                <CircuitBoard className="w-4 h-4" />
                Project
              </button>
              <button 
                onClick={() => setUploadType('model')}
                className={`px-4 py-2 rounded-sm text-sm font-medium transition-colors flex items-center gap-2 ${uploadType === 'model' ? 'bg-white text-black font-semibold' : 'text-gray-400 hover:text-white'}`}
              >
                <Box className="w-4 h-4" />
                3D Model
              </button>
              <button 
                onClick={() => setUploadType('manual')}
                className={`px-4 py-2 rounded-sm text-sm font-medium transition-colors flex items-center gap-2 ${uploadType === 'manual' ? 'bg-white text-black font-semibold' : 'text-gray-400 hover:text-white'}`}
              >
                <BookOpen className="w-4 h-4" />
                Manual / Guide
              </button>
            </div>
          </div>

        {uploadType === 'project' ? (
          <form onSubmit={handleProjectSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 tracking-wider uppercase">Project Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-transparent border border-white/20 rounded-md px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                  placeholder="e.g. Nav2 Autonomous Rover"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 tracking-wider uppercase">Price (INR)</label>
                <input 
                  type="number" 
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="0"
                  className="w-full bg-transparent border border-white/20 rounded-md px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 tracking-wider uppercase">Custom Tags (Comma Separated)</label>
                <input 
                  type="text" 
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full bg-transparent border border-white/20 rounded-md px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                  placeholder="e.g. SLAM, LiDAR, Python, Autonomous"
                />
              </div>
            </div>

            <div className="p-6 bg-transparent border border-white/10 rounded-md space-y-4">
              <div className="flex items-center space-x-3">
                <FileBox className="text-white w-5 h-5" strokeWidth={1.5} />
                <h3 className="text-lg font-medium text-white tracking-tight">Source Code (.zip)</h3>
              </div>
              <p className="text-sm text-gray-400">Upload the complete source code as a ZIP folder.</p>
              
              <div 
                className="border border-dashed border-white/20 rounded-md p-8 text-center hover:border-white transition-colors cursor-pointer group"
                onClick={() => codeFileRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={codeFileRef} 
                  className="hidden" 
                  accept=".zip,.rar,.tar,.gz"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setCodeFile(e.target.files[0]);
                    }
                  }}
                />
                {codeFile ? (
                  <div className="text-white flex flex-col items-center">
                    <CheckCircle2 className="w-6 h-6 text-green-500 mb-2" />
                    <p className="text-sm">{codeFile.name}</p>
                    <p className="text-xs text-gray-400 mt-1">Click to change file</p>
                  </div>
                ) : (
                  <>
                    <Plus className="w-6 h-6 text-gray-400 mx-auto mb-2 group-hover:text-white transition-colors" strokeWidth={1.5} />
                    <p className="text-sm text-gray-400 group-hover:text-white transition-colors">Click to upload .ZIP or drag & drop</p>
                  </>
                )}
              </div>
            </div>

            {/* Main Project Overview Text */}
            <div className="p-5 bg-white/5 border border-white/10 rounded-lg space-y-2">
              <div className="flex items-center space-x-2 text-white mb-1">
                <Lightbulb className="w-5 h-5 text-amber-400" />
                <label className="text-xs font-semibold tracking-wider uppercase text-white">PROJECT OVERVIEW</label>
              </div>
              <p className="text-xs text-gray-400">Main overview description of the project. This will be displayed in full under the "Project Overview" section on the project detail page.</p>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="w-full bg-black/50 border border-white/20 rounded-md px-4 py-3 text-white focus:outline-none focus:border-white transition-colors resize-y text-sm"
                placeholder="e.g. VitaBot is an interactive health companion robot running on Raspberry Pi 3B+. Includes main application loop, ROS 2 nodes, and automated health monitoring routines..."
              ></textarea>
            </div>

            {/* Description Sections: Software & Hardware */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 p-5 bg-white/5 border border-white/10 rounded-lg">
                <div className="flex items-center space-x-2 text-white mb-1">
                  <Code2 className="w-5 h-5 text-white" />
                  <label className="text-xs font-semibold tracking-wider uppercase text-white">SOFTWARE Description</label>
                </div>
                <p className="text-xs text-gray-400">Specify ROS 2 nodes, packages, launch files, algorithms, and setup commands.</p>
                <textarea 
                  value={softwareDescription}
                  onChange={(e) => setSoftwareDescription(e.target.value)}
                  rows={5}
                  className="w-full bg-black/50 border border-white/20 rounded-md px-4 py-3 text-white focus:outline-none focus:border-white transition-colors resize-none text-sm"
                  placeholder="e.g. Navigation2 setup, SLAM toolbox configuration, custom ROS 2 lifecycle nodes..."
                ></textarea>
              </div>

              <div className="space-y-2 p-5 bg-white/5 border border-white/10 rounded-lg">
                <div className="flex items-center space-x-2 text-white mb-1">
                  <Cpu className="w-5 h-5 text-white" />
                  <label className="text-xs font-semibold tracking-wider uppercase text-white">HARDWARE Description</label>
                </div>
                <p className="text-xs text-gray-400">Specify compute unit, microcontrollers, sensors, actuators, and power requirements.</p>
                <textarea 
                  value={hardwareDescription}
                  onChange={(e) => setHardwareDescription(e.target.value)}
                  rows={5}
                  className="w-full bg-black/50 border border-white/20 rounded-md px-4 py-3 text-white focus:outline-none focus:border-white transition-colors resize-none text-sm"
                  placeholder="e.g. Jetson Nano 4GB, RPLidar A1, L298N motor driver, 12V 5Ah LiFePO4 battery..."
                ></textarea>
              </div>
            </div>

            {/* Required Hardware Components & Product Links */}
            <div className="p-6 bg-transparent border border-white/10 rounded-md space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Cpu className="text-white w-5 h-5" strokeWidth={1.5} />
                  <div>
                    <h3 className="text-lg font-medium text-white tracking-tight">Hardware Parts & Store Links</h3>
                    <p className="text-xs text-gray-400">Add hardware component parts, quantities, descriptions, and direct product buy links.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={addHardwareRow}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Part
                </button>
              </div>

              <div className="space-y-3">
                {hardwareList.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 bg-black/40 border border-white/10 rounded-lg items-center">
                    <div className="md:col-span-4">
                      <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">Component Name</label>
                      <input
                        type="text"
                        value={item.component}
                        onChange={(e) => updateHardwareRow(index, 'component', e.target.value)}
                        className="w-full bg-black/60 border border-white/20 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-white"
                        placeholder="e.g. RPLidar A1 360° LiDAR"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">Qty</label>
                      <input
                        type="text"
                        value={item.quantity}
                        onChange={(e) => updateHardwareRow(index, 'quantity', e.target.value)}
                        className="w-full bg-black/60 border border-white/20 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-white"
                        placeholder="1"
                      />
                    </div>
                    <div className="md:col-span-5">
                      <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">Product / Buy Link (URL)</label>
                      <input
                        type="url"
                        value={item.buy_url}
                        onChange={(e) => updateHardwareRow(index, 'buy_url', e.target.value)}
                        className="w-full bg-black/60 border border-white/20 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-white"
                        placeholder="https://..."
                      />
                    </div>
                    <div className="md:col-span-1 flex justify-end pt-2 md:pt-0">
                      {hardwareList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeHardwareRow(index)}
                          className="text-gray-400 hover:text-red-400 p-1"
                          title="Remove Part"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Video Section (URL or File Upload) */}
            <div className="p-6 bg-transparent border border-white/10 rounded-md space-y-4">
              <div className="flex items-center space-x-3">
                <Video className="text-purple-400 w-5 h-5" strokeWidth={1.5} />
                <h3 className="text-lg font-medium text-white tracking-tight">Project Video (Optional)</h3>
              </div>
              <p className="text-sm text-gray-400">Add a video link (YouTube, Vimeo, MP4) OR upload a video file for this project.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-400 tracking-wider uppercase block mb-1">Video Link (YouTube / Vimeo / MP4 URL)</label>
                  <input 
                    type="url" 
                    value={videoUrlInput}
                    onChange={(e) => setVideoUrlInput(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... or https://example.com/video.mp4"
                    className="w-full bg-transparent border border-white/20 rounded-md px-4 py-3 text-white focus:outline-none focus:border-purple-400 transition-colors text-sm"
                  />
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500 uppercase tracking-wider">
                  <div className="h-px bg-white/10 flex-1"></div>
                  <span>OR Upload Video File</span>
                  <div className="h-px bg-white/10 flex-1"></div>
                </div>

                <div 
                  className="border border-dashed border-white/20 rounded-md p-6 text-center hover:border-purple-400 transition-colors cursor-pointer group"
                  onClick={() => videoFileRef.current?.click()}
                >
                  <input 
                    type="file" 
                    ref={videoFileRef} 
                    className="hidden" 
                    accept="video/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setVideoFile(e.target.files[0]);
                      }
                    }}
                  />
                  {videoFile ? (
                    <div className="text-white flex flex-col items-center">
                      <CheckCircle2 className="w-6 h-6 text-green-500 mb-2" />
                      <p className="text-sm font-medium">{videoFile.name}</p>
                      <p className="text-xs text-gray-400 mt-1">Click to change video file</p>
                    </div>
                  ) : (
                    <>
                      <Film className="w-6 h-6 text-gray-400 mx-auto mb-2 group-hover:text-purple-400 transition-colors" strokeWidth={1.5} />
                      <p className="text-sm text-gray-400 group-hover:text-white transition-colors">Click to upload video file (.mp4, .webm)</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Preview Video Section */}
            <div className="p-6 bg-transparent border border-white/10 rounded-md space-y-4">
              <div className="flex items-center space-x-3">
                <Film className="text-pink-400 w-5 h-5" strokeWidth={1.5} />
                <h3 className="text-lg font-medium text-white tracking-tight">Card Preview Video (Optional)</h3>
              </div>
              <p className="text-sm text-gray-400">Upload a short loopable preview video (.mp4) that plays when hovering over the project card.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-400 tracking-wider uppercase block mb-1">Preview Video Link (YouTube / Vimeo / MP4 URL)</label>
                  <input 
                    type="url" 
                    value={previewVideoUrlInput}
                    onChange={(e) => setPreviewVideoUrlInput(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... or https://example.com/preview.mp4"
                    className="w-full bg-transparent border border-white/20 rounded-md px-4 py-3 text-white focus:outline-none focus:border-pink-400 transition-colors text-sm"
                  />
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500 uppercase tracking-wider">
                  <div className="h-px bg-white/10 flex-1"></div>
                  <span>OR Upload Preview Video File</span>
                  <div className="h-px bg-white/10 flex-1"></div>
                </div>

                <div 
                  className="border border-dashed border-white/20 rounded-md p-6 text-center hover:border-pink-400 transition-colors cursor-pointer group"
                  onClick={() => previewVideoFileRef.current?.click()}
                >
                  <input 
                    type="file" 
                    ref={previewVideoFileRef} 
                    className="hidden" 
                    accept="video/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setPreviewVideoFile(e.target.files[0]);
                      }
                    }}
                  />
                  {previewVideoFile ? (
                    <div className="text-white flex flex-col items-center">
                      <CheckCircle2 className="w-6 h-6 text-green-500 mb-2" />
                      <p className="text-sm font-medium">{previewVideoFile.name}</p>
                      <p className="text-xs text-gray-400 mt-1">Click to change preview video file</p>
                    </div>
                  ) : (
                    <>
                      <Video className="w-6 h-6 text-gray-400 mx-auto mb-2 group-hover:text-pink-400 transition-colors" strokeWidth={1.5} />
                      <p className="text-sm text-gray-400 group-hover:text-white transition-colors">Click to upload preview video (.mp4, .webm)</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Circuit Diagram Section */}
            <div className="p-6 bg-transparent border border-white/10 rounded-md space-y-4">
              <div className="flex items-center space-x-3">
                <CircuitBoard className="text-white w-5 h-5" strokeWidth={1.5} />
                <h3 className="text-lg font-medium text-white tracking-tight">Circuit Diagrams</h3>
              </div>
              <p className="text-sm text-gray-400">Upload wiring or circuit diagrams for hardware integration.</p>
              
              <div 
                className="border border-dashed border-white/20 rounded-md p-8 text-center hover:border-white transition-colors cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setCircuitFile(e.target.files[0]);
                    }
                  }}
                />
                {circuitFile ? (
                  <div className="text-white flex flex-col items-center">
                    <CheckCircle2 className="w-6 h-6 text-green-500 mb-2" />
                    <p className="text-sm">{circuitFile.name}</p>
                    <p className="text-xs text-gray-400 mt-1">Click to change file</p>
                  </div>
                ) : (
                  <>
                    <Plus className="w-6 h-6 text-gray-400 mx-auto mb-2 group-hover:text-white transition-colors" strokeWidth={1.5} />
                    <p className="text-sm text-gray-400 group-hover:text-white transition-colors">Click to upload image or drag & drop</p>
                  </>
                )}
              </div>
            </div>

            {/* Preview Images Section */}
            <div className="p-6 bg-transparent border border-white/10 rounded-md space-y-4">
              <div className="flex items-center space-x-3">
                <ImageIcon className="text-white w-5 h-5" strokeWidth={1.5} />
                <h3 className="text-lg font-medium text-white tracking-tight">Preview Images</h3>
              </div>
              <p className="text-sm text-gray-400">Upload one or multiple preview images to display on the project card.</p>
              
              <div 
                className="border border-dashed border-white/20 rounded-md p-8 text-center hover:border-white transition-colors cursor-pointer group"
                onClick={() => previewImagesRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={previewImagesRef} 
                  className="hidden" 
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      setPreviewImages(Array.from(e.target.files));
                    }
                  }}
                />
                {previewImages.length > 0 ? (
                  <div className="text-white flex flex-col items-center">
                    <CheckCircle2 className="w-6 h-6 text-green-500 mb-2" />
                    <p className="text-sm">{previewImages.length} image(s) selected</p>
                    <p className="text-xs text-gray-400 mt-1">Click to reselect files</p>
                  </div>
                ) : (
                  <>
                    <Plus className="w-6 h-6 text-gray-400 mx-auto mb-2 group-hover:text-white transition-colors" strokeWidth={1.5} />
                    <p className="text-sm text-gray-400 group-hover:text-white transition-colors">Click to upload images or drag & drop</p>
                  </>
                )}
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-white hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-black rounded-md font-medium transition-colors flex justify-center items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Uploading...
                </>
              ) : 'Publish Project'}
            </button>
          </form>
        ) : uploadType === 'model' ? (
          <form onSubmit={handleModelSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 tracking-wider uppercase">Model Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-transparent border border-white/20 rounded-md px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                  placeholder="E.g., Articulated Dragon"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 tracking-wider uppercase">Price (INR)</label>
                <input 
                  type="number" 
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="0"
                  className="w-full bg-transparent border border-white/20 rounded-md px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 tracking-wider uppercase">Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full bg-transparent border border-white/20 rounded-md px-4 py-3 text-white focus:outline-none focus:border-white transition-colors resize-none"
                placeholder="Describe your 3D model..."
                required
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Image Upload */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 tracking-wider uppercase">Preview Image</label>
                <div className="relative group h-full">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    required
                  />
                  <div className={`flex items-center gap-4 p-4 h-[72px] rounded-md border border-dashed transition-colors ${imageFile ? 'border-white/50 bg-white/5' : 'border-white/20 bg-transparent group-hover:border-white/40'}`}>
                    <div className="p-3 bg-white/5 rounded-md text-gray-400 group-hover:text-white transition-colors">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-medium text-white truncate">
                        {imageFile ? imageFile.name : "Select Preview Image"}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">JPG, PNG (Max 5MB)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* STL Upload */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 tracking-wider uppercase">3D File (.STL)</label>
                <div className="relative group h-full">
                  <input
                    type="file"
                    accept=".stl"
                    onChange={(e) => setStlFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    required
                  />
                  <div className={`flex items-center gap-4 p-4 h-[72px] rounded-md border border-dashed transition-colors ${stlFile ? 'border-white/50 bg-white/5' : 'border-white/20 bg-transparent group-hover:border-white/40'}`}>
                    <div className="p-3 bg-white/5 rounded-md text-gray-400 group-hover:text-white transition-colors">
                      <FileBox className="w-5 h-5" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-medium text-white truncate">
                        {stlFile ? stlFile.name : "Select .STL File"}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">.STL only</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-white hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-black rounded-md font-medium transition-colors flex justify-center items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Uploading Model...
                </>
              ) : 'Publish 3D Model'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleManualSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 tracking-wider uppercase">Manual Title</label>
                <input 
                  type="text" 
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  className="w-full bg-transparent border border-white/20 rounded-md px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                  placeholder="e.g. Ubuntu Setup for ROS 2"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 tracking-wider uppercase">Category</label>
                <select
                  value={manualCategory}
                  onChange={(e) => setManualCategory(e.target.value as any)}
                  className="w-full bg-[#0a0a0a] border border-white/20 rounded-md px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                >
                  <option value="SETUP">SETUP</option>
                  <option value="COMMANDS">USEFUL COMMANDS</option>
                  <option value="HARDWARE">HARDWARE & EMBEDDED</option>
                  <option value="TUTORIALS">TUTORIALS</option>
                  <option value="TROUBLESHOOTING">TROUBLESHOOTING</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 tracking-wider uppercase">Manual Summary</label>
              <textarea 
                value={manualSummary}
                onChange={(e) => setManualSummary(e.target.value)}
                rows={3}
                className="w-full bg-transparent border border-white/20 rounded-md px-4 py-3 text-white focus:outline-none focus:border-white transition-colors resize-none text-sm"
                placeholder="Brief summary of what this guide covers..."
                required
              ></textarea>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 tracking-wider uppercase">Important Note / Alert Banner (Optional)</label>
              <input 
                type="text" 
                value={manualNote}
                onChange={(e) => setManualNote(e.target.value)}
                className="w-full bg-transparent border border-white/20 rounded-md px-4 py-3 text-white focus:outline-none focus:border-white transition-colors text-sm"
                placeholder="e.g. Note: ROS 2 Jazzy requires Ubuntu 24.04 LTS."
              />
            </div>

            <div className="p-6 bg-white/5 border border-white/10 rounded-md space-y-4">
              <h3 className="text-base font-semibold text-white">Main Commands / Code Block</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase">Section Title</label>
                  <input 
                    type="text" 
                    value={manualSectionTitle}
                    onChange={(e) => setManualSectionTitle(e.target.value)}
                    className="w-full bg-black/50 border border-white/20 rounded-md px-4 py-2.5 text-white text-sm"
                    placeholder="e.g. Installation Commands"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase">Code Language</label>
                  <select 
                    value={manualLanguage}
                    onChange={(e) => setManualLanguage(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-white/20 rounded-md px-4 py-2.5 text-white text-sm"
                  >
                    <option value="bash">bash / shell</option>
                    <option value="python">python</option>
                    <option value="cpp">c++</option>
                    <option value="ini">ini / config</option>
                    <option value="text">plain text</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase">Terminal Commands / Source Code</label>
                <textarea 
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  rows={6}
                  className="w-full bg-black/60 font-mono text-emerald-400 border border-white/20 rounded-md p-4 text-xs focus:outline-none focus:border-emerald-400 transition-colors"
                  placeholder="sudo apt update && sudo apt install -y ros-humble-desktop..."
                ></textarea>
              </div>

              {/* Optional Section 1 Image */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-medium text-gray-400 uppercase">Section 1 Diagram / Image (Optional)</label>
                <div 
                  className="border border-dashed border-white/20 rounded-md p-5 text-center hover:border-white transition-colors cursor-pointer group"
                  onClick={() => manualImageRef.current?.click()}
                >
                  <input 
                    type="file" 
                    ref={manualImageRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setManualImageFile(e.target.files[0]);
                      }
                    }}
                  />
                  {manualImageFile ? (
                    <div className="text-white flex flex-col items-center">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mb-1" />
                      <p className="text-xs">{manualImageFile.name}</p>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="w-5 h-5 text-gray-400 mx-auto mb-1 group-hover:text-white transition-colors" />
                      <p className="text-xs text-gray-400 group-hover:text-white transition-colors">Click to upload diagram image (Optional)</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 bg-white/5 border border-white/10 rounded-md space-y-4">
              <h3 className="text-base font-semibold text-white">Additional Execution Block (Optional)</h3>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase">Step 2 Section Title</label>
                <input 
                  type="text" 
                  value={manualExtraTitle}
                  onChange={(e) => setManualExtraTitle(e.target.value)}
                  className="w-full bg-black/50 border border-white/20 rounded-md px-4 py-2.5 text-white text-sm"
                  placeholder="e.g. Workspace Environment Sourcing"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase">Step 2 Commands</label>
                <textarea 
                  value={manualExtraCode}
                  onChange={(e) => setManualExtraCode(e.target.value)}
                  rows={4}
                  className="w-full bg-black/60 font-mono text-emerald-400 border border-white/20 rounded-md p-4 text-xs focus:outline-none focus:border-emerald-400 transition-colors"
                  placeholder="echo 'source /opt/ros/humble/setup.bash' >> ~/.bashrc..."
                ></textarea>
              </div>

              {/* Optional Section 2 Image */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-medium text-gray-400 uppercase">Step 2 Diagram / Image (Optional)</label>
                <div 
                  className="border border-dashed border-white/20 rounded-md p-5 text-center hover:border-white transition-colors cursor-pointer group"
                  onClick={() => manualExtraImageRef.current?.click()}
                >
                  <input 
                    type="file" 
                    ref={manualExtraImageRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setManualExtraImageFile(e.target.files[0]);
                      }
                    }}
                  />
                  {manualExtraImageFile ? (
                    <div className="text-white flex flex-col items-center">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mb-1" />
                      <p className="text-xs">{manualExtraImageFile.name}</p>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="w-5 h-5 text-gray-400 mx-auto mb-1 group-hover:text-white transition-colors" />
                      <p className="text-xs text-gray-400 group-hover:text-white transition-colors">Click to upload step 2 diagram image (Optional)</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-white hover:bg-gray-200 disabled:opacity-50 text-black rounded-md font-semibold transition-colors flex justify-center items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Publishing Manual...
                </>
              ) : 'Publish Manual Guide'}
            </button>
          </form>
        )}
      </div>

      <div className="max-w-4xl mx-auto mt-12 bg-[#0a0a0a] p-10 rounded-xl border border-white/10 shadow-lg">
        <div className="flex items-center space-x-4 mb-8 border-b border-white/10 pb-6">
          <Lightbulb className="text-white w-6 h-6" strokeWidth={1.5} />
          <h2 className="text-2xl font-semibold text-white tracking-tight">
            User Requested Projects
          </h2>
        </div>
        
        {loadingIdeas ? (
          <p className="text-sm text-gray-400">Loading ideas...</p>
        ) : ideas.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No project ideas submitted yet.</p>
        ) : (
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {ideas.map((idea) => (
              <div key={idea.id} className={`border border-white/10 rounded-md p-6 relative transition-all ${idea.is_done ? 'opacity-50' : 'bg-transparent'}`}>
                <div className="flex justify-between items-start gap-4">
                  <p className={`text-base pr-8 flex-1 ${idea.is_done ? 'text-gray-500 line-through' : 'text-gray-200'}`}>{idea.idea}</p>
                  
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <span className="text-xs text-gray-500">
                      {new Date(idea.created_at).toLocaleDateString()}
                    </span>
                    {!idea.is_done ? (
                      <button 
                        onClick={() => markAsDone(idea.id)}
                        className="p-2 rounded-full border border-white/10 hover:bg-white hover:text-black text-gray-400 transition-colors cursor-pointer"
                        title="Mark as done"
                      >
                        <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    ) : (
                      <div className="text-gray-500 flex items-center gap-1 text-xs font-medium mt-1">
                        <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} /> Done
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </AdminHeaderLayout>
  );
}
