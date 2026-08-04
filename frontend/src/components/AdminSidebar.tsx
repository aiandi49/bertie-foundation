import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  DollarSign,
  PieChart,
  X,
  BookOpen
} from "lucide-react";

interface AdminSidebarProps {
  isOpen?: boolean;
  toggleSidebar?: () => void;
}

export function AdminSidebar({ isOpen, toggleSidebar }: AdminSidebarProps) {
  const { pathname } = useLocation();

  // NOTE: Dashboard (/admin) is the single unified admin panel — it already
  // has tabs for Newsletter, Contact, Volunteer, Stories, and Feedback, each
  // wired to the correct table. The old separate pages this sidebar used to
  // link to (/moderation, /content-admin, /newsletter-admin, /volunteer-admin,
  // /stories-admin) were never registered as routes — they were dead links.
  // /feedbackadmin was a registered route but was left as an unfinished
  // placeholder, so it's removed here too in favor of the Feedback tab in
  // the main dashboard. Keeping this nav honest matters for handoff.
  const navItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: <PieChart className="w-5 h-5" />
    },
    {
      name: "Campaigns",
      path: "/campaign-admin",
      icon: <DollarSign className="w-5 h-5" />
    },
    {
      name: "Documentation",
      path: "/AdminDocs",
      icon: <BookOpen className="w-5 h-5" />
    }
  ];

  // For mobile displays
  const sidebarClasses = `bg-secondary-900 w-64 min-h-screen p-4 border-r border-secondary-700 
    ${isOpen !== undefined ? (isOpen ? 'block' : 'hidden') : 'hidden md:block'}
    ${isOpen !== undefined ? 'fixed md:static top-0 left-0 z-50 h-full overflow-y-auto shadow-xl' : ''}`;
  
  return (
    <aside className={sidebarClasses}>
      {/* Mobile close button */}
      {toggleSidebar && (
        <div className="flex justify-between items-center mb-3 md:hidden">
          <h2 className="text-lg font-bold text-white">Admin Panel</h2>
          <button 
            onClick={toggleSidebar}
            className="p-1.5 rounded-full hover:bg-secondary-800 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      )}
      
      {/* Regular header without close button */}
      {!toggleSidebar && (
        <div className="mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-white">Admin Panel</h2>
          <p className="text-gray-400 text-xs sm:text-sm">Bertie Foundation</p>
        </div>
      )}
      
      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-2 px-3 py-2 sm:py-3 rounded-md transition-colors text-sm sm:text-base
              ${pathname === item.path ? "bg-primary-600 text-white" : "text-gray-300 hover:bg-secondary-800 hover:text-white"}`}
            onClick={toggleSidebar} // Will close sidebar on mobile when clicking a link
          >
            {React.cloneElement(item.icon, { className: "w-4 h-4 sm:w-5 sm:h-5" })}
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
