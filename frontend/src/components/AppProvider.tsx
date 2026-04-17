import React, { useState } from 'react';
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { Suspense } from 'react';
import { NetworkStatusProvider } from './NetworkStatusProvider';
import { ThemeProvider } from './ThemeProvider';
import { PerformanceTracker } from './PerformanceTracker';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';

// Define a dark theme for Chakra UI
const chakraTheme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  styles: {
    global: {
      'html, body': {
        backgroundColor: '#111827',
        color: 'white',
      },
      '*, *::before, *::after': {
        borderColor: '#374151',
      },
    },
  },
});

interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  // Service worker has been disabled to fix preview issues
  
  return (
    <>
      {/* Simplified providers setup */}
      <ChakraProvider theme={chakraTheme} resetCSS={true}>
        <ThemeProvider defaultTheme="dark" storageKey="bertie-ui-theme">
          <NetworkStatusProvider>
            <Suspense fallback={
              <div className="fixed inset-0 z-50 flex justify-center items-center bg-secondary-950 bg-opacity-80">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
              </div>
            }>
              {children}
            </Suspense>
          </NetworkStatusProvider>
        </ThemeProvider>
      </ChakraProvider>
      <Toaster position="top-right" richColors />
    </>
  );
}