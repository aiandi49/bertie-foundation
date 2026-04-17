import React from 'react';
import { FormServiceFallback } from '../utils/formServiceFallback';
import { Button } from '@/components/ui/button';

/**
 * Admin utility to export all form submissions from localStorage
 */
export function FormSubmissionsExport() {
  const handleExport = () => {
    FormServiceFallback.exportAllData();
  };

  return (
    <div className="bg-secondary-800/30 p-3 sm:p-4 rounded-lg border border-secondary-700 shadow-lg mb-4 sm:mb-8">
      <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span>Temporary Form Submissions Export</span>
      </h2>
      <p className="mb-3 sm:mb-4 text-gray-300 text-sm sm:text-base">
        Due to Firebase connectivity issues, form submissions are temporarily stored in the browser's localStorage.
        Click the button below to log all submissions to the console, then copy and save them.
      </p>
      <div className="flex flex-wrap gap-2 sm:gap-4">
        <Button
          onClick={handleExport}
          variant="primary"
          size="small"
        >
          Export All to Console
        </Button>
        <Button
          onClick={() => {
            window.open('about:blank').document.write('<pre>' + JSON.stringify(FormServiceFallback.exportAllData(), null, 2) + '</pre>');
          }}
          variant="secondary"
          size="small"
        >
          Open in New Tab
        </Button>
      </div>
    </div>
  );
}
