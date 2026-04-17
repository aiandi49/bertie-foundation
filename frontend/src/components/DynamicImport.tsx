import React, { useState, useEffect, lazy, Suspense } from 'react';

interface Props {
  /**
   * The component to load dynamically
   */
  getComponent: () => Promise<{ default: React.ComponentType<any> }>;
  
  /**
   * Props to pass to the loaded component
   */
  componentProps?: Record<string, any>;
  
  /**
   * Custom loading component
   */
  fallback?: React.ReactNode;
  
  /**
   * Function to handle load errors
   */
  onError?: (error: Error) => void;
  
  /**
   * Preload the component after this time (ms)
   */
  preloadAfter?: number;
}

/**
 * DynamicImport component that lazy loads components on demand
 * Useful for large components that aren't needed immediately
 */
export function DynamicImport({
  getComponent,
  componentProps = {},
  fallback = <div className="animate-pulse p-4 bg-gray-800 rounded">Loading...</div>,
  onError,
  preloadAfter = 5000
}: Props) {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    let mounted = true;
    let preloadTimeout: number;
    
    // Schedule preloading after delay
    if (preloadAfter > 0) {
      preloadTimeout = window.setTimeout(() => {
        getComponent()
          .then(module => {
            if (mounted) {
              setComponent(module.default);
            }
          })
          .catch(err => {
            if (mounted) {
              setError(err);
              if (onError) onError(err);
            }
          });
      }, preloadAfter);
    }
    
    return () => {
      mounted = false;
      clearTimeout(preloadTimeout);
    };
  }, [getComponent, preloadAfter, onError]);
  
  if (error) {
    return (
      <div className="bg-red-900/20 text-red-200 p-4 rounded border border-red-700">
        Failed to load component: {error.message}
      </div>
    );
  }
  
  // If component is already loaded, render it directly
  if (Component) {
    return <Component {...componentProps} />;
  }
  
  // Otherwise, create a lazy component with Suspense
  const LazyComponent = lazy(getComponent);
  
  return (
    <Suspense fallback={fallback}>
      <LazyComponent {...componentProps} />
    </Suspense>
  );
}