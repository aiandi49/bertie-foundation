import React from 'react';

interface Props {
  /**
   * Show performance metrics in UI
   */
  showMetrics?: boolean;
}

/**
 * Mode detection for the app
 * Used to avoid directly checking process.env which is not supported
 */
export function isDevelopmentMode(): boolean {
  // Check if we have a telltale sign of development mode
  // URLs containing 'localhost' or specific port numbers commonly used in dev
  const url = window.location.href.toLowerCase();
  return (
    url.includes('localhost') ||
    url.includes('127.0.0.1') ||
    url.includes('devx') ||
    url.includes(':3000') ||
    url.includes(':8000') ||
    url.includes(':5173') ||
    // Also check for Vite's development mode flag
    import.meta.env.DEV === true
  );
}