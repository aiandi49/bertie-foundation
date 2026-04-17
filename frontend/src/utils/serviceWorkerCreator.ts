/**
 * Service Worker Creator
 * 
 * Handles the creation and updating of the service worker file
 */
import { generateServiceWorkerContent } from './swGenerator';

/**
 * Create service worker file in the public folder
 */
export async function createServiceWorkerFile(): Promise<boolean> {
  try {
    const sw = generateServiceWorkerContent();
    
    // For production environments and browsers that support Service Workers
    if ('serviceWorker' in navigator) {
      // Create a blob with the service worker code
      const blob = new Blob([sw], { type: 'text/javascript' });
      const url = URL.createObjectURL(blob);
      
      // Use this URL to register the service worker
      if (import.meta.env.DEV) {
        console.log('DEV environment: Service worker created at URL:', url);
        // Save the URL for development usage
        (window as any).__serviceWorkerBlobUrl = url;
        return true;
      }
      
      try {
        // Try to use the Fetch API to save to /public/sw.js
        // This will only work in development when running with proper permissions
        const response = await fetch('/sw.js', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/javascript',
          },
          body: sw
        });
        
        if (response.ok) {
          console.log('Service worker file created successfully');
          return true;
        } else {
          console.warn('Failed to create service worker file:', response.statusText);
          // Fall back to using the blob URL
          (window as any).__serviceWorkerBlobUrl = url;
          return true;
        }
      } catch (e) {
        console.warn('Error creating service worker file:', e);
        // Fall back to using the blob URL
        (window as any).__serviceWorkerBlobUrl = url;
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error generating service worker:', error);
    return false;
  }
}