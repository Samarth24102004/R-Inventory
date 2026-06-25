"use client";
import React, { useState, useEffect } from 'react';
import { Upload, Plus, CircuitBoard, Lightbulb, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminUploadPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('0');
  const [githubLink, setGithubLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return alert("Please fill title and description");
    
    setIsSubmitting(true);
    
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const { error } = await supabase.from('projects').insert([
      {
        title: title,
        slug: slug,
        description: description,
        short_description: description.length > 100 ? description.substring(0, 100) + '...' : description,
        price: parseFloat(price) || 0,
        github_link: githubLink,
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
      alert('Success! Your project has been uploaded to the Vault.');
      setTitle('');
      setDescription('');
      setPrice('0');
      setGithubLink('');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20 px-[5%] font-sans">
      <div className="max-w-4xl mx-auto bg-[#0a0a0a] p-10 rounded-xl border border-white/10 shadow-lg">
        <div className="flex items-center space-x-4 mb-8 border-b border-white/10 pb-6">
          <Upload className="text-white w-8 h-8" strokeWidth={1.5} />
          <h1 className="text-3xl font-semibold text-white tracking-tight">
            Upload Project
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 tracking-wider uppercase">Project Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-transparent border border-white/20 rounded-md px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                placeholder="e.g. Nav2 Autonomous Rover"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 tracking-wider uppercase">Price (INR)</label>
              <input 
                type="number" 
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-transparent border border-white/20 rounded-md px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400 tracking-wider uppercase">GitHub Repository Link</label>
            <input 
              type="url" 
              value={githubLink}
              onChange={(e) => setGithubLink(e.target.value)}
              className="w-full bg-transparent border border-white/20 rounded-md px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
              placeholder="https://github.com/username/project"
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
            ></textarea>
          </div>

          {/* Circuit Diagram Section */}
          <div className="p-6 bg-transparent border border-white/10 rounded-md space-y-4">
            <div className="flex items-center space-x-3">
              <CircuitBoard className="text-white w-5 h-5" strokeWidth={1.5} />
              <h3 className="text-lg font-medium text-white tracking-tight">Circuit Diagrams</h3>
            </div>
            <p className="text-sm text-gray-400">Upload wiring or circuit diagrams for hardware integration.</p>
            
            <div className="border border-dashed border-white/20 rounded-md p-8 text-center hover:border-white transition-colors cursor-pointer group">
              <Plus className="w-6 h-6 text-gray-400 mx-auto mb-2 group-hover:text-white transition-colors" strokeWidth={1.5} />
              <p className="text-sm text-gray-400 group-hover:text-white transition-colors">Click to upload image or drag & drop</p>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-white hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-black rounded-md font-medium transition-colors"
          >
            {isSubmitting ? 'Uploading...' : 'Publish Project'}
          </button>
          
        </form>
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
