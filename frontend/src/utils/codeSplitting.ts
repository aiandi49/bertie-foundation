/**
 * Utilities for code splitting and dynamic imports
 */
import { lazy, ComponentType } from 'react';

/**
 * Enhanced lazy loading with retries and better error handling
 * 
 * @param importFn Dynamic import function
 * @param options Options for the lazy loader
 * @returns Lazy loaded component
 */
export function lazyImport<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  {
    fallback = null,
    retries = 2,
    retryDelay = 1500,
    chunkName = 'unknown'
  }: {
    fallback?: React.ReactNode;
    retries?: number;
    retryDelay?: number;
    chunkName?: string;
  } = {}
): T {
  // Wrap the import with retries
  const wrappedImport = () => {
    let retriesLeft = retries;
    
    const tryImport = async (): Promise<{ default: T }> => {
      try {
        return await importFn();
      } catch (error) {
        if (retriesLeft === 0) {
          console.error(`Failed to load chunk ${chunkName}:`, error);
          throw error;
        }
        
        // Retry after delay
        retriesLeft--;
        return new Promise(resolve => {
          console.warn(`Retrying to load chunk ${chunkName}, ${retriesLeft} attempts left`);
          setTimeout(() => resolve(tryImport()), retryDelay);
        });
      }
    };
    
    return tryImport();
  };
  
  return lazy(wrappedImport);
}

/**
 * Preload a component to reduce loading time
 * Perfect for hovering or showing UI hints before navigation
 * 
 * @param importFn Import function
 */
export function preloadComponent(importFn: () => Promise<any>): void {
  importFn().catch(error => {
    console.warn('Failed to preload component:', error);
  });
}

/**
 * Prefetch a component after initial page load during idle time
 * 
 * @param importFn Import function
 * @param delay Delay before prefetching
 */
export function prefetchWhenIdle(importFn: () => Promise<any>, delay = 2000): void {
  // Only run in browser
  if (typeof window === 'undefined') return;
  
  // Use requestIdleCallback when available for better performance
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      setTimeout(() => {
        importFn().catch(() => {});
      }, delay);
    });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      importFn().catch(() => {});
    }, delay + 1000); // Add extra delay as a simple approximation
  }
}

/**
 * Preload critical CSS for a specific route
 * 
 * @param href CSS file URL
 * @param id Unique ID for the link element
 */
export function preloadCriticalCSS(href: string, id: string): void {
  if (typeof document === 'undefined' || document.getElementById(id)) return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'style';
  link.href = href;
  link.id = id;
  document.head.appendChild(link);
}
