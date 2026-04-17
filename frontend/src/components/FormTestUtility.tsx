import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FormServiceFallback } from '../utils/formServiceFallback';

export function FormTestUtility() {
  const [testStatus, setTestStatus] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  
  // Test newsletter subscription
  const testNewsletterForm = async () => {
    setTestStatus('Testing newsletter subscription...');
    try {
      await FormServiceFallback.subscribeToNewsletter('test@example.com', 'admin-test');
      setTestStatus('Newsletter subscription test complete! Check console for details.');
      
      // Get and show the stored data
      const allData = FormServiceFallback.exportAllData();
      setTestResult(allData.newsletter);
    } catch (error) {
      console.error('Test failed:', error);
      setTestStatus('Test failed. See console for details.');
    }
  };
  
  // Test contact form
  const testContactForm = async () => {
    setTestStatus('Testing contact form...');
    try {
      await FormServiceFallback.submitContactForm({
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'This is a test message from the admin panel.'
      });
      setTestStatus('Contact form test complete! Check console for details.');
      
      // Get and show the stored data
      const allData = FormServiceFallback.exportAllData();
      setTestResult(allData.contact);
    } catch (error) {
      console.error('Test failed:', error);
      setTestStatus('Test failed. See console for details.');
    }
  };
  
  // Test volunteer form
  const testVolunteerForm = async () => {
    setTestStatus('Testing volunteer application...');
    try {
      await FormServiceFallback.submitVolunteerApplication({
        name: 'Test Volunteer',
        email: 'volunteer@example.com',
        message: 'I want to volunteer for testing!',
        interests: ['Education', 'Technology']
      });
      setTestStatus('Volunteer form test complete! Check console for details.');
      
      // Get and show the stored data
      const allData = FormServiceFallback.exportAllData();
      setTestResult(allData.volunteer);
    } catch (error) {
      console.error('Test failed:', error);
      setTestStatus('Test failed. See console for details.');
    }
  };
  
  return (
    <div className="bg-secondary-800/30 p-3 sm:p-4 rounded-lg border border-secondary-700 shadow-lg mb-4 sm:mb-8">
      <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
        <span>Form Testing Utility</span>
      </h2>
      <p className="mb-3 sm:mb-4 text-gray-300 text-sm sm:text-base">
        Use these buttons to test form submissions with the fallback service.
        All test submissions will be stored in your browser's localStorage.
      </p>
      
      <div className="flex flex-wrap gap-2 sm:gap-3 mb-3 sm:mb-4">
        <Button onClick={testNewsletterForm} size="small" variant="primary">
          Test Newsletter Form
        </Button>
        <Button onClick={testContactForm} size="small" variant="primary">
          Test Contact Form
        </Button>
        <Button onClick={testVolunteerForm} size="small" variant="primary">
          Test Volunteer Form
        </Button>
        <Button onClick={() => FormServiceFallback.exportAllData()} size="small" variant="secondary">
          Log All Data to Console
        </Button>
      </div>
      
      {testStatus && (
        <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-secondary-700/40 rounded border border-secondary-600">
          <p className="font-medium text-sm sm:text-base">{testStatus}</p>
          
          {testResult && (
            <div className="mt-3">
              <h3 className="text-xs sm:text-sm font-bold mb-1 sm:mb-2">Latest Submission:</h3>
              <pre className="bg-secondary-800/50 p-1.5 sm:p-2 rounded text-xs overflow-auto max-h-32 sm:max-h-40">
                {JSON.stringify(testResult[testResult.length - 1], null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
