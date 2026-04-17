import React, { useState, useEffect } from 'react';

interface Props {
  /**
   * Selector for elements to lazy load
   */
  selector?: string;
  
  /**
   * Root margin for intersection observer
   */
  rootMargin?: string;
  
  /**
   * Threshold for intersection observer
   */
  threshold?: number;
  
  /**
   * Load hidden items after timeout (ms)
   */
  timeout?: number;
  
  /**
   * Children elements to render
   */
  children?: React.ReactNode;
}

/**
 * LazyContainer - optimizes rendering of content that's not immediately visible
 * 
 * This component defers rendering of content until it's close to the viewport
 * or after a specified timeout. It's useful for long pages with many elements.
 */
export function LazyContainer({ 
  selector = '[data-lazy]',
  rootMargin = '200px',
  threshold = 0.01,
  timeout = 10000,
  children 
}: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  
  useEffect(() => {
    if (!containerRef) return;
    
    // Skip if we're in a server environment with no window
    if (typeof window === 'undefined') return;
    
    // Create the observer if IntersectionObserver is available
    if (!('IntersectionObserver' in window)) {
      // Fallback for browsers without IntersectionObserver support
      setIsVisible(true);
      return;
    }
    
    // Create the observer
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold }
    );
    
    // Start observing
    observer.observe(containerRef);
    
    // Set a timeout to force visibility if not observed
    const timeoutId = window.setTimeout(() => {
      setIsVisible(true);
      observer.disconnect();
    }, timeout);
    
    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, [containerRef, rootMargin, threshold, timeout]);
  
  // Custom lazy loading of images and iframes inside the container
  useEffect(() => {
    if (!containerRef || !isVisible) return;
    
    // Find all elements that should be lazy loaded
    const lazyElements = containerRef.querySelectorAll(selector);
    
    // Track loading for performance metrics
    let loadedCount = 0;
    const startTime = performance.now();
    
    // Set loading='eager' to start loading
    lazyElements.forEach(element => {
      if (element instanceof HTMLImageElement || element instanceof HTMLIFrameElement) {
        // Update loading attribute
        element.loading = 'eager';
        
        // Set appropriate decoding attribute based on importance
        if (element.getAttribute('data-importance') === 'high') {
          element.decoding = 'sync';
          element.fetchPriority = 'high';
        } else {
          element.decoding = 'async';
          element.fetchPriority = 'auto';
        }
        
        // Track load completion
        const originalOnLoad = element.onload;
        element.onload = (e) => {
          loadedCount++;
          if (originalOnLoad) {
            // @ts-ignore - Call original handler
            originalOnLoad.call(element, e);
          }
        };
      }
      
      // For background images or images with data-src
      if (element.hasAttribute('data-src')) {
        const src = element.getAttribute('data-src');
        if (src) {
          if (element instanceof HTMLImageElement) {
            element.src = src;
          } else {
            element.style.backgroundImage = `url(${src})`;
          }
          element.removeAttribute('data-src');
        }
      }
    });
    
    // Record loading metrics after a slight delay
    if (lazyElements.length > 0 && typeof window !== 'undefined' && window.perfMetrics) {
      setTimeout(() => {
        const loadTime = Math.round(performance.now() - startTime);
        if (typeof window !== 'undefined' && window.perfMetrics) {
          if (!window.perfMetrics.lazyLoadStats) {
            window.perfMetrics.lazyLoadStats = [];
          }
          window.perfMetrics.lazyLoadStats.push({
            total: lazyElements.length,
            loaded: loadedCount,
            loadTime
          });
        }
      }, 1000); // Check after 1 second
    }
  }, [containerRef, isVisible, selector]);
  
  return (
    <div ref={setContainerRef} className="lazy-container">
      {isVisible ? children : <div style={{ height: '10px', minHeight: '10px' }} />}
    </div>
  );
}