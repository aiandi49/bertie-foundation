/**
 * Performance Utilities Module
 * 
 * Centralizes all performance-related utilities for easier imports across the app
 */

// Re-export performance-related utilities
export * from './performanceHooks';
export * from './performanceUtils';
export * from './apiUtils';
export * from './apiOptimizer';
export * from './imagePreload';
export * from './serviceWorker';
export * from './imageCompressor';
export * from './imageCacheUtils';
export * from './useIntersectionObserver';
export * from './ImageLoader';

/**
 * Initialize performance monitoring and optimizations
 * Including the service worker for offline capabilities
 */
export function initializePerformance() {
  // Set up global performance metrics
  if (typeof window !== 'undefined' && !window.perfMetrics) {
    window.perfMetrics = {
      pageSwitches: 0,
      pageTimings: {},
      jsChunksLoaded: 0,
      resourceStats: {
        images: 0,
        scripts: 0,
        stylesheets: 0
      }
    };
  }
  
  // Add resource hints for common domains
  const commonDomains = [
    
    'fonts.googleapis.com',
    'images.unsplash.com'
  ];
  
  commonDomains.forEach(domain => {
    addResourceHint('preconnect', domain);
  });
}

/**
 * Add a resource hint to the document head
 * 
 * @param type Type of resource hint (preconnect, prefetch, preload)
 * @param url URL to hint
 * @param as Optional resource type for preload
 */
export function addResourceHint(
  type: 'preconnect' | 'prefetch' | 'preload',
  url: string,
  as?: string
) {
  if (typeof document === 'undefined') return;
  
  // Check if hint already exists
  const selector = `link[rel="${type}"][href="${url}"]${as ? `[as="${as}"]` : ''}`;
  if (document.querySelector(selector)) return;
  
  // Create and append link element
  const link = document.createElement('link');
  link.rel = type;
  link.href = url;
  if (as) link.setAttribute('as', as);
  
  document.head.appendChild(link);
}

// Type definitions for global performance metrics
declare global {
  interface Window {
    perfMetrics?: {
      pageSwitches: number;
      pageTimings: Record<string, number>;
      jsChunksLoaded: number;
      resourceStats: {
        images: number;
        scripts: number;
        stylesheets: number;
      };
    };
  }
}
