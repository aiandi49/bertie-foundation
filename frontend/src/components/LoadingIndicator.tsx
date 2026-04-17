import React from 'react';
import { Loader2 } from 'lucide-react';
import { useLoadingState } from '../utils/loadingState';

/**
 * Props for LoadingIndicator component
 */
interface LoadingIndicatorProps {
  /**
   * Show backdrop behind loader
   */
  showBackdrop?: boolean;
  
  /**
   * Size of the loader (small, medium, large)
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * Custom class for container
   */
  className?: string;
}

/**
 * LoadingIndicator - Displays a loading spinner with optional message
 * 
 * This component can be placed anywhere in the app and will show automatically
 * when the global loading state is active.
 */
export function LoadingIndicator({
  showBackdrop = false,
  size = 'medium',
  className = '',
}: LoadingIndicatorProps) {
  const { isLoading, loadingMessage } = useLoadingState();
  
  if (!isLoading) return null;
  
  // Size classes for spinner
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };
  
  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-all duration-300 ${showBackdrop ? 'bg-black/30 backdrop-blur-sm' : ''} ${className}`}
    >
      <div className="rounded-lg bg-white/90 dark:bg-gray-800/90 shadow-lg p-4 flex flex-col items-center">
        <Loader2 className={`text-primary-500 animate-spin ${sizeClasses[size]}`} />
        {loadingMessage && (
          <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            {loadingMessage}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * PageTransition - Adds smooth transitions between page navigations
 * 
 * Wraps page content with fade/slide animations for smoother user experience
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const { isPageTransitioning } = useLoadingState();
  
  return (
    <div
      className={`transition-all duration-300 ${isPageTransitioning ? 'opacity-0 translate-y-3' : 'opacity-100 translate-y-0'}`}
    >
      {children}
    </div>
  );
}
