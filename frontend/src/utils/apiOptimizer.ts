/**
 * API optimization utilities to improve performance of data fetching
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiration: number;
}

// In-memory cache for API responses
let apiCache: Record<string, CacheEntry<any>> = {};

// Maximum number of entries in the cache (prevent memory leaks)
const MAX_CACHE_SIZE = 100;

/**
 * Cache API response in memory with expiration
 * 
 * @param key Cache key (usually endpoint URL + params hash)
 * @param data Response data to cache
 * @param ttl Time to live in milliseconds
 */
export function cacheApiResponse<T>(key: string, data: T, ttl: number): void {
  const timestamp = Date.now();
  const expiration = timestamp + ttl;
  
  // Add to cache
  apiCache[key] = { data, timestamp, expiration };
  
  // Trim cache if too large
  const cacheKeys = Object.keys(apiCache);
  if (cacheKeys.length > MAX_CACHE_SIZE) {
    // Remove oldest entries
    const oldestEntries = cacheKeys
      .map(k => ({ key: k, timestamp: apiCache[k].timestamp }))
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(0, cacheKeys.length - MAX_CACHE_SIZE)
      .map(entry => entry.key);
    
    // Remove from cache
    oldestEntries.forEach(key => {
      delete apiCache[key];
    });
  }
}

/**
 * Get cached API response
 * 
 * @param key Cache key
 * @returns Cached data or null if not found or expired
 */
export function getCachedApiResponse<T>(key: string): T | null {
  const entry = apiCache[key];
  
  // Return null if no cache entry
  if (!entry) return null;
  
  // Return null if expired
  if (Date.now() > entry.expiration) {
    delete apiCache[key]; // Clean up expired entry
    return null;
  }
  
  return entry.data;
}

/**
 * Clear specific cache entry
 * 
 * @param key Cache key to clear
 */
export function clearCacheEntry(key: string): void {
  delete apiCache[key];
}

/**
 * Clear all cache entries or entries matching a pattern
 * 
 * @param pattern Optional regex pattern to match cache keys
 */
export function clearApiCache(pattern?: RegExp): void {
  if (!pattern) {
    // Clear entire cache
    apiCache = {};
    return;
  }
  
  // Clear only matching entries
  Object.keys(apiCache).forEach(key => {
    if (pattern.test(key)) {
      delete apiCache[key];
    }
  });
}

/**
 * Generate a cache key from endpoint and parameters
 * 
 * @param endpoint API endpoint
 * @param params Query parameters or body
 * @returns Cache key string
 */
export function generateCacheKey(endpoint: string, params?: any): string {
  if (!params) return endpoint;
  
  // Sort parameters to ensure consistent keys
  const sortedParams = typeof params === 'object' ? 
    Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {} as Record<string, any>) : 
    params;
  
  return `${endpoint}:${JSON.stringify(sortedParams)}`;
}

/**
 * Create optimized fetch function with caching
 * 
 * @param fetchFn Original fetch function
 * @param ttl Cache TTL in milliseconds
 * @returns Optimized fetch function with caching
 */
export function createOptimizedFetch<T, P>(fetchFn: (params: P) => Promise<T>, ttl: number = 5 * 60 * 1000) {
  return async (params: P, forceFresh: boolean = false): Promise<T> => {
    // Generate cache key
    const cacheKey = generateCacheKey(fetchFn.name, params);
    
    // Check cache if not forcing fresh data
    if (!forceFresh) {
      const cachedData = getCachedApiResponse<T>(cacheKey);
      if (cachedData) return cachedData;
    }
    
    // Fetch fresh data
    const data = await fetchFn(params);
    
    // Cache the result
    cacheApiResponse(cacheKey, data, ttl);
    
    return data;
  };
}
