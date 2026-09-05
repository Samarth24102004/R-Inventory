"use client";
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Settings, Edit2, Trash2, Plus, X, Upload, CheckCircle2, Box, CircuitBoard, ImageIcon, FileBox, Video, Cpu, Code2, Film, BarChart3, Lightbulb, BookOpen, Terminal } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import AdminHeaderLayout from '@/components/AdminHeaderLayout';
import { parseProjectDescription, formatProjectDescription } from '@/lib/data';

export default function AdminProjectsPage() {
  const [activeTab, setActiveTab] = useState<'projects' | 'models' | 'manuals'>('projects');
  
  // Projects State
  const [projects, setProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  
  // Models State
  const [models, setModels] = useState<any[]>([]);
  const [loadingModels, setLoadingModels] = useState(true);

  // Manuals State
  const [manualsList, setManualsList] = useState<any[]>([]);
  const [loadingManuals, setLoadingManuals] = useState(true);
  
  // Edit Project Modal State
  const [editingProject, setEditingProject] = useState<any>(null);
  const [editProjectForm, setEditProjectForm] = useState({
    title: '',
    price: '',
    description: '',
    software_description: '',
    hardware_description: '',
    tags: '',
    github_link: '',
    video_url: '',
    preview_video_url: ''
  });
  const [circuitFile, setCircuitFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [codeFile, setCodeFile] = useState<File | null>(null);
  const codeFileRef = useRef<HTMLInputElement>(null);
  const [previewImages, setPreviewImages] = useState<File[]>([]);
  const previewImagesRef = useRef<HTMLInputElement>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const videoFileRef = useRef<HTMLInputElement>(null);
  const [previewVideoFile, setPreviewVideoFile] = useState<File | null>(null);
  const previewVideoFileRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editHardwareList, setEditHardwareList] = useState<{ component: string; quantity: string; description: string; buy_url: string }[]>([]);

  const addEditHardwareRow = () => {
    setEditHardwareList([...editHardwareList, { component: '', quantity: '1', description: '', buy_url: '' }]);
  };

  const updateEditHardwareRow = (index: number, field: string, value: string) => {
    const updated = [...editHardwareList];
    updated[index] = { ...updated[index], [field]: value };
    setEditHardwareList(updated);
  };

  const removeEditHardwareRow = (index: number) => {
    setEditHardwareList(editHardwareList.filter((_, i) => i !== index));
  };

  // Quick Video Modal State
  const [quickVideoProject, setQuickVideoProject] = useState<any>(null);
  const [quickVideoUrl, setQuickVideoUrl] = useState('');
  const [quickPreviewVideoUrl, setQuickPreviewVideoUrl] = useState('');
  const [quickVideoFile, setQuickVideoFile] = useState<File | null>(null);
  const quickVideoFileRef = useRef<HTMLInputElement>(null);
  const [quickPreviewVideoFile, setQuickPreviewVideoFile] = useState<File | null>(null);
  const quickPreviewVideoFileRef = useRef<HTMLInputElement>(null);
  const [isQuickVideoSubmitting, setIsQuickVideoSubmitting] = useState(false);

  // Edit Model Modal State
  const [editingModel, setEditingModel] = useState<any>(null);
  const [editModelForm, setEditModelForm] = useState({
    title: '',
    price: '',
    description: ''
  });
  const [isModelSubmitting, setIsModelSubmitting] = useState(false);

  // Edit Manual Modal State
  interface EditManualBlock {
    id: string;
    title: string;
    language: string;
    code: string;
    description: string;
    note: string;
    imageFile: File | null;
    image_url?: string;
  }

  const [editingManual, setEditingManual] = useState<any>(null);
  const [editManualForm, setEditManualForm] = useState({
    title: '',
    category: 'SETUP' as 'SETUP' | 'COMMANDS' | 'HARDWARE' | 'TUTORIALS' | 'TROUBLESHOOTING',
    summary: '',
  });
  const [editManualBlocks, setEditManualBlocks] = useState<EditManualBlock[]>([]);
  const [isManualSubmitting, setIsManualSubmitting] = useState(false);

  const openEditManualModal = (manual: any) => {
    setEditingManual(manual);
    setEditManualForm({
      title: manual.title || '',
      category: manual.category || 'SETUP',
      summary: manual.summary || '',
    });

    const parsedSections = Array.isArray(manual.sections) ? manual.sections : [];
    if (parsedSections.length > 0) {
      setEditManualBlocks(
        parsedSections.map((sec: any, idx: number) => ({
          id: idx.toString() + '_' + Date.now(),
          title: sec.title || `Block #${idx + 1}`,
          language: sec.language || 'bash',
          code: sec.code || '',
          description: sec.description || '',
          note: sec.note || '',
          imageFile: null,
          image_url: sec.image_url || undefined,
        }))
      );
    } else {
      setEditManualBlocks([
        {
          id: '1',
          title: 'Main Commands / Code Block',
          language: 'bash',
          code: manual.content || manual.code || '',
          description: '',
          note: '',
          imageFile: null,
          image_url: undefined,
        }
      ]);
    }
  };

  const addEditManualBlock = () => {
    setEditManualBlocks((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        title: `Execution Block #${prev.length + 1}`,
        language: 'bash',
        code: '',
        description: '',
        note: '',
        imageFile: null,
      }
    ]);
  };

  const updateEditManualBlock = (id: string, field: keyof EditManualBlock, value: any) => {
    setEditManualBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    );
  };

  const removeEditManualBlock = (id: string) => {
    if (editManualBlocks.length <= 1) {
      alert("A manual must have at least one execution block.");
      return;
    }
    setEditManualBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const handleEditManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingManual) return;
    if (!editManualForm.title || !editManualForm.summary) {
      return alert("Please fill in manual title and summary");
    }

    setIsManualSubmitting(true);
    const slug = editManualForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const categoryLabels: Record<string, string> = {
      SETUP: 'SETUP',
      COMMANDS: 'USEFUL COMMANDS',
      HARDWARE: 'HARDWARE & EMBEDDED',
      TUTORIALS: 'TUTORIALS',
      TROUBLESHOOTING: 'TROUBLESHOOTING'
    };

    const sectionsData = await Promise.all(
      editManualBlocks.map(async (block, index) => {
        let blockImageUrl: string | undefined = block.image_url;
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
          description: block.description.trim() || (index === 0 ? editManualForm.summary : undefined),
          note: block.note.trim() || undefined,
          image_url: blockImageUrl,
          code: block.code.trim() || undefined,
          language: block.language || 'bash'
        };
      })
    );

    const { data, error } = await supabase
      .from('manuals')
      .update({
        title: editManualForm.title,
        slug: slug,
        category: editManualForm.category,
        category_label: categoryLabels[editManualForm.category] || editManualForm.category,
        summary: editManualForm.summary,
        sections: sectionsData
      })
      .eq('id', editingManual.id)
      .select();

    setIsManualSubmitting(false);

    if (error) {
      alert(`Update failed: ${error.message}`);
    } else {
      setEditingManual(null);
      fetchManualsList();
    }
  };

  const fetchProjects = async () => {
    setLoadingProjects(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error(error);
      alert("Failed to load projects");
    } else {
      setProjects(data || []);
    }
    setLoadingProjects(false);
  };

  const fetchModels = async () => {
    setLoadingModels(true);
    const { data, error } = await supabase
      .from('stl_models')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error(error);
      alert("Failed to load 3D models");
    } else {
      setModels(data || []);
    }
    setLoadingModels(false);
  };

  const fetchManualsList = async () => {
    setLoadingManuals(true);
    const { data, error } = await supabase
      .from('manuals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setManualsList(data || []);
    }
    setLoadingManuals(false);
  };

  useEffect(() => {
    fetchProjects();
    fetchModels();
    fetchManualsList();
  }, []);

  const handleDeleteProject = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) return;
    
    // First, delete related purchases so we don't hit foreign key constraints
    await supabase.from('purchases').delete().eq('project_id', id);
    
    // Then delete the project
    const { error } = await supabase.from('projects').delete().eq('id', id);
    
    if (error) {
      alert(`Delete failed: ${error.message}`);
    } else {
      setProjects(projects.filter(p => p.id !== id));
    }
  };

  const handleDeleteModel = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this 3D model? This cannot be undone.")) return;
    
    // Also delete purchases for models if they exist
    await supabase.from('purchases').delete().eq('model_id', id);

    const { error } = await supabase.from('stl_models').delete().eq('id', id);
    
    if (error) {
      alert(`Delete failed: ${error.message}`);
    } else {
      setModels(models.filter(m => m.id !== id));
    }
  };

  const handleDeleteManual = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this manual guide? This cannot be undone.")) return;

    const { error } = await supabase.from('manuals').delete().eq('id', id);

    if (error) {
      alert(`Delete failed: ${error.message}`);
    } else {
      setManualsList(manualsList.filter(m => m.id !== id));
    }
  };

  const openEditProjectModal = (project: any) => {
    setEditingProject(project);
    const parsed = parseProjectDescription(project.description || '');

    let overviewText = project.description || '';
    if (overviewText.includes('SOFTWARE:') || overviewText.includes('[SOFTWARE]')) {
      const beforeMatch = overviewText.match(/^([\s\S]*?)(?=(?:\[SOFTWARE\]|SOFTWARE DESCRIPTION|SOFTWARE:))/i);
      if (beforeMatch && beforeMatch[1].trim()) {
        overviewText = beforeMatch[1].trim();
      } else {
        overviewText = '';
      }
    }

    setEditProjectForm({
      title: project.title || '',
      price: project.price?.toString() || '0',
      description: overviewText,
      software_description: project.software_description || parsed.software || '',
      hardware_description: project.hardware_description || parsed.hardware || '',
      tags: Array.isArray(project.tags) ? project.tags.join(', ') : (project.tags || ''),
      github_link: project.github_link || '',
      video_url: project.video_url || project.videoUrl || '',
      preview_video_url: project.preview_video_url || project.previewVideoUrl || ''
    });

    const hwArray = Array.isArray(project.hardware)
      ? project.hardware.map((h: any) => ({
          component: h.component || '',
          quantity: h.quantity?.toString() || '1',
          description: h.description || '',
          buy_url: h.buy_url || h.buyUrl || ''
        }))
      : [];
    setEditHardwareList(hwArray.length > 0 ? hwArray : [{ component: '', quantity: '1', description: '', buy_url: '' }]);

    setCircuitFile(null);
    setCodeFile(null);
    setPreviewImages([]);
    setVideoFile(null);
  };

  const openQuickVideoModal = (project: any) => {
    setQuickVideoProject(project);
    setQuickVideoUrl(project.video_url || project.videoUrl || '');
    setQuickPreviewVideoUrl(project.preview_video_url || project.previewVideoUrl || '');
    setQuickVideoFile(null);
    setQuickPreviewVideoFile(null);
  };

  const handleQuickVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickVideoProject) return;

    setIsQuickVideoSubmitting(true);
    let finalUrl = quickVideoUrl.trim();
    let finalPreviewUrl = quickPreviewVideoUrl.trim();

    if (quickVideoFile) {
      const fileExt = quickVideoFile.name.split('.').pop();
      const fileName = `video_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: videoUploadErr } = await supabase.storage
        .from('project_videos')
        .upload(fileName, quickVideoFile);
        
      if (!videoUploadErr) {
        const { data: urlData } = supabase.storage
          .from('project_videos')
          .getPublicUrl(fileName);
        finalUrl = urlData.publicUrl;
      } else {
        const { error: fallbackErr } = await supabase.storage
          .from('diagrams')
          .upload(fileName, quickVideoFile);
        if (!fallbackErr) {
          const { data: fallbackUrlData } = supabase.storage
            .from('diagrams')
            .getPublicUrl(fileName);
          finalUrl = fallbackUrlData.publicUrl;
        }
      }
    }

    if (quickPreviewVideoFile) {
      const fileExt = quickPreviewVideoFile.name.split('.').pop();
      const fileName = `preview_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: previewUploadErr } = await supabase.storage
        .from('project_videos')
        .upload(fileName, quickPreviewVideoFile);
        
      if (!previewUploadErr) {
        const { data: urlData } = supabase.storage
          .from('project_videos')
          .getPublicUrl(fileName);
        finalPreviewUrl = urlData.publicUrl;
      } else {
        const { error: fallbackErr } = await supabase.storage
          .from('diagrams')
          .upload(fileName, quickPreviewVideoFile);
        if (!fallbackErr) {
          const { data: fallbackUrlData } = supabase.storage
            .from('diagrams')
            .getPublicUrl(fileName);
          finalPreviewUrl = fallbackUrlData.publicUrl;
        }
      }
    }

    const { error } = await supabase
      .from('projects')
      .update({ 
        video_url: finalUrl || null,
        preview_video_url: finalPreviewUrl || null
      })
      .eq('id', quickVideoProject.id);

    setIsQuickVideoSubmitting(false);

    if (error) {
      alert(`Failed to update videos: ${error.message}`);
    } else {
      setQuickVideoProject(null);
      fetchProjects();
    }
  };

  const openEditModelModal = (model: any) => {
    setEditingModel(model);
    setEditModelForm({
      title: model.title || '',
      price: model.price?.toString() || '0',
      description: model.description || ''
    });
  };

  const handleEditProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let finalVideoUrl = editProjectForm.video_url;

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

    let finalPreviewVideoUrl = editProjectForm.preview_video_url;

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
    
    let github_link_url = editProjectForm.github_link;

    if (codeFile) {
      if (editingProject.github_link && editingProject.github_link.includes('supabase.co')) {
        try {
          const urlObj = new URL(editingProject.github_link);
          const pathSegments = urlObj.pathname.split('/');
          const fileName = pathSegments[pathSegments.length - 1];
          if (fileName) {
            await supabase.storage.from('project_code').remove([fileName]);
          }
        } catch (e) {
          console.error("Failed to delete old code zip", e);
        }
      }

      const fileExt = codeFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('project_code')
        .upload(fileName, codeFile);
        
      if (uploadError) {
        alert(`Failed to upload new code file: ${uploadError.message}`);
        setIsSubmitting(false);
        return;
      }
      
      const { data: urlData } = supabase.storage
        .from('project_code')
        .getPublicUrl(fileName);
        
      github_link_url = urlData.publicUrl;
    }

    let circuit_diagram_url = editingProject.circuit_diagram_url;
    
    if (circuitFile) {
      // 1. Delete old file if it exists
      if (circuit_diagram_url) {
        try {
          const urlObj = new URL(circuit_diagram_url);
          const pathSegments = urlObj.pathname.split('/');
          const fileName = pathSegments[pathSegments.length - 1];
          if (fileName) {
            await supabase.storage.from('diagrams').remove([fileName]);
          }
        } catch (e) {
          console.error("Failed to parse or delete old diagram", e);
        }
      }

      // 2. Upload new file
      const fileExt = circuitFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('diagrams')
        .upload(fileName, circuitFile);
        
      if (uploadError) {
        alert(`Failed to upload new diagram: ${uploadError.message}`);
        setIsSubmitting(false);
        return;
      }
      
      const { data: urlData } = supabase.storage
        .from('diagrams')
        .getPublicUrl(fileName);
        
      circuit_diagram_url = urlData.publicUrl;
    }
    
    // 3. Upload new preview images and append them
    let current_preview_images: string[] = editingProject.preview_images || [];
    if (previewImages.length > 0) {
      for (const img of previewImages) {
        const fileExt = img.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('project_previews')
          .upload(fileName, img);
          
        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('project_previews')
            .getPublicUrl(fileName);
          current_preview_images.push(urlData.publicUrl);
        } else {
          console.error("Preview image upload error:", uploadError);
        }
      }
    }
    
    const finalOverview = editProjectForm.description.trim() || formatProjectDescription(
      editProjectForm.software_description,
      editProjectForm.hardware_description
    );

    const shortDesc = (
      editProjectForm.description.trim() ||
      editProjectForm.software_description.trim() ||
      editProjectForm.hardware_description.trim()
    ).substring(0, 120) + '...';

    const tagsArray = editProjectForm.tags
      .split(',')
      .map((t: string) => t.trim())
      .filter((t: string) => t.length > 0);

    const cleanHardware = editHardwareList
      .filter(h => h.component.trim() !== '')
      .map(h => ({
        component: h.component.trim(),
        quantity: h.quantity || '1',
        description: h.description.trim(),
        buy_url: h.buy_url.trim()
      }));

    const { data, error } = await supabase
      .from('projects')
      .update({
        title: editProjectForm.title,
        price: parseFloat(editProjectForm.price) || 0,
        description: finalOverview,
        software_description: editProjectForm.software_description,
        hardware_description: editProjectForm.hardware_description,
        short_description: shortDesc,
        tags: tagsArray,
        hardware: cleanHardware,
        github_link: github_link_url,
        video_url: finalVideoUrl,
        preview_video_url: finalPreviewVideoUrl,
        circuit_diagram_url: circuit_diagram_url,
        preview_images: current_preview_images
      })
      .eq('id', editingProject.id)
      .select();
      
    setIsSubmitting(false);
    
    if (error) {
      alert(`Update failed: ${error.message}`);
    } else if (!data || data.length === 0) {
      alert("Update failed: 0 rows affected. Check Supabase RLS policies on 'projects'.");
    } else {
      setEditingProject(null);
      fetchProjects();
    }
  };

  const handleEditModelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsModelSubmitting(true);
    
    const { data, error } = await supabase
      .from('stl_models')
      .update({
        title: editModelForm.title,
        price: parseFloat(editModelForm.price) || 0,
        description: editModelForm.description
      })
      .eq('id', editingModel.id)
      .select();
      
    setIsModelSubmitting(false);
    
    if (error) {
      alert(`Update failed: ${error.message}`);
    } else if (!data || data.length === 0) {
      alert("Update failed: 0 rows affected. Check RLS policies for 'stl_models'.");
    } else {
      setEditingModel(null);
      fetchModels();
    }
  };

  return (
    <AdminHeaderLayout
      title="Manage Content"
      subtitle="Edit, update video links, or delete existing ROS 2 projects and 3D STL models."
    >
      <div className="space-y-8">

        {/* Sub-Tabs: Projects / 3D Models / Manuals */}
        <div className="flex space-x-3 mb-6">
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors border flex items-center gap-2 ${
              activeTab === 'projects'
                ? 'bg-white text-black border-white'
                : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            <CircuitBoard className="w-3.5 h-3.5" />
            Projects ({projects.length})
          </button>
          <button
            onClick={() => setActiveTab('models')}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors border flex items-center gap-2 ${
              activeTab === 'models'
                ? 'bg-white text-black border-white'
                : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            3D Models ({models.length})
          </button>
          <button
            onClick={() => setActiveTab('manuals')}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors border flex items-center gap-2 ${
              activeTab === 'manuals'
                ? 'bg-white text-black border-white'
                : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Manuals ({manualsList.length})
          </button>
        </div>

        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden shadow-lg">
          
          {/* Projects Tab */}
          {activeTab === 'projects' && (
            loadingProjects ? (
              <div className="p-12 text-center text-gray-500">Loading projects...</div>
            ) : projects.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                No projects found. <Link href="/admin/upload" className="text-white underline">Upload your first project</Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4 text-xs font-medium tracking-wider text-gray-400 uppercase">Project</th>
                      <th className="px-6 py-4 text-xs font-medium tracking-wider text-gray-400 uppercase">Price</th>
                      <th className="px-6 py-4 text-xs font-medium tracking-wider text-gray-400 uppercase">Video</th>
                      <th className="px-6 py-4 text-xs font-medium tracking-wider text-gray-400 uppercase">Date</th>
                      <th className="px-6 py-4 text-xs font-medium tracking-wider text-gray-400 uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {projects.map((project) => (
                      <tr key={project.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-medium text-white">{project.title}</div>
                          <div className="text-xs text-gray-500 truncate max-w-md">{project.slug}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-400/10 text-green-400 border border-green-400/20">
                            ₹{project.price}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => openQuickVideoModal(project)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                              (project.video_url || project.videoUrl)
                                ? 'bg-purple-500/10 text-purple-400 border-purple-500/30 hover:bg-purple-500/20'
                                : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            <Video className="w-3.5 h-3.5" />
                            {(project.video_url || project.videoUrl) ? 'Has Video' : '+ Add Video'}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">
                          {new Date(project.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button 
                              onClick={() => openQuickVideoModal(project)}
                              className="p-2 text-gray-400 hover:text-purple-400 hover:bg-purple-400/10 rounded transition-colors"
                              title="Add/Edit Video"
                            >
                              <Video className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => openEditProjectModal(project)}
                              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                              title="Edit Project"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteProject(project.id)}
                              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                              title="Delete Project"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {/* Models Tab */}
          {activeTab === 'models' && (
            loadingModels ? (
              <div className="p-12 text-center text-gray-500">Loading 3D models...</div>
            ) : models.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                No 3D models found. <Link href="/admin/upload" className="text-white underline">Upload your first 3D model</Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4 text-xs font-medium tracking-wider text-gray-400 uppercase">Model</th>
                      <th className="px-6 py-4 text-xs font-medium tracking-wider text-gray-400 uppercase">Price</th>
                      <th className="px-6 py-4 text-xs font-medium tracking-wider text-gray-400 uppercase">Date</th>
                      <th className="px-6 py-4 text-xs font-medium tracking-wider text-gray-400 uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {models.map((model) => (
                      <tr key={model.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4 flex items-center space-x-4">
                          {model.image_url ? (
                            <Image src={model.image_url} alt={model.title} width={40} height={40} className="w-10 h-10 object-cover rounded-md bg-white/10" />
                          ) : (
                            <div className="w-10 h-10 rounded-md bg-white/10 flex items-center justify-center">
                              <Box className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-white">{model.title}</div>
                            <div className="text-xs text-gray-500 truncate max-w-md">{model.stl_file_path}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-400/10 text-blue-400 border border-blue-400/20">
                            ₹{model.price}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">
                          {new Date(model.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button 
                              onClick={() => openEditModelModal(model)}
                              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteModel(model.id)}
                              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {/* Manuals Tab */}
          {activeTab === 'manuals' && (
            loadingManuals ? (
              <div className="p-12 text-center text-gray-500">Loading manuals...</div>
            ) : manualsList.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                No manuals found. <Link href="/admin/upload" className="text-white underline font-semibold">Publish your first manual guide</Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4 text-xs font-medium tracking-wider text-gray-400 uppercase">Manual Title</th>
                      <th className="px-6 py-4 text-xs font-medium tracking-wider text-gray-400 uppercase">Category</th>
                      <th className="px-6 py-4 text-xs font-medium tracking-wider text-gray-400 uppercase">Date</th>
                      <th className="px-6 py-4 text-xs font-medium tracking-wider text-gray-400 uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {manualsList.map((manual) => (
                      <tr key={manual.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-medium text-white">{manual.title}</div>
                          <div className="text-xs text-gray-500 truncate max-w-md">{manual.summary}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-[#84cc16]/10 text-[#84cc16] border border-[#84cc16]/20">
                            {manual.category || 'SETUP'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">
                          {new Date(manual.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button 
                              onClick={() => openEditManualModal(manual)}
                              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                              title="Edit Manual & Execution Blocks"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteManual(manual.id)}
                              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                              title="Delete Manual"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>

      {/* Edit Project Modal */}
      {editingProject && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-white/20 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button 
              onClick={() => setEditingProject(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="p-8 border-b border-white/10">
              <h2 className="text-2xl font-semibold">Edit Project</h2>
              <p className="text-gray-400 text-sm mt-1">Make changes to {editingProject.title}</p>
            </div>
            
            <form onSubmit={handleEditProjectSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Title</label>
                  <input 
                    type="text" 
                    value={editProjectForm.title}
                    onChange={(e) => setEditProjectForm({...editProjectForm, title: e.target.value})}
                    className="w-full bg-transparent border border-white/20 rounded-md px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Price (INR)</label>
                  <input 
                    type="number" 
                    value={editProjectForm.price}
                    onChange={(e) => setEditProjectForm({...editProjectForm, price: e.target.value})}
                    className="w-full bg-transparent border border-white/20 rounded-md px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Custom Tags (Comma Separated)</label>
                <input 
                  type="text" 
                  value={editProjectForm.tags}
                  onChange={(e) => setEditProjectForm({...editProjectForm, tags: e.target.value})}
                  className="w-full bg-transparent border border-white/20 rounded-md px-4 py-3 text-white focus:outline-none focus:border-white transition-colors text-sm"
                  placeholder="e.g. SLAM, LiDAR, Python, Autonomous"
                />
              </div>

              <div className="space-y-4 p-4 border border-white/10 rounded-md">
                <div className="flex items-center space-x-3">
                  <FileBox className="text-white w-5 h-5" />
                  <h3 className="text-sm font-medium text-white">Source Code (.zip)</h3>
                </div>
                {editProjectForm.github_link && (
                  <p className="text-xs text-gray-400 break-all">
                    Current: <a href={editProjectForm.github_link} target="_blank" className="text-blue-400 hover:underline">{editProjectForm.github_link}</a>
                  </p>
                )}
                
                <div 
                  className="border border-dashed border-white/20 rounded-md p-6 text-center hover:border-white transition-colors cursor-pointer group"
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
                      <CheckCircle2 className="w-5 h-5 text-green-500 mb-2" />
                      <p className="text-xs">{codeFile?.name}</p>
                    </div>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 text-gray-400 mx-auto mb-1 group-hover:text-white transition-colors" />
                      <p className="text-xs text-gray-400 group-hover:text-white transition-colors">Upload new .ZIP to replace current</p>
                    </>
                  )}
                </div>
              </div>

              {/* Main Project Overview Text */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-2">
                <div className="flex items-center space-x-2 text-white mb-1">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <label className="text-xs font-semibold tracking-wider uppercase text-white">PROJECT OVERVIEW</label>
                </div>
                <p className="text-[11px] text-gray-400">Main overview description of the project displayed in full under the "Project Overview" section on the project detail page.</p>
                <textarea 
                  value={editProjectForm.description}
                  onChange={(e) => setEditProjectForm({...editProjectForm, description: e.target.value})}
                  rows={5}
                  className="w-full bg-black/50 border border-white/20 rounded-md px-3 py-2 text-white focus:outline-none focus:border-white transition-colors resize-y text-xs"
                  placeholder="Main project overview description..."
                />
              </div>

              {/* Software & Hardware Descriptions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 p-4 bg-white/5 border border-white/10 rounded-lg">
                  <div className="flex items-center space-x-2 text-white mb-1">
                    <Code2 className="w-4 h-4 text-white" />
                    <label className="text-xs font-semibold tracking-wider uppercase text-white">SOFTWARE Description</label>
                  </div>
                  <textarea 
                    value={editProjectForm.software_description}
                    onChange={(e) => setEditProjectForm({...editProjectForm, software_description: e.target.value})}
                    rows={5}
                    className="w-full bg-black/50 border border-white/20 rounded-md px-3 py-2 text-white focus:outline-none focus:border-white transition-colors resize-none text-xs"
                    placeholder="ROS 2 nodes, packages, launch files, algorithms..."
                  />
                </div>

                <div className="space-y-2 p-4 bg-white/5 border border-white/10 rounded-lg">
                  <div className="flex items-center space-x-2 text-white mb-1">
                    <Cpu className="w-4 h-4 text-white" />
                    <label className="text-xs font-semibold tracking-wider uppercase text-white">HARDWARE Description</label>
                  </div>
                  <textarea 
                    value={editProjectForm.hardware_description}
                    onChange={(e) => setEditProjectForm({...editProjectForm, hardware_description: e.target.value})}
                    rows={5}
                    className="w-full bg-black/50 border border-white/20 rounded-md px-3 py-2 text-white focus:outline-none focus:border-white transition-colors resize-none text-xs"
                    placeholder="Compute unit, microcontrollers, sensors, wiring..."
                  />
                </div>
              </div>

              {/* Hardware Parts & Store Links */}
              <div className="space-y-4 p-4 border border-white/10 rounded-md bg-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Cpu className="w-4 h-4 text-white" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-white">Hardware Parts & Store Links</h3>
                  </div>
                  <button
                    type="button"
                    onClick={addEditHardwareRow}
                    className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Part
                  </button>
                </div>

                <div className="space-y-3">
                  {editHardwareList.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2 p-3 bg-black/50 border border-white/10 rounded-md items-center">
                      <div className="md:col-span-4">
                        <label className="text-[9px] text-gray-400 uppercase block mb-1">Part Name</label>
                        <input
                          type="text"
                          value={item.component}
                          onChange={(e) => updateEditHardwareRow(index, 'component', e.target.value)}
                          className="w-full bg-black/60 border border-white/20 rounded px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-white"
                          placeholder="e.g. RPLidar A1"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-[9px] text-gray-400 uppercase block mb-1">Qty</label>
                        <input
                          type="text"
                          value={item.quantity}
                          onChange={(e) => updateEditHardwareRow(index, 'quantity', e.target.value)}
                          className="w-full bg-black/60 border border-white/20 rounded px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-white"
                          placeholder="1"
                        />
                      </div>
                      <div className="md:col-span-5">
                        <label className="text-[9px] text-gray-400 uppercase block mb-1">Buy Link (URL)</label>
                        <input
                          type="url"
                          value={item.buy_url}
                          onChange={(e) => updateEditHardwareRow(index, 'buy_url', e.target.value)}
                          className="w-full bg-black/60 border border-white/20 rounded px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-white"
                          placeholder="https://..."
                        />
                      </div>
                      <div className="md:col-span-1 flex justify-end pt-1 md:pt-0">
                        {editHardwareList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeEditHardwareRow(index)}
                            className="text-gray-400 hover:text-red-400 p-1"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Video Section */}
              <div className="space-y-4 p-4 border border-white/10 rounded-md bg-white/5">
                <div className="flex items-center space-x-3">
                  <Video className="text-purple-400 w-5 h-5" />
                  <h3 className="text-sm font-medium text-white">Project & Preview Videos</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1">Main Video Link (YouTube / MP4)</label>
                    <input 
                      type="url"
                      value={editProjectForm.video_url}
                      onChange={(e) => setEditProjectForm({...editProjectForm, video_url: e.target.value})}
                      className="w-full bg-black/50 border border-white/20 rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-purple-400 transition-colors text-xs"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-purple-300 uppercase tracking-wider block mb-1">Preview Video Link (YouTube / MP4)</label>
                    <input 
                      type="url"
                      value={editProjectForm.preview_video_url}
                      onChange={(e) => setEditProjectForm({...editProjectForm, preview_video_url: e.target.value})}
                      className="w-full bg-black/50 border border-purple-500/40 rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-purple-400 transition-colors text-xs"
                      placeholder="https://www.youtube.com/watch?v=... (Card Preview Video)"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div 
                    className="border border-dashed border-white/20 rounded-md p-4 text-center hover:border-purple-400 transition-colors cursor-pointer group"
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
                        <CheckCircle2 className="w-5 h-5 text-green-500 mb-1" />
                        <p className="text-xs font-medium">{videoFile?.name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Will replace main video</p>
                      </div>
                    ) : (
                      <>
                        <Film className="w-5 h-5 text-gray-400 mx-auto mb-1 group-hover:text-purple-400 transition-colors" />
                        <p className="text-xs text-gray-400 group-hover:text-white transition-colors">Upload main video file (.mp4)</p>
                      </>
                    )}
                  </div>

                  <div 
                    className="border border-dashed border-white/20 rounded-md p-4 text-center hover:border-purple-400 transition-colors cursor-pointer group"
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
                        <CheckCircle2 className="w-5 h-5 text-green-500 mb-1" />
                        <p className="text-xs font-medium">{previewVideoFile?.name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Will replace preview video</p>
                      </div>
                    ) : (
                      <>
                        <Film className="w-5 h-5 text-purple-400 mx-auto mb-1 group-hover:text-white transition-colors" />
                        <p className="text-xs text-purple-300 group-hover:text-white transition-colors">Upload preview video file (.mp4)</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Circuit Diagram (Optional)</label>
                <div 
                  className="border border-dashed border-white/20 rounded-md p-6 text-center hover:border-white transition-colors cursor-pointer group"
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
                      <CheckCircle2 className="w-5 h-5 text-green-500 mb-2" />
                      <p className="text-sm">{circuitFile?.name}</p>
                      <p className="text-xs text-gray-400 mt-1">Will replace current diagram</p>
                    </div>
                  ) : editingProject.circuit_diagram_url ? (
                    <div className="text-white flex flex-col items-center">
                      <CheckCircle2 className="w-5 h-5 text-blue-400 mb-2" />
                      <p className="text-sm">Has Existing Diagram</p>
                      <p className="text-xs text-gray-400 mt-1">Click to upload a replacement</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-gray-400 mx-auto mb-2 group-hover:text-white transition-colors" />
                      <p className="text-sm text-gray-400 group-hover:text-white transition-colors">Click to add a circuit diagram</p>
                    </>
                  )}
                </div>
              </div>

              {/* Preview Images Upload Section */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Preview Images</label>
                <div 
                  className="border border-dashed border-white/20 rounded-md p-6 text-center hover:border-white transition-colors cursor-pointer group"
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
                      <CheckCircle2 className="w-5 h-5 text-green-500 mb-2" />
                      <p className="text-sm">{previewImages.length} image(s) selected</p>
                      <p className="text-xs text-gray-400 mt-1">These will be added to the project</p>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="w-5 h-5 text-gray-400 mx-auto mb-2 group-hover:text-white transition-colors" />
                      <p className="text-sm text-gray-400 group-hover:text-white transition-colors">Click to upload new images</p>
                      <p className="text-[10px] text-gray-500 mt-1">They will be added to the existing images</p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-white/10">
                <button 
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-6 py-3 bg-transparent text-white hover:bg-white/5 rounded-md font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-white text-black hover:bg-gray-200 disabled:opacity-50 rounded-md font-medium transition-colors"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Model Modal */}
      {editingModel && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-white/20 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button 
              onClick={() => setEditingModel(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="p-8 border-b border-white/10">
              <h2 className="text-2xl font-semibold">Edit 3D Model</h2>
              <p className="text-gray-400 text-sm mt-1">Make changes to {editingModel.title}</p>
            </div>
            
            <form onSubmit={handleEditModelSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Title</label>
                  <input 
                    type="text" 
                    value={editModelForm.title}
                    onChange={(e) => setEditModelForm({...editModelForm, title: e.target.value})}
                    className="w-full bg-transparent border border-white/20 rounded-md px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Price (INR)</label>
                  <input 
                    type="number" 
                    value={editModelForm.price}
                    onChange={(e) => setEditModelForm({...editModelForm, price: e.target.value})}
                    className="w-full bg-transparent border border-white/20 rounded-md px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Description</label>
                <textarea 
                  value={editModelForm.description}
                  onChange={(e) => setEditModelForm({...editModelForm, description: e.target.value})}
                  rows={6}
                  className="w-full bg-transparent border border-white/20 rounded-md px-4 py-3 text-white focus:outline-none focus:border-white transition-colors resize-none"
                  required
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-white/10">
                <button 
                  type="button"
                  onClick={() => setEditingModel(null)}
                  className="px-6 py-3 bg-transparent text-white hover:bg-white/5 rounded-md font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isModelSubmitting}
                  className="px-6 py-3 bg-white text-black hover:bg-gray-200 disabled:opacity-50 rounded-md font-medium transition-colors"
                >
                  {isModelSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Add/Edit Video Modal */}
      {quickVideoProject && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-white/20 rounded-2xl w-full max-w-lg overflow-y-auto shadow-2xl relative p-6">
            <button 
              onClick={() => setQuickVideoProject(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="mb-6 flex items-center space-x-3">
              <Video className="text-purple-400 w-6 h-6" />
              <div>
                <h2 className="text-xl font-semibold text-white">Add / Edit Video</h2>
                <p className="text-gray-400 text-xs mt-0.5">{quickVideoProject.title}</p>
              </div>
            </div>

            <form onSubmit={handleQuickVideoSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1">Main Video Link (YouTube / Vimeo / MP4)</label>
                <input 
                  type="url"
                  value={quickVideoUrl}
                  onChange={(e) => setQuickVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... or https://example.com/video.mp4"
                  className="w-full bg-black/50 border border-white/20 rounded-md px-4 py-3 text-white focus:outline-none focus:border-purple-400 transition-colors text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1">Preview Video Link (YouTube / MP4)</label>
                <input 
                  type="url"
                  value={quickPreviewVideoUrl}
                  onChange={(e) => setQuickPreviewVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... or https://example.com/preview.mp4"
                  className="w-full bg-black/50 border border-white/20 rounded-md px-4 py-3 text-white focus:outline-none focus:border-purple-400 transition-colors text-sm"
                />
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-500 uppercase tracking-wider">
                <div className="h-px bg-white/10 flex-1"></div>
                <span>OR Upload Video Files</span>
                <div className="h-px bg-white/10 flex-1"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  className="border border-dashed border-white/20 rounded-md p-4 text-center hover:border-purple-400 transition-colors cursor-pointer group"
                  onClick={() => quickVideoFileRef.current?.click()}
                >
                  <input 
                    type="file" 
                    ref={quickVideoFileRef} 
                    className="hidden" 
                    accept="video/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setQuickVideoFile(e.target.files[0]);
                      }
                    }}
                  />
                  {quickVideoFile ? (
                    <div className="text-white flex flex-col items-center">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mb-1" />
                      <p className="text-xs font-medium">{quickVideoFile?.name}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Main video selected</p>
                    </div>
                  ) : (
                    <>
                      <Film className="w-5 h-5 text-gray-400 mx-auto mb-1 group-hover:text-purple-400 transition-colors" />
                      <p className="text-xs text-gray-400 group-hover:text-white transition-colors">Upload main video file</p>
                    </>
                  )}
                </div>

                <div 
                  className="border border-dashed border-white/20 rounded-md p-4 text-center hover:border-purple-400 transition-colors cursor-pointer group"
                  onClick={() => quickPreviewVideoFileRef.current?.click()}
                >
                  <input 
                    type="file" 
                    ref={quickPreviewVideoFileRef} 
                    className="hidden" 
                    accept="video/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setQuickPreviewVideoFile(e.target.files[0]);
                      }
                    }}
                  />
                  {quickPreviewVideoFile ? (
                    <div className="text-white flex flex-col items-center">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mb-1" />
                      <p className="text-xs font-medium">{quickPreviewVideoFile?.name}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Preview video selected</p>
                    </div>
                  ) : (
                    <>
                      <Film className="w-5 h-5 text-gray-400 mx-auto mb-1 group-hover:text-purple-400 transition-colors" />
                      <p className="text-xs text-gray-400 group-hover:text-white transition-colors">Upload preview video file</p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-white/10">
                <button 
                  type="button"
                  onClick={() => setQuickVideoProject(null)}
                  className="px-4 py-2 bg-transparent text-white hover:bg-white/5 rounded-md text-sm transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isQuickVideoSubmitting}
                  className="px-5 py-2 bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-50 rounded-md text-sm font-medium transition-colors"
                >
                  {isQuickVideoSubmitting ? 'Saving...' : 'Save Video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      </div>

      {/* Edit Manual Modal */}
      {editingManual && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-white/20 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative p-8">
            <button 
              onClick={() => setEditingManual(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="flex items-center space-x-3 mb-6 border-b border-white/10 pb-4">
              <BookOpen className="text-[#84cc16] w-6 h-6" />
              <div>
                <h2 className="text-xl font-bold text-white">Edit Manual / Guide</h2>
                <p className="text-xs text-gray-400">Update title, category, summary, and manage execution blocks.</p>
              </div>
            </div>

            <form onSubmit={handleEditManualSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Manual Title</label>
                  <input 
                    type="text"
                    value={editManualForm.title}
                    onChange={(e) => setEditManualForm({ ...editManualForm, title: e.target.value })}
                    className="w-full bg-black/50 border border-white/20 rounded-md px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#84cc16]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Category</label>
                  <select
                    value={editManualForm.category}
                    onChange={(e) => setEditManualForm({ ...editManualForm, category: e.target.value as any })}
                    className="w-full bg-[#0a0a0a] border border-white/20 rounded-md px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#84cc16]"
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
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Manual Summary</label>
                <textarea 
                  value={editManualForm.summary}
                  onChange={(e) => setEditManualForm({ ...editManualForm, summary: e.target.value })}
                  rows={3}
                  className="w-full bg-black/50 border border-white/20 rounded-md p-4 text-white text-sm focus:outline-none focus:border-[#84cc16]"
                  required
                ></textarea>
              </div>

              {/* Execution Blocks Section */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <h3 className="text-base font-semibold text-white">Execution Blocks / Steps</h3>
                    <p className="text-xs text-gray-400">Add or delete execution blocks for this manual guide.</p>
                  </div>
                  <button
                    type="button"
                    onClick={addEditManualBlock}
                    className="px-3 py-1.5 bg-[#84cc16]/10 border border-[#84cc16]/30 text-[#84cc16] hover:bg-[#84cc16]/20 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add Execution Block
                  </button>
                </div>

                <div className="space-y-6">
                  {editManualBlocks.map((block, index) => (
                    <div key={block.id} className="p-5 bg-white/5 border border-white/10 rounded-lg space-y-4 relative">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#84cc16] flex items-center gap-2">
                          <Terminal className="w-4 h-4" /> Block #{index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeEditManualBlock(block.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2 py-1 rounded transition-colors flex items-center gap-1 text-xs cursor-pointer"
                          title="Delete Execution Block"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Block</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-gray-400 uppercase">Section Title</label>
                          <input 
                            type="text"
                            value={block.title}
                            onChange={(e) => updateEditManualBlock(block.id, 'title', e.target.value)}
                            className="w-full bg-black/50 border border-white/20 rounded-md px-3 py-2 text-white text-xs focus:outline-none focus:border-[#84cc16]"
                            placeholder="e.g. Terminal Commands"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-gray-400 uppercase">Code Language</label>
                          <select 
                            value={block.language}
                            onChange={(e) => updateEditManualBlock(block.id, 'language', e.target.value)}
                            className="w-full bg-[#0a0a0a] border border-white/20 rounded-md px-3 py-2 text-white text-xs focus:outline-none focus:border-[#84cc16]"
                          >
                            <option value="bash">bash / shell</option>
                            <option value="python">python</option>
                            <option value="cpp">c++</option>
                            <option value="ini">ini / config</option>
                            <option value="text">plain text</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-gray-400 uppercase">Commands / Source Code</label>
                        <textarea 
                          value={block.code}
                          onChange={(e) => updateEditManualBlock(block.id, 'code', e.target.value)}
                          rows={4}
                          className="w-full bg-black/60 font-mono text-emerald-400 border border-white/20 rounded-md p-3 text-xs focus:outline-none focus:border-[#84cc16]"
                          placeholder="Commands or code..."
                        ></textarea>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-gray-400 uppercase">Step Note / Alert (Optional)</label>
                        <input 
                          type="text"
                          value={block.note}
                          onChange={(e) => updateEditManualBlock(block.id, 'note', e.target.value)}
                          className="w-full bg-black/50 border border-white/20 rounded-md px-3 py-2 text-white text-xs focus:outline-none focus:border-[#84cc16]"
                          placeholder="Optional note for this block..."
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-gray-400 uppercase">Section Diagram / Image (Optional)</label>
                        <label className="border border-dashed border-white/20 rounded-md p-4 text-center hover:border-[#84cc16] transition-colors cursor-pointer group flex flex-col items-center justify-center">
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                updateEditManualBlock(block.id, 'imageFile', e.target.files[0]);
                              }
                            }}
                          />
                          {block.imageFile ? (
                            <div className="text-white flex flex-col items-center">
                              <CheckCircle2 className="w-4 h-4 text-green-400 mb-1" />
                              <p className="text-xs">{block.imageFile.name}</p>
                              <p className="text-[10px] text-gray-400">Click to change</p>
                            </div>
                          ) : block.image_url ? (
                            <div className="text-white flex flex-col items-center">
                              <ImageIcon className="w-4 h-4 text-[#84cc16] mb-1" />
                              <p className="text-xs text-gray-300">Existing Image Attached</p>
                              <p className="text-[10px] text-gray-400">Click to upload replacement image</p>
                            </div>
                          ) : (
                            <>
                              <ImageIcon className="w-4 h-4 text-gray-400 mb-1 group-hover:text-[#84cc16]" />
                              <p className="text-xs text-gray-400 group-hover:text-white">Click to upload diagram image (Optional)</p>
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addEditManualBlock}
                  className="w-full py-2.5 bg-white/5 border border-dashed border-white/20 hover:border-[#84cc16] hover:text-[#84cc16] text-gray-400 rounded-md font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Execution Block #{editManualBlocks.length + 1}
                </button>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                <button 
                  type="button"
                  onClick={() => setEditingManual(null)}
                  className="px-4 py-2 bg-transparent text-white hover:bg-white/5 rounded-md text-sm transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isManualSubmitting}
                  className="px-6 py-2 bg-white text-black hover:bg-gray-200 disabled:opacity-50 rounded-md text-sm font-semibold transition-colors flex items-center gap-2"
                >
                  {isManualSubmitting ? 'Saving Changes...' : 'Save Manual Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminHeaderLayout>
  );
}
