import { useState, useEffect, useRef, RefObject } from 'react';

interface IntersectionObserverOptions {
  /**
   * Root margin to use for intersection observer
   */
  rootMargin?: string;
  
  /**
   * Threshold for intersection observer (0-1)
   */
  threshold?: number | number[];
  
  /**
   * Whether to disconnect after first intersection
   */
  disconnectOnIntersection?: boolean;
  
  /**
   * Root element to use as viewport
   */
  root?: Element | null;
  
  /**
   * Trigger intersection after timeout even if not visible
   */
  fallbackTimeout?: number | null;
}

/**
 * Hook to detect when an element enters the viewport
 * Optimized for performance with cleanup and options
 */
export function useIntersectionObserver<T extends Element>(
  options: IntersectionObserverOptions = {}
): [RefObject<T>, boolean, IntersectionObserverEntry | null] {
  const {
    rootMargin = '0px',
    threshold = 0,
    disconnectOnIntersection = true,
    root = null,
    fallbackTimeout = 10000,
  } = options;
  
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const elementRef = useRef<T>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    // Clear any existing observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    // Function to handle intersection changes
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      setEntry(entry);
      
      if (entry.isIntersecting) {
        setIsIntersecting(true);
        
        // Disconnect if configured to do so
        if (disconnectOnIntersection && observerRef.current) {
          observerRef.current.disconnect();
          observerRef.current = null;
        }
      } else {
        setIsIntersecting(false);
      }
    };
    
    // Create and start observer
    observerRef.current = new IntersectionObserver(handleIntersection, {
      root,
      rootMargin,
      threshold,
    });
    
    observerRef.current.observe(element);
    
    // Set up fallback timeout if provided
    let timeoutId: number | undefined;
    if (fallbackTimeout !== null) {
      timeoutId = window.setTimeout(() => {
        setIsIntersecting(true);
        if (observerRef.current) {
          observerRef.current.disconnect();
          observerRef.current = null;
        }
      }, fallbackTimeout);
    }
    
    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
    };
  }, [rootMargin, threshold, disconnectOnIntersection, root, fallbackTimeout]);
  
  return [elementRef, isIntersecting, entry];
}

/**
 * Hook to track if a component is in viewport and trigger a callback
 */
export function useInViewport<T extends Element>(callback: (inView: boolean) => void, options?: IntersectionObserverOptions) {
  const [ref, isIntersecting] = useIntersectionObserver<T>(options);
  
  useEffect(() => {
    callback(isIntersecting);
  }, [isIntersecting, callback]);
  
  return ref;
}

/**
 * Hook to lazy load content when in viewport
 */
export function useLazyLoad<T extends Element>(options?: IntersectionObserverOptions) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const ref = useInViewport<T>((inView) => {
    if (inView && !shouldLoad) {
      setShouldLoad(true);
    }
  }, options);
  
  return { ref, shouldLoad };
}
