import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { useNetworkStatus } from '../components/NetworkStatusProvider';
import { lazyImport, prefetchComponentsWhenIdle } from '../utils/codeSplitting';
import { API_URL } from 'app';
import { OptimizedImage } from '../components/OptimizedImage';
import { Image, Upload, Loader2, FolderPlus, RefreshCcw } from 'lucide-react';
import { Layout } from '../components/Layout';
import { ImageUploadModal } from '../components/ImageUploadModal';
import { AlbumCreateModal } from '../components/AlbumCreateModal';
import { AlbumEditModal } from '../components/AlbumEditModal';
import { AlbumGrid } from '../components/AlbumGrid';
import { Button } from '../components/Button';
import { Toast } from '../components/Toast';
import { apiClient } from 'app';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { syncVideoCategories } from '../utils/videoUtils';
import { getOptimizedAnimationConfig, getScrollBasedAnimationConfig } from '../utils/performanceUtils';
import { debounce } from '../utils/apiUtils';
import { useOptimizedQuery, useIdleCallback } from '../utils/performanceHooks';
import { ProgressiveImage } from '../components/ProgressiveImage';
import { LazyContainer } from '../components/LazyContainer';
import { PerformanceTracker } from '../components/PerformanceTracker';
import { isImageCached, preloadImages } from '../utils/imagePreload';
import { isDevelopmentMode } from '../utils/environmentUtils';
import { getOptimizedImageUrl } from '../utils/imageCompressor';

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

