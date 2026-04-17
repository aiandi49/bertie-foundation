import React, { useRef, useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';

interface Props {
  onImageSelect: (file: File) => void;
  initialImageUrl?: string;
  className?: string;
}

export function AlbumCoverUpload({ onImageSelect, initialImageUrl, className = '' }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImageUrl || null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl && !initialImageUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, initialImageUrl]);

  // When initialImageUrl changes, update the preview
  useEffect(() => {
    setPreviewUrl(initialImageUrl || null);
  }, [initialImageUrl]);

  const handleFileSelect = (file: File) => {
    // Validate file is an image
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Create preview URL
    if (previewUrl && !initialImageUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    onImageSelect(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleClearImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (previewUrl && !initialImageUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    // We can pass null to onImageSelect to indicate the image has been cleared,
    // but the component implementation doesn't currently support this
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`relative h-40 border-2 rounded-lg overflow-hidden ${isDragging ? 'border-primary-500 bg-primary-900/10' : 'border-gray-600 border-dashed'} ${previewUrl ? 'p-0' : 'p-4'} hover:border-primary-500 transition-colors`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {previewUrl ? (
          <>
            <img 
              src={previewUrl} 
              alt="Album cover" 
              className="w-full h-full object-cover" 
            />
            <button
              type="button"
              className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/80 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleClearImage();
              }}
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-400">Click or drag image here</p>
            <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF</p>
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
}
