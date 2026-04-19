/**
 * Utilities for resource hints to improve page loading performance
 * 
 * This file contains functions for optimizing resource loading through browser hints,
 * preloading, and other web performance optimization techniques.
 */

/**
 * Interface for resource hint options
 */
interface ResourceHintOptions {
  // Resources to preload
  preload?: Array<{ href: string; as: 'style' | 'script' | 'image' | 'font' | 'fetch' }>;
  
  // Resources to prefetch (lower priority than preload)
  prefetch?: Array<{ href: string; as?: 'style' | 'script' | 'image' | 'font' | 'fetch' }>;
  
  // Domains to preconnect to
  preconnect?: Array<{ href: string; crossorigin?: boolean }>;
  
  // DNS to preconnect
  dnsPrefetch?: Array<{ href: string }>;
}

/**
 * Add resource hints to improve page loading performance
 * 
 * @param options Resource hint options
 */
export function getResourceHints(options?: ResourceHintOptions): void {
  // Skip if not in browser
  if (typeof document === 'undefined') return;
  
  // Default options with commonly used resources
  const defaultOptions: ResourceHintOptions = {
    preconnect: [
      // Common API domains
      
      // Common static asset domains
      
      // Common image hosting services
      { href: 'https://images.unsplash.com', crossorigin: true }
    ],
    dnsPrefetch: [
      // Additional common domains
      { href: 'https://fonts.googleapis.com' },
      { href: 'https://fonts.gstatic.com' }
    ]
  };
  
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    // Merge arrays
    preconnect: [...(defaultOptions.preconnect || []), ...(options?.preconnect || [])],
    dnsPrefetch: [...(defaultOptions.dnsPrefetch || []), ...(options?.dnsPrefetch || [])],
    preload: [...(defaultOptions.preload || []), ...(options?.preload || [])]
  };
  
  // Add preconnect hints
  if (mergedOptions.preconnect) {
    mergedOptions.preconnect.forEach(({ href, crossorigin }) => {
      if (document.querySelector(`link[rel="preconnect"][href="${href}"]`)) return;
      
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = href;
      if (crossorigin) link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }
  
  // Add DNS prefetch hints
  if (mergedOptions.dnsPrefetch) {
    mergedOptions.dnsPrefetch.forEach(({ href }) => {
      if (document.querySelector(`link[rel="dns-prefetch"][href="${href}"]`)) return;
      
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = href;
      document.head.appendChild(link);
    });
  }
  
  // Add preload hints
  if (mergedOptions.preload) {
    mergedOptions.preload.forEach(({ href, as }) => {
      if (document.querySelector(`link[rel="preload"][href="${href}"]`)) return;
      
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = href;
      link.as = as;
      document.head.appendChild(link);
    });
  }
}

/**
 * Adds resource hints for a specific module or route
 * Call this when entering a route that needs specific resources
 */
export function addDynamicResourceHints(options: ResourceHintOptions): void {
  getResourceHints(options);
}

/**
 * Preconnect to a domain, optimized for just-in-time connection establishment
 * Great for hover interactions that might lead to navigation
 */
export function preconnectToDomain(href: string, crossorigin = true): void {
  if (typeof document === 'undefined') return;
  
  // Skip if already exists
  if (document.querySelector(`link[rel="preconnect"][href="${href}"]`)) return;
  
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = href;
  if (crossorigin) link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
}

/**
 * Preload an image and get a promise that resolves when it's loaded
 * @param src Image source URL
 * @returns Promise that resolves with the src when loaded
 */
export function preloadImageWithPromise(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!src || typeof window === 'undefined') {
      reject(new Error('Invalid image source'));
      return;
    }
    
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

/**
 * Preload multiple images and get notified when all are loaded
 * @param sources Array of image URLs to preload
 * @returns Promise that resolves with array of successfully loaded URLs
 */
export function preloadMultipleImages(sources: string[]): Promise<string[]> {
  if (!sources || !Array.isArray(sources) || sources.length === 0) {
    return Promise.resolve([]);
  }
  
  return Promise.all(
    sources.map(src => preloadImageWithPromise(src).catch(() => null))
  ).then(results => results.filter(Boolean) as string[]);
}

/**
 * Setup common resource hints for the app
 * Call this early in app initialization
 */
export function setupCommonResourceHints(): void {
  getResourceHints();
}

/**
 * Register the service worker for offline support and caching
 * @returns Promise that resolves with boolean success status
 */
export function registerServiceWorker(): Promise<boolean> {
  if ('serviceWorker' in navigator && typeof window !== 'undefined') {
    return navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope:', registration.scope);
        return true;
      })
      .catch(error => {
        console.error('ServiceWorker registration failed:', error);
        return false;
      });
  }
  return Promise.resolve(false);
}

/**
 * Prefetch a page (document) for anticipated navigation
 * @param path The path to prefetch
 */
export function prefetchPage(path: string): void {
  if (!path || typeof document === 'undefined') return;
  
  // Skip if already prefetched
  const prefetchUrl = new URL(path, window.location.origin).href;
  if (document.querySelector(`link[rel="prefetch"][href="${prefetchUrl}"]`)) return;
  
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = prefetchUrl;
  link.as = 'document';
  document.head.appendChild(link);
  
  console.log(`Prefetched page: ${prefetchUrl}`);
}

/**
 * Use the browser's requestIdleCallback API to perform non-critical tasks
 * when the browser is idle
 * @param callback Function to execute during idle time
 * @param options Options for requestIdleCallback
 */
export function scheduleIdleTask(
  callback: () => void,
  options: { timeout?: number } = {}
): void {
  if (typeof window === 'undefined') return;
  
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(callback, options);
  } else {
    // Fallback for browsers that don't support requestIdleCallback
    setTimeout(callback, options.timeout || 1);
  }
}

/**
 * Send a message to the service worker
 * @param message The message to send
 * @returns Promise that resolves when the service worker responds
 */
export function sendMessageToServiceWorker(message: any): Promise<any> {
  if (!('serviceWorker' in navigator) || typeof window === 'undefined') {
    return Promise.reject(new Error('Service Worker not supported'));
  }
  
  return new Promise((resolve, reject) => {
    const messageChannel = new MessageChannel();
    
    messageChannel.port1.onmessage = event => {
      if (event.data.error) {
        reject(event.data.error);
      } else {
        resolve(event.data);
      }
    };
    
    // If service worker is active, send the message
    navigator.serviceWorker.ready
      .then(registration => {
        registration.active?.postMessage(message, [messageChannel.port2]);
      })
      .catch(reject);
  });
}

/**
 * Tell the service worker to preload and cache resources
 * @param urls Array of URLs to preload and cache
 */
export function preloadResourcesInServiceWorker(urls: string[]): void {
  if (!urls || !Array.isArray(urls) || urls.length === 0) return;
  
  sendMessageToServiceWorker({
    type: 'PRELOAD_RESOURCES',
    urls: urls
  }).catch(error => {
    console.error('Failed to send preload message to service worker:', error);
  });
}

/**
 * Generate a responsive image URL for the service worker to handle
 * @param url Original image URL
 * @param width Desired image width
 * @returns Service worker URL for responsive image
 */
export function getResponsiveImageUrl(url: string, width: number): string {
  if (!url) return '';
  
  // Create a URL that the service worker can intercept and transform
  return `/image-resize/${width}/${encodeURIComponent(url)}`;
}
