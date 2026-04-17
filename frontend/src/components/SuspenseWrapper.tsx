import React, { Suspense } from 'react';

interface SuspenseWrapperProps {
  children: React.ReactNode;
}

/**
 * SuspenseWrapper component provides a fallback for lazy-loaded components
 */
export function SuspenseWrapper({ children }: SuspenseWrapperProps) {
  // Create a loader element that matches the theme and app design
  const loader = (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-secondary-950 bg-opacity-80">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
    </div>
  );

  return (
    <Suspense fallback={loader}>
      {children}
    </Suspense>
  );
}
