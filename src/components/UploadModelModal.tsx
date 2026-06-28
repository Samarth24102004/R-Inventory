"use client";

import React, { useState } from 'react';
import { X, Upload, FileBox, Image as ImageIcon, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface UploadModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UploadModelModal({ isOpen, onClose, onSuccess }: UploadModelModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [stlFile, setStlFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!title || !description || !price || !imageFile || !stlFile) {
        throw new Error("Please fill in all fields and select both files.");
      }

      // Generate unique file names
      const timestamp = Date.now();
      const imageFileName = `${timestamp}-${imageFile.name}`;
      const stlFileName = `${timestamp}-${stlFile.name}`;

      // 1. Upload Preview Image to public bucket
      const { data: imageData, error: imageError } = await supabase.storage
        .from('model_images')
        .upload(imageFileName, imageFile);

      if (imageError) throw new Error(`Image Upload Error: ${imageError.message}`);

      // Get public URL for the image
      const { data: publicUrlData } = supabase.storage
        .from('model_images')
        .getPublicUrl(imageFileName);

      // 2. Upload STL file to private bucket
      const { data: stlData, error: stlError } = await supabase.storage
        .from('stl_files')
        .upload(stlFileName, stlFile);

      if (stlError) throw new Error(`STL Upload Error: ${stlError.message}`);

      // 3. Insert record into database
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

      // Success cleanup
      setTitle('');
      setDescription('');
      setPrice('');
      setImageFile(null);
      setStlFile(null);
      onSuccess();
      onClose();

    } catch (err: any) {
      console.error("Upload process failed:", err);
      setError(err.message || "An error occurred during upload.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-400" />
            Upload 3D Model
          </h2>
          <button
            onClick={onClose}
            className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleUpload} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="E.g., Articulated Dragon"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors min-h-[100px] resize-none"
                placeholder="Describe your model..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">Price (INR)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="299"
                required
              />
            </div>

            <div className="flex flex-col gap-4">
              {/* Image Upload */}
              <div className="relative group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  required
                />
                <div className={`flex items-center gap-4 p-4 rounded-xl border border-dashed transition-colors ${imageFile ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/20 bg-white/5 group-hover:border-white/40'}`}>
                  <div className="p-3 bg-white/10 rounded-lg text-neutral-300">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium text-white truncate">
                      {imageFile ? imageFile.name : "Select Preview Image"}
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">JPG, PNG (Max 5MB)</p>
                  </div>
                </div>
              </div>

              {/* STL Upload */}
              <div className="relative group">
                <input
                  type="file"
                  accept=".stl"
                  onChange={(e) => setStlFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  required
                />
                <div className={`flex items-center gap-4 p-4 rounded-xl border border-dashed transition-colors ${stlFile ? 'border-green-500/50 bg-green-500/5' : 'border-white/20 bg-white/5 group-hover:border-white/40'}`}>
                  <div className="p-3 bg-white/10 rounded-lg text-neutral-300">
                    <FileBox className="w-6 h-6" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium text-white truncate">
                      {stlFile ? stlFile.name : "Select .STL File"}
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">.STL only</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full bg-white text-black font-semibold py-4 rounded-xl hover:bg-neutral-200 transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Uploading securely...
                </>
              ) : (
                'Upload Model'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
