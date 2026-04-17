import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { ImageUploadModal } from '../components/ImageUploadModal';
import { ArrowLeft, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiClient } from 'app';
import { API_URL } from 'app';
import { OptimizedImage } from '../components/OptimizedImage';
import { getOptimizedAnimationConfig, getScrollBasedAnimationConfig } from '../utils/performanceUtils';
import { getCachedData } from '../utils/apiUtils';

interface Album {
  id: string;
  title: string;
  description?: string;
  cover_image_url?: string;
  created_at: string;
  updated_at: string;
  image_count: number;
}

interface Image {
  id: string;
  filename: string;
  category: string;
  title: string;
  description?: string;
  uploaded_at: string;
  url: string;
}

export default function AlbumDetail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const albumId = searchParams.get('id');

  const [album, setAlbum] = useState<Album | null>(null);
  const [images, setImages] = useState<Image[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [animConfig] = useState(getOptimizedAnimationConfig());
  const [scrollAnim] = useState(getScrollBasedAnimationConfig());

  const fetchAlbum = async () => {
    if (!albumId) return;
    try {
      // Use cached data with a 3 minute expiry
      const data = await getCachedData(
        `album-${albumId}`,
        async () => {
          const response = await apiClient.get_album({ album_id: albumId });
          return response.json();
        },
        3 * 60 * 1000 // 3 minutes cache
      );
      setAlbum(data);
    } catch (error) {
      console.error('Error fetching album:', error);
      setError('Failed to load album');
    }
  };

  const fetchImages = async () => {
    if (!albumId) return;
    try {
      setIsLoading(true);
      setError('');
      
      // Use cached data with a 2 minute expiry
      const data = await getCachedData(
        `album-images-${albumId}`,
        async () => {
          // TODO: Update to use album-specific image endpoint
          const response = await apiClient.list_images({ category: albumId });
          return response.json();
        },
        2 * 60 * 1000 // 2 minutes cache
      );
      
      setImages(data.images || []);
    } catch (error) {
      console.error('Error fetching images:', error);
      setError('Failed to load images');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!albumId) {
      navigate('/Pictures');
      return;
    }
    fetchAlbum();
    fetchImages();
  }, [albumId, navigate]);

  const handleUpload = async (formData: FormData) => {
    setIsLoading(true);
    try {
      const file = formData.get('file') as File;
      const title = formData.get('title') as string;
      const description = formData.get('description') as string | null;

      // Create a new FormData instance for the API call
      // Create the request
      const response = await fetch(`${API_URL}/api/images/upload?title=${encodeURIComponent(title)}&category=${encodeURIComponent(albumId as string)}${description ? `&description=${encodeURIComponent(description)}` : ''}`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      if (response.ok) {
        fetchImages();
        // Update album cover if it doesn't have one
        if (!album?.cover_image_url) {
          const imageData = await response.json();
          await apiClient.update_album(
            { album_id: albumId as string },
            { cover_image_url: imageData.url }
          );
          fetchAlbum();
        }
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload image');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  if (!albumId) return null;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-secondary-900 to-primary-800 text-white">
        <ImageUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onUpload={handleUpload}
        />

        {/* Header Section */}
        <div className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent" />
          {album?.cover_image_url && (
            <div className="absolute inset-0">
              <OptimizedImage
                src={album.cover_image_url || ''}
                alt={album.title}
                className="w-full h-full opacity-20"
                objectFit="cover"
                priority={true}
              />
            </div>
          )}

          <div className="container mx-auto px-4 relative z-10">
            <Button
              onClick={() => navigate('/Pictures')}
              variant="ghost"
              className="mb-6"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Gallery
            </Button>

            <div className="max-w-4xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{album?.title}</h1>
              {album?.description && (
                <p className="text-xl text-gray-300 mb-6">{album.description}</p>
              )}
              <div className="flex items-center gap-2 text-gray-400">
                <ImageIcon className="w-5 h-5" />
                <span>{images.length} photos</span>
                <span className="mx-2">•</span>
                <span>Created {new Date(album?.created_at || '').toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-semibold">Photos</h2>
            <Button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Add Photos
            </Button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500 mb-4" />
              <p className="text-gray-400">Loading photos...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={fetchImages}>Try Again</Button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && images.length === 0 && (
            <div className="text-center py-12">
              <ImageIcon size={48} className="text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Photos Yet</h3>
              <p className="text-gray-400 mb-6">Add some photos to this album!</p>
              <Button onClick={() => setIsUploadModalOpen(true)}>Add Photos</Button>
            </div>
          )}

          {/* Photo Grid */}
          {!isLoading && !error && images.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: animConfig.duration, 
                    ease: animConfig.ease, 
                    delay: index * 0.1 * (animConfig.enableComplexAnimations ? 1 : 0)
                  }}
                  className="group relative overflow-hidden rounded-lg bg-secondary-800 aspect-square hover:shadow-lg transition-all duration-300"
                >
                  <OptimizedImage
                    src={image.url}
                    alt={image.title}
                    className="absolute inset-0"
                    objectFit="cover"
                    priority={index < 6} /* Only prioritize first 6 images */
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{image.title}</h3>
                      {image.description && (
                        <p className="text-sm text-gray-300 mt-2">{image.description}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
