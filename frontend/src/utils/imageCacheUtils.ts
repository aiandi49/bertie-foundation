/**
 * Image caching utilities to optimize image loading performance
 */

/**
 * In-memory cache for images that have been loaded
 */
const loadedImages = new Set<string>();

/**
 * Browser cache state detection
 */
const browserCacheState = new Map<string, 'checking' | 'cached' | 'not-cached' | 'error'>();

/**
 * Track an image as loaded
 * 
 * @param url Image URL that has been loaded
 */
export function trackImageLoaded(url: string): void {
  loadedImages.add(url);
}

/**
 * Check if an image is already loaded in this session
 * 
 * @param url Image URL to check
 * @returns True if the image has been loaded
 */
export function isImageLoadedInSession(url: string): boolean {
  return loadedImages.has(url);
}

/**
 * Check if an image exists in browser cache
 * 
 * @param url Image URL to check
 * @returns Promise that resolves with a boolean indicating if the image is cached
 */
export function checkImageCacheStatus(url: string): Promise<'cached' | 'not-cached'> {
  // Check if we already determined the cache state
  if (browserCacheState.has(url)) {
    const state = browserCacheState.get(url);
    if (state === 'cached' || state === 'not-cached') {
      return Promise.resolve(state);
    }
  }
  
  // Set state to checking
  browserCacheState.set(url, 'checking');
  
  return new Promise((resolve) => {
    const img = new Image();
    
    // Set up a timeout to detect cached images
    let timedOut = false;
    const timeoutId = setTimeout(() => {
      timedOut = true;
      browserCacheState.set(url, 'not-cached');
      resolve('not-cached');
    }, 50); // Very short timeout - cached images load immediately
    
    img.onload = () => {
      // If we haven't timed out yet, image is likely cached
      if (!timedOut) {
        clearTimeout(timeoutId);
        browserCacheState.set(url, 'cached');
        resolve('cached');
      }
      // Always track as loaded
      trackImageLoaded(url);
    };
    
    img.onerror = () => {
      clearTimeout(timeoutId);
      browserCacheState.set(url, 'error');
      resolve('not-cached');
    };
    
    // Trigger the load
    img.src = url;
  });
}

/**
 * Preload a batch of images with priority ordering
 * 
 * @param urls Array of image URLs to preload
 * @param maxConcurrent Maximum number of concurrent requests
 * @returns Promise that resolves when all images are preloaded
 */
export async function preloadImages(
  urls: string[],
  maxConcurrent: number = 3
): Promise<void> {
  // Skip already loaded images
  const urlsToLoad = urls.filter(url => !isImageLoadedInSession(url));
  if (urlsToLoad.length === 0) return;
  
  // Process in batches to limit concurrent requests
  for (let i = 0; i < urlsToLoad.length; i += maxConcurrent) {
    const batch = urlsToLoad.slice(i, i + maxConcurrent);
    await Promise.all(
      batch.map(url => {
        return new Promise<void>(resolve => {
          const img = new Image();
          img.onload = () => {
            trackImageLoaded(url);
            resolve();
          };
          img.onerror = () => resolve(); // Resolve even on error
          img.src = url;
        });
      })
    );
  }
}

/**
 * Calculate the appropriate image size based on device and container
 * 
 * @param originalWidth Original width of the image
 * @param containerWidth Width of the container (as percent or pixels)
 * @returns Calculated width in pixels
 */
export function calculateOptimalImageSize(
  originalWidth: number,
  containerWidth: string | number = '100%'
): number {
  // Get device pixel ratio and viewport width
  const pixelRatio = window.devicePixelRatio || 1;
  const viewportWidth = window.innerWidth;
  
  // Convert container width to pixels
  let containerPixels = 0;
  if (typeof containerWidth === 'number') {
    containerPixels = containerWidth;
  } else if (containerWidth.endsWith('%')) {
    const percentage = parseFloat(containerWidth) / 100;
    containerPixels = viewportWidth * percentage;
  } else if (containerWidth.endsWith('px')) {
    containerPixels = parseFloat(containerWidth);
  }
  
  // Calculate optimal size, accounting for pixel ratio
  const optimalWidth = Math.round(containerPixels * pixelRatio);
  
  // Don't upscale images
  return Math.min(optimalWidth, originalWidth);
}
