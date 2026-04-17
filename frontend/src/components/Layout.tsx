import React, { Suspense, lazy } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Menu } from 'lucide-react';
import { Footer } from './Footer';
import { Navigation } from './Navigation';
import { AdminSidebar } from './AdminSidebar';
import { PageOptimizer } from './PageOptimizer';

interface Props {
  children: React.ReactNode;
  className?: string;
  useWhiteBackground?: boolean;
  prefetchResources?: {
    images?: string[];
    pages?: string[];
    domains?: string[];
  };
}

export function Layout({ children, className = '', useWhiteBackground = false, prefetchResources = {} }: Props) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  
  // Check if current page is an admin page
  const isAdminPage = pathname === '/admin' || 
                      pathname === '/Admin' || 
                      pathname === '/TestForms' || 
                      pathname === '/moderation' || 
                      pathname === '/campaign-admin' ||
                      pathname === '/content-admin' ||
                      pathname === '/newsletter-admin' ||
                      pathname === '/feedbackadmin' ||
                      pathname === '/volunteer-admin' ||
                      pathname === '/stories-admin' ||
                      pathname === '/AdminDocs';
  
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  return (
    <div className={`min-h-screen flex flex-col ${useWhiteBackground ? 'bg-white' : 'bg-secondary-900'} ${className}`}>
      <Navigation />
      
      {/* Admin Sidebar Toggle Button - Only visible on mobile when on admin pages */}
      {isAdminPage && (
        <div className="md:hidden sticky top-[4rem] z-30 p-2">
          <button 
            onClick={toggleSidebar} 
            className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white rounded-lg shadow-md hover:bg-primary-700 transition-colors text-sm"
            aria-label="Toggle admin sidebar"
            aria-expanded={sidebarOpen}
          >
            <Menu size={16} />
            <span>Admin Menu</span>
          </button>
        </div>
      )}
      
      {/* Overlay for mobile when sidebar is open */}
      {isAdminPage && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}
      
      <div className="flex flex-1 overflow-hidden">
        {/* Conditionally render admin sidebar */}
        {isAdminPage && <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />}
        
        {/* Main content with page transitions */}
        <main className={`flex-1 w-full overflow-y-auto ${isAdminPage ? 'md:ml-64' : ''} px-2 sm:px-4 md:px-6 pb-4 sm:pb-6 md:pb-8`}>
          <PageOptimizer 
            resources={prefetchResources}
            enableCodeSplitting={true} /* Enable code splitting for better performance */
            priorityLevel="medium"
          >
            {children}
          </PageOptimizer>
        </main>
      </div>
      <Footer />
    </div>
  );
}
