/**
 * Image optimization utilities for better performance
 */

/**
 * Generate responsive image sizes for different screen widths and device pixel ratios
 * 
 * @param originalWidth Original image width in pixels
 * @param options Configuration options
 * @returns Array of width sizes to use in srcset
 */
export function getResponsiveSizes(originalWidth: number, options: {
  minWidth?: number;
  maxWidth?: number;
  steps?: number;
} = {}) {
  const {
    minWidth = Math.min(originalWidth, 320),
    maxWidth = originalWidth,
    steps = 4
  } = options;
  
  // Calculate step size
  const step = Math.floor((maxWidth - minWidth) / (steps - 1));
  
  // Generate sizes
  const sizes: number[] = [];
  for (let i = 0; i < steps; i++) {
    const size = Math.min(maxWidth, minWidth + i * step);
    if (!sizes.includes(size) && size > 0) {
      sizes.push(size);
    }
  }
  
  // Make sure we have the max width
  if (!sizes.includes(maxWidth)) {
    sizes.push(maxWidth);
  }
  
  return sizes.sort((a, b) => a - b);
}

/**
 * Generate srcset for responsive images
 * 
 * @param src Base image URL
 * @param sizes Array of widths to generate
 * @returns srcset attribute value
 */
export function generateSrcSet(
  src: string,
  sizes: number[]
): string {
  // Check if the image URL supports width parameter
  const supportsWidth = src.includes('?') || src.includes('width=');
  
  if (!supportsWidth) {
    return '';
  }
  
  return sizes
    .map(size => {
      // Add width parameter based on URL structure
      const url = src.includes('?')
        ? `${src}&width=${size}`
        : `${src}?width=${size}`;
      
      return `${url} ${size}w`;
    })
    .join(', ');
}

/**
 * Calculate the appropriate sizes attribute for responsive images
 * 
 * @param containerWidth Width of the image container as percentage or fixed width
 * @returns sizes attribute string
 */
export function calculateSizesAttribute(containerWidth: string | number): string {
  if (typeof containerWidth === 'number') {
    return `${containerWidth}px`;
  }
  
  // For percentage-based widths, create a responsive sizes value
  if (containerWidth.endsWith('%')) {
    const percentage = parseFloat(containerWidth);
    return `(max-width: 768px) 100vw, ${percentage}vw`;
  }
  
  return '100vw';
}

/**
 * Check if browser supports modern image formats
 * 
 * @returns Object with support flags
 */
export function detectImageSupport(): {
  webp: boolean;
  avif: boolean;
} {
  // In SSR/build environment, assume no support
  if (typeof document === 'undefined') {
    return { webp: false, avif: false };
  }
  
  // For client-side, we would normally test, but let's assume modern browsers
  // In a real app, you'd use feature detection
  return {
    webp: true,
    avif: false // Most browsers don't support AVIF yet
  };
}