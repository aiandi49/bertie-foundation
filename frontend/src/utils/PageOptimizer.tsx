/**
 * PageOptimizer component - optimizes resource loading based on page visibility and priority
 * 
 * This component uses various optimization techniques to improve page performance:
 * 1. Resources are loaded based on visibility in viewport
 * 2. Critical resources are loaded first, non-critical are deferred
 * 3. Images are preloaded intelligently
 * 4. Page transitions are optimized
 */
import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { usePerformance } from './PerformanceProvider';
import { preloadImages } from './imageCacheUtils';

interface PageOptimizerProps {
  /**
   * Critical image URLs to preload when page becomes visible
   */
  criticalImages?: string[];
  
  /**
   * Optional images to load after critical ones
   */
  optionalImages?: string[];
  
  /**
   * Whether this is a page with high priority
   */
  highPriority?: boolean;
  
  /**
   * Custom identification for the page (defaults to pathname)
   */
  pageId?: string;
  
  /**
   * Children components
   */
  children: React.ReactNode;
}

/**
 * PageOptimizer component optimizes page loading
 */
export function PageOptimizer({
  criticalImages = [],
  optionalImages = [],
  highPriority = false,
  pageId,
  children
}: PageOptimizerProps) {
  const location = useLocation();
  const { isFirstLoad, connectionSpeed, reducedMotion } = usePerformance();
  const containerRef = useRef<HTMLDivElement>(null);
  const pageIdentifier = pageId || location.pathname;
  
  // Preload critical images when page becomes visible
  useEffect(() => {
    if (criticalImages.length === 0) return;
    
    // Create intersection observer to detect when page is visible
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // Only preload critical images for first visible section
          const maxConcurrent = connectionSpeed === 'fast' ? 5 : 
                               connectionSpeed === 'medium' ? 3 : 2;
          
          preloadImages(criticalImages, maxConcurrent);
          observer.disconnect();
        }
      },
      { threshold: 0.1 } // Start preloading when 10% of container is visible
    );
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => observer.disconnect();
  }, [criticalImages, connectionSpeed, pageIdentifier]);
  
  // Load optional images with lower priority after a delay
  useEffect(() => {
    if (optionalImages.length === 0) return;
    
    // Skip or delay optional images on slow connections
    const shouldSkip = connectionSpeed === 'slow' || connectionSpeed === 'offline';
    if (shouldSkip && !highPriority) return;
    
    // Determine delay based on connection and priority
    const delay = isFirstLoad ? 2000 : 
                 connectionSpeed === 'fast' ? 1000 : 
                 connectionSpeed === 'medium' ? 2000 : 3000;
    
    // Use requestIdleCallback to load when browser is idle
    const timeoutId = setTimeout(() => {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => {
          preloadImages(optionalImages, 2);
        });
      } else {
        // Fallback for browsers without requestIdleCallback
        preloadImages(optionalImages, 2);
      }
    }, delay);
    
    return () => clearTimeout(timeoutId);
  }, [optionalImages, connectionSpeed, isFirstLoad, highPriority]);
  
  // Track page view for performance metrics
  useEffect(() => {
    // Record page load time
    const pageStartTime = performance.now();
    
    // Initialize animation settings based on device capabilities
    const animationClass = reducedMotion ? 'reduced-motion' : 'standard-motion';
    if (containerRef.current) {
      containerRef.current.classList.add(animationClass);
    }
    
    return () => {
      // Record page view duration when unmounting
      const pageDuration = performance.now() - pageStartTime;
      
      // Track in performance metrics if available
      if (window.perfMetrics) {
        window.perfMetrics.pageSwitches = (window.perfMetrics.pageSwitches || 0) + 1;
        window.perfMetrics.pageTimings[pageIdentifier] = pageDuration;
      }
    };
  }, [pageIdentifier, reducedMotion]);
  
  return (
    <div ref={containerRef} className="page-optimizer">
      {children}
    </div>
  );
}
