import React, { useEffect } from 'react';

/**
 * ChakraOverride component injects CSS to fix the white screen overlay
 * without breaking app content visibility
 */
export function ChakraOverride() {
  useEffect(() => {
    // Add a minimal amount of CSS to fix overlay
    const fixOverlayCSS = `
      :root {
        color-scheme: dark;
      }
      
      body {
        background-color: #111827;
        color: white;
      }
      
      /* Target the backdrop only */
      body > div:first-child > div:first-child {
        background-color: transparent !important;
      }
      
      .chakra-ui-light, .chakra-ui-dark {
        background-color: transparent !important;
      }
    `;
    
    const styleElement = document.createElement('style');
    styleElement.textContent = fixOverlayCSS;
    document.head.appendChild(styleElement);
    
    console.log('Applied minimal fix for white overlay');
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  
  return null;
}

