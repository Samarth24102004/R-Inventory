"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Upload, Plus, CircuitBoard, Lightbulb, CheckCircle2, Box, Image as ImageIcon, FileBox, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminUploadPage() {
  const [uploadType, setUploadType] = useState<'project' | 'model'>('project');

  // Shared States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('0');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Project Specific States
  const [githubLink, setGithubLink] = useState('');
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
    if (!title || !description) return alert("Please fill title and description");
    
    setIsSubmitting(true);
    
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

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

    const { error } = await supabase.from('projects').insert([
      {
        title: title,
        slug: slug,
        description: description,
        short_description: description.length > 100 ? description.substring(0, 100) + '...' : description,
        price: parseFloat(price) || 0,
        github_link: githubLink,
        circuit_diagram_url: circuit_diagram_url,
        preview_images: uploaded_preview_urls,
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
      setPrice('0');
      setGithubLink('');
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

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20 px-[5%] font-sans">
      <div className="max-w-4xl mx-auto bg-[#0a0a0a] p-10 rounded-xl border border-white/10 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-white/10 pb-6 gap-6">
          <div className="flex items-center space-x-4">
            <Upload className="text-white w-8 h-8" strokeWidth={1.5} />
            <h1 className="text-3xl font-semibold text-white tracking-tight">
              Upload Content
            </h1>
          </div>
          <div className="flex gap-3 items-center">
            <div className="flex bg-white/5 rounded-md p-1 border border-white/10">
              <button 
                onClick={() => setUploadType('project')}
                className={`px-4 py-2 rounded-sm text-sm font-medium transition-colors flex items-center gap-2 ${uploadType === 'project' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <CircuitBoard className="w-4 h-4" />
                Project
              </button>
              <button 
                onClick={() => setUploadType('model')}
                className={`px-4 py-2 rounded-sm text-sm font-medium transition-colors flex items-center gap-2 ${uploadType === 'model' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <Box className="w-4 h-4" />
                3D Model
              </button>
            </div>
            <a href="/admin/projects" className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-md text-sm font-medium transition-colors">
              Manage Content
            </a>
          </div>
        </div>

        {uploadType === 'project' ? (
          <form onSubmit={handleProjectSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 tracking-wider uppercase">Drive Link for Code</label>
              <input 
                type="url" 
                value={githubLink}
                onChange={(e) => setGithubLink(e.target.value)}
                className="w-full bg-transparent border border-white/20 rounded-md px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                placeholder="https://drive.google.com/drive/folders/..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 tracking-wider uppercase">Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full bg-transparent border border-white/20 rounded-md px-4 py-3 text-white focus:outline-none focus:border-white transition-colors resize-none"
                placeholder="Describe the architecture, capabilities, and setup..."
                required
              ></textarea>
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
        ) : (
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
  );
}
