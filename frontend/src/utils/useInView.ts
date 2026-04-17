/**
 * useInView - Custom hook to detect when an element enters the viewport
 * Used for lazy loading and triggering animations
 */
import { useState, useEffect, useRef, RefObject } from 'react';

interface UseInViewOptions {
  /**
   * Root margin, like CSS margin but for the IntersectionObserver
   * Default '0px'
   */
  rootMargin?: string;
  
  /**
   * Threshold when the callback should be triggered
   * 0 means as soon as one pixel is visible
   * 1 means the entire element must be visible
   */
  threshold?: number | number[];
  
  /**
   * Only trigger the intersection once
   */
  triggerOnce?: boolean;
  
  /**
   * Root element to use as viewport
   */
  root?: Element | null;
  
  /**
   * Disable this hook entirely
   */
  disabled?: boolean;
}

interface UseInViewReturn {
  /**
   * Ref to attach to the element you want to monitor
   */
  ref: RefObject<any>;
  
  /**
   * Whether the element is in view
   */
  inView: boolean;
  
  /**
   * Entry from the IntersectionObserver
   */
  entry?: IntersectionObserverEntry;
}

/**
 * Hook to detect when an element enters the viewport
 */
export function useInView({
  rootMargin = '0px',
  threshold = 0,
  triggerOnce = false,
  root = null,
  disabled = false,
}: UseInViewOptions = {}): UseInViewReturn {
  const [inView, setInView] = useState<boolean>(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry>();
  const ref = useRef<Element>(null);
  const frozen = useRef<boolean>(false);
  
  useEffect(() => {
    // Early return if hook is disabled
    if (disabled) return;
    
    // Early return if no window (SSR) or no IntersectionObserver
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      // Fallback: consider element in view for SSR or no support
      setInView(true);
      return;
    }
    
    // Get current ref value
    const element = ref.current;
    if (!element) return;
    
    // Set up observer
    const observer = new IntersectionObserver(
      (entries) => {
        // We only ever observe one element, so entries[0] is our target
        const entry = entries[0];
        
        // Update state with new information
        setEntry(entry);
        
        // If we should trigger once and we're already frozen, don't change state
        if (frozen.current) return;
        
        const isInView = entry.isIntersecting;
        setInView(isInView);
        
        // If element is in view and we only need to trigger once, freeze
        if (isInView && triggerOnce) {
          frozen.current = true;
          observer.disconnect();
        }
      },
      { root, rootMargin, threshold }
    );
    
    // Start observing
    observer.observe(element);
    
    // Cleanup when unmounted
    return () => {
      observer.disconnect();
    };
  }, [disabled, root, rootMargin, threshold, triggerOnce]);
  
  return { ref, inView, entry };
}