export default function Pictures() {
  // Define critical resources for preloading
  const criticalResources = {
    images: [
      // Preload hero background
      '/public/6e585a83-81ae-4d9b-8d1e-2f72d5932a31/hero-bg.jpg',
      // We'll dynamically add important album covers and images later
    ],
    pages: [
      // Prefetch likely navigation paths
      '/album-detail',
      '/',
      '/donate'
    ],
    domains: [
      // Preconnect to image hosting domains
      
      'images.unsplash.com',
      API_URL.replace(/^https?:\/\//, '') // Add API domain for faster API requests
    ]
  };
  
  // Get network status for adaptive loading
  const { isOnline, isSlowConnection, canLoadHighQualityMedia } = useNetworkStatus();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
  const [isAlbumEditModalOpen, setIsAlbumEditModalOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const [isSyncing, setIsSyncing] = useState(false);
  const [animConfig] = useState(getOptimizedAnimationConfig());
  const [scrollAnim] = useState(getScrollBasedAnimationConfig());
  const navigate = useNavigate();
  
  // Use optimized query hook for albums with longer cache time
  const { 
    data: albums = [], 
    isLoading: isLoadingAlbums, 
    error: albumsError, 
    refetch: refetchAlbums 
  } = useOptimizedQuery<Album[]>(
    async () => {
      const response = await apiClient.list_albums();
      const data = await response.json();
      return data;
    },
    'albums-list',
    15 * 60 * 1000, // 15 minutes cache
    [isOnline], // Refetch when coming online
    {
      onSuccess: (data) => {
        // Preload album cover images for faster rendering
        if (data && data.length > 0) {
          // Choose fewer covers to preload on slow connections
          const preloadCount = isSlowConnection ? 1 : 3;
          
          // Only preload first few album covers to avoid too many requests
          const albumCovers = data
            .slice(0, preloadCount)
            .filter(album => album.cover_image_url)
            .map(album => album.cover_image_url!);
            
          // Add to critical resources
          criticalResources.images.push(...albumCovers);
          
          // Preload in background with network checks
          if (!isDevelopmentMode() && canLoadHighQualityMedia()) {
            preloadImages(albumCovers).catch(e => console.error('Failed to preload album covers:', e));
          }
        }
      }
    }
  );
  
  // Use optimized query hook for images with smarter caching
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageData, setImageData] = useState<{images: Image[]} | null>(null);
  const [showToastMessage, setShowToastMessage] = useState(false);
  
  // Fetch images function
  const fetchImages = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.list_images();
      const data = await response.json();
      setImageData(data);
      
      // Preload important images
      if (data?.images && data.images.length > 0) {
        // Get featured or first few images to preload
        // Limit preloading on slow connections
        const preloadCount = isSlowConnection ? 1 : 3;
        
        const importantImages = data.images
          .filter(img => img.category === 'Featured' || img.category === 'Success Stories')
          .slice(0, preloadCount)
          .map(img => getOptimizedImageUrl(img.url, canLoadHighQualityMedia() ? 'display' : 'preview'));
          
        // Add to critical resources if not already present
        importantImages.forEach(url => {
          if (!criticalResources.images.includes(url)) {
            criticalResources.images.push(url);
          }
        });
        
        // Only preload if network conditions are good
        if (canLoadHighQualityMedia() && typeof window !== 'undefined') {
          // Use idle callback to preload without impacting performance
          if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
            window.requestIdleCallback(() => preloadImages(importantImages.slice(0, 2)));
          } else {
            setTimeout(() => preloadImages(importantImages.slice(0, 2)), 1000);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching images:', err);
      setError('Failed to load images');
    } finally {
      setIsLoading(false);
    }
  };

  // Load images on component mount
  useEffect(() => {
    fetchImages();
  }, [isOnline]); // Refetch when coming online
  
  // Extract images from data with null safety
  const images = imageData?.images || [];

  // Simplified function that uses the refetch from useOptimizedQuery
  const fetchAlbums = async () => {
    await refetchAlbums(true); // Force refresh
  };
  
  const closeToast = () => {
    setShowToast(false);
  };

  // Function to show simple toast messages for disabled buttons
  const showToastInfo = (message: string) => {
    setToastType('info');
    setToastMessage(message);
    setShowToast(true);
  };

  // Use debounced version of handler to prevent multiple rapid calls
  const debouncedSyncVideoCategories = useCallback(
    debounce((silent: boolean) => handleSyncVideoCategories(silent), 500),
    []
  );
  
  // Use idle callback to sync video categories when browser is idle
  useIdleCallback(() => {
    handleSyncVideoCategories(true);
  }, 2000); // Wait 2 seconds after render before scheduling

  // We don't need the useEffect for API fetch anymore as the useOptimizedQuery hook handles it

  const handleSyncVideoCategories = async (silent = false) => {
    try {
      if (!silent) {
        setIsSyncing(true);
      }
      
      const result = await syncVideoCategories();
      
      // Only show toast and refresh albums if any changes were made
      if ((result.created_albums.length > 0 || result.updated_albums.length > 0) && !silent) {
        setToastType('success');
        setToastMessage(`Successfully synced albums with video categories. ${result.created_albums.length} created, ${result.updated_albums.length} updated.`);
        setShowToast(true);
        // Refresh albums list
        refetchAlbums(true); // Force refetch
      }
    } catch (error) {
      console.error('Error syncing video categories:', error);
      if (!silent) {
        setToastType('error');
        setToastMessage('Failed to sync albums with video categories');
        setShowToast(true);
      }
    } finally {
      if (!silent) {
        setIsSyncing(false);
      }
    }
  };


  const handleUpload = async (formData: FormData) => {
    setIsLoading(true);
    try {
      // Check if we have multiple files (batch upload) or a single file
      const files = formData.getAll('files');
      
      let response;
      let data;
      
      if (files && files.length > 1) {
        // Use batch upload endpoint for multiple files
        console.log(`Uploading ${files.length} images as batch`);
        response = await apiClient.batch_upload_images({}, formData);
        data = await response.json();
        console.log('Batch upload response:', data);
      } else {
        // For single file, use the existing endpoint for backward compatibility
        const file = formData.get('files') as File || formData.get('file') as File;
        const title = formData.get('title') as string;
        const category = formData.get('category') as string;
        const description = formData.get('description') as string | null;

        // Create query parameters
        const queryParams = {
          title,
          category,
          description: description || undefined
        };
        
        console.log('Uploading single image with params:', queryParams);
        response = await apiClient.upload_image(queryParams, { file });
        data = await response.json();
        console.log('Upload response:', data);
      }
      
      if (response.ok) {
        fetchImages();
        // If images were added to an album, refresh albums
        const category = formData.get('category') as string;
        if (category && category !== 'Uncategorized') {
          fetchAlbums();
        }
        
        // Show success toast for batch uploads
        if (files && files.length > 1) {
          setToastType('success');
          setToastMessage(`Successfully uploaded ${files.length} images`);
          setShowToast(true);
        }
      } else {
        throw new Error(`Failed to upload image: ${data.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setToastType('error');
      setToastMessage('Failed to upload image');
      setShowToast(true);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout prefetchResources={criticalResources}>
      <div className="min-h-screen">
        <div className="bg-gradient-to-br from-primary-900 via-secondary-900 to-primary-800 text-white">
          {/* We're keeping the modals but they won't be accessible for now */}
          <ImageUploadModal
            isOpen={isUploadModalOpen}
            onClose={() => setIsUploadModalOpen(false)}
            onUpload={handleUpload}
          />

          <AlbumCreateModal
            isOpen={isAlbumModalOpen}
            onClose={() => setIsAlbumModalOpen(false)}
            onAlbumCreated={fetchAlbums}
          />

          <AlbumEditModal
            isOpen={isAlbumEditModalOpen}
            onClose={() => setIsAlbumEditModalOpen(false)}
            onAlbumUpdated={fetchAlbums}
            album={selectedAlbum}
          />

          {/* Hero Section */}
          <div className="relative py-16 overflow-hidden">  {/* Reduced from py-24 to py-16 */}
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('/public/6e585a83-81ae-4d9b-8d1e-2f72d5932a31/hero-bg.jpg')] opacity-10 bg-cover bg-center" />
            <div className="absolute inset-0 bg-gradient-to-b from-primary-900/50 via-transparent to-primary-800/50" />
            
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary-500/10 to-transparent rounded-full blur-3xl"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              <motion.div
                className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-500/10 to-transparent rounded-full blur-3xl"
                animate={{
                  scale: [1.2, 1, 1.2],
                  rotate: [360, 180, 0],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </div>

            <div className="container mx-auto px-4 relative z-10">
              <motion.div
                className="max-w-4xl mx-auto text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: animConfig.duration, ease: animConfig.ease }}
                {...scrollAnim}
              >
                <h1 className="text-5xl md:text-6xl font-bold mb-4">  {/* Reduced size and reduced margin */}
                  <span className="bg-gradient-to-r from-white via-primary-100 to-white text-transparent bg-clip-text">BERTIE's </span>
                  <span className="text-primary-400">Photo Gallery</span>
                </h1>
                <p className="text-xl text-gray-300 mb-6">  {/* Reduced size and reduced margin */}
                  Explore our visual journey of community impact through these inspiring photographs.
                  Each image captures a moment of positive change in our mission.
                </p>
                <div className="flex gap-4 justify-center mt-4">  
                  <Button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="flex items-center gap-2"
                    size="md"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Photos
                  </Button>
                  <Button
                    onClick={() => setIsAlbumModalOpen(true)}
                    className="flex items-center gap-2"
                    size="md"
                    variant="secondary"
                  >
                    <FolderPlus className="w-4 h-4" />
                    Create Album
                  </Button>
                  <Button
                    onClick={() => debouncedSyncVideoCategories(false)}
                    className="flex items-center gap-2"
                    size="md"
                    variant="outline"
                    disabled={isSyncing}
                  >
                    <RefreshCcw className="w-4 h-4" />
                    {isSyncing ? 'Syncing...' : 'Sync with Videos'}
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Filter Section */}
          <div className="sticky top-0 z-20 bg-primary-900/80 backdrop-blur-sm border-y border-primary-800 shadow-lg">
            <div className="container mx-auto px-4 py-6">
              <div className="flex flex-wrap justify-center gap-3">
                {['All', 'Featured', 'Community Events', 'Volunteer Work', 'Success Stories', 'Special Programs'].map((category) => (
                  <button
                    key={category}
                    className={`px-4 py-1.5 rounded-full transition-all duration-300 ${
                      selectedCategory === category || (category === 'All' && !selectedCategory)
                        ? 'bg-primary-500 text-white'
                        : 'bg-white/5 backdrop-blur-sm text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                    onClick={() => setSelectedCategory(category === 'All' ? null : category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-b from-secondary-900 to-primary-900 pb-24">
          <div className="container mx-auto px-4 py-12">
            {/* Display albums grid */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-white text-center mb-8">
                <span className="bg-gradient-to-r from-white via-primary-100 to-white bg-clip-text text-transparent">Photo Albums</span>
              </h2>
              
              {isLoadingAlbums ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
                  <span className="ml-4 text-xl text-gray-300">Loading albums...</span>
                </div>
              ) : albums.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-primary-700 rounded-lg bg-primary-800/30">
                  <Image className="w-16 h-16 text-primary-500 mx-auto mb-4 opacity-50" />
                  <h3 className="text-2xl font-medium text-white mb-2">No Albums Yet</h3>
                  <p className="text-gray-400 max-w-md mx-auto mb-8">
                    Create your first album to start organizing your photos by category.
                  </p>
                  <Button 
                    onClick={() => setIsAlbumModalOpen(true)}
                    variant="primary"
                    className="flex items-center gap-2 mx-auto"
                  >
                    <FolderPlus className="w-4 h-4" />
                    Create First Album
                  </Button>
                </div>
              ) : (
                <AlbumGrid 
                  albums={albums} 
                  onAlbumClick={(albumId) => navigate(`/AlbumDetail?id=${albumId}`)}
                  onEditClick={(album) => {
                    setSelectedAlbum(album);
                    setIsAlbumEditModalOpen(true);
                  }}
                />
              )}
            </div>
            
            {/* Display recent images */}
            <div>
              <h2 className="text-3xl font-bold text-white text-center mb-8">
                <span className="bg-gradient-to-r from-white via-primary-100 to-white bg-clip-text text-transparent">Recent Photos</span>
              </h2>
              
              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
                  <span className="ml-4 text-xl text-gray-300">Loading images...</span>
                </div>
              ) : images.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-primary-700 rounded-lg bg-primary-800/30">
                  <Image className="w-16 h-16 text-primary-500 mx-auto mb-4 opacity-50" />
                  <h3 className="text-2xl font-medium text-white mb-2">No Photos Yet</h3>
                  <p className="text-gray-400 max-w-md mx-auto mb-8">
                    Upload your first photo to start building your gallery.
                  </p>
                  <Button 
                    onClick={() => setIsUploadModalOpen(true)}
                    variant="primary"
                    className="flex items-center gap-2 mx-auto"
                  >
                    <Upload className="w-4 h-4" />
                    Upload First Photo
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images.slice(0, 8).map((image, index) => (
                    <motion.div 
                      key={image.id}
                      className="relative overflow-hidden rounded-lg bg-secondary-800 aspect-square group cursor-pointer"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        duration: animConfig.duration, 
                        ease: animConfig.ease, 
                        delay: index * 0.1 * (animConfig.enableComplexAnimations ? 1 : 0) 
                      }}
                    >
                      <div className="absolute inset-0">
                        <ProgressiveImage
                          src={getOptimizedImageUrl(image.url, 'display')}
                          placeholderSrc={getOptimizedImageUrl(image.url, 'thumbnail')}
                          alt={image.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="text-white text-lg font-medium truncate">{image.title}</h3>
                          <p className="text-gray-300 text-sm">{image.category}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
              
              {images.length > 8 && (
                <div className="text-center mt-8">
                  <Button variant="outline" onClick={() => setSelectedCategory(null)}>
                    View All Photos
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Toast notifications */}
      <Toast 
        visible={showToast}
        message={toastMessage}
        type={toastType}
        onClose={closeToast}
        duration={5000}
      />
      
      {/* Performance monitoring (only in development mode) */}
      <PerformanceTracker 
        devModeOnly={true}
        position="bottom-right"
        visible={isDevelopmentMode()} 
      />
    </Layout>
  );
}
