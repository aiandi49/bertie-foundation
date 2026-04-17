import React, { createContext, useContext, useState, useCallback, ReactNode, useRef, useEffect } from 'react';
import Sonner from 'sonner';

/**
 * Types for toast functions
 */
type ToastOptions = {
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  icon?: React.ReactNode;
  description?: string | React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  cancel?: {
    label: string;
    onClick?: () => void;
  };
};

/**
 * Interface for performance context
 */
interface PerformanceContextType {
  // Loading states
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  isFirstLoad: boolean;
  
  // Network states
  isOnline: boolean;
  connectionSpeed: 'fast' | 'medium' | 'slow' | 'offline';
  
  // Performance flags
  reducedMotion: boolean;
  lowPowerMode: boolean;
  
  // Toast notifications
  toast: {
    success: (message: string, options?: ToastOptions) => void;
    error: (message: string, options?: ToastOptions) => void;
    info: (message: string, options?: ToastOptions) => void;
    warning: (message: string, options?: ToastOptions) => void;
    loading: (message: string, options?: ToastOptions) => () => void;
  };
  
  // Request performance tracking
  apiStats: {
    avgResponseTime: number;
    totalRequests: number;
    failedRequests: number;
    cachedRequests: number;
  };
  
  // Image loading tracking
  imageStats: {
    loaded: number;
    total: number;
    avg: number;
  };
  
  // Cache control
  clearImageCache: () => void;
}

/**
 * Create context with default values
 */
const PerformanceContext = createContext<PerformanceContextType>({
  isLoading: false,
  setLoading: () => {},
  isFirstLoad: true,
  isOnline: true,
  connectionSpeed: 'fast',
  reducedMotion: false,
  lowPowerMode: false,
  toast: {
    success: () => {},
    error: () => {},
    info: () => {},
    warning: () => {},
    loading: () => () => {},
  },
  apiStats: {
    avgResponseTime: 0,
    totalRequests: 0,
    failedRequests: 0,
    cachedRequests: 0
  },
  imageStats: {
    loaded: 0,
    total: 0,
    avg: 0
  },
  clearImageCache: () => {}
});

/**
 * Provider props
 */
interface PerformanceProviderProps {
  children: ReactNode;
}

/**
 * Attempt to detect low power mode
 */
function detectLowPowerMode(): boolean {
  // iOS Safari has a CSS media query for low power mode
  if (window.matchMedia && window.matchMedia('(prefers-reduced-data: reduce)').matches) {
    return true;
  }
  
  // Detect based on battery API if available
  if ('getBattery' in navigator) {
    // @ts-ignore - getBattery is not in the TypeScript defs
    navigator.getBattery().then((battery) => {
      return battery.level <= 0.2 && !battery.charging;
    }).catch(() => false);
  }
  
  return false;
}

/**
 * Detect connection speed
 * 
 * @returns Connection speed category
 */
function detectConnectionSpeed(): 'fast' | 'medium' | 'slow' | 'offline' {
  if (!navigator.onLine) return 'offline';
  
  // Use NetworkInformation API if available
  const conn = (navigator as any).connection;
  if (conn) {
    if (conn.saveData) return 'slow';
    
    if (conn.effectiveType === '4g') return 'fast';
    if (conn.effectiveType === '3g') return 'medium';
    return 'slow';
  }
  
  // Fallback: assume fast connection
  return 'fast';
}

/**
 * Performance Provider component
 */
