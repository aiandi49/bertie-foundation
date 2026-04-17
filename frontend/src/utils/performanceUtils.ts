/**
 * Utilities for performance optimization
 */

// Flag to detect if the device is low-powered
let isLowPoweredDevice: boolean | null = null;

/**
 * Check if the device is likely to be low-powered
 * This is a simple heuristic based on user agent and device memory
 * 
 * @returns boolean indicating if the device is likely low-powered
 */
export function checkLowPoweredDevice(): boolean {
  // Return cached result if available
  if (isLowPoweredDevice !== null) {
    return isLowPoweredDevice;
  }
  
  // Check if the device is mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Check device memory if available (Chrome only)
  const hasLowMemory = 'deviceMemory' in navigator && (navigator as any).deviceMemory < 4;
  
  // Check for low CPU cores if available (experimental API)
  const hasLowCPU = 'hardwareConcurrency' in navigator && navigator.hardwareConcurrency < 4;
  
  // Check if the connection is slow
  const hasSlowConnection = 'connection' in navigator && 
    (navigator as any).connection && 
    ((navigator as any).connection.saveData ||
     (navigator as any).connection.effectiveType === 'slow-2g' ||
     (navigator as any).connection.effectiveType === '2g' ||
     (navigator as any).connection.effectiveType === '3g');
  
  // Consider a device low-powered if it meets at least one criteria
  isLowPoweredDevice = isMobile && (hasLowMemory || hasLowCPU || hasSlowConnection);
  
  return isLowPoweredDevice;
}

/**
 * Get optimized animation settings based on device capabilities
 * 
 * @returns Animation config with appropriate values for the current device
 */
export function getOptimizedAnimationConfig() {
  const isLowPower = checkLowPoweredDevice();
  
  return {
    // Reduce animation duration for low-powered devices
    duration: isLowPower ? 0.3 : 0.8,
    
    // Use simpler easing for low-powered devices
    ease: isLowPower ? "easeOut" : "easeInOut",
    
    // Disable or reduce staggering for low-powered devices
    staggerChildren: isLowPower ? 0.1 : 0.2,
    
    // Disable certain animations completely on low-powered devices
    enableComplexAnimations: !isLowPower,
    
    // Disable backdrop blur on low-powered devices (which can be applied via CSS)
    enableBlur: !isLowPower,
  };
}

/**
 * Get optimized viewport-based animation settings
 * Only animate elements when they're in or near the viewport
 */
export function getScrollBasedAnimationConfig() {
  return {
    // Only animate when element is in viewport
    viewport: { once: true, amount: 0.3 },
    
    // Optimize transition based on device capability
    transition: { duration: checkLowPoweredDevice() ? 0.3 : 0.8 }
  };
}
