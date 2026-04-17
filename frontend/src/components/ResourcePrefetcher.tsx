import React, { useState, useEffect, useRef } from 'react';
import { addResourceHint, isImageCached } from '../utils/imagePreload';
import { useIdleCallback } from '../utils/performanceHooks';
import { useLocation } from 'react-router-dom';
import { isDevelopmentMode } from '../utils/environmentUtils';

interface Props {
  /**
   * Images to preload before they're needed
   */
  preloadImages?: string[];
  
  /**
   * Pages to prefetch before they're navigated to
   */
  prefetchPages?: string[];
  
  /**
   * Domains to preconnect to
   */
  preconnectDomains?: string[];
  
  /**
   * Priority assets to load immediately
   */
  priority?: boolean;
  
  /**
   * Additional configuration for resource hints
   */
  options?: {
    delay?: number;
    useIdleTime?: boolean;
  };
}

/**
 * ResourcePrefetcher - Preloads resources for better performance
 * 
 * This component can preload images, prefetch pages, and preconnect to domains
 * to improve performance before resources are actually needed.
 */
export function ResourcePrefetcher({
  preloadImages = [],
  prefetchPages = [],
  preconnectDomains = [],
  priority = false,
  options = {
    delay: 2000,
    useIdleTime: true
  }
}: Props) {
  const location = useLocation();
  const processedRef = useRef<Set<string>>(new Set());
  
  // Function to preload all resources
  const preloadResources = async () => {
    if (typeof window === 'undefined') return;
    
    if (isDevelopmentMode()) {
      console.log('ResourcePrefetcher: Preloading resources', {
        images: preloadImages.length,
        pages: prefetchPages.length,
        domains: preconnectDomains.length
      });
    }
    
    // Preconnect to domains for faster future requests
    preconnectDomains.forEach(domain => {
      if (!processedRef.current.has(`preconnect:${domain}`)) {
        addResourceHint(domain, 'preconnect', { crossOrigin: 'anonymous' });
        
        // Also add dns-prefetch as a fallback for browsers that don't support preconnect
        addResourceHint(domain, 'dns-prefetch');
        
        processedRef.current.add(`preconnect:${domain}`);
      }
    });
    
    // Prefetch pages that might be visited next
    prefetchPages.forEach(page => {
      const url = page.startsWith('/') ? page : `/${page}`;
      const prefetchKey = `prefetch:${url}`;
      
      if (!processedRef.current.has(prefetchKey) && url !== location.pathname) {
        addResourceHint(url, 'prefetch', { as: 'document' });
        processedRef.current.add(prefetchKey);
      }
    });
    
    // Preload images
    for (const imgSrc of preloadImages) {
      const preloadKey = `preload:${imgSrc}`;
      
      if (!processedRef.current.has(preloadKey)) {
        // Check if already cached before preloading
        const cached = await isImageCached(imgSrc);
        
        if (!cached) {
          addResourceHint(imgSrc, 'preload', { as: 'image', crossOrigin: 'anonymous' });
        }
        
        processedRef.current.add(preloadKey);
      }
    }
  };
  
  // If priority is true, load immediately, otherwise use idle callback
  useEffect(() => {
    if (priority) {
      preloadResources();
    }
  }, [priority]);
  
  // Use idle callback for non-priority resources
  useIdleCallback(() => {
    if (!priority) {
      preloadResources();
    }
  }, options.useIdleTime ? options.delay : 0);
  
  // Component doesn't render anything visible
  return null;
}