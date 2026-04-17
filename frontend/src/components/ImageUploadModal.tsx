import React, { useState, useCallback, useEffect } from 'react';
import { X, Upload, Loader2, XCircle } from 'lucide-react';
import { Button } from './Button';
import { getUniqueVideoCategories } from '../utils/videoUtils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (formData: FormData) => Promise<void>;
  maxFiles?: number;
}

export function ImageUploadModal({ isOpen, onClose, onUpload, maxFiles = 25 }: Props) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Uncategorized');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previews, setPreviews] = useState<string[]>([]);
  const [videoCategories, setVideoCategories] = useState<string[]>([]);

  // Load video categories on mount
  useEffect(() => {
    const loadVideoCategories = () => {
      const categories = getUniqueVideoCategories();
      const categoryNames = categories.map(cat => cat.category);
      setVideoCategories(categoryNames);
    };
    
    loadVideoCategories();
  }, []);

  // Categories from different sources
  const defaultCategories = [
    'Uncategorized',
    'Featured',
    'Community Events',
    'Volunteer Work',
    'Success Stories',
    'Special Programs'
  ];
  
  // Combine default categories with video categories, removing duplicates
  const categories = [...new Set([...defaultCategories, ...videoCategories])];
  

  // Generate previews for selected files
  const generatePreviews = (files: File[]) => {
    const newPreviews: string[] = [];
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          newPreviews.push(e.target.result as string);
          if (newPreviews.length === files.length) {
            setPreviews(newPreviews);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };
  
  // Remove a file from selection
  const removeFile = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
    
    const newPreviews = [...previews];
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
    
    if (newFiles.length === 0) {
      setSuccessMessage('');
    } else {
      setSuccessMessage(`${newFiles.length} ${newFiles.length === 1 ? 'file' : 'files'} selected`);
    }
  };
  
  // Handle drag and drop events
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      handleFileSelection(files);
    }
  }, []);
  
  // Process files from either input or drag-and-drop
  const handleFileSelection = (files: File[]) => {
    if (files.length === 0) return;
    
    // Check if files exceed the maximum
    if (files.length > maxFiles) {
      setError(`You can only upload up to ${maxFiles} images at once`);
      return;
    }
    
    // Validate file types
    const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      setError('Please select only image files');
      return;
    }
    
    setSelectedFiles(files);
    setError('');
    setSuccessMessage(`${files.length} ${files.length === 1 ? 'file' : 'files'} selected`);
    generatePreviews(files);
    
    // Use first filename (without extension) as default title if not manually set by user
    if (title === '') {
      // If multiple files, use a generic title
      if (files.length > 1) {
        setTitle('Photo Collection');
      } else {
        // For single file, use the filename
        setTitle(files[0].name.replace(/\.[^/.]+$/, ''));
      }
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFileSelection(files);
  };

  const simulateProgress = () => {
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      if (progress > 95) {
        clearInterval(interval);
      } else {
        setUploadProgress(progress);
      }
    }, 200);
    return interval;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      setError('Please select at least one image');
      return;
    }

    try {
      setIsUploading(true);
      setError('');
      setUploadProgress(0);
      
      // Start progress simulation
      const progressInterval = simulateProgress();

      const formData = new FormData();
      
      // Append all files with the same field name 'files'
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });
      
      // Add metadata
      formData.append('title', title);
      formData.append('category', category);
      if (description) formData.append('description', description);

      await onUpload(formData);
      
      // Complete progress
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Reset form
      setSelectedFiles([]);
      setTitle('');
      setCategory('Uncategorized');
      setDescription('');
      setSuccessMessage('');
      setPreviews([]);
      onClose();
    } catch (error) {
      setError('Failed to upload images. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-secondary-800 rounded-xl w-full max-w-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-white mb-6">Upload New Photo</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Image Files * (Up to {maxFiles} files)
            </label>
            <div 
              className="mt-1 flex justify-center px-6 pt-3 pb-3 border-2 border-gray-600 border-dashed rounded-lg hover:border-primary-500 transition-colors cursor-pointer"
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDrop={handleDrop}
            >
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-400">
                  <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-primary-500 hover:text-primary-400">
                    <span>Select images</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-400">
                  PNG, JPG, GIF up to 10MB each
                </p>
              </div>
            </div>
            {selectedFiles.length > 0 && (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium text-primary-500">
                    {successMessage}
                  </p>
                </div>
                
                {/* Preview grid for images */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 my-3">
                  {selectedFiles.map((file, index) => (
                    previews[index] ? (
                      <div key={index} className="relative group aspect-square overflow-hidden rounded-md border border-gray-600">
                        <img 
                          src={previews[index]} 
                          alt={file.name} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button 
                            onClick={() => removeFile(index)}
                            className="p-1 bg-red-500 rounded-full"
                            aria-label="Remove image"
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 text-xs text-white truncate">
                          {file.name}
                        </div>
                      </div>
                    ) : null
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-secondary-700 text-white border border-gray-600 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-secondary-700 text-white border border-gray-600 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 rounded-lg bg-secondary-700 text-white border border-gray-600 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUploading || selectedFiles.length === 0}
              className="relative overflow-hidden"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading... {uploadProgress}%
                </>
              ) : (
                selectedFiles.length > 1 ? `Upload ${selectedFiles.length} Photos` : 'Upload Photo'
              )}
              
              {/* Progress bar */}
              {isUploading && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                  <div 
                    className="h-full bg-primary-500 transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
