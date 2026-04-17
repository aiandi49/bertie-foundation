import React from 'react';
import { useNetworkStatus } from './NetworkStatusProvider';
import { BertieLogo } from './BertieLogo';

interface Props {
  /** Custom message to display when offline */
  message?: string;
  
  /** Show retry button */
  showRetry?: boolean;
  
  /** Custom retry function */
  onRetry?: () => void;
  
  /** When to show the fallback (only when offline, or also when service worker is active) */
  mode?: 'offline-only' | 'offline-with-cache';
  
  /** Additional CSS class names */
  className?: string;
}

/**
 * OfflineFallback - A component that shows when the user is offline
 * with customizable messages and cached content information
 */
export function OfflineFallback({
  message = "You're currently offline",
  showRetry = true,
  onRetry,
  mode = 'offline-with-cache',
  className = ''
}: Props) {
  const { isOnline, isServiceWorkerActive, lastChecked } = useNetworkStatus();
  
  // If online, don't show the fallback
  if (isOnline) return null;
  
  // If mode is 'offline-with-cache' and service worker is active, show cached content message
  const hasCache = mode === 'offline-with-cache' && isServiceWorkerActive;
  
  // Format the last time we checked connectivity
  const lastCheckedTime = new Date(lastChecked).toLocaleTimeString();
  
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };
  
  return (
    <div className={`text-center py-8 px-4 ${className}`}>
      <div className="max-w-md mx-auto bg-primary-900 p-6 rounded-lg shadow-lg text-white">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 mb-4 text-primary-400">
            <BertieLogo className="h-full" />
          </div>
          
          <h2 className="text-xl font-semibold mb-2">{message}</h2>
          
          <p className="text-gray-300 mb-4">
            {hasCache 
              ? "Don't worry - you can still access cached content." 
              : "Please check your internet connection and try again."}
          </p>
          
          {showRetry && (
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors"
            >
              Try Again
            </button>
          )}
          
          <div className="mt-4 text-xs text-gray-400">
            Last checked: {lastCheckedTime}
          </div>
          
          {hasCache && (
            <div className="mt-6 w-full">
              <h3 className="text-sm font-medium mb-2 text-primary-300">Available Offline:</h3>
              <div className="bg-primary-800 rounded p-2 text-sm text-gray-300">
                <div className="py-1.5 px-2 border-b border-primary-700">Home Page</div>
                <div className="py-1.5 px-2 border-b border-primary-700">Previously Viewed Pages</div>
                <div className="py-1.5 px-2">Recent Images</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
