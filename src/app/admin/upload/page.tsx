"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Upload, Plus, CircuitBoard, Lightbulb, Mail, CheckCircle2, Box, Image as ImageIcon, FileBox, Loader2, Video, Cpu, Code2, Film, BarChart3, Trash2, ExternalLink, BookOpen, Terminal, Play } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatProjectDescription } from '@/lib/data';
import AdminHeaderLayout from '@/components/AdminHeaderLayout';
import Link from 'next/link';

export default function AdminUploadPage() {
  const searchParams = useSearchParams();
  const [uploadType, setUploadType] = useState<'project' | 'model' | 'manual' | 'simulation'>('project');

  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (typeParam === 'simulation') setUploadType('simulation');
    else if (typeParam === 'model') setUploadType('model');
    else if (typeParam === 'manual') setUploadType('manual');
  }, [searchParams]);

  // Simulation Specific States
  const [simTitle, setSimTitle] = useState('');
  const [simCategory, setSimCategory] = useState('Gazebo & Gz Sim');
  const [simSimulator, setSimSimulator] = useState('Gazebo Fortress');
  const [simRosDistro, setSimRosDistro] = useState('ROS 2 Jazzy');
  const [simTag, setSimTag] = useState('');
  const [simLaunchCommand, setSimLaunchCommand] = useState('');
  const [simDescription, setSimDescription] = useState('');
  const [simLongDescription, setSimLongDescription] = useState('');
  const [simSensorsInput, setSimSensorsInput] = useState('');
  const [simFeaturesInput, setSimFeaturesInput] = useState('');
  const [simPrice, setSimPrice] = useState('0');
  const [simVideoUrl, setSimVideoUrl] = useState('');
  const [simVideoFile, setSimVideoFile] = useState<File | null>(null);
  const [simPreviewImageFile, setSimPreviewImageFile] = useState<File | null>(null);
  const [simCodeFile, setSimCodeFile] = useState<File | null>(null);
  const [simProjectId, setSimProjectId] = useState<string>('');
  const [availableProjects, setAvailableProjects] = useState<{ id: string; title: string; slug: string }[]>([]);

  useEffect(() => {
    const fetchAvailableProjects = async () => {
      const { data } = await supabase.from('projects').select('id, title, slug').order('created_at', { ascending: false });
      if (data) setAvailableProjects(data);
    };
    fetchAvailableProjects();
  }, []);

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
  
  interface ManualBlock {
    id: string;
    title: string;
    language: string;
    code: string;
    description: string;
    note: string;
    imageFile: File | null;
  }

  const [manualBlocks, setManualBlocks] = useState<ManualBlock[]>([
    {
      id: '1',
      title: 'Main Commands / Code Block',
      language: 'bash',
      code: '',
      description: '',
      note: '',
      imageFile: null
    }
  ]);

  const addManualBlock = () => {
    setManualBlocks((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        title: `Execution Block #${prev.length + 1}`,
        language: 'bash',
        code: '',
        description: '',
        note: '',
        imageFile: null
      }
    ]);
  };

  const updateManualBlock = (id: string, field: keyof ManualBlock, value: any) => {
    setManualBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    );
  };

  const removeManualBlock = (id: string) => {
    if (manualBlocks.length <= 1) return;
    setManualBlocks((prev) => prev.filter((b) => b.id !== id));
  };

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

    const sectionsData = await Promise.all(
      manualBlocks.map(async (block, index) => {
        let blockImageUrl: string | undefined = undefined;
        if (block.imageFile) {
          const fileExt = block.imageFile.name.split('.').pop();
          const fileName = `manual_step_${index + 1}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
          const { error: uploadErr } = await supabase.storage.from('manual_images').upload(fileName, block.imageFile);
          if (!uploadErr) {
            const { data: urlData } = supabase.storage.from('manual_images').getPublicUrl(fileName);
            blockImageUrl = urlData.publicUrl;
          } else {
            const { error: fallbackErr } = await supabase.storage.from('diagrams').upload(fileName, block.imageFile);
            if (!fallbackErr) {
              const { data: fallbackUrlData } = supabase.storage.from('diagrams').getPublicUrl(fileName);
              blockImageUrl = fallbackUrlData.publicUrl;
            }
          }
        }

        return {
          title: block.title.trim() || `Execution Block #${index + 1}`,
          description: block.description.trim() || (index === 0 ? manualSummary : undefined),
          note: block.note.trim() || (index === 0 && manualNote.trim() ? manualNote.trim() : undefined),
          image_url: blockImageUrl,
          code: block.code.trim() || undefined,
          language: block.language || 'bash'
        };
      })
    );

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
      setManualBlocks([
        {
          id: Date.now().toString(),
          title: 'Main Commands / Code Block',
          language: 'bash',
          code: '',
          description: '',
          note: '',
          imageFile: null
        }
      ]);
    }
  };

  const handleSimulationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simTitle.trim() || !simLaunchCommand.trim()) {
      return alert("Please provide at least a simulation title and primary ROS 2 launch command.");
    }

    setIsSubmitting(true);
    try {
      const slug = simTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substring(2, 7);

      let finalVideoUrl = simVideoUrl.trim() || null;
      if (simVideoFile) {
        const fileExt = simVideoFile.name.split('.').pop();
        const fileName = `sim_video_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: videoUploadErr } = await supabase.storage.from('project_videos').upload(fileName, simVideoFile);
        if (!videoUploadErr) {
          const { data: urlData } = supabase.storage.from('project_videos').getPublicUrl(fileName);
          finalVideoUrl = urlData.publicUrl;
        }
      }

      let finalPreviewImageUrl: string | null = null;
      if (simPreviewImageFile) {
        const fileExt = simPreviewImageFile.name.split('.').pop();
        const fileName = `sim_preview_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: imgErr } = await supabase.storage.from('project_previews').upload(fileName, simPreviewImageFile);
        if (!imgErr) {
          const { data: urlData } = supabase.storage.from('project_previews').getPublicUrl(fileName);
          finalPreviewImageUrl = urlData.publicUrl;
        }
      }

      let finalCodeUrl: string | null = null;
      if (simCodeFile) {
        const fileExt = simCodeFile.name.split('.').pop();
        const fileName = `sim_code_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: codeErr } = await supabase.storage.from('project_code').upload(fileName, simCodeFile);
        if (!codeErr) {
          const { data: urlData } = supabase.storage.from('project_code').getPublicUrl(fileName);
          finalCodeUrl = urlData.publicUrl;
        }
      }

      const sensorsArray = simSensorsInput
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const featuresArray = simFeaturesInput
        .split(',')
        .map(f => f.trim())
        .filter(f => f.length > 0);

      const { error } = await supabase.from('simulations').insert([
        {
          title: simTitle.trim(),
          slug: slug,
          category: simCategory,
          tag: simTag.trim() || `${simSimulator} • ${simRosDistro}`,
          simulator: simSimulator,
          ros_distro: simRosDistro,
          launch_command: simLaunchCommand.trim(),
          description: simDescription.trim(),
          long_description: simLongDescription.trim() || simDescription.trim(),
          sensors: sensorsArray,
          features: featuresArray,
          video_url: finalVideoUrl,
          preview_image_url: finalPreviewImageUrl,
          code_file_url: finalCodeUrl,
          price: parseFloat(simPrice) || 0,
          project_id: simProjectId ? simProjectId : null
        }
      ]);

      if (error) {
        throw new Error(error.message);
      }

      alert("Success! Simulation project uploaded to RoS Inventory.");
      setSimTitle('');
      setSimLaunchCommand('');
      setSimDescription('');
      setSimLongDescription('');
      setSimTag('');
      setSimSensorsInput('');
      setSimFeaturesInput('');
      setSimPrice('0');
      setSimVideoUrl('');
      setSimVideoFile(null);
      setSimPreviewImageFile(null);
      setSimCodeFile(null);
      setSimProjectId('');
    } catch (err: any) {
      console.error(err);
      alert(`Upload Failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminHeaderLayout
      title="Upload Content"
      subtitle="Upload new ROS 2 projects, hardware architectures, code ZIPs, 3D STL models, manual guides, and digital twin simulations."
    >
      <div className="space-y-8">
        <div className="bg-[#0a0a0a] p-10 rounded-xl border border-white/10 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-white/10 pb-6 gap-6">
            <h2 className="text-xl font-semibold text-white tracking-tight">Select Content Type</h2>
            <div className="flex flex-wrap bg-white/5 rounded-md p-1 border border-white/10 gap-1">
              <button 
                onClick={() => setUploadType('project')}
                className={`px-4 py-2 rounded-sm text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer ${uploadType === 'project' ? 'bg-white text-black font-semibold' : 'text-gray-400 hover:text-white'}`}
              >
                <CircuitBoard className="w-4 h-4" />
                Project
              </button>
              <button 
                onClick={() => setUploadType('model')}
                className={`px-4 py-2 rounded-sm text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer ${uploadType === 'model' ? 'bg-white text-black font-semibold' : 'text-gray-400 hover:text-white'}`}
              >
                <Box className="w-4 h-4" />
                3D Model
              </button>
              <button 
                onClick={() => setUploadType('manual')}
                className={`px-4 py-2 rounded-sm text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer ${uploadType === 'manual' ? 'bg-white text-black font-semibold' : 'text-gray-400 hover:text-white'}`}
              >
                <BookOpen className="w-4 h-4" />
                Manual / Guide
              </button>
              <button 
                onClick={() => setUploadType('simulation')}
                className={`px-4 py-2 rounded-sm text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer ${uploadType === 'simulation' ? 'bg-white text-black font-semibold' : 'text-gray-400 hover:text-white'}`}
              >
                <Play className="w-4 h-4" />
                Simulation
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

            {/* Execution Blocks List */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-white tracking-tight">Execution Blocks / Steps</h3>
                  <p className="text-xs text-gray-400">Add commands, scripts, code snippets, notes, and diagrams step-by-step.</p>
                </div>
                <button
                  type="button"
                  onClick={addManualBlock}
                  className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 rounded-md text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Execution Block
                </button>
              </div>

              {manualBlocks.map((block, index) => (
                <div key={block.id} className="p-6 bg-white/5 border border-white/10 rounded-md space-y-4 relative group">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                      <Terminal className="w-4 h-4" /> Block #{index + 1}
                    </span>
                    {manualBlocks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeManualBlock(block.id)}
                        className="text-gray-400 hover:text-red-400 p-1 transition-colors flex items-center gap-1 text-xs"
                        title="Remove Execution Block"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-400 uppercase">Section Title</label>
                      <input 
                        type="text" 
                        value={block.title}
                        onChange={(e) => updateManualBlock(block.id, 'title', e.target.value)}
                        className="w-full bg-black/50 border border-white/20 rounded-md px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-400"
                        placeholder="e.g. Installation Commands"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-400 uppercase">Code Language</label>
                      <select 
                        value={block.language}
                        onChange={(e) => updateManualBlock(block.id, 'language', e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-white/20 rounded-md px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-400"
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
                      value={block.code}
                      onChange={(e) => updateManualBlock(block.id, 'code', e.target.value)}
                      rows={5}
                      className="w-full bg-black/60 font-mono text-emerald-400 border border-white/20 rounded-md p-4 text-xs focus:outline-none focus:border-emerald-400 transition-colors"
                      placeholder="sudo apt update && sudo apt install -y ros-humble-desktop..."
                    ></textarea>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-400 uppercase">Step Note / Alert (Optional)</label>
                    <input 
                      type="text" 
                      value={block.note}
                      onChange={(e) => updateManualBlock(block.id, 'note', e.target.value)}
                      className="w-full bg-black/50 border border-white/20 rounded-md px-4 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-400"
                      placeholder="e.g. Make sure to restart terminal session after sourcing setup.bash"
                    />
                  </div>

                  {/* Section Diagram / Image Upload */}
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-medium text-gray-400 uppercase">Section Diagram / Image (Optional)</label>
                    <label className="border border-dashed border-white/20 rounded-md p-5 text-center hover:border-emerald-400 transition-colors cursor-pointer group flex flex-col items-center justify-center">
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            updateManualBlock(block.id, 'imageFile', e.target.files[0]);
                          }
                        }}
                      />
                      {block.imageFile ? (
                        <div className="text-white flex flex-col items-center">
                          <CheckCircle2 className="w-5 h-5 text-green-500 mb-1" />
                          <p className="text-xs">{block.imageFile.name}</p>
                          <p className="text-[10px] text-gray-400 mt-1">Click to change image</p>
                        </div>
                      ) : (
                        <>
                          <ImageIcon className="w-5 h-5 text-gray-400 mb-1 group-hover:text-emerald-400 transition-colors" />
                          <p className="text-xs text-gray-400 group-hover:text-white transition-colors">Click to upload diagram/image for step #{index + 1} (Optional)</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addManualBlock}
                className="w-full py-3 bg-white/5 border border-dashed border-white/20 hover:border-emerald-400 hover:text-emerald-400 text-gray-400 rounded-md font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Execution Block #{manualBlocks.length + 1}
              </button>
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

        {uploadType === 'simulation' && (
          <form onSubmit={handleSimulationSubmit} className="space-y-8">
            {/* Row 1: Title, Simulator, ROS Distro */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase">Simulation Title *</label>
                <input 
                  type="text" 
                  required
                  value={simTitle}
                  onChange={(e) => setSimTitle(e.target.value)}
                  className="w-full bg-black/50 border border-white/20 rounded-md px-4 py-3 text-white focus:outline-none focus:border-white"
                  placeholder="e.g. Gazebo Warehouse AMR Digital Twin"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase">Simulator Platform *</label>
                <select
                  value={simSimulator}
                  onChange={(e) => setSimSimulator(e.target.value)}
                  className="w-full bg-black/50 border border-white/20 rounded-md px-4 py-3 text-white focus:outline-none focus:border-white"
                >
                  <option value="Gazebo Fortress">Gazebo Fortress</option>
                  <option value="Gazebo Harmonic">Gazebo Harmonic</option>
                  <option value="Gazebo Classic 11">Gazebo Classic 11</option>
                  <option value="RViz2">RViz2</option>
                  <option value="PX4 SITL">PX4 SITL</option>
                  <option value="Webots">Webots</option>
                  <option value="Isaac Sim">Isaac Sim</option>
                  <option value="Custom Simulation">Custom Simulation</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase">Target ROS Distro *</label>
                <select
                  value={simRosDistro}
                  onChange={(e) => setSimRosDistro(e.target.value)}
                  className="w-full bg-black/50 border border-white/20 rounded-md px-4 py-3 text-white focus:outline-none focus:border-white"
                >
                  <option value="ROS 2 Jazzy">ROS 2 Jazzy</option>
                  <option value="ROS 2 Humble">ROS 2 Humble</option>
                  <option value="ROS 2 Iron">ROS 2 Iron</option>
                  <option value="ROS 2 Rolling">ROS 2 Rolling</option>
                  <option value="ROS 1 Noetic">ROS 1 Noetic</option>
                </select>
              </div>
            </div>

            {/* Row 2: Category, Tag Badge, Price, Link Project */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase">Category *</label>
                <select
                  value={simCategory}
                  onChange={(e) => setSimCategory(e.target.value)}
                  className="w-full bg-black/50 border border-white/20 rounded-md px-4 py-3 text-white focus:outline-none focus:border-white"
                >
                  <option value="Gazebo & Gz Sim">Gazebo & Gz Sim</option>
                  <option value="Nav2 & SLAM">Nav2 & SLAM</option>
                  <option value="Robotic Arms">Robotic Arms</option>
                  <option value="Drones & UAVs">Drones & UAVs</option>
                  <option value="General Simulation">General Simulation</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase">Display Tag / Badge</label>
                <input 
                  type="text" 
                  value={simTag}
                  onChange={(e) => setSimTag(e.target.value)}
                  className="w-full bg-black/50 border border-white/20 rounded-md px-4 py-3 text-white focus:outline-none focus:border-white"
                  placeholder="e.g. Gazebo • Nav2 (optional)"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase">Access Price (₹)</label>
                <input 
                  type="number" 
                  min="0"
                  value={simPrice}
                  onChange={(e) => setSimPrice(e.target.value)}
                  className="w-full bg-black/50 border border-white/20 rounded-md px-4 py-3 text-white focus:outline-none focus:border-white font-mono"
                  placeholder="0 for Free"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase">Link To Hardware Project</label>
                <select
                  value={simProjectId}
                  onChange={(e) => setSimProjectId(e.target.value)}
                  className="w-full bg-black/50 border border-white/20 rounded-md px-4 py-3 text-white focus:outline-none focus:border-white text-xs truncate"
                >
                  <option value="">None (Independent Simulation)</option>
                  {availableProjects.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Launch Command */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-400 uppercase flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Primary ROS 2 Launch Command *</span>
                </label>
                <span className="text-[11px] text-gray-400 font-mono">Visitors can copy this with 1 click</span>
              </div>
              <input 
                type="text" 
                required
                value={simLaunchCommand}
                onChange={(e) => setSimLaunchCommand(e.target.value)}
                className="w-full bg-black/70 border border-emerald-500/40 focus:border-emerald-400 rounded-md px-4 py-3 text-emerald-300 font-mono text-xs sm:text-sm focus:outline-none"
                placeholder="e.g. ros2 launch my_robot_bringup gazebo.launch.py headless:=false"
              />
            </div>

            {/* Overview & Detailed Long Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase">Short Overview Description *</label>
                <textarea 
                  rows={4} 
                  required
                  value={simDescription}
                  onChange={(e) => setSimDescription(e.target.value)}
                  className="w-full bg-black/50 border border-white/20 rounded-md p-4 text-white focus:outline-none focus:border-white text-sm"
                  placeholder="Summary of the simulated robot, world layout, and simulation purpose..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase">Detailed Architecture & Docs</label>
                <textarea 
                  rows={4} 
                  value={simLongDescription}
                  onChange={(e) => setSimLongDescription(e.target.value)}
                  className="w-full bg-black/50 border border-white/20 rounded-md p-4 text-white focus:outline-none focus:border-white text-sm"
                  placeholder="In-depth details: controller plugins, coordinate frames (TF tree), topics, parameters..."
                />
              </div>
            </div>

            {/* Sensors and Features (Comma-separated) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase">Simulated Sensors & Telemetry (Comma-Separated)</label>
                <input 
                  type="text" 
                  value={simSensorsInput}
                  onChange={(e) => setSimSensorsInput(e.target.value)}
                  className="w-full bg-black/50 border border-white/20 rounded-md px-4 py-3 text-white focus:outline-none focus:border-white text-xs"
                  placeholder="e.g. 2D RPLidar, Differential Encoders, 9-DOF IMU, Depth Camera"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase">Key Capabilities & Features (Comma-Separated)</label>
                <input 
                  type="text" 
                  value={simFeaturesInput}
                  onChange={(e) => setSimFeaturesInput(e.target.value)}
                  className="w-full bg-black/50 border border-white/20 rounded-md px-4 py-3 text-white focus:outline-none focus:border-white text-xs"
                  placeholder="e.g. Physics Collision Bounds, Keyboard Teleop, Dynamic Costmap, OMPL Trajectory"
                />
              </div>
            </div>

            {/* File Uploads: Video URL / File, Image Preview, Code ZIP */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-white/10">
              {/* Preview Video */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase">Simulation Video (URL or MP4)</label>
                <input 
                  type="text" 
                  value={simVideoUrl}
                  onChange={(e) => setSimVideoUrl(e.target.value)}
                  className="w-full bg-black/50 border border-white/20 rounded-md px-3 py-2 text-white focus:outline-none focus:border-white text-xs mb-2"
                  placeholder="https://youtube.com/watch?v=... or direct URL"
                />
                <label className="border border-dashed border-white/20 rounded-md p-4 text-center hover:border-white/40 transition-colors cursor-pointer group flex flex-col items-center justify-center">
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="video/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSimVideoFile(e.target.files[0]);
                      }
                    }}
                  />
                  {simVideoFile ? (
                    <div className="text-white flex flex-col items-center">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mb-1" />
                      <p className="text-xs truncate max-w-[180px]">{simVideoFile.name}</p>
                    </div>
                  ) : (
                    <>
                      <Video className="w-5 h-5 text-gray-400 mb-1 group-hover:text-white" />
                      <p className="text-xs text-gray-400 group-hover:text-white">Or upload MP4 simulation video</p>
                    </>
                  )}
                </label>
              </div>

              {/* Preview Thumbnail Screenshot */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase">Simulation Screenshot / Thumbnail</label>
                <label className="border border-dashed border-white/20 rounded-md p-6 text-center hover:border-white/40 transition-colors cursor-pointer group flex flex-col items-center justify-center h-[108px]">
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSimPreviewImageFile(e.target.files[0]);
                      }
                    }}
                  />
                  {simPreviewImageFile ? (
                    <div className="text-white flex flex-col items-center">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mb-1" />
                      <p className="text-xs truncate max-w-[180px]">{simPreviewImageFile.name}</p>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="w-5 h-5 text-gray-400 mb-1 group-hover:text-white" />
                      <p className="text-xs text-gray-400 group-hover:text-white">Upload Gazebo/RViz screenshot</p>
                    </>
                  )}
                </label>
              </div>

              {/* Source Code ZIP */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase">Simulation Package (.ZIP)</label>
                <label className="border border-dashed border-white/20 rounded-md p-6 text-center hover:border-white/40 transition-colors cursor-pointer group flex flex-col items-center justify-center h-[108px]">
                  <input 
                    type="file" 
                    className="hidden" 
                    accept=".zip,.tar.gz,.gz"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSimCodeFile(e.target.files[0]);
                      }
                    }}
                  />
                  {simCodeFile ? (
                    <div className="text-white flex flex-col items-center">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mb-1" />
                      <p className="text-xs truncate max-w-[180px]">{simCodeFile.name}</p>
                    </div>
                  ) : (
                    <>
                      <FileBox className="w-5 h-5 text-gray-400 mb-1 group-hover:text-white" />
                      <p className="text-xs text-gray-400 group-hover:text-white">Upload URDF / Gazebo code .ZIP</p>
                    </>
                  )}
                </label>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-white hover:bg-gray-200 disabled:opacity-50 text-black rounded-md font-semibold transition-colors flex justify-center items-center gap-2 cursor-pointer shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Publishing Simulation Project...
                </>
              ) : 'Publish Simulation Project & Commands'}
            </button>
          </form>
        )}
      </div>

      <div className="max-w-4xl mx-auto mt-12 bg-[#0a0a0a] p-10 rounded-xl border border-white/10 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-white/10 pb-6">
          <div className="flex items-center space-x-4">
            <Mail className="text-white w-6 h-6" strokeWidth={1.5} />
            <h2 className="text-2xl font-semibold text-white tracking-tight">
              Contact Messages & Inquiries
            </h2>
          </div>
          <Link
            href="/admin/inbox"
            className="text-xs font-semibold text-[#84cc16] hover:underline flex items-center gap-1.5 shrink-0"
          >
            <span>Open Dedicated Inbox</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
        
        {loadingIdeas ? (
          <p className="text-sm text-gray-400">Loading messages...</p>
        ) : ideas.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No contact messages received yet.</p>
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
