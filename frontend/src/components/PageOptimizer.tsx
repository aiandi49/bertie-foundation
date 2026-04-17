import React, { useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { PerformanceTracker } from './PerformanceTracker';
import { ResourcePrefetcher } from './ResourcePrefetcher';
import { isDevelopmentMode } from '../utils/environmentUtils';
import { addResourceHint } from '../utils/imagePreload';

declare global {
  interface Window {
    perfMetrics?: {
      pageTimings: Record<string, number>;
      pageSwitches: number;
      jsChunksLoaded: number;
      resourceStats: {
        images: number;
        scripts: number;
        stylesheets: number;
      };
    };
  }
}

interface Props {
  /**
   * Children to render
   */
  children: ReactNode;
  
  /**
   * Show performance metrics in dev mode
   */
  showMetrics?: boolean;
  
  /**
   * Resources to prefetch for improved performance
   */
  resources?: {
    images?: string[];
    pages?: string[];
    domains?: string[];
  };
  
  /**
   * Enable code splitting optimization
   */
  enableCodeSplitting?: boolean;
  
  /**
   * Priority level for resource prefetching
   * - high: preload critical resources immediately
   * - medium: load after initial render
   * - low: load during idle time
   */
  priorityLevel?: 'high' | 'medium' | 'low';
}

/**
 * PageOptimizer - Wraps pages with performance optimizations
 * 
 * This component provides:
 * 1. Performance tracking
 * 2. Resource prefetching
 * 3. Code splitting optimization
 */
export function PageOptimizer({
  children,
  showMetrics = isDevelopmentMode(),
  resources = {},
  enableCodeSplitting = true,
  priorityLevel = 'medium'
}: Props) {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  
  // Show content after a short delay to prevent layout shifts
  useEffect(() => {
    setIsVisible(false);
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, [location.pathname]);
  
  // Initialize performance metrics if they don't exist
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.perfMetrics) {
      window.perfMetrics = {
        pageTimings: {},
        pageSwitches: 0,
        jsChunksLoaded: 0,
        resourceStats: {
          images: 0,
          scripts: 0,
          stylesheets: 0
        }
      };
    }
    
    // Track resource loading performance
    if (enableCodeSplitting && typeof PerformanceObserver !== 'undefined') {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            // Track resource timings
            if (entry.initiatorType === 'img' && window.perfMetrics) {
              window.perfMetrics.resourceStats.images++;
            } else if (entry.initiatorType === 'script' && window.perfMetrics) {
              window.perfMetrics.resourceStats.scripts++;
            } else if (entry.initiatorType === 'link' && window.perfMetrics) {
              window.perfMetrics.resourceStats.stylesheets++;
            }
          }
        });
        
        observer.observe({ entryTypes: ['resource'] });
        return () => observer.disconnect();
      } catch (e) {
        console.warn('PerformanceObserver not supported', e);
      }
    }
  }, [enableCodeSplitting]);
  
  return (
    <>
      {/* Page content with fade-in effect to prevent layout shifts */}
      <div 
        className={`transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        aria-busy={!isVisible}
      >
        {children}
      </div>
      
      {/* Performance monitoring */}
      <PerformanceTracker showMetrics={showMetrics} />
      
      {/* Resource prefetching */}
      <ResourcePrefetcher
        preloadImages={resources.images || []}
        prefetchPages={resources.pages || []}
        preconnectDomains={resources.domains || []}
        priority={priorityLevel === 'high'}
        options={{
          delay: priorityLevel === 'low' ? 2000 : priorityLevel === 'medium' ? 1000 : 0,
          useIdleTime: priorityLevel === 'low'
        }}
      />
    </>
  );
}