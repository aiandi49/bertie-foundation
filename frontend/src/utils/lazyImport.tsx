/**
 * Lazy loading utilities for components and pages
 * 
 * This file provides utilities for lazy loading React components
 * with proper loading and error states.
 */

import React, { lazy, Suspense } from 'react';

/**
 * Props for lazy loading indicator/fallback components
 */
interface LoadingProps {
  message?: string;
}

/**
 * Default loading component shown while lazy-loaded components are loading
 */
export const DefaultLoading: React.FC<LoadingProps> = ({ message = 'Loading...' }) => (
  <div className="flex items-center justify-center p-8 h-full w-full min-h-[200px]">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent"></div>
      <p className="text-muted-foreground">{message}</p>
    </div>
  </div>
);

/**
 * Default error component shown when lazy-loaded components fail to load
 */
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Error boundary component for catching lazy loading errors
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('LazyLoad Error:', error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

/**
 * Default error component for lazy loading failures
 */
export const DefaultError: React.FC = () => (
  <div className="flex items-center justify-center p-8 min-h-[200px] text-center">
    <div className="flex flex-col items-center gap-4">
      <div className="rounded-full bg-destructive/10 p-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6 text-destructive"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </div>
      <div>
        <h3 className="text-lg font-semibold">Something went wrong</h3>
        <p className="text-sm text-muted-foreground">Failed to load component. Please try refreshing.</p>
      </div>
    </div>
  </div>
);

/**
 * Creates a lazy-loaded component with proper loading and error states
 * @param importFn Dynamic import function for the component
 * @param loadingComponent Component to show during loading (optional)
 * @param errorComponent Component to show on error (optional)
 * @returns Lazy-loaded component with proper loading and error handling
 */
export function lazyImport<T extends React.ComponentType<any>>(  
  importFn: () => Promise<{ default: T }>,
  loadingComponent: React.ReactNode = <DefaultLoading />,
  errorComponent: React.ReactNode = <DefaultError />
): React.ComponentType<React.ComponentProps<T>> {
  const LazyComponent = lazy(importFn);
  
  return (props: React.ComponentProps<T>) => (
    <ErrorBoundary fallback={errorComponent}>
      <Suspense fallback={loadingComponent}>
        <LazyComponent {...props} />
      </Suspense>
    </ErrorBoundary>
  );
}

/**
 * Higher-order component to make any component lazily loaded
 * @param Component Component to be lazy loaded
 * @param options Lazy loading options
 * @returns Wrapped component with lazy loading behavior
 */
export function withLazyLoading<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    loading?: React.ReactNode;
    error?: React.ReactNode;
    delay?: number; // Delay in ms before showing the component (allows short loads to be instant)
  } = {}
): React.FC<P> {
  const { loading = <DefaultLoading />, error = <DefaultError />, delay = 200 } = options;
  
  return function WrappedLazyComponent(props: P) {
    const [shouldRender, setShouldRender] = React.useState(delay === 0);
    
    React.useEffect(() => {
      if (delay > 0) {
        const timer = setTimeout(() => setShouldRender(true), delay);
        return () => clearTimeout(timer);
      }
    }, [delay]);
    
    if (!shouldRender) {
      return <>{loading}</>;
    }
    
    return (
      <ErrorBoundary fallback={error}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

/**
 * Creates a code-split route component with proper loading state
 * Specifically designed for code-splitting in React Router
 * @param importFn Dynamic import function for the page component
 * @returns Route component with proper code splitting
 */
export function lazyRoute<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  loadingMessage: string = 'Loading page...'
): React.ComponentType<React.ComponentProps<T>> {
  return lazyImport(
    importFn,
    <DefaultLoading message={loadingMessage} />
  );
}
