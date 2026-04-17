import React, { useState } from 'react';
import { Button } from './Button';

export function AdminDocumentation() {
  const [activeSection, setActiveSection] = useState('introduction');

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-secondary-900 text-gray-100 min-h-screen pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Table of Contents - Fixed on large screens */}
          <div className="lg:w-1/4">
            <div className="lg:sticky lg:top-24 bg-secondary-800 rounded-xl p-5 shadow-xl border border-secondary-700">
              <h2 className="text-xl font-bold mb-4 text-primary-500">Table of Contents</h2>
              <nav className="space-y-1">
                {[
                  { id: 'introduction', label: 'Introduction' },
                  { id: 'accessing-admin', label: 'Accessing Admin Functions' },
                  { id: 'content-moderation', label: 'Content Moderation' },
                  { id: 'form-management', label: 'Form Management' },
                  { id: 'email-notifications', label: 'Email Notification System' },
                  { id: 'editing-content', label: 'Adding and Editing Content' },
                  { id: 'advanced-tools', label: 'Advanced Tools' }
                ].map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`block w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 ${activeSection === section.id ? 'bg-primary-600/30 text-primary-400 font-medium' : 'hover:bg-secondary-700 text-gray-300'}`}
                  >
                    {section.label}
                  </button>
                ))}
              </nav>
              <div className="mt-6">
                <Button 
                  variant="outline" 
                  size="small"
                  onClick={() => window.print()}
                  className="w-full"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print Documentation
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4 prose prose-lg prose-invert max-w-none">
            <section id="introduction" className="mb-12">
              <div className="bg-secondary-800/50 rounded-xl p-6 shadow-lg border border-secondary-700/50">
                <h1 className="text-4xl font-bold text-white mb-6">Bertie Foundation Admin Documentation</h1>
                <p className="text-gray-300">
                  This documentation provides comprehensive guidance for administrators of the Bertie Foundation website. 
                  It covers all aspects of content management, including moderation of user-submitted content, form management, 
                  email notifications, and adding/editing dynamic content.
                </p>
                <p className="text-sm text-gray-400 mt-4">
                  Last updated: April 5, 2025
                </p>
              </div>
            </section>

            <section id="accessing-admin" className="mb-12">
              <div className="bg-secondary-800/50 rounded-xl p-6 shadow-lg border border-secondary-700/50">
                <h2 className="text-3xl font-bold text-white mb-6">Accessing Admin Functions</h2>
                <p className="mb-4">
                  Admin functions are accessible from the Admin Dashboard. To access the dashboard:
                </p>
                <ol className="list-decimal pl-6 space-y-2 mb-6">
                  <li>Log in with your administrator credentials</li>
                  <li>Navigate to the Admin Dashboard by clicking the "Admin" link in the user menu</li>
                  <li>You'll see various sections for different administrative functions</li>
                </ol>
                
                <div className="bg-secondary-700/30 border border-secondary-600 rounded-lg p-4 my-6 flex justify-center">
                  <div className="bg-secondary-800 border border-secondary-700 rounded-lg p-2 text-center w-full max-w-2xl">
                    <div className="text-sm text-gray-400 mb-1">Admin Dashboard Screenshot</div>
                    <div className="h-48 flex items-center justify-center bg-secondary-900 rounded border border-secondary-800">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <p>
                  The Admin Dashboard provides quick access to all administrative functions and displays important metrics at a glance.
                </p>
              </div>
            </section>

            <section id="content-moderation" className="mb-12">
              <div className="bg-secondary-800/50 rounded-xl p-6 shadow-lg border border-secondary-700/50">
                <h2 className="text-3xl font-bold text-white mb-6">Content Moderation</h2>
                
                <h3 className="text-2xl font-bold text-white mb-4">Reviewing Pending Submissions</h3>
                <p className="mb-4">
                  User-submitted content requires admin approval before it appears on the website. This includes success stories, 
                  feedback, and other user-generated content.
                </p>
                <ol className="list-decimal pl-6 space-y-2 mb-6">
                  <li>Navigate to the <strong>Content Moderation</strong> tab in the Admin Dashboard</li>
                  <li>You'll see a list of pending submissions sorted by date (newest first)</li>
                  <li>Each submission displays basic information like submission type, date, and submitter's name/email</li>
                  <li>Click the expand button (downward arrow) to view the full details of a submission</li>
                </ol>

                <div className="bg-secondary-700/30 border border-secondary-600 rounded-lg p-4 my-6 flex justify-center">
                  <div className="bg-secondary-800 border border-secondary-700 rounded-lg p-2 text-center w-full max-w-2xl">
                    <div className="text-sm text-gray-400 mb-1">Pending Submissions View</div>
                    <div className="h-48 flex items-center justify-center bg-secondary-900 rounded border border-secondary-800">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mt-8 mb-4">Approving or Rejecting Content</h3>
                <p className="mb-4">
                  After reviewing a submission, you can either approve or reject it:
                </p>
                <ol className="list-decimal pl-6 space-y-2 mb-6">
                  <li>Expand the submission to view its full details</li>
                  <li>Review all submission fields carefully</li>
                  <li>If applicable, check any attached media (images, etc.)</li>
                  <li>To approve: Click the <strong>Approve</strong> button</li>
                  <li>To reject: Click the <strong>Reject</strong> button</li>
                  <li>You can optionally include a message to the submitter explaining your decision</li>
                  <li>Toggle the "Notify user" checkbox if you want to send an email notification</li>
                </ol>

                <div className="bg-amber-900/30 border border-amber-800 rounded-lg p-4 my-6">
                  <div className="flex items-start">
                    <svg className="w-6 h-6 text-amber-500 mr-3 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <p className="font-bold text-amber-500">Important Note</p>
                      <p className="text-gray-300">Once you reject content, it is permanently removed and cannot be recovered. Please review carefully before rejecting.</p>
                    </div>
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mt-8 mb-4">Best Practices for Content Moderation</h3>
                <ul className="list-disc pl-6 space-y-2 mb-6">
                  <li><strong>Be consistent:</strong> Apply the same standards to all submissions</li>
                  <li><strong>Review thoroughly:</strong> Check all text fields and any attached media</li>
                  <li><strong>Consider context:</strong> Some submissions may need to be understood in their full context</li>
                  <li><strong>Be timely:</strong> Try to moderate submissions within 48 hours</li>
                  <li><strong>Use notification messages:</strong> When rejecting content, provide clear, constructive feedback</li>
                  <li><strong>Follow guidelines:</strong> Ensure all published content aligns with the foundation's mission and values</li>
                  <li><strong>Check for sensitive information:</strong> Ensure no private or sensitive information is inadvertently published</li>
                </ul>
              </div>
            </section>

            <section id="form-management" className="mb-12">
              <div className="bg-secondary-800/50 rounded-xl p-6 shadow-lg border border-secondary-700/50">
                <h2 className="text-3xl font-bold text-white mb-6">Form Management</h2>
                
                <h3 className="text-2xl font-bold text-white mb-4">Viewing Form Submissions</h3>
                <p className="mb-4">
                  The platform collects submissions from various forms:
                </p>
                <ol className="list-decimal pl-6 space-y-2 mb-6">
                  <li>Navigate to the <strong>Form Management</strong> tab in the Admin Dashboard</li>
                  <li>Select the form type you want to view (Contact, Volunteer Applications, Newsletter Subscribers, etc.)</li>
                  <li>Submissions are displayed in reverse chronological order</li>
                  <li>Each entry shows key information and submission date</li>
                  <li>You can view full details by expanding each entry</li>
                </ol>

                <div className="bg-secondary-700/30 border border-secondary-600 rounded-lg p-4 my-6 flex justify-center">
                  <div className="bg-secondary-800 border border-secondary-700 rounded-lg p-2 text-center w-full max-w-2xl">
                    <div className="text-sm text-gray-400 mb-1">Form Management View</div>
                    <div className="h-48 flex items-center justify-center bg-secondary-900 rounded border border-secondary-800">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mt-8 mb-4">Managing Newsletter Subscribers</h3>
                <p className="mb-4">
                  Newsletter subscribers have their own management section:
                </p>
                <ol className="list-decimal pl-6 space-y-2 mb-6">
                  <li>Navigate to the <strong>Newsletter</strong> tab in the Form Management section</li>
                  <li>View a list of all subscribers with their email addresses and signup date</li>
                  <li>You can delete subscribers by clicking the delete button next to their entry</li>
                  <li>To export the subscriber list, use the <strong>Export</strong> button at the top of the page</li>
                </ol>

                <h3 className="text-2xl font-bold text-white mt-8 mb-4">Exporting Form Data</h3>
                <p className="mb-4">
                  Form data can be exported for offline analysis or backup:
                </p>
                <ol className="list-decimal pl-6 space-y-2 mb-6">
                  <li>Navigate to the form type you want to export</li>
                  <li>Click the <strong>Export</strong> button at the top of the form list</li>
                  <li>For temporary local backups, use the <strong>Export All to Console</strong> button in the Form Export Utility</li>
                  <li>To open the data in a new browser tab, use the <strong>Open in New Tab</strong> button</li>
                  <li>You can copy and paste the data into a spreadsheet or text file</li>
                </ol>

                <div className="bg-blue-900/30 border border-blue-800 rounded-lg p-4 my-6">
                  <div className="flex items-start">
                    <svg className="w-6 h-6 text-blue-500 mr-3 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="font-bold text-blue-500">Note about local storage</p>
                      <p className="text-gray-300">If the application displays a Firebase connectivity warning, submissions are being stored in your browser's localStorage. Use the export functions to save this data, as it will be lost if you clear your browser data.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="email-notifications" className="mb-12">
              <div className="bg-secondary-800/50 rounded-xl p-6 shadow-lg border border-secondary-700/50">
                <h2 className="text-3xl font-bold text-white mb-6">Email Notification System</h2>
                
                <h3 className="text-2xl font-bold text-white mb-4">How Email Notifications Work</h3>
                <p className="mb-4">
                  The system sends email notifications in various scenarios:
                </p>
                <ol className="list-decimal pl-6 space-y-2 mb-6">
                  <li><strong>User notifications:</strong> Sent to users after they submit forms (contact, volunteer applications, etc.)</li>
                  <li><strong>Admin notifications:</strong> Sent to administrators when new submissions are received</li>
                  <li><strong>Moderation notifications:</strong> Sent to users when their content is approved or rejected</li>
                </ol>
                <p className="mb-4">
                  All emails use pre-defined templates based on the type of form or action. Emails are sent through the Databutton email service.
                </p>

                <h3 className="text-2xl font-bold text-white mt-8 mb-4">Testing Email Notifications</h3>
                <p className="mb-4">
                  You can test the email notification system to ensure it's working properly:
                </p>
                <ol className="list-decimal pl-6 space-y-2 mb-6">
                  <li>Navigate to the <strong>Tools</strong> section in the Admin Dashboard</li>
                  <li>Open the <strong>End-to-End Form Tester</strong></li>
                  <li>Check the "Enable Admin Mode" checkbox to enable notification testing</li>
                  <li>Select the form type you want to test</li>
                  <li>Click the test button for that form</li>
                  <li>The system will send a test notification to the test email address</li>
                  <li>Check the logs in the test results panel to see if the notification was sent successfully</li>
                </ol>

                <div className="bg-secondary-700/30 border border-secondary-600 rounded-lg p-4 my-6 flex justify-center">
                  <div className="bg-secondary-800 border border-secondary-700 rounded-lg p-2 text-center w-full max-w-2xl">
                    <div className="text-sm text-gray-400 mb-1">Email Notification Testing</div>
                    <div className="h-48 flex items-center justify-center bg-secondary-900 rounded border border-secondary-800">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mt-8 mb-4">Troubleshooting Email Issues</h3>
                <p className="mb-4">
                  If email notifications aren't working properly:
                </p>
                <ol className="list-decimal pl-6 space-y-2 mb-6">
                  <li><strong>Check connectivity:</strong> Ensure the system has internet access</li>
                  <li><strong>Test specific templates:</strong> Use the End-to-End Tester to test specific email templates</li>
                  <li><strong>Check spam folders:</strong> Some emails may be flagged as spam by recipients' email providers</li>
                  <li><strong>Verify recipient addresses:</strong> Make sure email addresses are correctly formatted</li>
                  <li><strong>Check logs:</strong> Review the End-to-End Tester logs for any error messages</li>
                  <li><strong>Contact support:</strong> If issues persist, contact technical support</li>
                </ol>

                <div className="bg-secondary-700/30 border border-secondary-600 rounded-lg p-4 my-6">
                  <h4 className="font-bold text-white mb-2">Available Email Templates</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-secondary-800 p-3 rounded border border-secondary-700">
                      <div className="font-medium text-primary-400">volunteer_application</div>
                      <div className="text-sm text-gray-400">Sent to volunteers and admins after application</div>
                    </div>
                    <div className="bg-secondary-800 p-3 rounded border border-secondary-700">
                      <div className="font-medium text-primary-400">contact_form</div>
                      <div className="text-sm text-gray-400">Confirmation for contact form submissions</div>
                    </div>
                    <div className="bg-secondary-800 p-3 rounded border border-secondary-700">
                      <div className="font-medium text-primary-400">donation</div>
                      <div className="text-sm text-gray-400">Thank you message for donations</div>
                    </div>
                    <div className="bg-secondary-800 p-3 rounded border border-secondary-700">
                      <div className="font-medium text-primary-400">feedback</div>
                      <div className="text-sm text-gray-400">Confirmation for feedback submissions</div>
                    </div>
                    <div className="bg-secondary-800 p-3 rounded border border-secondary-700">
                      <div className="font-medium text-primary-400">success_story</div>
                      <div className="text-sm text-gray-400">For success story submissions and approvals</div>
                    </div>
                    <div className="bg-secondary-800 p-3 rounded border border-secondary-700">
                      <div className="font-medium text-primary-400">newsletter</div>
                      <div className="text-sm text-gray-400">Welcome message for newsletter subscriptions</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="editing-content" className="mb-12">
              <div className="bg-secondary-800/50 rounded-xl p-6 shadow-lg border border-secondary-700/50">
                <h2 className="text-3xl font-bold text-white mb-6">Adding and Editing Content</h2>
                
                <h3 className="text-2xl font-bold text-white mb-4">Programs and Events</h3>
                <p className="mb-4">
                  Add or edit programs and events through the content management interface:
                </p>
                <ol className="list-decimal pl-6 space-y-2 mb-6">
                  <li>Navigate to the <strong>Programs & Events</strong> section in the Admin Dashboard</li>
                  <li>To add a new program/event, click the <strong>Add New</strong> button</li>
                  <li>Fill in all required fields (title, description, date, location, etc.)</li>
                  <li>Add any relevant images or media</li>
                  <li>Toggle visibility settings as needed</li>
                  <li>Click <strong>Save</strong> to publish the program/event</li>
                </ol>

                <p className="mb-4">
                  To edit an existing program/event:
                </p>
                <ol className="list-decimal pl-6 space-y-2 mb-6">
                  <li>Find the entry in the list and click <strong>Edit</strong></li>
                  <li>Make your changes to any fields</li>
                  <li>Click <strong>Save</strong> to update</li>
                </ol>

                <h3 className="text-2xl font-bold text-white mt-8 mb-4">Success Stories</h3>
                <p className="mb-4">
                  In addition to moderating user-submitted success stories, admins can add success stories directly:
                </p>
                <ol className="list-decimal pl-6 space-y-2 mb-6">
                  <li>Navigate to the <strong>Success Stories</strong> section in the Admin Dashboard</li>
                  <li>Click <strong>Add New Story</strong></li>
                  <li>Fill in all fields (title, story content, program, impact, etc.)</li>
                  <li>Upload an image if relevant</li>
                  <li>Add appropriate tags to help with categorization</li>
                  <li>Click <strong>Publish</strong> to make the story visible on the website</li>
                </ol>

                <div className="bg-secondary-700/30 border border-secondary-600 rounded-lg p-4 my-6 flex justify-center">
                  <div className="bg-secondary-800 border border-secondary-700 rounded-lg p-2 text-center w-full max-w-2xl">
                    <div className="text-sm text-gray-400 mb-1">Story Editor</div>
                    <div className="h-48 flex items-center justify-center bg-secondary-900 rounded border border-secondary-800">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mt-8 mb-4">Campaigns</h3>
                <p className="mb-4">
                  Campaigns for fundraising and other initiatives can be managed through the Campaign Manager:
                </p>
                <ol className="list-decimal pl-6 space-y-2 mb-6">
                  <li>Navigate to the <strong>Campaigns</strong> section in the Admin Dashboard</li>
                  <li>View existing campaigns or click <strong>Create New Campaign</strong></li>
                  <li>Set up campaign details:
                    <ul className="list-disc pl-6 space-y-1 mt-2">
                      <li>Name and description</li>
                      <li>Funding goal</li>
                      <li>Start and end dates</li>
                      <li>Associated program(s)</li>
                      <li>Campaign image</li>
                    </ul>
                  </li>
                  <li>Monitor campaign progress through the dashboard</li>
                  <li>Update campaign information by clicking <strong>Edit</strong> on an existing campaign</li>
                </ol>
              </div>
            </section>

            <section id="advanced-tools" className="mb-12">
              <div className="bg-secondary-800/50 rounded-xl p-6 shadow-lg border border-secondary-700/50">
                <h2 className="text-3xl font-bold text-white mb-6">Advanced Tools</h2>
                
                <h3 className="text-2xl font-bold text-white mb-4">End-to-End Testing</h3>
                <p className="mb-4">
                  The End-to-End Form Tester allows you to verify that all forms and notifications are working correctly:
                </p>
                <ol className="list-decimal pl-6 space-y-2 mb-6">
                  <li>Navigate to the <strong>Tools</strong> section in the Admin Dashboard</li>
                  <li>Open the <strong>End-to-End Form Tester</strong></li>
                  <li>Choose between testing individual forms or running a comprehensive test</li>
                  <li>Enable Admin Mode if you want to test email notifications</li>
                  <li>Run the tests and monitor the test logs and results panels</li>
                  <li>Use these tests after system updates or when troubleshooting issues</li>
                </ol>

                <div className="bg-secondary-700/30 border border-secondary-600 rounded-lg p-4 my-6 flex justify-center">
                  <div className="bg-secondary-800 border border-secondary-700 rounded-lg p-2 text-center w-full max-w-2xl">
                    <div className="text-sm text-gray-400 mb-1">End-to-End Testing UI</div>
                    <div className="h-48 flex items-center justify-center bg-secondary-900 rounded border border-secondary-800">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mt-8 mb-4">Data Export Utilities</h3>
                <p className="mb-4">
                  For advanced data management and backup:
                </p>
                <ol className="list-decimal pl-6 space-y-2 mb-6">
                  <li>Navigate to the <strong>Tools</strong> section in the Admin Dashboard</li>
                  <li>Use the <strong>Form Submissions Export</strong> utility for comprehensive data exports</li>
                  <li>Click <strong>Export All to Console</strong> to log all stored data to the browser console</li>
                  <li>For better visualization, click <strong>Open in New Tab</strong> to display formatted JSON data</li>
                  <li>Save this data regularly, especially if using the localStorage fallback system</li>
                </ol>

                <div className="bg-green-900/30 border border-green-800 rounded-lg p-4 my-6">
                  <div className="flex items-start">
                    <svg className="w-6 h-6 text-green-500 mr-3 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="font-bold text-green-500">Best Practice</p>
                      <p className="text-gray-300">Create regular backups of your data, especially after significant updates or changes to the website. This ensures you always have a fallback in case of data loss.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="support" className="mb-12">
              <div className="bg-secondary-800/50 rounded-xl p-6 shadow-lg border border-secondary-700/50">
                <h2 className="text-3xl font-bold text-white mb-6">Support and Additional Help</h2>
                <p className="mb-4">
                  If you encounter issues not covered in this documentation or need further assistance, please contact 
                  the technical support team at <a href="mailto:support@bertiefoundation.org" className="text-primary-400 hover:underline">support@bertiefoundation.org</a>.
                </p>
                
                <div className="mt-8 border-t border-secondary-700 pt-6">
                  <p className="text-sm text-gray-400">
                    Last updated: April 5, 2025
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
