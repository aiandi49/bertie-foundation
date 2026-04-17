import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { FormServiceFallback } from '../utils/formServiceFallback';
import { apiClient } from 'app';
import { Button } from './Button';

interface Props {
  formType: 'newsletter' | 'contact' | 'volunteer' | 'success-stories' | 'feedback';
  title: string;
}

// Map form types to collection names
const COLLECTION_MAPPING = {
  'newsletter': 'newsletter_subscriptions',
  'contact': 'contact_submissions',
  'volunteer': 'volunteer_applications',
  'success-stories': 'success_stories',
  'feedback': 'feedback_submissions'
};

interface FormSubmission {
  id: string;
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  submittedAt: Date;
  status?: string;
  [key: string]: any; // For other form-specific fields
}

export function AdminFormView({ formType, title }: Props) {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState<Record<string, boolean>>({});
  const [filterStatus, setFilterStatus] = useState('all');

  const getFormattedDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown date';
    
    // Handle Firestore Timestamp objects
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };

  const fetchSubmissions = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (formType === 'newsletter') {
        // Use the API for newsletter subscribers
        try {
          const response = await fetch('/api/newsletter/get-subscribers', {
            credentials: 'include'
          });
          const data = await response.json();
          console.log(`Retrieved ${data.subscribers.length} newsletter subscribers`);
          
          const formattedSubmissions = data.subscribers.map((sub: any) => ({
            id: sub.id,
            email: sub.email,
            status: sub.status,
            source: sub.source,
            submittedAt: new Date(sub.subscribed_at)
          }));
          
          setSubmissions(formattedSubmissions);
        } catch (apiError: any) {
          console.error('Error fetching newsletter subscribers:', apiError);
          setError('Failed to load newsletter subscribers. Please try again later.');
        }
      } else {
        // Original Firebase logic for other form types
        // Check network connectivity first
        if (!window.navigator.onLine) {
          setError('You appear to be offline. Please check your internet connection and try again.');
          setLoading(false);
          return;
        }
        
        const collectionName = COLLECTION_MAPPING[formType];
        console.log(`Fetching ${formType} submissions from collection: ${collectionName}`);
        
        try {
          const q = query(
            collection(db, collectionName),
            orderBy('submittedAt', 'desc')
          );
          
          const snapshot = await getDocs(q);
          console.log(`Retrieved ${snapshot.docs.length} ${formType} submissions`);
          
          const formattedSubmissions = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              // Handle both Firestore Timestamp and string date formats
              submittedAt: data.submittedAt && typeof data.submittedAt.toDate === 'function' 
                ? data.submittedAt.toDate() 
                : new Date(data.submittedAt || Date.now())
            };
          });
          
          setSubmissions(formattedSubmissions);
        } catch (firestoreError: any) {
          console.error(`Error fetching ${formType} submissions:`, firestoreError);
          
          // Handle specific Firestore error codes
          if (firestoreError.code === 'unavailable' || firestoreError.code === 'failed-precondition') {
            setError('Unable to connect to the database. Please check your internet connection and try again later.');
          } else if (firestoreError.code === 'permission-denied') {
            setError('You don\'t have permission to view these submissions. Please contact the administrator.');
          } else {
            setError(`Failed to load ${formType} submissions: ${firestoreError.message}`);
          }
        }
      }
    } catch (err) {
      console.error(`Error in fetchSubmissions for ${formType}:`, err);
      setError(`An unexpected error occurred. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubmission = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this submission?')) return;
    
    setDeleteLoading(prev => ({ ...prev, [id]: true }));
    
    // For newsletter subscribers, use the API
    if (formType === 'newsletter') {
      try {
        const response = await fetch(`/api/newsletter/subscriber/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
          setSubmissions(prev => prev.filter(submission => submission.id !== id));
        } else {
          alert(`Failed to delete subscriber: ${data.message}`);
        }
      } catch (error) {
        console.error('Error deleting subscriber:', error);
        alert('Failed to delete subscriber. Please try again.');
      } finally {
        setDeleteLoading(prev => ({ ...prev, [id]: false }));
      }
      return;
    }
    try {
      const collectionName = COLLECTION_MAPPING[formType];
      console.log(`Deleting ${formType} submission with ID: ${id} from collection: ${collectionName}`);
      
      // For feedback form (or any form type using localStorage), use the fallback service
      if (formType === 'feedback' || !window.navigator.onLine) {
        const success = FormServiceFallback.deleteSubmission(collectionName, id);
        
        if (success) {
          console.log(`Successfully deleted submission with ID: ${id} from localStorage`);
          setSubmissions(prev => prev.filter(submission => submission.id !== id));
        } else {
          alert(`Failed to delete submission from localStorage. Please try again.`);
        }
      } else {
        // For Firebase-connected collections
        try {
          await deleteDoc(doc(db, collectionName, id));
          console.log(`Successfully deleted submission with ID: ${id} from Firebase`);
          setSubmissions(prev => prev.filter(submission => submission.id !== id));
        } catch (firestoreError: any) {
          console.error(`Error deleting ${formType} submission:`, firestoreError);
          
          // Check if we should fall back to localStorage
          if (firestoreError.code === 'unavailable' || firestoreError.code === 'failed-precondition') {
            console.log(`Falling back to localStorage deletion for ${id}`);
            const fallbackSuccess = FormServiceFallback.deleteSubmission(collectionName, id);
            
            if (fallbackSuccess) {
              console.log(`Successfully deleted submission with ID: ${id} from localStorage fallback`);
              setSubmissions(prev => prev.filter(submission => submission.id !== id));
            } else {
              alert('Unable to delete submission. Please try again later.');
            }
          } else if (firestoreError.code === 'permission-denied') {
            alert('You don\'t have permission to delete this submission. Please contact the administrator.');
          } else {
            alert(`Failed to delete submission: ${firestoreError.message}`);
          }
        }
      }
    } catch (err) {
      console.error(`Error in handleDeleteSubmission for ${formType}:`, err);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setDeleteLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  useEffect(() => {
    // Load immediately on component mount
    fetchSubmissions();
    
    // Set up a persistent data connection that doesn't hide when switching tabs
    if (formType === 'newsletter') {
      // Newsletter data is loaded via API, just fetch once
      return () => {};
    } else {
      // For all other form types, always try fetching from Firebase first
      // If Firebase fails, the fallback logic in fetchSubmissions will handle it
      console.log(`Setting up persistent data for ${formType}`);
      
      // If we're offline, load from localStorage
      if (!window.navigator.onLine) {
        const formStorageKey = COLLECTION_MAPPING[formType];
        const localData = FormServiceFallback.getStoredSubmissions(formStorageKey);
        if (localData && localData.length > 0) {
          setSubmissions(localData);
        }
      }
      
      return () => {
        // Don't unsubscribe from data when component unmounts
        // This ensures data persists between tab changes
      };
    }
  }, [formType]);

  // Render different fields based on form type
  const renderFields = (submission: FormSubmission) => {
    switch(formType) {
      case 'newsletter':
        return (
          <>
            <div><strong>Email:</strong> {submission.email}</div>
            <div><strong>Status:</strong> {submission.status || 'active'}</div>
            <div><strong>Source:</strong> {submission.source || 'Not specified'}</div>
          </>
        );
      
      case 'contact':
        return (
          <>
            <div><strong>Name:</strong> {submission.name}</div>
            <div><strong>Email:</strong> {submission.email}</div>
            <div><strong>Subject:</strong> {submission.subject}</div>
            <div className="mt-2"><strong>Message:</strong></div>
            <div className="bg-secondary-800/30 p-2 sm:p-3 rounded mt-1 whitespace-pre-wrap text-sm sm:text-base">{submission.message}</div>
          </>
        );
      
      case 'volunteer':
        return (
          <>
            <div><strong>Name:</strong> {submission.name}</div>
            <div><strong>Email:</strong> {submission.email}</div>
            <div><strong>Status:</strong> {submission.status || 'pending'}</div>
            <div><strong>Interests:</strong> {Array.isArray(submission.interests) ? submission.interests.join(', ') : 'Not specified'}</div>
            {submission.skills && (
              <div><strong>Skills:</strong> {Array.isArray(submission.skills) ? submission.skills.join(', ') : 'Not specified'}</div>
            )}
            {submission.availability && (
              <div><strong>Availability:</strong> {submission.availability}</div>
            )}
            <div className="mt-2"><strong>Message:</strong></div>
            <div className="bg-secondary-800/30 p-3 rounded mt-1 whitespace-pre-wrap">{submission.message}</div>
          </>
        );
      
      case 'success-stories':
        return (
          <>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div><strong>Title:</strong> {submission.title}</div>
                <div><strong>Name:</strong> {submission.name}</div>
                <div><strong>Email:</strong> {submission.email}</div>
              </div>
              
              <div className="ml-4 flex flex-col items-end">
                <div className="text-sm">
                  <strong>Status:</strong> 
                  <span className={`ml-2 font-medium ${submission.approved === true ? 'text-green-400' : submission.approved === false ? 'text-amber-400' : 'text-gray-400'}`}>
                    {submission.approved === true ? 'Published' : submission.approved === false ? 'Pending Approval' : submission.status || 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
              <div>
                <div><strong>Program:</strong> {submission.program}</div>
                <div><strong>Impact:</strong> {submission.impact}</div>
              </div>
              
              {submission.imageUrl && (
                <div className="flex justify-end">
                  <img 
                    src={submission.imageUrl} 
                    alt="Story Image"
                    className="h-20 sm:h-24 w-auto object-cover rounded border border-gray-600"
                  />
                </div>
              )}
            </div>
            
            <div className="mt-2"><strong>Story:</strong></div>
            <div className="bg-secondary-800/30 p-2 sm:p-3 rounded mt-1 whitespace-pre-wrap text-sm sm:text-base">{submission.story}</div>
            
            {submission.approved === false && (
              <div className="mt-2 sm:mt-3 flex space-x-1.5 sm:space-x-2">
                <Button 
                  onClick={() => {
                    FormServiceFallback.approveSuccessStory(submission.id, true);
                    setSubmissions(prev => prev.map(item => 
                      item.id === submission.id ? {...item, approved: true, status: 'published'} : item
                    ));
                  }} 
                  variant="success" 
                  size="xsmall"
                >
                  Publish Story
                </Button>
                <Button 
                  onClick={() => {
                    FormServiceFallback.approveSuccessStory(submission.id, false);
                    handleDeleteSubmission(submission.id);
                  }} 
                  variant="secondary" 
                  size="xsmall"
                >
                  Reject
                </Button>
              </div>
            )}
          </>
        );
      
      case 'feedback':
        return (
          <>
            <div><strong>Name:</strong> {submission.name || 'Anonymous'}</div>
            {submission.email && <div><strong>Email:</strong> {submission.email}</div>}
            <div><strong>Rating:</strong> {submission.rating} / 5</div>
            <div><strong>Category:</strong> {submission.category}</div>
            <div><strong>Status:</strong> 
              <span className={`font-medium ${submission.approved === true ? 'text-green-400' : submission.approved === false ? 'text-amber-400' : 'text-gray-400'}`}>
                {submission.approved === true ? 'Approved' : submission.approved === false ? 'Pending Approval' : 'Not Specified'}
              </span>
            </div>
            <div className="mt-2"><strong>Feedback:</strong></div>
            <div className="bg-secondary-800/30 p-2 sm:p-3 rounded mt-1 whitespace-pre-wrap text-sm sm:text-base">{submission.feedback || submission.comment}</div>
            
            {submission.approved === false && (
              <div className="mt-2 sm:mt-3 flex space-x-1.5 sm:space-x-2">
                <Button 
                  onClick={() => {
                    FormServiceFallback.approveFeedback(submission.id, true);
                    setSubmissions(prev => prev.map(item => 
                      item.id === submission.id ? {...item, approved: true} : item
                    ));
                  }} 
                  variant="success" 
                  size="xsmall"
                >
                  Approve
                </Button>
                <Button 
                  onClick={() => {
                    FormServiceFallback.approveFeedback(submission.id, false);
                    handleDeleteSubmission(submission.id);
                  }} 
                  variant="secondary" 
                  size="xsmall"
                >
                  Reject
                </Button>
              </div>
            )}
          </>
        );
      
      default:
        return <div>No details available</div>;
    }
  };

  return (
    <div className="bg-secondary-800/30 rounded-xl p-3 sm:p-6 overflow-hidden shadow-xl border border-secondary-700/50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="text-primary-500">{title}</span>
        </h2>
        <Button 
          onClick={fetchSubmissions} 
          variant="secondary" 
          disabled={loading}
          size="small"
          className="flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh</span>
        </Button>
      </div>

      {formType === 'newsletter' && (
        <div className="mb-4 flex space-x-2">
          <Button onClick={() => setFilterStatus('all')} variant={filterStatus === 'all' ? 'primary' : 'secondary'}>All</Button>
          <Button onClick={() => setFilterStatus('active')} variant={filterStatus === 'active' ? 'primary' : 'secondary'}>Active</Button>
          <Button onClick={() => setFilterStatus('unsubscribed')} variant={filterStatus === 'unsubscribed' ? 'primary' : 'secondary'}>Unsubscribed</Button>
        </div>
      )}

      {error && (
        <div className="bg-amber-900/30 border border-amber-800 text-amber-200 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-amber-400 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium">{error}</p>
              {error.includes('Firebase') && (
                <p className="text-sm mt-1">
                  Please use the "Export All Submissions to Console" button above to retrieve any locally stored submissions.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-t-2 border-primary-500 rounded-full animate-spin mb-4" />
            <p className="text-gray-400">Loading submissions...</p>
          </div>
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-secondary-600 rounded-lg bg-secondary-800/20">
          <div className="flex flex-col items-center">
            <svg className="w-12 h-12 text-gray-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-gray-400 font-medium text-lg">No {formType.replace('-', ' ')} submissions found</p>
            <p className="text-gray-500 text-sm mt-1">Any new submissions will appear here</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4 max-h-[650px] overflow-y-auto pr-1 sm:pr-2 mt-3 sm:mt-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="p-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="p-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="p-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {submissions
                .filter(submission => {
                  if (filterStatus === 'all') return true;
                  const status = submission.data.status || submission.status || 'active';
                  return status === filterStatus;
                })
                .map(submission => (
                <tr 
                  key={submission.id} 
                  className="bg-secondary-700/50 p-2 sm:p-4 rounded-lg border border-secondary-600 transition-all hover:border-primary-500/50 shadow-md group hover:bg-secondary-700/80"
                >
                  <td className="p-3 whitespace-nowrap text-sm text-gray-200">
                    {submission.data.email || submission.email}
                  </td>
                  <td className="p-3 whitespace-nowrap text-sm text-gray-200">
                    {submission.data.name || submission.name || 'N/A'}
                  </td>
                  <td className="p-3 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      (submission.data.status || submission.status) === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {submission.data.status || submission.status || 'active'}
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap text-sm text-gray-400">
                    {getFormattedDate(submission.data.subscribedAt || submission.subscribed_at)}
                  </td>
                  <td className="p-3 whitespace-nowrap text-right text-sm font-medium">
                    <Button 
                      onClick={() => handleDeleteSubmission(submission.id)} 
                      variant="danger" 
                      size="xsmall" 
                      disabled={deleteLoading[submission.id]}
                      className="ml-2 opacity-70 group-hover:opacity-100 transition-opacity"
                    >
                      {deleteLoading[submission.id] ? (
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 border-t-2 border-white rounded-full animate-spin" />
                          <span>Deleting...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>Delete</span>
                        </div>
                      )}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
