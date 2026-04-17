import React, { createContext, useContext, useState, useMemo, ReactNode, useCallback } from 'react';

interface LoadingContextType {
  /**
   * Global loading state
   */
  isLoading: boolean;
  
  /**
   * Start loading state
   */
  startLoading: () => void;
  
  /**
   * End loading state
   */
  endLoading: () => void;
  
  /**
   * API loading states by endpoint
   */
  apiLoadingStates: Record<string, boolean>;
  
  /**
   * Set loading state for specific API
   */
  setApiLoading: (endpoint: string, loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
}

/**
 * LoadingProvider component to manage global and API-specific loading states
 * with performance optimizations and offline support
 */
export function LoadingProvider({ children }: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCount, setLoadingCount] = useState(0);
  const [apiLoadingStates, setApiLoadingStates] = useState<Record<string, boolean>>({});
  
  // Debounce loading state changes to prevent flickering
  const startLoading = useCallback(() => {
    setLoadingCount(count => count + 1);
    setIsLoading(true);
  }, []);
  
  const endLoading = useCallback(() => {
    setLoadingCount(count => {
      const newCount = Math.max(0, count - 1);
      if (newCount === 0) {
        // Small delay to prevent flickering for fast operations
        setTimeout(() => setIsLoading(false), 100);
      }
      return newCount;
    });
  }, []);
  
  // Optimize API loading state updates
  const setApiLoading = useCallback((endpoint: string, loading: boolean) => {
    setApiLoadingStates(current => {
      // Only update if state actually changes
      if (current[endpoint] === loading) return current;
      return { ...current, [endpoint]: loading };
    });
  }, []);
  
  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    isLoading,
    startLoading,
    endLoading,
    apiLoadingStates,
    setApiLoading
  }), [isLoading, apiLoadingStates, startLoading, endLoading, setApiLoading]);
  
  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
    </LoadingContext.Provider>
  );
}

/**
 * Hook to use loading context
 */
export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}