export function PerformanceProvider({ children }: PerformanceProviderProps) {
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  
  // Connection states
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionSpeed, setConnectionSpeed] = useState<'fast' | 'medium' | 'slow' | 'offline'>(detectConnectionSpeed());
  
  // Performance flags
  const [reducedMotion, setReducedMotion] = useState(
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const [lowPowerMode, setLowPowerMode] = useState(detectLowPowerMode());
  
  // Stats tracking
  const [apiStats, setApiStats] = useState({
    avgResponseTime: 0,
    totalRequests: 0,
    failedRequests: 0,
    cachedRequests: 0
  });
  
  const [imageStats, setImageStats] = useState({
    loaded: 0,
    total: 0,
    avg: 0
  });
  
  // Loading indicator refs
  const loadingTimeoutRef = useRef<number | null>(null);
  
  // Set up event listeners for online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setConnectionSpeed(detectConnectionSpeed());
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setConnectionSpeed('offline');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Track reduced motion preference
  useEffect(() => {
    if (window.matchMedia) {
      const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      const handleMotionChange = (e: MediaQueryListEvent) => {
        setReducedMotion(e.matches);
      };
      
      motionQuery.addEventListener('change', handleMotionChange);
      return () => motionQuery.removeEventListener('change', handleMotionChange);
    }
  }, []);
  
  // Mark first load as complete after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFirstLoad(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle loading state with debounce
  const setLoading = useCallback((loading: boolean) => {
    if (loading) {
      // Clear any existing timeout
      if (loadingTimeoutRef.current !== null) {
        clearTimeout(loadingTimeoutRef.current);
      }
      
      setIsLoading(true);
    } else {
      // Add a small delay before hiding the loading indicator
      // to prevent flashing for quick operations
      loadingTimeoutRef.current = window.setTimeout(() => {
        setIsLoading(false);
        loadingTimeoutRef.current = null;
      }, 300);
    }
  }, []);
  
  // Toast functions
  const toast = {
    success: (message: string, options?: ToastOptions) => {
      Sonner.success(message, options);
    },
    error: (message: string, options?: ToastOptions) => {
      Sonner.error(message, options);
    },
    info: (message: string, options?: ToastOptions) => {
      Sonner.message(message, options);
    },
    warning: (message: string, options?: ToastOptions) => {
      Sonner.warning(message, options);
    },
    loading: (message: string, options?: ToastOptions) => {
      const id = Math.random().toString(36).slice(2, 11);
      Sonner.loading(message, { id, ...options });
      
      return () => {
        Sonner.dismiss(id);
      };
    },
  };
  
  // Clear image cache
  const clearImageCache = useCallback(() => {
    // Clear in-memory cache
    if (window.perfMetrics?.imagesObserved) {
      window.perfMetrics.imagesObserved.clear();
    }
    
    // Update stats
    setImageStats(prev => ({
      ...prev,
      loaded: 0
    }));
  }, []);
  
  // Track image loading for stats
  useEffect(() => {
    if (window.perfMetrics) {
      const intervalId = setInterval(() => {
        if (window.perfMetrics?.imagesObserved) {
          const total = document.querySelectorAll('img').length;
          const loaded = window.perfMetrics.imagesObserved.size;
          
          if (total > 0) {
            const avg = (loaded / total) * 100;
            setImageStats({ loaded, total, avg });
          }
        }
      }, 2000);
      
      return () => clearInterval(intervalId);
    }
  }, []);
  
  const value = {
    isLoading,
    setLoading,
    isFirstLoad,
    isOnline,
    connectionSpeed,
    reducedMotion,
    lowPowerMode,
    toast,
    apiStats,
    imageStats,
    clearImageCache
  };
  
  return (
    <PerformanceContext.Provider value={value}>
      {/* Sonner toast container */}
      <Sonner position="top-right" closeButton />
      {children}
    </PerformanceContext.Provider>
  );
}

/**
 * Hook to use performance context
 */
export function usePerformance() {
  return useContext(PerformanceContext);
}

/**
 * Add performance context to window for debugging
 */
export function enablePerformanceDebug() {
  if (typeof window !== 'undefined') {
    (window as any).perfDebug = {
      getStats: () => {
        if (window.perfMetrics) {
          return window.perfMetrics;
        }
        return 'Performance metrics not initialized';
      },
      clearImageCache: () => {
        if (window.perfMetrics?.imagesObserved) {
          window.perfMetrics.imagesObserved.clear();
          return 'Image cache cleared';
        }
        return 'Image cache not available';
      }
    };
  }
}
