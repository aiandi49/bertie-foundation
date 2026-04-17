import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
import { apiClient } from 'app';
import { AlbumCoverUpload } from './AlbumCoverUpload';
import { API_URL } from 'app';

interface Album {
  id: string;
  title: string;
  description?: string;
  cover_image_url?: string;
  created_at: string;
  updated_at: string;
  image_count: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAlbumUpdated: () => void;
  album: Album | null;
}

export function AlbumEditModal({ isOpen, onClose, onAlbumUpdated, album }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Update form values when the album changes
  useEffect(() => {
    if (album) {
      setTitle(album.title);
      setDescription(album.description || '');
    }
  }, [album]);

  if (!isOpen || !album) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Update album details
      const response = await apiClient.update_album(
        { album_id: album.id },
        {
          title,
          description: description || undefined
        }
      );
      
      if (!response.ok) {
        let errorMessage = 'Failed to update album';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch (jsonError) {
          console.error('Error parsing error response:', jsonError);
        }
        throw new Error(errorMessage);
      }

      // If we have a new cover image, upload it
      if (coverImage) {
        try {
          const imageResponse = await apiClient.upload_image(
            {
              title: `Cover for ${title}`,
              category: album.id,
              description: `Cover image for album: ${title}`
            },
            { file: coverImage }
          );
          
          if (!imageResponse.ok) {
            const imageErrorData = await imageResponse.json();
            console.warn('Cover image upload issue:', imageErrorData);
            // Continue with album update even if cover image fails
          }
        } catch (imageError) {
          console.warn('Failed to upload cover image:', imageError);
          // Continue with album update even if cover image fails
        }
      }
      
      onAlbumUpdated();
      onClose();
    } catch (error) {
      console.error('Failed to update album:', error);
      setError(error instanceof Error ? error.message : 'Failed to update album');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-secondary-900 rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-white">Edit Album</h2>
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
                initialImageUrl={album.cover_image_url ? `${API_URL}${album.cover_image_url}` : undefined}
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
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
