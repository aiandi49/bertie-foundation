import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Download, Search, X, Filter, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { FormSubmissionsService, FormSubmission, FormType } from '../utils/formSubmissionsService';

interface FormSubmissionsManagerProps {
  onMigrateClick?: () => void;
}

export function FormSubmissionsManager({ onMigrateClick }: FormSubmissionsManagerProps) {
  // States for submissions and filtering
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // States for filtering
  const [activeTab, setActiveTab] = useState<FormType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);
  
  // States for export
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  
  // Function to fetch all submissions
  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await FormSubmissionsService.getSubmissions();
      setSubmissions(data);
      applyFilters(data, activeTab, searchTerm, startDate, endDate);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError('Failed to load submissions. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to apply filters
  const applyFilters = (
    data: FormSubmission[], 
    tab: FormType | 'all', 
    search: string, 
    from?: Date, 
    to?: Date
  ) => {
    let filtered = [...data];
    
    // Apply form type filter
    if (tab !== 'all') {
      filtered = filtered.filter(item => item.form_type === tab);
    }
    
    // Apply search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(item => {
        // Convert the item to a string for searching
        const itemStr = JSON.stringify(item).toLowerCase();
        return itemStr.includes(searchLower);
      });
    }
    
    // Apply date filters
    if (from) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.timestamp);
        return itemDate >= from;
      });
    }
    
    if (to) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.timestamp);
        return itemDate <= to;
      });
    }
    
    setFilteredSubmissions(filtered);
  };
  
  // Handle delete submission
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this submission?')) return;
    
    try {
      const success = await FormSubmissionsService.deleteSubmission(id);
      if (success) {
        // Remove from local state
        const updatedSubmissions = submissions.filter(s => s.id !== id);
        setSubmissions(updatedSubmissions);
        applyFilters(updatedSubmissions, activeTab, searchTerm, startDate, endDate);
      } else {
        setError('Failed to delete submission');
      }
    } catch (err) {
      console.error('Error deleting submission:', err);
      setError('An error occurred while deleting the submission');
    }
  };
  
  // Handle exporting submissions
  const handleExport = async () => {
    setExporting(true);
    setError(null);
    
    try {
      // Prepare filter for export
      const filter = {
        form_types: activeTab !== 'all' ? [activeTab] : undefined,
        search_term: searchTerm || undefined,
        start_date: startDate ? startDate.toISOString() : undefined,
        end_date: endDate ? endDate.toISOString() : undefined
      };
      
      const result = await FormSubmissionsService.exportSubmissions({
        format: exportFormat,
        filter
      });
      
      if (result && result.success) {
        // Handle the export data
        if (exportFormat === 'json') {
          // For JSON, create a file to download
          const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `form-submissions-${new Date().toISOString().slice(0, 10)}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } else if (exportFormat === 'csv') {
          // For CSV, create a file to download
          const blob = new Blob([result.data], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `form-submissions-${new Date().toISOString().slice(0, 10)}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      } else {
        setError('Failed to export submissions');
      }
    } catch (err) {
      console.error('Error exporting submissions:', err);
      setError('An error occurred during export');
    } finally {
      setExporting(false);
    }
  };
  
  // Handle reset filters
  const resetFilters = () => {
    setActiveTab('all');
    setSearchTerm('');
    setStartDate(undefined);
    setEndDate(undefined);
    applyFilters(submissions, 'all', '', undefined, undefined);
  };
  
  // Effect to load data on component mount
  useEffect(() => {
    fetchSubmissions();
  }, []);
  
  // Effect to apply filters when filter parameters change
  useEffect(() => {
    applyFilters(submissions, activeTab, searchTerm, startDate, endDate);
  }, [activeTab, searchTerm, startDate, endDate]);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  // Get the appropriate badge color for form type
  const getFormTypeBadge = (type: FormType) => {
    const badgeColors: Record<FormType, string> = {
      contact: 'bg-blue-800 hover:bg-blue-700',
      volunteer: 'bg-green-800 hover:bg-green-700',
      newsletter: 'bg-purple-800 hover:bg-purple-700',
      success_stories: 'bg-yellow-800 hover:bg-yellow-700',
      feedback: 'bg-orange-800 hover:bg-orange-700',
      donations: 'bg-pink-800 hover:bg-pink-700'
    };
    
    return badgeColors[type] || 'bg-gray-800 hover:bg-gray-700';
  };
  
  // Helper to render form data in a nice format
  const renderFormData = (data: Record<string, any>) => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="overflow-hidden">
            <span className="font-medium text-gray-300">{key}: </span>
            <span className="text-gray-400">
              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-2xl font-bold text-white">Form Submissions Manager</h2>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchSubmissions}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          
          {onMigrateClick && (
            <Button 
              variant="secondary" 
              size="sm"
              onClick={onMigrateClick}
              className="flex items-center gap-1"
            >
              Migrate Local Data
            </Button>
          )}
        </div>
      </div>
      
      {error && (
        <div className="bg-red-900/30 text-red-200 p-3 rounded-md border border-red-800">
          {error}
        </div>
      )}
      
      {showFilters && (
        <div className="bg-secondary-800/30 p-4 rounded-lg border border-secondary-700">
          <h3 className="font-semibold mb-3 text-white">Filter Submissions</h3>
          
          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <div className="flex-1">
              <div className="text-sm text-gray-400 mb-1">Search</div>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search in submissions..."
                  className="pl-8"
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-2.5 text-gray-500 hover:text-gray-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex-1 flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <div className="text-sm text-gray-400 mb-1">Start Date</div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="flex-1">
                <div className="text-sm text-gray-400 mb-1">End Date</div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-between items-center gap-3">
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={resetFilters} 
                variant="link"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                Reset Filters
              </Button>
              <div className="text-sm text-gray-500">
                {filteredSubmissions.length} of {submissions.length} submissions
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-400">Export as:</div>
              <Button 
                onClick={() => setExportFormat('json')} 
                variant={exportFormat === 'json' ? 'default' : 'outline'}
                size="sm"
              >
                JSON
              </Button>
              <Button 
                onClick={() => setExportFormat('csv')} 
                variant={exportFormat === 'csv' ? 'default' : 'outline'}
                size="sm"
              >
                CSV
              </Button>
              <Button 
                onClick={handleExport} 
                disabled={exporting}
                variant="secondary"
                size="sm"
                className="flex items-center gap-1"
              >
                {exporting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Export
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => setActiveTab(value as FormType | 'all')}>
        <TabsList className="flex justify-start space-x-1 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-primary-500 scrollbar-track-transparent overflow-y-hidden">
          <TabsTrigger value="all" className="min-w-fit">
            All Forms
          </TabsTrigger>
          <TabsTrigger value="contact" className="min-w-fit">
            Contact
          </TabsTrigger>
          <TabsTrigger value="volunteer" className="min-w-fit">
            Volunteer
          </TabsTrigger>
          <TabsTrigger value="newsletter" className="min-w-fit">
            Newsletter
          </TabsTrigger>
          <TabsTrigger value="success_stories" className="min-w-fit">
            Success Stories
          </TabsTrigger>
          <TabsTrigger value="feedback" className="min-w-fit">
            Feedback
          </TabsTrigger>
          <TabsTrigger value="donations" className="min-w-fit">
            Donations
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          {renderTabContent(filteredSubmissions)}
        </TabsContent>
        
        <TabsContent value="contact" className="mt-6">
          {renderTabContent(filteredSubmissions)}
        </TabsContent>
        
        <TabsContent value="volunteer" className="mt-6">
          {renderTabContent(filteredSubmissions)}
        </TabsContent>
        
        <TabsContent value="newsletter" className="mt-6">
          {renderTabContent(filteredSubmissions)}
        </TabsContent>
        
        <TabsContent value="success_stories" className="mt-6">
          {renderTabContent(filteredSubmissions)}
        </TabsContent>
        
        <TabsContent value="feedback" className="mt-6">
          {renderTabContent(filteredSubmissions)}
        </TabsContent>
        
        <TabsContent value="donations" className="mt-6">
          {renderTabContent(filteredSubmissions)}
        </TabsContent>
      </Tabs>
    </div>
  );
  
  // Helper function to render tab content
  function renderTabContent(data: FormSubmission[]) {
    return (
      <div>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center">
              <div className="h-8 w-8 border-4 border-t-transparent border-primary-500 rounded-full animate-spin mb-4" />
              <p className="text-gray-400">Loading submissions...</p>
            </div>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-secondary-600 rounded-lg bg-secondary-800/20">
            <div className="flex flex-col items-center">
              <svg className="w-12 h-12 text-gray-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-gray-400 font-medium text-lg">No submissions found</p>
              <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or add new submissions</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-h-[650px] overflow-y-auto pr-1 sm:pr-2">
            {filteredSubmissions.map((submission) => (
              <div 
                key={submission.id} 
                className="bg-secondary-800/50 p-4 rounded-lg border border-secondary-700 hover:border-primary-500/50 transition-all shadow-md"
              >
                <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={getFormTypeBadge(submission.form_type)}>
                      {submission.form_type.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {formatDate(submission.timestamp)}
                    </span>
                  </div>
                  
                  <Button 
                    onClick={() => handleDelete(submission.id)} 
                    variant="destructive" 
                    size="sm"
                    className="h-7 text-xs"
                  >
                    Delete
                  </Button>
                </div>
                
                {renderFormData(submission.data)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}
