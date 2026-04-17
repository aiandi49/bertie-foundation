import React, { useState, useEffect } from 'react';
import { isDevelopmentMode } from '../utils/environmentUtils';

interface Props {
  visible?: boolean;
  devModeOnly?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

interface PerformanceMetrics {
  fcp: number | null;
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  ttfb: number | null;
  fps: number[];
  loadTime: number | null;
  smoothness?: number;
}

/**
 * Performance tracker component to monitor vital web metrics
 * and display them in a floating panel
 */
export function PerformanceTracker({
  visible = false,
  devModeOnly = true,
  position = 'bottom-right'
}: Props) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    ttfb: null,
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    loadTime: null,
    fps: []
  });
  
  const [expanded, setExpanded] = useState(false);
  
  // Get position classes
  const positionClasses = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'bottom-right': 'bottom-0 right-0'
  }[position];
  
  // Skip if invisible or in production
  if ((devModeOnly && !isDevelopmentMode()) || !visible) {
    return null;
  }
  
  useEffect(() => {
    // Skip if not visible or in production mode when devModeOnly is true
    if ((devModeOnly && !isDevelopmentMode()) || !visible) {
      return;
    }
    
    if (typeof window === 'undefined' || typeof performance === 'undefined') {
      return; // Skip in SSR or environments without performance API
    }
    
    let frameCountInterval: number;
    let frameCount = 0;
    let lastFrameTime = performance.now();
    let slowFrames = 0;
    
    // Set up FPS counter
    const countFrames = () => {
      frameCount++;
      const now = performance.now();
      const delta = now - lastFrameTime;
      
      // Count frames slower than 16.7ms (60fps)
      if (delta > 16.7) {
        slowFrames++;
      }
      
      lastFrameTime = now;
      window.requestAnimationFrame(countFrames);
    };
    
    // Calculate FPS every second
    const calculateFPS = () => {
      const now = performance.now();
      const elapsed = now - lastFrameTime;
      const fps = Math.round((frameCount * 1000) / elapsed);
      const smoothness = Math.max(0, 100 - (slowFrames / frameCount * 100));
      
      setMetrics(prev => ({
        ...prev,
        fps: [...prev.fps.slice(-9), fps], // Keep last 10 FPS readings
        smoothness
      }));
      
      frameCount = 0;
      slowFrames = 0;
    };
    
    // Track navigation timing API if available
    if ('getEntriesByType' in performance) {
      try {
        const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
        if (navigationEntries.length > 0) {
          const ttfb = Math.round(navigationEntries[0].responseStart);
          const loadTime = Math.round(navigationEntries[0].loadEventEnd - navigationEntries[0].fetchStart);
          setMetrics(prev => ({ ...prev, ttfb, loadTime }));
        }
      } catch (e) {
        console.warn('Error accessing navigation timing:', e);
      }
    }

    // Use PerformanceObserver when available
    if ('PerformanceObserver' in window) {
      // Track FCP
      try {
        const fcpObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              const fcp = Math.round(entry.startTime);
              setMetrics(prev => ({ ...prev, fcp }));
              fcpObserver.disconnect();
            }
          }
        });
        fcpObserver.observe({ type: 'paint', buffered: true });
      } catch (e) {
        console.warn('FCP observer not supported', e);
      }
      
      // Track LCP
      try {
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          const lcp = Math.round(lastEntry.startTime);
          setMetrics(prev => ({ ...prev, lcp }));
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      } catch (e) {
        console.warn('LCP observer not supported', e);
      }
      
      // Track FID
      try {
        const fidObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            const fid = Math.round((entry as any).processingStart - (entry as any).startTime);
            setMetrics(prev => ({ ...prev, fid }));
          }
        });
        fidObserver.observe({ type: 'first-input', buffered: true });
      } catch (e) {
        console.warn('FID observer not supported', e);
      }
      
      // Track CLS
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            // @ts-ignore - layout shift entry has hadRecentInput
            if (!(entry as any).hadRecentInput) {
              // @ts-ignore - layout shift entry has value
              clsValue += (entry as any).value;
              setMetrics(prev => ({ ...prev, cls: Math.round(clsValue * 1000) / 1000 }));
            }
          }
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });
      } catch (e) {
        console.warn('CLS observer not supported', e);
      }
    }
    
    // Start FPS tracking
    if ('requestAnimationFrame' in window) {
      requestAnimationFrame(countFrames);
      frameCountInterval = window.setInterval(calculateFPS, 1000);
    }
    
    // Cleanup
    return () => {
      if (frameCountInterval) {
        clearInterval(frameCountInterval);
      }
    };
  }, [devModeOnly, visible]);
  
  return (
    <div 
      className={`fixed ${positionClasses} z-50 p-2 rounded-lg bg-gray-900/90 text-white text-xs font-mono transition-all shadow-lg cursor-pointer ${
        expanded ? 'w-auto' : 'w-8 h-8 overflow-hidden'
      }`}
      onClick={() => setExpanded(!expanded)}
    >
      {!expanded ? (
        <div className="flex items-center justify-center h-full">📊</div>
      ) : (
        <>
          <div className="text-xs font-semibold mb-1 flex justify-between items-center">
            <span>Performance Metrics</span>
            <span className="text-xs opacity-50">[click to collapse]</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>TTFB:</span>
              <span className={metrics.ttfb && metrics.ttfb > 200 ? 'text-red-400' : 'text-green-400'}>
                {metrics.ttfb ? `${metrics.ttfb}ms` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>FCP:</span>
              <span className={metrics.fcp && metrics.fcp > 1800 ? 'text-red-400' : 'text-green-400'}>
                {metrics.fcp ? `${metrics.fcp}ms` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>LCP:</span>
              <span className={metrics.lcp && metrics.lcp > 2500 ? 'text-red-400' : 'text-green-400'}>
                {metrics.lcp ? `${metrics.lcp}ms` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>CLS:</span>
              <span className={metrics.cls && metrics.cls > 0.1 ? 'text-red-400' : 'text-green-400'}>
                {metrics.cls ?? 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>FPS:</span>
              <span className={metrics.fps.length > 0 && Math.min(...metrics.fps) < 30 ? 'text-red-400' : 'text-green-400'}>
                {metrics.fps.length > 0 ? `${metrics.fps[metrics.fps.length - 1]}` : 'N/A'}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}