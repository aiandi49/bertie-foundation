import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface NetworkStatus {
  /** Whether the user is online */
  isOnline: boolean;
  
  /** Whether the connection is slow */
  isSlowConnection: boolean;
  
  /** Estimated network bandwidth in Mbps */
  estimatedBandwidth: number | null;
  
  /** Connection type if available */
  connectionType: string | null;
  
  /** Effective connection type (4g, 3g, 2g, slow-2g) */
  effectiveType: string | null;
  
  /** Network round trip time in ms */
  rtt: number | null;
  
  /** Whether save-data mode is enabled */
  saveData: boolean;
  
  /** Time to first byte of last navigation in ms */
  lastTTFB: number | null;
  
  /** Last page load time in ms */
  lastPageLoadTime: number | null;
  
  /** Last time network status was checked */
  lastChecked: number;
  
  /** Whether the device has reduced data mode enabled */
  isReducedDataMode: boolean;
  
  /** Whether the device is likely on battery (mobile or laptop with low battery) */
  isLikelyOnBattery: boolean;
  
  /** Whether the connection has high latency */
  hasHighLatency: boolean;
  
  /** The maximum quality level that should be loaded (1-5) */
  maxQualityLevel: number;
  
  /** Test the network quality */
  testConnection: () => Promise<void>;
  
  /** Determine if the connection is good enough for high-quality media */
  canLoadHighQualityMedia: () => boolean;
}

const NetworkStatusContext = createContext<NetworkStatus | null>(null);

// Default network settings (optimistic approach)
const defaultNetworkStatus: NetworkStatus = {
  isOnline: true,
  isSlowConnection: false,
  estimatedBandwidth: null,
  connectionType: null,
  effectiveType: null,
  rtt: null,
  saveData: false,
  lastTTFB: null,
  lastPageLoadTime: null,
  lastChecked: Date.now(),
  isReducedDataMode: false,
  isLikelyOnBattery: false,
  hasHighLatency: false,
  maxQualityLevel: 5, // Default to highest quality
  testConnection: async () => {},
  canLoadHighQualityMedia: () => true
};

/**
 * Detects user agent as mobile
 */
const isMobileDevice = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  return (/android|webos|iphone|ipad|ipod|blackberry|windows phone/).test(userAgent);
};

/**
 * Estimates battery level from navigator.battery if available
 */
const getBatteryLevel = async (): Promise<number | null> => {
  if (!('getBattery' in navigator)) return null;
  
  try {
    const battery = await (navigator as any).getBattery();
    return battery.level * 100; // Convert to percentage
  } catch (e) {
    console.warn('Unable to access battery info:', e);
    return null;
  }
};

