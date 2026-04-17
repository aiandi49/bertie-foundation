import React, { useState, useEffect } from 'react';
import { PendingSubmission, ContentSubmission } from './PendingSubmission';
import { apiClient } from 'app';
import { Button } from '@/components/ui/button';

interface ModeratorDashboardProps {
  title?: string;
  subtitle?: string;
  selectedType?: string;
}

interface PendingCounts {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  [key: string]: number;
}

export function ModeratorDashboard({ 
  title = "Content Moderation", 
  subtitle = "Review and approve user-submitted content",
  selectedType
}: ModeratorDashboardProps) {
  const [pendingSubmissions, setPendingSubmissions] = useState<ContentSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<ContentSubmission[]>([]);
  const [counts, setCounts] = useState<PendingCounts>({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState(selectedType || 'all');
  const [statusFilter, setStatusFilter] = useState('pending');

  // Format content type for display
  const formatContentType = (type: string) => {
    return type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const fetchSubmissions = async () => {
    setLoading(true);
    setError('');
    
    try {
      // First get counts and basic stats
      const countResponse = await apiClient.get_pending_submissions();
      const countData = await countResponse.json();
      setCounts(countData.counts || { total: 0, pending: 0, approved: 0, rejected: 0 });
      
      // If we're viewing all content types and pending status
      if (activeFilter === 'all' && statusFilter === 'pending') {
        setPendingSubmissions(countData.pending_submissions || []);
        filterSubmissions(activeFilter, countData.pending_submissions || []);
      } else {
        // Otherwise fetch the specific content type we want
        let submissions = [];
        
        if (activeFilter !== 'all') {
          // Get submissions for specific content type
          const submissionsResponse = await apiClient.get_submissions_by_type({
            content_type: activeFilter,
            status: statusFilter
          });
          submissions = await submissionsResponse.json();
        } else {
          // Get submissions for all content types with the current status
          // We need to make multiple requests and combine them
          const contentTypes = ['success-story', 'feedback', 'volunteer', 'contact'];
          let allSubmissions = [];
          
          for (const type of contentTypes) {
            try {
              const typeResponse = await apiClient.get_submissions_by_type({
                content_type: type,
                status: statusFilter
              });
              const typeSubmissions = await typeResponse.json();
              allSubmissions = [...allSubmissions, ...typeSubmissions];
            } catch (e) {
              console.error(`Error fetching ${type} submissions:`, e);
            }
          }
          
          submissions = allSubmissions;
        }
        
        setPendingSubmissions(submissions);
        filterSubmissions(activeFilter, submissions);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setError('Failed to load submissions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (id: string) => {
    // If we're viewing pending items, remove it from the view
    if (statusFilter === 'pending') {
      setPendingSubmissions(prev => prev.filter(sub => sub.id !== id));
      setFilteredSubmissions(prev => prev.filter(sub => sub.id !== id));
      
      // Update counts
      setCounts(prev => ({
        ...prev,
        pending: Math.max(0, prev.pending - 1),
        approved: prev.approved + 1
      }));
    } else {
      // Otherwise refresh the data
      fetchSubmissions();
    }
  };

  const handleReject = (id: string) => {
    // If we're viewing pending items, remove it from the view
    if (statusFilter === 'pending') {
      setPendingSubmissions(prev => prev.filter(sub => sub.id !== id));
      setFilteredSubmissions(prev => prev.filter(sub => sub.id !== id));
      
      // Update counts
      setCounts(prev => ({
        ...prev,
        pending: Math.max(0, prev.pending - 1),
        rejected: prev.rejected + 1
      }));
    } else {
      // Otherwise refresh the data
      fetchSubmissions();
    }
  };

  const filterSubmissions = (filter: string, submissions = pendingSubmissions) => {
    setActiveFilter(filter);
    
    if (filter === 'all') {
      setFilteredSubmissions(submissions);
    } else {
      setFilteredSubmissions(submissions.filter(sub => sub.content_type === filter));
    }
  };

  // Fetch data when filters change
  useEffect(() => {
    fetchSubmissions();
  }, [activeFilter, statusFilter]);
  
  // Poll for new submissions
  useEffect(() => {
    // Poll for new submissions every 30 seconds
    const interval = setInterval(() => {
      fetchSubmissions();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Get unique content types
  const contentTypes = [...new Set(pendingSubmissions.map(sub => sub.content_type))];

  return (
    <div className="bg-secondary-800/30 rounded-xl p-3 sm:p-6 overflow-hidden shadow-xl border border-secondary-700/50">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            {title} 
            {counts.pending > 0 && (
              <span className="ml-2 text-xs sm:text-sm bg-amber-500/90 text-white py-0.5 px-2 rounded-full">
                {counts.pending} pending
              </span>
            )}
          </h2>
          <p className="text-gray-400 text-sm sm:text-base">{subtitle}</p>
        </div>
        
        <Button 
          onClick={fetchSubmissions} 
          variant="secondary" 
          disabled={loading}
          size="small"
          className="flex items-center gap-1 text-xs sm:text-sm self-start sm:self-auto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh</span>
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-secondary-800/50 rounded-lg p-2 sm:p-4 border border-secondary-700">
          <div className="text-xs sm:text-sm text-gray-400">Total</div>
          <div className="text-lg sm:text-2xl font-bold text-white">{counts.total || 0}</div>
        </div>
        <div className="bg-secondary-800/50 rounded-lg p-2 sm:p-4 border border-secondary-700">
          <div className="text-xs sm:text-sm text-gray-400">Pending</div>
          <div className="text-lg sm:text-2xl font-bold text-amber-500">{counts.pending || 0}</div>
        </div>
        <div className="bg-secondary-800/50 rounded-lg p-2 sm:p-4 border border-secondary-700">
          <div className="text-xs sm:text-sm text-gray-400">Approved</div>
          <div className="text-lg sm:text-2xl font-bold text-green-500">{counts.approved || 0}</div>
        </div>
        <div className="bg-secondary-800/50 rounded-lg p-2 sm:p-4 border border-secondary-700">
          <div className="text-xs sm:text-sm text-gray-400">Rejected</div>
          <div className="text-lg sm:text-2xl font-bold text-red-500">{counts.rejected || 0}</div>
        </div>
      </div>

      {/* Filter buttons */}
      {/* Filter by content type */}
      <div className="mb-4 sm:mb-6">
        <h3 className="text-sm font-medium text-gray-400 mb-2">Content Type:</h3>
        <div className="flex flex-wrap gap-1.5 sm:gap-2 overflow-x-auto pb-1">
          <Button 
            onClick={() => filterSubmissions('all')} 
            variant={activeFilter === 'all' ? 'primary' : 'secondary'}
            size="small"
            className="text-xs sm:text-sm py-1 px-2 sm:px-3"
          >
            All Types
          </Button>
          
          {contentTypes.map(type => (
            <Button 
              key={type}
              onClick={() => filterSubmissions(type)} 
              variant={activeFilter === type ? 'primary' : 'secondary'}
              size="small"
              className="text-xs sm:text-sm py-1 px-2 sm:px-3"
            >
              {formatContentType(type)}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Filter by status */}
      <div className="mb-4 sm:mb-6">
        <h3 className="text-sm font-medium text-gray-400 mb-2">Status:</h3>
        <div className="flex flex-wrap gap-1.5 sm:gap-2 overflow-x-auto pb-1">
          <Button 
            onClick={() => setStatusFilter('pending')} 
            variant={statusFilter === 'pending' ? 'primary' : 'secondary'}
            size="small"
            className="text-xs sm:text-sm py-1 px-2 sm:px-3"
          >
            Pending ({counts.pending || 0})
          </Button>
          
          <Button 
            onClick={() => setStatusFilter('approved')} 
            variant={statusFilter === 'approved' ? 'primary' : 'secondary'}
            size="small"
            className="text-xs sm:text-sm py-1 px-2 sm:px-3"
          >
            Approved ({counts.approved || 0})
          </Button>
          
          <Button 
            onClick={() => setStatusFilter('rejected')} 
            variant={statusFilter === 'rejected' ? 'primary' : 'secondary'}
            size="small"
            className="text-xs sm:text-sm py-1 px-2 sm:px-3"
          >
            Rejected ({counts.rejected || 0})
          </Button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-200 p-2.5 sm:p-4 rounded-lg mb-4 sm:mb-6 text-sm">
          <div className="flex items-center">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {loading ? (
        <div className="flex justify-center py-6 sm:py-12">
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 sm:w-10 sm:h-10 border-t-2 border-primary-500 rounded-full animate-spin mb-2 sm:mb-4" />
            <p className="text-gray-400 text-xs sm:text-base">Loading submissions...</p>
          </div>
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="text-center py-8 sm:py-16 border border-dashed border-secondary-600 rounded-lg bg-secondary-800/20">
          <div className="flex flex-col items-center">
            <svg className="w-8 h-8 sm:w-12 sm:h-12 text-gray-500 mb-2 sm:mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-400 font-medium text-sm sm:text-lg">
              {activeFilter === 'all' ? 
                `No ${statusFilter} content found` : 
                `No ${statusFilter} ${formatContentType(activeFilter)} submissions`}
            </p>
            <p className="text-gray-500 text-xs mt-1">
              {statusFilter === 'pending' ? 'New submissions will appear here for review' : 
               statusFilter === 'approved' ? 'Approved content will appear here' : 
               'Rejected content will appear here'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSubmissions.map(submission => (
            <PendingSubmission
              key={submission.id}
              submission={submission}
              onApprove={handleApprove}
              onReject={handleReject}
              isLoading={loading}
            />
          ))}
        </div>
      )}
    </div>
  );
}
