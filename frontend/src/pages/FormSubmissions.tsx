import React, { useState } from 'react';
import { FormDataMigrationTool } from '../components/FormDataMigrationTool';
import { FormSubmissionsManager } from '../components/FormSubmissionsManager';
import { AdminLayout } from '../components/AdminLayout';

export default function FormSubmissions() {
  const [refreshKey, setRefreshKey] = useState(0);

  // Called when migration is complete to refresh the submissions list
  const handleMigrationComplete = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  return (
    <AdminLayout title="Form Submissions Management">
      <div className="max-w-6xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-white mb-8">Form Submissions Management</h1>
        
        <FormDataMigrationTool onMigrationComplete={handleMigrationComplete} />
        
        <div className="bg-secondary-800/30 p-6 rounded-xl border border-secondary-700 shadow-lg">
          <FormSubmissionsManager key={refreshKey} />
        </div>
      </div>
    </AdminLayout>
  );
}
