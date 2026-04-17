import React from 'react';
import { Layout } from '../components/Layout';
import { EndToEndFormTester } from '../components/EndToEndFormTester';
import { FormTestUtility } from '../components/FormTestUtility';
import { motion } from 'framer-motion';

export default function TestForms() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-16 px-4 bg-gradient-to-br from-primary-900 via-secondary-900 to-primary-800 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80"
            alt="Form Testing"
            className="w-full h-full object-cover opacity-10"
          />
        </div>
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Form & Notification Testing
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Comprehensive end-to-end testing of all forms and notification systems
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-6 bg-secondary-900">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-secondary-800/50 rounded-xl p-6 shadow-lg border border-secondary-700 mb-8">
              <h2 className="text-2xl font-bold mb-4 text-white">Testing Documentation</h2>
              
              <div className="prose prose-invert max-w-none">
                <p>
                  This page allows you to perform end-to-end testing of all forms and notifications in the Bertie Foundation website. 
                  The tests verify the following aspects:
                </p>
                
                <ul>
                  <li>Form submission functionality (both client-side and API)</li>
                  <li>Email notifications to administrators</li>
                  <li>Confirmation emails to users</li>
                  <li>Content moderation workflow</li>
                  <li>Data storage and retrieval</li>
                </ul>
                
                <p>
                  <strong>Test Guidelines:</strong>
                </p>
                
                <ol>
                  <li>Use the comprehensive test to run all tests in sequence</li>
                  <li>Check the logs panel for detailed test results</li>
                  <li>Enable admin mode to test email notifications (sends real emails)</li>
                  <li>Any issues found will be highlighted in the logs</li>
                </ol>
              </div>
            </div>
            
            <EndToEndFormTester />
            
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4 text-white">Legacy Testing Utility</h3>
              <p className="text-gray-400 mb-4">The original testing utility is still available below for basic local storage testing:</p>
              <FormTestUtility />
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
