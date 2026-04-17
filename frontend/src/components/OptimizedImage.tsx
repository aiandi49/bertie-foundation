import React, { useState, useEffect, useRef } from 'react';
import { API_URL } from 'app';
import { getResponsiveSizes, generateSrcSet, calculateSizesAttribute } from '../utils/imageUtils';

interface Props {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  quality?: 'low' | 'medium' | 'high';
  priority?: boolean;
  containerWidth?: string | number;
  sizes?: string;
  placeholder?: 'blur' | 'empty' | 'none';
  onLoad?: () => void;
  onClick?: () => void;
}

/**
 * Optimized image component with lazy loading, responsive sizing and more
 */
export function OptimizedImage({
  src,
  alt,
  className = '',
  width,
  height,
  objectFit = 'cover',
  quality = 'medium',
  priority = false,
  containerWidth = '100%',
  sizes,
  placeholder = 'blur',
  onLoad,
  onClick
}: Props) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Handle absolute URLs vs relative paths
  const imgSrc = src.startsWith('http') ? src : src.startsWith('/public') ? src : `${API_URL}${src}`;
  
  // Set loading attribute based on priority
  const loadingAttr = priority ? 'eager' : 'lazy';
  
  // Define a set of widths for different screen sizes
  const imageSizes = [320, 480, 640, 750, 828, 1080, 1200, 1920, 2048, 3840];

  // Generate the srcset attribute
  const srcSet = generateSrcSet(imgSrc, imageSizes);
  
  // Add quality parameter if needed
  const qualityMap = {
    low: 50,
    medium: 75,
    high: 90
  };
  
  // Add quality parameter if the URL supports it
  const finalSrc = imgSrc.includes('?') 
    ? `${imgSrc}&quality=${qualityMap[quality]}` 
    : `${imgSrc}?quality=${qualityMap[quality]}`;
    
  // Check if image is already in viewport on mount
  useEffect(() => {
    if (!priority && imgRef.current) {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          // Start loading the image
          if (imgRef.current) {
            imgRef.current.loading = 'eager';
            
            // For background images or other data-src attributes
            if (imgRef.current.dataset.src && !imgRef.current.src) {
              imgRef.current.src = imgRef.current.dataset.src;
            }
            
            // Track image observation for performance metrics
            if (window.perfMetrics && !window.perfMetrics.imagesObserved) {
              window.perfMetrics.imagesObserved = new Set();
            }
            
            if (window.perfMetrics?.imagesObserved && !window.perfMetrics.imagesObserved.has(finalSrc)) {
              window.perfMetrics.imagesObserved.add(finalSrc);
              
              if (window.perfMetrics.imagesObserved.size % 5 === 0) {
                console.log(`Optimized image loading: ${window.perfMetrics.imagesObserved.size} images loaded with intersection observer`);
              }
            }
          }
          observer.disconnect();
        }
      }, {
        rootMargin: '200px', // Start loading when image is within 200px of viewport
        threshold: 0.01
      });
      
      observer.observe(imgRef.current);
      
      return () => {
        observer.disconnect();
      };
    }
  }, [priority, finalSrc]);
  
  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };
  
  const handleError = () => {
    setError(true);
    console.error(`Failed to load image: ${imgSrc}`);
  };

  return (
    <div 
      className={`relative overflow-hidden ${className}`} 
      style={{ width: width ? `${width}px` : containerWidth, height: height ? `${height}px` : '100%' }}
      onClick={onClick}
    >
      {/* Background placeholder while image loads */}
      {placeholder !== 'none' && (
        <div 
          className={`absolute inset-0 bg-gray-200 ${placeholder === 'blur' ? 'animate-pulse' : ''} ${isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          aria-hidden="true"
        />
      )}
      
      {!error ? (
        <img
          ref={imgRef}
          src={finalSrc}
          srcSet={srcSet}
          sizes={sizes || calculateSizesAttribute(containerWidth)}
          alt={alt}
          loading={loadingAttr}
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} optimize-img`}
          style={{ objectFit }}
          width={width}
          height={height}
          fetchpriority={priority ? 'high' : 'auto'}
          decoding={priority ? 'sync' : 'async'}
        />
      ) : (
        // Error fallback
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500">
          <span className="text-sm">Image not available</span>
        </div>
      )}
    </div>
  );
}
