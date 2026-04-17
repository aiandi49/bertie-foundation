/**
 * Image preloading and caching utilities
 */

/**
 * Preload an image in the browser cache
 * 
 * @param src Image URL to preload
 * @returns Promise that resolves when the image is loaded
 */
export function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

/**
 * Preload multiple images in parallel
 * 
 * @param sources Array of image URLs to preload
 * @returns Promise that resolves when all images are loaded
 */
export function preloadImages(sources: string[]): Promise<HTMLImageElement[]> {
  return Promise.all(sources.map(preloadImage));
}

/**
 * Check if an image is already cached by the browser
 * 
 * @param src Image URL to check
 * @returns Promise that resolves to boolean indicating if image is cached
 */
export function isImageCached(src: string): Promise<boolean> {
  return new Promise(resolve => {
    const img = new Image();
    
    // If image loads immediately (within 20ms), it's likely cached
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    
    // Set src after handlers
    img.src = src;
    
    // If image is in cache, onload may have already fired
    // In this case, check complete property
    if (img.complete) {
      resolve(true);
    }
  });
}

/**
 * Create a resource hint link element
 * 
 * @param url URL to preload/prefetch/preconnect
 * @param type Type of resource hint to create
 * @returns HTMLLinkElement that can be appended to document head
 */
export function createResourceHint(
  url: string, 
  type: 'preload' | 'prefetch' | 'preconnect' | 'dns-prefetch',
  options?: {
    as?: string;
    crossOrigin?: 'anonymous' | 'use-credentials';
    media?: string;
  }
): HTMLLinkElement {
  const link = document.createElement('link');
  link.rel = type;
  link.href = url;
  
  if (options?.as) {
    link.as = options.as;
  }
  
  if (options?.crossOrigin) {
    link.crossOrigin = options.crossOrigin;
  }
  
  if (options?.media) {
    link.media = options.media;
  }
  
  return link;
}

/**
 * Add a resource hint to the document head
 * 
 * @param url URL to preload/prefetch/preconnect
 * @param type Type of resource hint
 * @param options Additional options
 */
export function addResourceHint(
  url: string,
  type: 'preload' | 'prefetch' | 'preconnect' | 'dns-prefetch',
  options?: {
    as?: string;
    crossOrigin?: 'anonymous' | 'use-credentials';
    media?: string;
  }
): void {
  // Check if hint already exists
  const existingLink = document.querySelector(
    `link[rel="${type}"][href="${url}"]`
  );
  
  if (!existingLink) {
    const link = createResourceHint(url, type, options);
    document.head.appendChild(link);
  }
}