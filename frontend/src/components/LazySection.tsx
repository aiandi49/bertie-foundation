import React from 'react';
import { useIsVisible } from '../utils/performanceUtils';

interface Props {
  /**
   * Content to render
   */
  children: React.ReactNode;
  
  /**
   * Optional className
   */
  className?: string;
  
  /**
   * Extra margin around viewport to trigger loading earlier
   */
  rootMargin?: string;
  
  /**
   * Number of pixels/percent of target visible before loading
   */
  threshold?: number;
  
  /**
   * Placeholder to show while main content loads
   */
  placeholder?: React.ReactNode;
  
  /**
   * Skip lazy loading and load immediately
   */
  immediate?: boolean;
}

/**
 * LazySection component for deferring content rendering until visible
 * @param props Component properties
 * @returns JSX element
 */
export function LazySection({
  children,
  className = '',
  rootMargin = '200px', // Load when section is 200px from viewport
  threshold = 0.01, // Start loading when 1% of section is visible
  placeholder = <div className="animate-pulse bg-gray-800/50 rounded h-40"></div>,
  immediate = false
}: Props) {
  // Skip intersection observer if immediate loading is requested
  if (immediate) {
    return (
      <div className={className}>
        {children}
      </div>
    );
  }
  
  // Use the visibility detection hook
  const [ref, isVisible] = useIsVisible<HTMLDivElement>(rootMargin, threshold);
  
  return (
    <div ref={ref} className={className}>
      {isVisible ? children : placeholder}
    </div>
  );
}