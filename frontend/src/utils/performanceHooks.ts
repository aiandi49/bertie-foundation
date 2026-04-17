/**
 * Custom hooks for optimized data loading and performance
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { getCachedData, clearCache } from './apiUtils';

/**
 * Hook for data fetching with optimized caching, loading states, and error handling
 * 
 * @param fetchFn The async function to fetch data
 * @param cacheKey The key to cache the data under
 * @param cacheTime Cache expiration time in milliseconds (default: 5 minutes)
 * @param dependencies Array of dependencies that trigger refetch when changed
 * @returns Object with data, loading state, error state, and refetch function
 */
interface OptimizedQueryOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useOptimizedQuery<T>(
  fetchFn: () => Promise<T>, 
  cacheKey: string, 
  cacheTime: number = 5 * 60 * 1000,
  dependencies: any[] = [],
  options?: OptimizedQueryOptions<T>
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async (force: boolean = false) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Clear cache if forced refresh
      if (force) {
        clearCache(cacheKey);
      }
      
      const result = await getCachedData<T>(cacheKey, fetchFn, cacheTime);
      
      // Only update state if component is still mounted
      if (mountedRef.current) {
        setData(result);
        setIsLoading(false);
        
        // Call onSuccess callback if provided
        if (options?.onSuccess) {
          options.onSuccess(result);
        }
      }
    } catch (err) {
      console.error(`Error fetching data for ${cacheKey}:`, err);
      
      // Only update state if component is still mounted
      if (mountedRef.current) {
        const error = err as Error;
        setError(error);
        setIsLoading(false);
        
        // Call onError callback if provided
        if (options?.onError) {
          options.onError(error);
        }
      }
    }
  }, [fetchFn, cacheKey, cacheTime]);

  // Initial fetch and refetch on dependency changes
  useEffect(() => {
    fetchData();
  }, [...dependencies, fetchData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Add listener to refetch when coming back online
  useEffect(() => {
    const handleOnline = () => {
      fetchData(true); // Force refresh when coming back online
    };
    
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

/**
 * Hook to optimize resource loading by delaying non-critical operations
 * until the page has finished loading critical content
 * 
 * @param callback Function to execute when idle
 * @param delay Optional delay in ms before scheduling the callback
 * @param options Additional options including timeout
 */
export function useIdleCallback(callback: () => void, delay: number = 0, options: { timeout?: number } = {}) {
  useEffect(() => {
    // Use requestIdleCallback when available, otherwise setTimeout
    const scheduleCallback = () => {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(callback, options);
      } else {
        setTimeout(callback, 50); // Fallback delay
      }
    };
    
    // Delay the scheduling
    const timer = setTimeout(scheduleCallback, delay);
    
    return () => {
      clearTimeout(timer);
    };
  }, [callback, delay, options.timeout]);
}

/**
 * Hook for route-based code splitting with prefetching
 * 
 * @param routes Array of routes that might be navigated to
 */
export function usePrefetchRoutes(routes: string[]) {
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;
    
    // Don't prefetch on slow connections
    if ('connection' in navigator && 
        (navigator as any).connection.saveData) {
      return;
    }
    
    const prefetchRoute = (route: string) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = route;
      link.as = 'document';
      document.head.appendChild(link);
    };
    
    // Prefetch routes during idle time
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        routes.forEach(prefetchRoute);
      });
    } else {
      // Fallback to setTimeout
      setTimeout(() => {
        routes.forEach(prefetchRoute);
      }, 1000);
    }
  }, [routes]);
}

/**
 * Hook to optimize resource loading by delaying non-critical operations
 * until the main content is visible to the user
 */
export function useVisibleCallback(callback: () => void) {
  useEffect(() => {
    // Use Intersection Observer API when available
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            callback();
            observer.disconnect();
          }
        },
        { threshold: 0.1 } // 10% visibility triggers the callback
      );
      
      // Create a target element
      const target = document.createElement('div');
      target.style.position = 'absolute';
      target.style.top = '0';
      target.style.left = '0';
      target.style.width = '1px';
      target.style.height = '1px';
      target.style.pointerEvents = 'none';
      document.body.appendChild(target);
      
      observer.observe(target);
      
      return () => {
        observer.disconnect();
        document.body.removeChild(target);
      };
    } else {
      // Fallback for browsers without Intersection Observer
      setTimeout(callback, 1000);
      return () => {};
    }
  }, [callback]);
}
