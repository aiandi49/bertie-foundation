import React from 'react';
import { Loader2 } from 'lucide-react';
import { useLoading } from '../utils/LoadingProvider';

interface Props {
  showBackdrop?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

// Loading spinner component
export function LoadingSpinner({ 
  showBackdrop = false, 
  size = 'medium',
  className = ''
}: Props) {
  const { isLoading, loadingMessage } = useLoading();
  
  if (!isLoading) return null;
  
  // Size mapping
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };
  
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${showBackdrop ? 'bg-black/30 backdrop-blur-sm' : ''} ${className}`}>
      <div className="rounded-lg bg-white/90 dark:bg-gray-800/90 shadow-lg p-4 flex flex-col items-center">
        <Loader2 className={`text-primary-500 animate-spin ${sizeClasses[size]}`} />
        {loadingMessage && (
          <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">{loadingMessage}</p>
        )}
      </div>
    </div>
  );
}

// Page transition wrapper
export function PageTransition({ children }: { children: React.ReactNode }) {
  const { isPageTransitioning } = useLoading();
  
  return (
    <div
      className={`transition-all duration-300 ${isPageTransitioning ? 'opacity-0 translate-y-3' : 'opacity-100 translate-y-0'}`}
    >
      {children}
    </div>
  );
}