export function NetworkStatusProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<NetworkStatus>(defaultNetworkStatus);
  
  // Get a very simple estimate of connectivity speed
  const estimateConnectionQuality = useCallback(async () => {
    let connectionType = null;
    let effectiveType = null;
    let rtt = null;
    let saveData = false;
    let estimatedBandwidth = null;
    
    // Use Network Information API if available
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      connectionType = conn.type;
      effectiveType = conn.effectiveType;
      rtt = conn.rtt;
      saveData = !!conn.saveData;
      estimatedBandwidth = conn.downlink ? conn.downlink * 1024 : null; // Convert to Kbps
    }
    
    // Check if device is likely operating on battery
    const batteryLevel = await getBatteryLevel();
    const isLikelyOnBattery = isMobileDevice() || (batteryLevel !== null && batteryLevel < 30);
    
    // Infer connection quality
    let isSlowConnection = false;
    
    // Check for explicitly slow connection first
    if (effectiveType) {
      isSlowConnection = ['slow-2g', '2g', '3g'].includes(effectiveType);
    }
    
    // Then check RTT if available
    if (!isSlowConnection && rtt !== null) {
      isSlowConnection = rtt > 500; // More than 500ms RTT is considered slow
    }
    
    // Then check bandwidth if available
    if (!isSlowConnection && estimatedBandwidth !== null) {
      isSlowConnection = estimatedBandwidth < 1000; // Less than 1 Mbps is considered slow
    }
    
    // Get page performance metrics
    let lastTTFB = null;
    let lastPageLoadTime = null;
    const hasHighLatency = rtt !== null ? rtt > 300 : false;
    
    if ('getEntriesByType' in performance) {
      try {
        const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
        if (navigationEntries.length > 0) {
          lastTTFB = navigationEntries[0].responseStart;
          lastPageLoadTime = navigationEntries[0].loadEventEnd - navigationEntries[0].fetchStart;
          
          // If we couldn't determine connection speed earlier, use TTFB as indicator
          if (!isSlowConnection && lastTTFB !== null) {
            isSlowConnection = lastTTFB > 1000; // TTFB over 1 second suggests slow connection
          }
        }
      } catch (e) {
        console.warn('Error accessing navigation timing:', e);
      }
    }
    
    // Check for reduced data mode
    const isReducedDataMode = saveData || (isLikelyOnBattery && isSlowConnection);
    
    // Calculate max quality level based on all factors
    let maxQualityLevel = 5; // Maximum quality
    
    if (isReducedDataMode) {
      maxQualityLevel = 1; // Minimum quality for data saving mode
    } else if (isSlowConnection) {
      maxQualityLevel = 2; // Low quality for slow connections
    } else if (hasHighLatency) {
      maxQualityLevel = 3; // Medium quality for high latency
    } else if (isLikelyOnBattery) {
      maxQualityLevel = 4; // Good quality for battery preservation
    }
    
    setStatus(prev => ({
      ...prev,
      isOnline: navigator.onLine,
      isSlowConnection,
      connectionType,
      effectiveType,
      rtt,
      saveData,
      estimatedBandwidth,
      lastTTFB,
      lastPageLoadTime,
      lastChecked: Date.now(),
      isReducedDataMode,
      isLikelyOnBattery,
      hasHighLatency,
      maxQualityLevel
    }));
  }, []);
  
  // Test connection speed by loading a tiny file and measuring time
  const testConnection = useCallback(async () => {
    try {
      const startTime = performance.now();
      // Add a cache busting parameter to prevent using cached responses
      const response = await fetch(`/public/favicon.ico?cache=${Date.now()}`, {
        method: 'HEAD', // Only get headers, not content
        cache: 'no-store'
      });
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      const isSlowConnection = responseTime > 300; // More than 300ms suggests slower connection
      
      setStatus(prev => ({
        ...prev,
        rtt: responseTime,
        isSlowConnection: isSlowConnection || prev.isSlowConnection,
        lastChecked: Date.now(),
      }));
    } catch (e) {
      console.warn('Network test failed:', e);
      setStatus(prev => ({
        ...prev,
        isOnline: navigator.onLine
      }));
    }
  }, []);
  
  // Determine if high quality media should be loaded
  const canLoadHighQualityMedia = useCallback(() => {
    const {
      isOnline,
      isSlowConnection,
      isReducedDataMode,
      maxQualityLevel
    } = status;
    
    // Only load high quality if online, not a slow connection,
    // not in reduced data mode, and quality level is at least 3
    return isOnline && !isSlowConnection && !isReducedDataMode && maxQualityLevel >= 3;
  }, [status]);
  
  // Initial setup and event listeners
  useEffect(() => {
    // Get initial network status
    estimateConnectionQuality();
    
    // Online/offline events
    const handleOnline = () => {
      setStatus(prev => ({ ...prev, isOnline: true }));
      estimateConnectionQuality(); // Re-check connection when coming back online
    };
    
    const handleOffline = () => {
      setStatus(prev => ({ ...prev, isOnline: false }));
    };
    
    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('load', estimateConnectionQuality);
    window.addEventListener('offline', handleOffline);
    
    // Listen for network changes if supported
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      conn.addEventListener('change', estimateConnectionQuality);
    }
    
    // Set up periodic checks every 60 seconds when the app is active
    let connectionCheckInterval: number | undefined;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        estimateConnectionQuality();
        connectionCheckInterval = window.setInterval(estimateConnectionQuality, 60000);
      } else if (connectionCheckInterval) {
        clearInterval(connectionCheckInterval);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Initial setup if document is already visible
    if (document.visibilityState === 'visible') {
      connectionCheckInterval = window.setInterval(estimateConnectionQuality, 60000);
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('load', estimateConnectionQuality);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if ('connection' in navigator) {
        const conn = (navigator as any).connection;
        conn.removeEventListener('change', estimateConnectionQuality);
      }
      
      if (connectionCheckInterval) {
        clearInterval(connectionCheckInterval);
      }
    };
  }, [estimateConnectionQuality]);
  
  return (
    <NetworkStatusContext.Provider value={{ 
      ...status, 
      testConnection, 
      canLoadHighQualityMedia 
    }}>
      {children}
    </NetworkStatusContext.Provider>
  );
}

/**
 * Hook to access network status information
 */
export function useNetworkStatus() {
  const context = useContext(NetworkStatusContext);
  
  if (!context) {
    throw new Error('useNetworkStatus must be used within a NetworkStatusProvider');
  }
  
  return context;
}