/**
 * Offline Indicator Component
 * 
 * Displays a banner when the user is offline
 */
import React, { useEffect, useState } from 'react';

interface Props {
  position?: 'top' | 'bottom';
  showAfterMs?: number;
}

/**
 * Offline indicator that appears when the user loses connection
 */
export function OfflineIndicator({ 
  position = 'top',
  showAfterMs = 500 
}: Props) {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showIndicator, setShowIndicator] = useState(false);
  
  useEffect(() => {
    // Update offline status
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Delay showing the indicator to prevent flashing during quick reconnects
    let timeoutId: ReturnType<typeof setTimeout>;
    
    if (isOffline) {
      timeoutId = setTimeout(() => {
        setShowIndicator(true);
      }, showAfterMs);
    } else {
      setShowIndicator(false);
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearTimeout(timeoutId);
    };
  }, [isOffline, showAfterMs]);
  
  if (!showIndicator) return null;
  
  const positionClass = position === 'top' 
    ? 'top-0' 
    : 'bottom-0';
    
  return (
    <div 
      className={`
        fixed left-0 w-full z-50 ${positionClass}
        bg-red-600 text-white px-4 py-2
        flex items-center justify-center
        transition-transform duration-300 ease-in-out
        ${showIndicator ? 'translate-y-0' : position === 'top' ? '-translate-y-full' : 'translate-y-full'}
      `}
    >
      <svg 
        className="w-5 h-5 mr-2" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="2" 
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span className="font-semibold">You're offline</span>
      <span className="ml-2 text-sm hidden sm:inline">
        Some features may be unavailable until you reconnect
      </span>
    </div>
  );
}