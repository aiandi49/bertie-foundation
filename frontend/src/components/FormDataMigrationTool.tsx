import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FormServiceFallback } from '../utils/formServiceFallback';
import { FormSubmissionsService } from '../utils/formSubmissionsService';

interface FormDataMigrationToolProps {
  onMigrationComplete?: () => void;
}

export function FormDataMigrationTool({ onMigrationComplete }: FormDataMigrationToolProps) {
  const [migrating, setMigrating] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  
  const handleMigrate = async () => {
    if (!window.confirm('This will migrate all form data from local storage to the centralized system. This process cannot be undone. Continue?')) {
      return;
    }
    
    setMigrating(true);
    setResult(null);
    
    try {
      // Get all data from local storage
      const localData = FormServiceFallback.exportAllData();
      
      // Check if there's data to migrate
      const totalItems = (
        (localData.newsletter?.length || 0) +
        (localData.contact?.length || 0) +
        (localData.volunteer?.length || 0) +
        (localData.successStories?.length || 0) +
        (localData.feedback?.length || 0) +
        (localData.donations?.length || 0)
      );
      
      if (totalItems === 0) {
        setResult({
          success: false,
          message: 'No local form data found to migrate.'
        });
        setMigrating(false);
        return;
      }
      
      // Call migration service
      const success = await FormSubmissionsService.migrateFromLocalStorage();
      
      if (success) {
        setResult({
          success: true,
          message: `Successfully migrated ${totalItems} form submissions from local storage.`
        });
        
        // Call the onMigrationComplete callback if provided
        if (onMigrationComplete) {
          onMigrationComplete();
        }
      } else {
        setResult({
          success: false,
          message: 'Failed to migrate data. Please try again.'
        });
      }
    } catch (error) {
      console.error('Error during migration:', error);
      setResult({
        success: false,
        message: `Error during migration: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setMigrating(false);
    }
  };
  
  return (
    <div className="bg-secondary-800/30 p-4 rounded-lg border border-secondary-700 mb-6">
      <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
        Form Data Migration Tool
      </h3>
      
      <p className="text-gray-300 mb-4">
        Migrate all form submissions from local storage to the centralized storage system. 
        This ensures all form data is accessible from one place and can be properly filtered and exported.
      </p>
      
      {result && (
        <Alert variant={result.success ? "default" : "destructive"} className="mb-4">
          <AlertTitle>{result.success ? 'Success!' : 'Error'}</AlertTitle>
          <AlertDescription>{result.message}</AlertDescription>
        </Alert>
      )}
      
      <Button 
        onClick={handleMigrate} 
        disabled={migrating}
        className="flex items-center gap-2"
      >
        {migrating ? (
          <>
            <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
            Migrating...
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Migrate Form Data
          </>
        )}
      </Button>
    </div>
  );
}
