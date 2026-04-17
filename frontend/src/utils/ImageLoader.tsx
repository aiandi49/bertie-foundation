import React, { useEffect, useState, useRef } from 'react';

interface ImageLoaderProps {
  /**
   * Image URL to load
   */
  src: string;
  
  /**
   * Image alt text
   */
  alt: string;
  
  /**
   * Optional placeholder until image loads
   */
  placeholder?: string;
  
  /**
   * Optional blur amount for placeholder (0-20)
   */
  blurAmount?: number;
  
  /**
   * Load image with high priority
   */
  priority?: boolean;
  
  /**
   * Additional classes for the image
   */
  className?: string;
  
  /**
   * Width of the image
   */
  width?: number | string;
  
  /**
   * Height of the image
   */
  height?: number | string;
  
  /**
   * Object fit property
   */
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  
  /**
   * Optional callback when image is loaded
   */
  onLoad?: () => void;
  
  /**
   * Optional fade-in duration in ms
   */
  fadeInDuration?: number;
}

/**
 * Global image loading cache to prevent duplicate loading
 */
const imageCache = new Map<string, boolean>();

/**
 * Image preloader that works across components
 */
export function preloadImage(src: string): Promise<void> {
  // Skip if already in cache
  if (imageCache.has(src)) {
    return Promise.resolve();
  }
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      imageCache.set(src, true);
      resolve();
    };
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Enhanced image loader with optimized loading strategies
 */
export function ImageLoader({
  src,
  alt,
  placeholder,
  blurAmount = 5,
  priority = false,
  className = '',
  width,
  height,
  objectFit = 'cover',
  onLoad,
  fadeInDuration = 400
}: ImageLoaderProps) {
  const [loaded, setLoaded] = useState(imageCache.has(src));
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Handle image loaded event
  const handleImageLoaded = () => {
    setLoaded(true);
    imageCache.set(src, true);
    if (onLoad) onLoad();
  };
  
  // Use intersection observer for non-priority images
  useEffect(() => {
    // Skip if already loaded, has priority, or had an error
    if (loaded || priority || error || !imgRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const img = imgRef.current;
          if (img) {
            if (img.loading === 'lazy') {
              img.loading = 'eager';
            }
            
            // If src was empty (truly lazy loading), set it now
            if (!img.src && img.dataset.src) {
              img.src = img.dataset.src;
            }
            
            observer.disconnect();
          }
        }
      },
      {
        rootMargin: '200px', // Start loading when within 200px of viewport
        threshold: 0.01
      }
    );
    
    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [src, loaded, priority, error]);
  
  // Apply styles
  const imageStyles: React.CSSProperties = {
    objectFit,
    transition: `opacity ${fadeInDuration}ms ease-in-out`,
    opacity: loaded ? 1 : 0,
    width: width ? (typeof width === 'number' ? `${width}px` : width) : '100%',
    height: height ? (typeof height === 'number' ? `${height}px` : height) : '100%',
  };
  
  const placeholderStyles: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    filter: placeholder ? `blur(${blurAmount}px)` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundImage: placeholder ? `url(${placeholder})` : undefined,
    opacity: loaded ? 0 : 1,
    transition: `opacity ${fadeInDuration}ms ease-in-out`,
    backgroundColor: placeholder ? undefined : '#f0f0f0',
  };
  
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width: imageStyles.width, height: imageStyles.height }}>
      {/* Placeholder or background */}
      <div style={placeholderStyles} aria-hidden="true" />
      
      {/* Actual image */}
      <img
        ref={imgRef}
        src={priority ? src : undefined}
        data-src={!priority ? src : undefined}
        alt={alt}
        onLoad={handleImageLoaded}
        onError={() => setError(true)}
        loading={priority ? 'eager' : 'lazy'}
        className="w-full h-full"
        style={imageStyles}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding={priority ? 'sync' : 'async'}
      />
      
      {/* Error fallback */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500">
          <span>Failed to load image</span>
        </div>
      )}
    </div>
  );
}
