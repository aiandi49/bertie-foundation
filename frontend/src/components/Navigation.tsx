import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { mode, Mode } from "app";
import { ScrollToTop } from './ScrollToTop';

import { Home, Users, Heart, BookOpen, Menu, Calendar, Play, TrendingUp, Mail, ChevronDown, Info, Target, Image, Lock, TestTube } from 'lucide-react';
import { NotificationBell } from './NotificationBell';

export function Navigation() {
  const location = useLocation();
  // Check if current page is an admin page
  const isAdminPage = location.pathname === '/admin' || 
                     location.pathname === '/Admin' || 
                     location.pathname === '/TestForms' || 
                     location.pathname === '/moderation' || 
                     location.pathname === '/campaign-admin' ||
                     location.pathname === '/content-admin' ||
                     location.pathname === '/newsletter-admin' ||
                     location.pathname === '/feedbackadmin' ||
                     location.pathname === '/volunteer-admin' ||
                     location.pathname === '/stories-admin' ||
                     location.pathname === '/form-submissions' ||
                     location.pathname === '/AdminDocs';
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [isAboutUsOpen, setIsAboutUsOpen] = React.useState(false);
  const [isMediaOpen, setIsMediaOpen] = React.useState(false);
  
  // Check if the app is in development mode - show admin in nav only in dev mode
  const isDevMode = mode === Mode.DEV;

  const mediaLinks = [
    { name: 'Videos', path: '/videos', icon: Play },
    { name: 'Pictures', path: '/pictures', icon: Image },
    { name: 'Success Stories', path: '/success-stories', icon: Heart },
  ];

  const aboutUsLinks = [
    { name: 'Who Is Bertie?', path: '/who-is-bertie', icon: Heart },
    { name: 'Our Story', path: '/our-story', icon: BookOpen },
    { name: 'Vision', path: '/vision', icon: Target },
    { name: 'Members', path: '/Members', icon: Users },
  ];


  const makingDifferenceLinks = [
    { name: 'Impact', path: '/impact', icon: TrendingUp },
    { name: 'Feedback', path: '/feedback', icon: Mail },
  ];

  const mainLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Contact Us', path: '/contact-us', icon: Mail },
    { name: 'Admin', path: '/Admin', icon: Lock, adminOnly: true },
  ];
  
  // Admin links for the dropdown
  const adminLinks = [
    { name: 'Admin Dashboard', path: '/Admin', icon: Lock },
    { name: 'Form Testing', path: '/TestForms', icon: TestTube },
    { name: 'Form Submissions', path: '/form-submissions', icon: Mail },
  ];

  const isResourcesPage = window.location.pathname === '/resources';

  return (
    <>
      <ScrollToTop />
      <nav className={`${isResourcesPage ? 'bg-white text-secondary-900' : 'text-white'} shadow-lg sticky top-0 z-50`} style={{ backgroundColor: isResourcesPage ? 'white' : '#2563eb' }}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <img 
                  src="/images/bertie-logo.jpg" 
                  alt="Bertie Foundation Logo" 
                  className="h-20 w-auto object-contain mr-2 shadow-lg shadow-primary-400/60 transition-all hover:shadow-primary-400/80 rounded-lg" 
                />
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-white hover:text-primary-400 focus:outline-none p-2 rounded-md transition-colors"
                aria-label="Toggle mobile menu"
                aria-expanded={isOpen ? "true" : "false"}
              >
                <Menu size={28} className={`${isResourcesPage ? 'text-secondary-900' : 'text-white'}`} />
              </button>
            </div>

            {/* Desktop menu */}
            <div className="hidden md:flex space-x-8 items-center">
              {/* Home button */}
              <button
                onClick={() => navigate('/')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${window.location.pathname === '/' ? 'bg-blue-500 text-white' : isResourcesPage ? 'text-secondary-700 hover:bg-blue-500/10 hover:text-secondary-900' : 'text-gray-300 hover:bg-blue-500/10 hover:text-white'}`}
              >
                <Home size={20} className="text-red-500" />
                <span className="font-bold">Home</span>
              </button>
              
              {/* About Us Dropdown */}
              <div className="relative group">
                <button
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 cursor-default ${isResourcesPage ? 'text-secondary-700 hover:bg-blue-500/10 hover:text-secondary-900' : 'text-gray-300 hover:bg-blue-500/10 hover:text-white'}`}
                >
                  <Info size={20} className="text-red-500" />
                  <span className="font-bold">About Us</span>
                  <ChevronDown size={20} className="text-red-500 transform group-hover:rotate-180 transition-transform duration-300" />
                </button>
                <div className="absolute left-0 mt-2 w-48 bg-secondary-800 rounded-lg shadow-lg overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  {aboutUsLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <button
                        key={link.path}
                        onClick={() => navigate(link.path)}
                        className="flex items-center w-full px-4 py-2 text-left text-gray-300 hover:bg-blue-500/10 hover:text-white transition-colors duration-300"
                      >
                        <Icon size={20} className="mr-2 text-red-500" />
                        <span className="font-bold">{link.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Media Dropdown */}
              <div className="relative group">
                <button
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${isResourcesPage ? 'text-secondary-700 hover:bg-blue-500/10 hover:text-secondary-900' : 'text-gray-300 hover:bg-blue-500/10 hover:text-white'}`}
                  onClick={() => setIsMediaOpen(!isMediaOpen)}
                >
                  <Play size={20} className="text-red-500" />
                  <span className="font-bold">Media</span>
                  <ChevronDown size={20} className="text-red-500 transform group-hover:rotate-180 transition-transform duration-300" />
                </button>
                <div className="absolute left-0 mt-2 w-48 bg-secondary-800 rounded-lg shadow-lg overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  {mediaLinks.filter(link => link.path !== '/donate').map((link) => {
                    const Icon = link.icon;
                    if (link.name === 'Pictures') {
                      return (
                        <button
                          key={link.path}
                          disabled
                          className="flex items-center w-full px-4 py-2 text-left text-gray-500 cursor-not-allowed"
                        >
                          <Icon size={20} className="mr-2" />
                          <span className="font-bold">{link.name}</span>
                        </button>
                      );
                    }
                    return (
                      <button
                        key={link.path}
                        onClick={() => navigate(link.path)}
                        className="flex items-center w-full px-4 py-2 text-left text-gray-300 hover:bg-blue-500/10 hover:text-white transition-colors duration-300"
                      >
                        <Icon size={20} className="mr-2" />
                        <span className="font-bold">{link.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Making Difference Dropdown */}
              <div className="relative group">
                <button
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 cursor-default ${isResourcesPage ? 'text-secondary-700 hover:bg-blue-500/10 hover:text-secondary-900' : 'text-gray-300 hover:bg-blue-500/10 hover:text-white'}`}
                >
                  <Heart size={18} className="text-red-500" />
                  <span className="font-bold">Making Difference</span>
                  <ChevronDown size={18} className="text-red-500 transform group-hover:rotate-180 transition-transform duration-300" />
                </button>
                <div className="absolute left-0 mt-2 w-48 bg-secondary-800 rounded-lg shadow-lg overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  {makingDifferenceLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <button
                        key={link.path}
                        onClick={() => navigate(link.path)}
                        className="flex items-center w-full px-4 py-2 text-left text-gray-300 hover:bg-blue-500/10 hover:text-white transition-colors duration-300"
                      >
                        <Icon size={20} className="mr-2 text-red-500" />
                        <span className="font-bold">{link.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {mainLinks.filter(link => link.name !== 'Home' && !(link.adminOnly && !isAdminPage) && !(link.adminOnly && !isDevMode)).map((link) => {
                const Icon = link.icon;
                
                // Special case for Admin to show dropdown
                if (link.name === 'Admin') {
                  return (
                    <div key={link.path} className="relative group">
                      <button
                        disabled
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 text-gray-500 cursor-not-allowed`}
                      >
                        <Icon size={20} className="text-red-500" />
                        <span className="font-bold">{link.name}</span>
                        <ChevronDown size={16} className="text-red-500 transform group-hover:rotate-180 transition-transform duration-300 ml-1" />
                      </button>
                      <div className="absolute right-0 mt-2 w-48 bg-secondary-800 rounded-lg shadow-lg overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                        {adminLinks.map((adminLink) => {
                          const AdminIcon = adminLink.icon;
                          return (
                            <button
                              key={adminLink.path}
                              onClick={() => navigate(adminLink.path)}
                              className="flex items-center w-full px-4 py-2 text-left text-gray-300 hover:bg-blue-500/10 hover:text-white transition-colors duration-300"
                            >
                              <AdminIcon size={20} className="mr-2 text-red-500" />
                              <span className="font-bold">{adminLink.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
                
                // Regular navigation item
                return (
                  <button
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${window.location.pathname === link.path ? 'bg-blue-500 text-white' : isResourcesPage ? 'text-secondary-700 hover:bg-blue-500/10 hover:text-secondary-900' : 'text-gray-300 hover:bg-blue-500/10 hover:text-white'}`}
                  >
                    <Icon size={20} className="text-red-500" />
                    <span className="font-bold">{link.name}</span>
                  </button>
                );
              })}

            </div>
          </div>

          {/* Mobile menu */}
          <div className={`md:hidden py-2 ${isOpen ? 'block' : 'hidden'} transition-all duration-300 ease-in-out`}>
            <div className="space-y-2 max-h-[70vh] overflow-y-auto pb-4 bg-secondary-900 rounded-lg shadow-xl px-4">
              {/* Mobile About Us Dropdown */}
              <div className="mt-4">
                <button
                  onClick={() => setIsAboutUsOpen(!isAboutUsOpen)}
                  className={`flex items-center justify-between w-full px-3 py-3 rounded-lg transition-all duration-300 ${isResourcesPage ? 'text-secondary-700 hover:bg-blue-500/10 hover:text-secondary-900' : 'text-gray-300 hover:bg-blue-500/10 hover:text-white'}`}
                  aria-expanded={isAboutUsOpen ? "true" : "false"}
                >
                  <div className="flex items-center space-x-3">
                    <Info size={18} className="text-red-500" />
                    <span className="font-bold text-base">About Us</span>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`text-red-500 transform transition-transform duration-300 ${isAboutUsOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                <div className={`mt-2 bg-secondary-800/50 rounded-lg overflow-hidden transition-all duration-300 ${isAboutUsOpen ? 'max-h-96 opacity-100 visible' : 'max-h-0 opacity-0 invisible'}`}>
                  {aboutUsLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <button
                        key={link.path}
                        onClick={() => {
                          navigate(link.path);
                          setIsOpen(false);
                          setIsAboutUsOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-3 text-left text-gray-300 hover:bg-blue-500/10 hover:text-white transition-colors duration-300 text-sm"
                      >
                        <Icon size={16} className="mr-3 text-red-500" />
                        <span>{link.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Making Difference Dropdown (Added for mobile) */}
              <div className="mt-2">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`flex items-center justify-between w-full px-3 py-3 rounded-lg transition-all duration-300 ${isResourcesPage ? 'text-secondary-700 hover:bg-blue-500/10 hover:text-secondary-900' : 'text-gray-300 hover:bg-blue-500/10 hover:text-white'}`}
                  aria-expanded={isDropdownOpen ? "true" : "false"}
                >
                  <div className="flex items-center space-x-3">
                    <Heart size={18} className="text-red-500" />
                    <span className="font-bold text-base">Making Difference</span>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`text-red-500 transform transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                <div className={`mt-2 bg-secondary-800/50 rounded-lg overflow-hidden transition-all duration-300 ${isDropdownOpen ? 'max-h-96 opacity-100 visible' : 'max-h-0 opacity-0 invisible'}`}>
                  {makingDifferenceLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <button
                        key={link.path}
                        onClick={() => {
                          navigate(link.path);
                          setIsOpen(false);
                          setIsDropdownOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-3 text-left text-gray-300 hover:bg-blue-500/10 hover:text-white transition-colors duration-300 text-sm"
                      >
                        <Icon size={16} className="mr-3 text-red-500" />
                        <span>{link.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Mobile Media Dropdown */}
              <div className="mt-2">
                <button
                  onClick={() => setIsMediaOpen(!isMediaOpen)}
                  className={`flex items-center justify-between w-full px-3 py-3 rounded-lg transition-all duration-300 ${isResourcesPage ? 'text-secondary-700 hover:bg-blue-500/10 hover:text-secondary-900' : 'text-gray-300 hover:bg-blue-500/10 hover:text-white'}`}
                  aria-expanded={isMediaOpen ? "true" : "false"}
                >
                  <div className="flex items-center space-x-3">
                    <Play size={18} className="text-red-500" />
                    <span className="font-bold text-base">Media</span>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`text-red-500 transform transition-transform duration-300 ${isMediaOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                <div className={`mt-2 bg-secondary-800/50 rounded-lg overflow-hidden transition-all duration-300 ${isMediaOpen ? 'max-h-96 opacity-100 visible' : 'max-h-0 opacity-0 invisible'}`}>
                  {mediaLinks.filter(link => link.path !== '/donate').map((link) => {
                    const Icon = link.icon;
                    if (link.name === 'Pictures') {
                      return (
                        <button
                          key={link.path}
                          disabled
                          className="flex items-center w-full px-4 py-3 text-left text-gray-500 cursor-not-allowed text-sm"
                        >
                          <Icon size={16} className="mr-3" />
                          <span>{link.name}</span>
                        </button>
                      );
                    }
                    return (
                      <button
                        key={link.path}
                        onClick={() => {
                          navigate(link.path);
                          setIsOpen(false);
                          setIsMediaOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-3 text-left text-gray-300 hover:bg-blue-500/10 hover:text-white transition-colors duration-300 text-sm"
                      >
                        <Icon size={16} className="mr-3" />
                        <span>{link.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Main Links */}
              <div className="mt-2 space-y-2">
                {mainLinks.filter(link => !(link.adminOnly && !isDevMode)).map((link) => {
                  const Icon = link.icon;
                  
                  // Special case for Admin on mobile
                  if (link.name === 'Admin') {
                    return (
                      <div key={link.path}>
                        <button
                          disabled
                          className={`flex items-center justify-between w-full px-3 py-3 rounded-lg transition-all duration-300 text-sm text-gray-500 cursor-not-allowed`}
                        >
                          <div className="flex items-center space-x-3">
                            <Icon size={18} className="text-red-500" />
                            <span className="font-bold text-base">{link.name}</span>
                          </div>
                          <ChevronDown
                            size={18}
                            className="text-red-500 transform transition-transform duration-300"
                          />
                        </button>
                        <div className="pl-6 mt-1 space-y-2">
                          {adminLinks.map((adminLink) => {
                            const AdminIcon = adminLink.icon;
                            if (isAdminPage) {
                              return (
                                <button
                                  key={adminLink.path}
                                  onClick={() => {
                                    navigate(adminLink.path);
                                    setIsOpen(false);
                                  }}
                                  className="flex items-center w-full px-3 py-2 text-left text-gray-300 hover:bg-blue-500/10 hover:text-white transition-colors duration-300 rounded-md text-sm"
                                >
                                  <AdminIcon size={16} className="mr-2 text-red-500" />
                                  <span>{adminLink.name}</span>
                                </button>
                              );
                            }
                            return null;
                          })}
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <button
                      key={link.path}
                      onClick={() => {
                        navigate(link.path);
                        setIsOpen(false);
                      }}
                      className={`flex items-center space-x-3 w-full px-3 py-3 rounded-lg transition-all duration-300 text-base ${window.location.pathname === link.path ? 'bg-blue-500 text-white' : isResourcesPage ? 'text-secondary-700 hover:bg-blue-500/10 hover:text-secondary-900' : 'text-gray-300 hover:bg-blue-500/10 hover:text-white'}`}
                    >
                      <Icon size={18} className="text-red-500" />
                      <span className="font-bold">{link.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
