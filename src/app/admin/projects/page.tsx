"use client";
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Settings, Edit2, Trash2, Plus, X, Upload, CheckCircle2, Box, CircuitBoard, ImageIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function AdminProjectsPage() {
  const [activeTab, setActiveTab] = useState<'projects' | 'models'>('projects');
  
  // Projects State
  const [projects, setProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  
  // Models State
  const [models, setModels] = useState<any[]>([]);
  const [loadingModels, setLoadingModels] = useState(true);
  
  // Edit Project Modal State
  const [editingProject, setEditingProject] = useState<any>(null);
  const [editProjectForm, setEditProjectForm] = useState({
    title: '',
    price: '',
    description: '',
    github_link: ''
  });
  const [circuitFile, setCircuitFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImages, setPreviewImages] = useState<File[]>([]);
  const previewImagesRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Model Modal State
  const [editingModel, setEditingModel] = useState<any>(null);
  const [editModelForm, setEditModelForm] = useState({
    title: '',
    price: '',
    description: ''
  });
  const [isModelSubmitting, setIsModelSubmitting] = useState(false);

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

  useEffect(() => {
    fetchProjects();
    fetchModels();
  }, []);

  const handleDeleteProject = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this project? This cannot be undone.")) return;
    
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
    
    // Also delete purchases for models if they exist in purchases table or similar
    await supabase.from('purchases').delete().eq('model_id', id);

    const { error } = await supabase.from('stl_models').delete().eq('id', id);
    
    if (error) {
      alert(`Delete failed: ${error.message}`);
    } else {
      setModels(models.filter(m => m.id !== id));
    }
  };

  const openEditProjectModal = (project: any) => {
    setEditingProject(project);
    setEditProjectForm({
      title: project.title || '',
      price: project.price?.toString() || '0',
      description: project.description || '',
      github_link: project.github_link || ''
    });
    setCircuitFile(null);
    setPreviewImages([]);
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
    
    const { data, error } = await supabase
      .from('projects')
      .update({
        title: editProjectForm.title,
        price: parseFloat(editProjectForm.price) || 0,
        description: editProjectForm.description,
        short_description: editProjectForm.description.length > 100 ? editProjectForm.description.substring(0, 100) + '...' : editProjectForm.description,
        github_link: editProjectForm.github_link,
        circuit_diagram_url: circuit_diagram_url,
        preview_images: current_preview_images
      })
      .eq('id', editingProject.id)
      .select();
      
    setIsSubmitting(false);
    
    if (error) {
      alert(`Update failed: ${error.message}`);
    } else if (!data || data.length === 0) {
      alert("Update failed: 0 rows affected. This is likely because Supabase blocked the update due to Row Level Security (RLS) policies on the 'projects' table. Please check your Supabase Policies for UPDATE.");
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
    <div className="min-h-screen bg-black text-white pt-32 pb-20 px-[5%] font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div className="flex items-center space-x-4">
            <Settings className="text-white w-8 h-8" strokeWidth={1.5} />
            <h1 className="text-3xl font-semibold text-white tracking-tight">
              Manage Content
            </h1>
          </div>
          <Link href="/admin/upload" className="flex items-center px-6 py-3 bg-white text-black hover:bg-gray-200 rounded-md text-sm font-medium transition-colors">
            <Plus className="w-4 h-4 mr-2" /> Add New
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8 border-b border-white/10 pb-px">
          <button
            onClick={() => setActiveTab('projects')}
            className={`pb-4 px-2 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'projects'
                ? 'border-white text-white'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            <CircuitBoard className="w-4 h-4" />
            Projects
          </button>
          <button
            onClick={() => setActiveTab('models')}
            className={`pb-4 px-2 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'models'
                ? 'border-white text-white'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            <Box className="w-4 h-4" />
            3D Models
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
                        <td className="px-6 py-4 text-sm text-gray-400">
                          {new Date(project.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button 
                              onClick={() => openEditProjectModal(project)}
                              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteProject(project.id)}
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

        </div>
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
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Drive Link for Code</label>
                <input 
                  type="url" 
                  value={editProjectForm.github_link}
                  onChange={(e) => setEditProjectForm({...editProjectForm, github_link: e.target.value})}
                  className="w-full bg-transparent border border-white/20 rounded-md px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                  placeholder="https://drive.google.com/..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Description</label>
                <textarea 
                  value={editProjectForm.description}
                  onChange={(e) => setEditProjectForm({...editProjectForm, description: e.target.value})}
                  rows={6}
                  className="w-full bg-transparent border border-white/20 rounded-md px-4 py-3 text-white focus:outline-none focus:border-white transition-colors resize-none"
                  required
                />
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
                      <p className="text-sm">{circuitFile.name}</p>
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

    </div>
  );
}
