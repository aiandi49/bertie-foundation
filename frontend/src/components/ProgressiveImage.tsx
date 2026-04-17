import React, { useEffect, useState, createContext, useContext } from 'react';

interface Props {
  /** The width of the container (used for sizes attribute) */
  containerWidth?: string;
  /** Whether to load image with priority (eager) */
  priority?: boolean;
  /** Delay before loading the full image (ms) */
  delay?: number;
  /**
   * Low quality placeholder image URL
   */
  placeholderSrc: string;
  /**
   * Image source URL
   */
  src: string;
  /**
   * Alternative text for the image
   */
  alt: string;
  /**
   * CSS class name
   */
  className?: string;
  /**
   * Object fit property
   */
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  /**
   * Fade duration in milliseconds
   */
  fadeDuration?: number;
  /**
   * Callback when the full image is loaded
   */
  onLoad?: () => void;
}

/**
 * Context to track loaded images for better user experience
 */
const LoadedImagesContext = createContext<Set<string>>(new Set());

export const LoadedImagesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  // Effect for persisting loaded images in sessionStorage
  useEffect(() => {
    try {
      // Load previously loaded images from sessionStorage
      const storedImages = sessionStorage.getItem('loadedImages');
      if (storedImages) {
        setLoadedImages(new Set(JSON.parse(storedImages)));
      }
    } catch (error) {
      console.warn('Failed to load previously loaded images from sessionStorage:', error);
    }

    return () => {
      // Save loaded images to sessionStorage on unmount
      try {
        sessionStorage.setItem('loadedImages', JSON.stringify(Array.from(loadedImages)));
      } catch (error) {
        console.warn('Failed to save loaded images to sessionStorage:', error);
      }
    };
  }, []);

  // Function to add a loaded image
  const addLoadedImage = (src: string) => {
    setLoadedImages(prev => {
      const newSet = new Set(prev);
      newSet.add(src);
      return newSet;
    });
  };

  // Enhanced context value with method to add loaded images
  const contextValue = {
    loadedImages,
    addLoadedImage
  };

  return (
    <LoadedImagesContext.Provider value={loadedImages}>
      {children}
    </LoadedImagesContext.Provider>
  );
};

/**
 * Progressive Image component that shows a low-quality placeholder
 * while the full-quality image loads
 */
export function ProgressiveImage({
  src,
  placeholderSrc,
  alt,
  className = '',
  objectFit = 'cover',
  fadeDuration = 500,
  onLoad,
  containerWidth = '100%',
  priority = false,
  delay = 0
}: Props) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(!priority); // Skip loading state if priority
  // Use the context to track loaded images with proper null checking
  const loadedImages = useContext(LoadedImagesContext) || new Set();
  
  // Check if image was already loaded previously
  const wasLoaded = loadedImages instanceof Set && loadedImages.has(src);
  
  useEffect(() => {
    // If this was already loaded before or is priority, skip loading delay
    if (wasLoaded || priority) {
      setIsLoaded(true);
      setLoading(false);
      return;
    }

    if (delay > 0) {
      // Delay loading the full image to prioritize critical resources
      const timer = setTimeout(() => {
        // Create a new Image to preload
        const img = new Image();
        img.src = src;
        img.onload = () => {
          setIsLoaded(true);
          setLoading(false);
          if (onLoad) onLoad();

          // Mark this image as loaded
          if (loadedImages instanceof Set) {
            loadedImages.add(src);
          }
        };
      }, delay);

      return () => clearTimeout(timer);
    } else {
      // No delay, load immediately
      const img = new Image();
      img.src = src;
      img.onload = () => {
        setIsLoaded(true);
        setLoading(false);
        if (onLoad) onLoad();

        // Mark this image as loaded
        if (loadedImages instanceof Set) {
          loadedImages.add(src);
        }
      };
    }
  }, [src, delay, priority, wasLoaded, loadedImages, onLoad]);

  // Calculate sizes attribute based on container width
  const sizes = containerWidth || '100vw';

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* placeholder image - always render the placeholder */}
      <img
        src={placeholderSrc}
        alt={alt}
        className={`w-full h-full absolute inset-0 transition-opacity duration-${fadeDuration} ${isLoaded ? 'opacity-0' : 'opacity-100'}`}
        style={{
          objectFit,
          filter: 'blur(10px)',
          transform: 'scale(1.05)', // Slightly larger to hide blur edges
        }}
        aria-hidden={isLoaded ? 'true' : 'false'}
        loading="eager" // Always load placeholder eagerly for better UX
      />

      {/* Main image - conditionally load based on priority */}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full absolute inset-0 transition-opacity duration-${fadeDuration} ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={{ objectFit }}
        onLoad={() => {
          setIsLoaded(true);
          setLoading(false);
          if (onLoad) onLoad();

          // Mark this image as loaded
          if (loadedImages instanceof Set) {
            loadedImages.add(src);
          }
        }}
        loading={priority ? 'eager' : 'lazy'}
        sizes={sizes}
      />

      {/* Loading indicator - only show when actively loading */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <div className="w-8 h-8 border-2 border-primary-300 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}