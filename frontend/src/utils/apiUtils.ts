/**
 * API Optimization Utilities
 */

// Cache for storing API responses
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number; // Expiry time in milliseconds
}

type CacheStore = Record<string, CacheItem<any>>;

// In-memory cache
const apiCache: CacheStore = {};

/**
 * Get or fetch data with caching
 * 
 * @param cacheKey Unique key for this request
 * @param fetchFn Function that returns a promise with the data
 * @param expiryTime Time in milliseconds that the cache is valid (default: 5 minutes)
 * @returns The cached data or fetched data
 */
export async function getCachedData<T>(
  cacheKey: string, 
  fetchFn: () => Promise<T>, 
  expiryTime: number = 5 * 60 * 1000
): Promise<T> {
  const now = Date.now();
  const cached = apiCache[cacheKey];

  // If we have cached data and it's not expired, use it
  if (cached && now < cached.expiry) {
    console.log(`Using cached data for ${cacheKey}`);
    return cached.data;
  }

  // Otherwise fetch fresh data
  try {
    console.log(`Fetching fresh data for ${cacheKey}`);
    const data = await fetchFn();
    
    // Store in cache
    apiCache[cacheKey] = {
      data,
      timestamp: now,
      expiry: now + expiryTime
    };
    
    return data;
  } catch (error) {
    // If we have stale data, return it on error
    if (cached) {
      console.warn(`Error fetching data, using stale cache for ${cacheKey}`);
      return cached.data;
    }
    
    // Otherwise, propagate the error
    throw error;
  }
}

/**
 * Clear all or specific cache entries
 * 
 * @param cacheKey Optional key to clear specific cache entry
 */
export function clearCache(cacheKey?: string): void {
  if (cacheKey) {
    delete apiCache[cacheKey];
  } else {
    // Clear all cache
    Object.keys(apiCache).forEach(key => delete apiCache[key]);
  }
}

// Debounce function to reduce frequent API calls
type DebounceFunction = (...args: any[]) => void;

/**
 * Debounce a function to prevent multiple rapid calls
 * 
 * @param func Function to debounce
 * @param wait Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends DebounceFunction>(func: T, wait: number = 300): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>): void {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
  };
}
