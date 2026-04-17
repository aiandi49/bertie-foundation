import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Notification } from 'utils/notificationStore';
import { apiClient } from 'app';

interface SubmissionData {
  [key: string]: any;
}

export interface ContentSubmission {
  id: string;
  content_type: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  moderated_at?: string;
  email?: string;
  name?: string;
  admin_notes?: string;
  data: SubmissionData;
}

interface Props {
  submission: ContentSubmission;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isLoading?: boolean;
}

/**
 * Component to display a pending submission with approve/reject controls
 */
export function PendingSubmission({ submission, onApprove, onReject, isLoading = false }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [notifyUser, setNotifyUser] = useState(true);
  const [message, setMessage] = useState('');
  const [showMessageField, setShowMessageField] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const response = await apiClient.take_moderation_action({
        content_id: submission.id,
        action: 'approve',
        notify_user: notifyUser,
        message: message.trim() || undefined
      });
      
      const result = await response.json();
      
      if (result.success) {
        onApprove(submission.id);
      } else {
        console.error('Failed to approve submission:', result.message);
      }
    } catch (error) {
      console.error('Error approving submission:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      const response = await apiClient.take_moderation_action({
        content_id: submission.id,
        action: 'reject',
        notify_user: notifyUser,
        message: message.trim() || undefined
      });
      
      const result = await response.json();
      
      if (result.success) {
        onReject(submission.id);
      } else {
        console.error('Failed to reject submission:', result.message);
      }
    } catch (error) {
      console.error('Error rejecting submission:', error);
    } finally {
      setActionLoading(false);
    }
  };

  // Format content type for display
  const formatContentType = (type: string) => {
    return type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Render different fields based on content type
  const renderFields = () => {
    const { data } = submission;
    
    switch(submission.content_type) {
      case 'feedback':
        return (
          <>
            <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-4">
              <div>
                <strong>Name:</strong> {data.name || 'Anonymous'}
              </div>
              {data.email && (
                <div>
                  <strong>Email:</strong> {data.email}
                </div>
              )}
              <div>
                <strong>Rating:</strong> {data.rating} / 5
              </div>
              <div>
                <strong>Category:</strong> {data.category}
              </div>
            </div>
            <div className="mb-4">
              <strong>Feedback:</strong>
              <div className="bg-secondary-800/30 p-2 sm:p-3 rounded mt-1 whitespace-pre-wrap text-sm">
                {data.feedback || data.comment}
              </div>
            </div>
          </>
        );
      
      case 'success-story':
        return (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-4">
              <div>
                <strong>Title:</strong> {data.title}
              </div>
              <div>
                <strong>Name:</strong> {data.name}
              </div>
              <div>
                <strong>Program:</strong> {data.program}
              </div>
              <div>
                <strong>Impact:</strong> {data.impact}
              </div>
            </div>
            
            {data.imageUrl && (
              <div className="mb-4">
                <strong>Image:</strong>
                <div className="mt-1 sm:mt-2">
                  <img 
                    src={data.imageUrl} 
                    alt="Story image" 
                    className="max-h-24 sm:max-h-48 rounded border border-secondary-600"
                  />
                </div>
              </div>
            )}
            
            <div className="mb-4">
              <strong>Story:</strong>
              <div className="bg-secondary-800/30 p-3 rounded mt-1 whitespace-pre-wrap">
                {data.story}
              </div>
            </div>
          </>
        );
      
      case 'volunteer':
        return (
          <>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <strong>Name:</strong> {data.name}
              </div>
              <div>
                <strong>Email:</strong> {data.email}
              </div>
              {data.phone && (
                <div>
                  <strong>Phone:</strong> {data.phone}
                </div>
              )}
              <div>
                <strong>Interests:</strong> {Array.isArray(data.interests) ? data.interests.join(', ') : data.interests}
              </div>
              {data.skills && (
                <div>
                  <strong>Skills:</strong> {Array.isArray(data.skills) ? data.skills.join(', ') : data.skills}
                </div>
              )}
              {data.availability && (
                <div>
                  <strong>Availability:</strong> {data.availability}
                </div>
              )}
            </div>
            <div className="mb-4">
              <strong>Message:</strong>
              <div className="bg-secondary-800/30 p-3 rounded mt-1 whitespace-pre-wrap">
                {data.message}
              </div>
            </div>
          </>
        );
      
      case 'contact':
        return (
          <>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <strong>Name:</strong> {data.name}
              </div>
              <div>
                <strong>Email:</strong> {data.email}
              </div>
              {data.subject && (
                <div className="col-span-2">
                  <strong>Subject:</strong> {data.subject}
                </div>
              )}
            </div>
            <div className="mb-4">
              <strong>Message:</strong>
              <div className="bg-secondary-800/30 p-3 rounded mt-1 whitespace-pre-wrap">
                {data.message}
              </div>
            </div>
          </>
        );
      
      default:
        return (
          <pre className="bg-secondary-800/30 p-3 rounded mt-1 overflow-x-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        );
    }
  };

  return (
    <div className="bg-secondary-800/50 rounded-xl p-3 sm:p-6 shadow-lg border border-secondary-700 transition-all hover:border-primary-500/50 mb-4 sm:mb-6">
      {/* Header with submission info */}
      <div className="flex justify-between items-start mb-2 sm:mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white">
            {formatContentType(submission.content_type)} Submission
          </h3>
          <div className="text-xs sm:text-sm text-gray-400">
            Submitted {formatDate(submission.created_at)}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${submission.status === 'approved' ? 'bg-green-100 text-green-800' : submission.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
            {submission.status === 'approved' ? 'Approved' : submission.status === 'rejected' ? 'Rejected' : 'Pending'}
          </span>
          <button 
            onClick={() => setExpanded(!expanded)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {expanded ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Basic submission info (always visible) */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-4">
        <div>
          <strong>ID:</strong> <span className="font-mono text-xs truncate block sm:inline-block max-w-[120px] sm:max-w-none overflow-hidden">{submission.id}</span>
        </div>
        {submission.email && (
          <div>
            <strong>Submitted by:</strong> <span className="block sm:inline-block truncate max-w-[120px] sm:max-w-none">{submission.name || submission.email}</span>
          </div>
        )}
        {submission.moderated_at && (
          <div className="col-span-2">
            <strong>{submission.status === 'approved' ? 'Approved' : 'Rejected'} on:</strong> {formatDate(submission.moderated_at)}
          </div>
        )}
        {submission.admin_notes && (
          <div className="col-span-2">
            <strong>Admin notes:</strong> <span className="italic text-gray-400">{submission.admin_notes}</span>
          </div>
        )}
      </div>

      {/* Content details (expandable) */}
      {expanded && (
        <div className="mt-3 sm:mt-4 border-t border-secondary-700 pt-3 sm:pt-4">
          {renderFields()}

          {/* Notification settings */}
          <div className="mt-5 mb-3 sm:mb-4 border-t border-secondary-700 pt-3 sm:pt-4">
            <div className="flex items-center mb-2 sm:mb-3">
              <input
                type="checkbox"
                id={`notify-${submission.id}`}
                checked={notifyUser}
                onChange={(e) => setNotifyUser(e.target.checked)}
                className="rounded bg-secondary-900 border-secondary-700 text-primary-500 focus:ring-primary-500 w-3.5 h-3.5 sm:w-4 sm:h-4"
              />
              <label htmlFor={`notify-${submission.id}`} className="ml-1.5 sm:ml-2 text-xs sm:text-sm text-gray-300">
                Notify user of decision {submission.email ? `(${submission.email})` : ''}
              </label>
            </div>

            <button 
              onClick={() => setShowMessageField(!showMessageField)}
              className="text-primary-400 hover:text-primary-300 text-xs sm:text-sm flex items-center"
            >
              {showMessageField ? 'Hide message field' : 'Add message to notification'}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                {showMessageField ? (
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                ) : (
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                )}
              </svg>
            </button>

            {showMessageField && (
              <div className="mt-2">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Optional message to include in the notification email..."
                  className="w-full px-3 sm:px-4 py-1.5 sm:py-2 bg-secondary-900 border border-secondary-700 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:border-primary-500"
                  rows={2}
                ></textarea>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex justify-end space-x-2 sm:space-x-3 mt-3 sm:mt-4">
            {submission.status === 'pending' ? (
              <>
                <Button
                  onClick={handleReject}
                  variant="destructive"
                  className="text-xs sm:text-sm py-1 sm:py-1.5 px-2 sm:px-3"
                  disabled={isLoading || actionLoading}
                >
                  {actionLoading ? 'Processing...' : 'Reject'}
                </Button>
                <Button
                  onClick={handleApprove}
                  variant="default"
                  disabled={isLoading || actionLoading}
                >
                  {actionLoading ? 'Processing...' : 'Approve'}
                </Button>
              </>
            ) : (
              <div className="ml-auto text-xs text-gray-400 italic">
                {submission.status === 'approved' ? 'This submission has been approved' : 'This submission has been rejected'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
