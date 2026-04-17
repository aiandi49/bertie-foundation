/**
 * Enhanced caching and API request optimization hooks
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNetworkStatus } from '../components/NetworkStatusProvider';

/**
 * Cached item with TTL
 */
interface CachedItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

/**
 * Response cache options
 */
interface CacheOptions {
  /**
   * Cache TTL in milliseconds (default: 5 minutes)
   */
  ttl?: number;
  
  /**
   * Extended TTL for offline mode in milliseconds (default: 1 hour) 
   */
  offlineTtl?: number;
  
  /**
   * Whether to store in localStorage for persistence across sessions
   */
  persistent?: boolean;
  
  /**
   * Whether to refresh cache in background even when using cached data
   */
  backgroundRefresh?: boolean;
  
  /**
   * On success callback
   */
  onSuccess?: (data: any) => void;
  
  /**
   * On error callback
   */
  onError?: (error: Error) => void;
}

// In-memory cache storage
const memoryCache = new Map<string, CachedItem<any>>();

/**
 * Check if a cached item is still valid
 */
function isCacheValid<T>(cachedItem: CachedItem<T> | null, ttl: number): boolean {
  if (!cachedItem) return false;
  return Date.now() < cachedItem.expiresAt;
}

/**
 * Store item in cache with TTL
 */
function setCacheItem<T>(
  key: string, 
  data: T, 
  ttl: number,
  persistent: boolean = false
): void {
  const timestamp = Date.now();
  const expiresAt = timestamp + ttl;
  const item: CachedItem<T> = { data, timestamp, expiresAt };
  
  // Store in memory cache
  memoryCache.set(key, item);
  
  // Optionally store in localStorage
  if (persistent) {
    try {
      localStorage.setItem(
        `api_cache_${key}`, 
        JSON.stringify(item)
      );
    } catch (error) {
      console.warn('Failed to store in localStorage:', error);
    }
  }
}

/**
 * Get item from cache
 */
function getCacheItem<T>(key: string, persistent: boolean = false): CachedItem<T> | null {
  // Try memory cache first
  const memoryItem = memoryCache.get(key) as CachedItem<T> | undefined;
  
  if (memoryItem) {
    return memoryItem;
  }
  
  // Fall back to localStorage if persistent cache is enabled
  if (persistent) {
    try {
      const storedItem = localStorage.getItem(`api_cache_${key}`);
      
      if (storedItem) {
        const parsedItem = JSON.parse(storedItem) as CachedItem<T>;
        // Also store in memory for faster access next time
        memoryCache.set(key, parsedItem);
        return parsedItem;
      }
    } catch (error) {
      console.warn('Failed to retrieve from localStorage:', error);
    }
  }
  
  return null;
}

/**
 * Clear cached item by key
 */
export function clearCacheItem(key: string, persistent: boolean = false): void {
  memoryCache.delete(key);
  
  if (persistent) {
    try {
      localStorage.removeItem(`api_cache_${key}`);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  }
}

/**
 * Clear all cached items
 */
export function clearAllCache(): void {
  // Clear memory cache
  memoryCache.clear();
  
  // Clear localStorage API cache items
  try {
    Object.keys(localStorage)
      .filter(key => key.startsWith('api_cache_'))
      .forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.warn('Failed to clear localStorage cache:', error);
  }
}

/**
 * Hook for enhanced API caching with network awareness
 */
export function useApiCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: CacheOptions = {}
) {
  const {
    ttl = 5 * 60 * 1000, // 5 minutes default
    offlineTtl = 60 * 60 * 1000, // 1 hour default
    persistent = false,
    backgroundRefresh = true,
    onSuccess,
    onError
  } = options;
  
  const { isOnline, isSlowConnection } = useNetworkStatus();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isMounted = useRef(true);
  
  // Determine effective TTL based on network status
  const effectiveTtl = !isOnline ? offlineTtl : ttl;
  
  // Fetch data with cache awareness
  const fetchData = useCallback(async (skipCache = false) => {
    // Skip if not mounted
    if (!isMounted.current) return;
    
    // Check cache first unless explicitly skipped
    if (!skipCache) {
      const cachedItem = getCacheItem<T>(key, persistent);
      
      if (isCacheValid(cachedItem, effectiveTtl)) {
        // Use cached data
        setData(cachedItem.data);
        setIsLoading(false);
        setError(null);
        
        // Set last updated timestamp
        setLastUpdated(new Date(cachedItem.timestamp));
        
        // Optionally refresh in background if online
        if (backgroundRefresh && isOnline && !isSlowConnection) {
          setIsRefreshing(true);
          fetchFromNetwork(true);
        }
        
        return cachedItem.data;
      }
    }
    
    // No valid cache, fetch from network
    return fetchFromNetwork(false);
  }, [key, fetchFn, effectiveTtl, persistent, backgroundRefresh, isOnline, isSlowConnection]);
  
  // Fetch from network helper
  const fetchFromNetwork = async (isBackground = false) => {
    if (!isBackground) {
      setIsLoading(true);
    }
    
    try {
      const result = await fetchFn();
      
      if (isMounted.current) {
        setData(result);
        
        if (!isBackground) {
          setIsLoading(false);
        } else {
          setIsRefreshing(false);
        }
        
        setError(null);
        
        // Update cache
        setCacheItem(key, result, effectiveTtl, persistent);
        setLastUpdated(new Date());
        
        // Call success callback if provided
        if (onSuccess) onSuccess(result);
        
        return result;
      }
    } catch (err) {
      if (isMounted.current) {
        if (!isBackground) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsLoading(false);
        } else {
          setIsRefreshing(false);
        }
        
        // Call error callback if provided
        if (onError) onError(err instanceof Error ? err : new Error(String(err)));
      }
      throw err;
    }
  };
  
  // Refresh data and cache
  const refresh = useCallback(() => {
    return fetchData(true); // Skip cache
  }, [fetchData]);
  
  // Initial fetch
  useEffect(() => {
    fetchData();
    
    // Cleanup
    return () => {
      isMounted.current = false;
    };
  }, [fetchData]);
  
  // Invalidate the cache for this key
  const invalidateCache = useCallback(() => {
    clearCacheItem(key, persistent);
    return refresh();
  }, [key, persistent, refresh]);
  
  return {
    data,
    isLoading,
    isRefreshing,
    error,
    refresh,
    lastUpdated,
    invalidateCache
  };
}
