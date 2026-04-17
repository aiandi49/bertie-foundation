/**
 * Offline utility functions
 */

/**
 * Add offline indicator to the UI
 */
export function addOfflineIndicator() {
  // Check if indicator already exists
  if (document.getElementById('offline-indicator')) return;
  
  // Create indicator element
  const indicator = document.createElement('div');
  indicator.id = 'offline-indicator';
  indicator.className = 'fixed bottom-4 right-4 z-50 bg-black/80 text-white text-sm px-3 py-2 rounded-full flex items-center gap-2 animate-pulse';
  indicator.innerHTML = `
    <span class="w-2 h-2 bg-red-500 rounded-full"></span>
    Offline Mode
  `;
  
  // Add to document
  document.body.appendChild(indicator);
}

/**
 * Remove offline indicator from the UI
 */
export function removeOfflineIndicator() {
  const indicator = document.getElementById('offline-indicator');
  if (indicator) {
    indicator.remove();
  }
}

/**
 * Check if the app is operating in offline mode
 */
export function isOfflineMode(): boolean {
  return !navigator.onLine;
}

/**
 * Create a custom offline experience for specified routes
 * 
 * @param routes Routes to create offline experience for
 */
export function setupOfflineRoutes(routes: string[]) {
  // Only run if service worker is available
  if (!('serviceWorker' in navigator)) return;
  
  // Cache important route content
  if (navigator.serviceWorker.controller) {
    // Let service worker know which routes to prioritize
    navigator.serviceWorker.controller.postMessage({
      type: 'CACHE_ROUTES',
      routes
    });
  }
}

/**
 * Force sync when coming back online
 */
export function setupAutoSync() {
  window.addEventListener('online', () => {
    // Trigger sync when we come back online
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SYNC_DATA'
      });
    }
  });
}