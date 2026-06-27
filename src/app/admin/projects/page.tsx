"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Settings, Edit2, Trash2, Plus, X, Upload, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Edit Modal State
  const [editingProject, setEditingProject] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    price: '',
    description: '',
    github_link: ''
  });
  const [circuitFile, setCircuitFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
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
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (id: string) => {
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

  const openEditModal = (project: any) => {
    setEditingProject(project);
    setEditForm({
      title: project.title || '',
      price: project.price?.toString() || '0',
      description: project.description || '',
      github_link: project.github_link || ''
    });
    setCircuitFile(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
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
    
    const { data, error } = await supabase
      .from('projects')
      .update({
        title: editForm.title,
        price: parseFloat(editForm.price) || 0,
        description: editForm.description,
        short_description: editForm.description.length > 100 ? editForm.description.substring(0, 100) + '...' : editForm.description,
        github_link: editForm.github_link,
        circuit_diagram_url: circuit_diagram_url
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

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20 px-[5%] font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
          <div className="flex items-center space-x-4">
            <Settings className="text-white w-8 h-8" strokeWidth={1.5} />
            <h1 className="text-3xl font-semibold text-white tracking-tight">
              Manage Projects
            </h1>
          </div>
          <Link href="/admin/upload" className="flex items-center px-6 py-3 bg-white text-black hover:bg-gray-200 rounded-md text-sm font-medium transition-colors">
            <Plus className="w-4 h-4 mr-2" /> New Project
          </Link>
        </div>

        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden shadow-lg">
          {loading ? (
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
                            onClick={() => openEditModal(project)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(project.id)}
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
          )}
        </div>
      </div>

      {/* Edit Modal */}
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
            
            <form onSubmit={handleEditSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Title</label>
                  <input 
                    type="text" 
                    value={editForm.title}
                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                    className="w-full bg-transparent border border-white/20 rounded-md px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Price (INR)</label>
                  <input 
                    type="number" 
                    value={editForm.price}
                    onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                    className="w-full bg-transparent border border-white/20 rounded-md px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">GitHub Link</label>
                <input 
                  type="url" 
                  value={editForm.github_link}
                  onChange={(e) => setEditForm({...editForm, github_link: e.target.value})}
                  className="w-full bg-transparent border border-white/20 rounded-md px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Description</label>
                <textarea 
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
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
    </div>
  );
}
