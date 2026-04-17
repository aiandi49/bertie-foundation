import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, limit, addDoc, getFirestore } from 'firebase/firestore';
import { db, app } from '../utils/firebase';
import { Button } from '@/components/ui/button';

export function FirebaseTest() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [writeStatus, setWriteStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [writeMessage, setWriteMessage] = useState('');

  // Test read operation
  useEffect(() => {
    const testFirebaseConnection = async () => {
      try {
        setStatus('loading');
        setMessage('Testing Firebase connection...');
        
        // Log Firebase config details (without sensitive info)
        console.log('Firebase app:', app ? 'Initialized' : 'Not initialized');
        console.log('Firebase db:', db ? 'Initialized' : 'Not initialized');
        console.log('Firebase db type:', typeof db);
        
        // Try to reconnect if needed
        const dbInstance = getFirestore(app);
        console.log('Tried getting a fresh Firestore instance');
        
        console.log('Testing Firebase read connection...');
        const testQuery = query(collection(db, 'test_collection'), limit(1));
        await getDocs(testQuery);
        
        setStatus('success');
        setMessage('Firebase read connection successful!');
        console.log('Firebase read connection successful!');
      } catch (error) {
        console.error('Firebase connection test failed:', error);
        setStatus('error');
        setMessage(`Firebase connection error: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    testFirebaseConnection();
  }, []);

  // Test write operation
  const testFirebaseWrite = async () => {
    try {
      setWriteStatus('loading');
      setWriteMessage('Testing Firebase write operation...');
      
      console.log('Testing Firebase write operation...');
      const result = await addDoc(collection(db, 'test_collection'), {
        message: 'Test document',
        timestamp: new Date().toISOString()
      });
      
      setWriteStatus('success');
      setWriteMessage(`Firebase write successful! Document ID: ${result.id}`);
      console.log('Firebase write successful!', result.id);
    } catch (error) {
      console.error('Firebase write test failed:', error);
      setWriteStatus('error');
      setWriteMessage(`Firebase write error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div className="bg-secondary-800/30 p-4 rounded-lg border border-secondary-700 shadow-lg mb-8">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
        </svg>
        <span>Firebase Connection Test</span>
      </h2>
      
      {/* Read Test */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-200">Read Test:</h3>
        <div className={`p-3 rounded ${status === 'success' ? 'bg-green-900/30 text-green-400 border border-green-800' : 
          status === 'error' ? 'bg-red-900/30 text-red-400 border border-red-800' : 'bg-blue-900/30 text-blue-400 border border-blue-800'}`}>
          {status === 'loading' && (
            <div className="flex items-center">
              <div className="w-4 h-4 border-t-2 border-blue-500 rounded-full animate-spin mr-2" />
              {message}
            </div>
          )}
          {status !== 'loading' && message}
        </div>
      </div>
      
      {/* Write Test */}
      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-200">Write Test:</h3>
        <Button 
          onClick={testFirebaseWrite}
          disabled={writeStatus === 'loading'}
          size="small"
          variant="primary"
          className="mb-3"
        >
          {writeStatus === 'loading' ? (
            <div className="flex items-center">
              <div className="w-4 h-4 border-t-2 border-white rounded-full animate-spin mr-2" />
              Testing...
            </div>
          ) : 'Test Write Operation'}
        </Button>
        
        {writeStatus !== 'idle' && (
          <div className={`p-3 rounded ${writeStatus === 'success' ? 'bg-green-900/30 text-green-400 border border-green-800' : 
            writeStatus === 'error' ? 'bg-red-900/30 text-red-400 border border-red-800' : 'bg-blue-900/30 text-blue-400 border border-blue-800'}`}>
            {writeMessage}
          </div>
        )}
      </div>
    </div>
  );
}
