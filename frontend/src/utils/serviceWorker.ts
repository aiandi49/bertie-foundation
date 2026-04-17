/**
 * Service Worker Registration
 * 
 * This module handles the registration of the service worker
 * for caching assets and providing offline functionality.
 */

// Flag to check if service worker is enabled - DISABLE in development to fix preview issues
const SW_ENABLED = false; // Disabled to fix preview issues

// Import service worker utilities
import { generateServiceWorkerContent } from './swGenerator';
import { createServiceWorkerFile } from './serviceWorkerCreator';

/**
 * Register the service worker
 */
export async function registerServiceWorker() {
  if (!SW_ENABLED) {
    console.log('Service worker not supported or disabled in development');
    return false;
  }
  
  try {
    // In development, try to create the service worker file first
    if (import.meta.env.DEV) {
      await createServiceWorkerFile();
    }
    
    // Use absolute path to ensure correct scope
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/' // Control the entire origin
    });
    console.log('Service worker registered successfully:', registration.scope);
    
    // Update service worker if needed
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    
    return true;
  } catch (error) {
    console.error('Service worker registration failed:', error);
    return false;
  }
}

/**
 * Unregister all service workers and clear caches
 */
export async function unregisterServiceWorker() {
  if (!SW_ENABLED) return false;
  
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.unregister();
      console.log('Service worker unregistered successfully');
    }
    
    // Clear all caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
      console.log('Caches cleared successfully');
    }
    
    return true;
  } catch (error) {
    console.error('Service worker unregistration failed:', error);
    return false;
  }
}

/**
 * Update the service worker
 */
export async function updateServiceWorker() {
  if (!SW_ENABLED) return false;
  
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.update();
      console.log('Service worker updated successfully');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Service worker update failed:', error);
    return false;
  }
}

/**
 * Check if the user is online
 */
export function isOnline() {
  return navigator.onLine;
}

/**
 * Check if we're in offline mode
 */
export function isOfflineMode() {
  return !navigator.onLine;
}

/**
 * Check if a service worker is active
 */
export async function isServiceWorkerActive() {
  if (!SW_ENABLED) return false;
  
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    return !!registration && !!registration.active;
  } catch (error) {
    console.error('Error checking service worker status:', error);
    return false;
  }
}

/**
 * Listen for online/offline events
 * 
 * @param onlineCallback Function to call when online
 * @param offlineCallback Function to call when offline
 * @returns Cleanup function
 */
export function listenForConnectivityChanges(
  onlineCallback: () => void,
  offlineCallback: () => void
) {
  window.addEventListener('online', onlineCallback);
  window.addEventListener('offline', offlineCallback);
  
  return () => {
    window.removeEventListener('online', onlineCallback);
    window.removeEventListener('offline', offlineCallback);
  };
}
