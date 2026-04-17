import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
import { apiClient } from 'app';
import { AlbumCoverUpload } from './AlbumCoverUpload';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAlbumCreated: () => void;
}

export function AlbumCreateModal({ isOpen, onClose, onAlbumCreated }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Create the album first
      const createResponse = await apiClient.create_album({
        title,
        description: description || undefined
      });
      const albumData = await createResponse.json();
      
      // If we have a cover image, upload it
      if (coverImage) {
        const formData = new FormData();
        formData.append('file', coverImage);
        formData.append('title', `Cover for ${title}`);
        formData.append('category', albumData.id); // Using album ID as the category
        
        // Upload the image
        await apiClient.upload_image(
          {
            title: `Cover for ${title}`,
            category: albumData.id,
            description: `Cover image for album: ${title}`
          },
          { file: coverImage }
        );
      }
      
      onAlbumCreated();
      onClose();
    } catch (error) {
      console.error('Failed to create album:', error);
      setError('Failed to create album');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-secondary-900 rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-white">Create New Album</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-200 mb-1">
                Album Title *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 bg-secondary-800 border border-secondary-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
                placeholder="Enter album title"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-200 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 bg-secondary-800 border border-secondary-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white h-24"
                placeholder="Enter album description (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Cover Image
              </label>
              <AlbumCoverUpload 
                onImageSelect={(file) => setCoverImage(file)}
                className="mb-2"
              />
              <p className="text-xs text-gray-400">Select an image that represents this album</p>
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                onClick={onClose}
                variant="secondary"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!title.trim() || isLoading}
                loading={isLoading}
              >
                Create Album
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
