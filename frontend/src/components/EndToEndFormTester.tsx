import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FormServiceFallback } from '../utils/formServiceFallback';
import { apiClient } from 'app';
import { ContentType } from 'types';

export function EndToEndFormTester() {
  const [testStatus, setTestStatus] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [testLogs, setTestLogs] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [adminMode, setAdminMode] = useState(false);
  
  // Add a log entry
  const addLog = (message: string) => {
    setTestLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`]);
  };
  
  // Get notifications to check if they're being created
  const fetchNotifications = async () => {
    try {
      const response = await apiClient.get_notifications();
      const data = await response.json();
      setNotifications(data.notifications || []);
      return data.notifications || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  };
  
  // Update test status with result details
  const updateTestStatus = (status: string, details?: any) => {
    setTestStatus(status);
    if (details) {
      setTestResult(details);
    }
  };
  
  // Clear test results
  const clearResults = () => {
    setTestStatus('');
    setTestResult(null);
    setTestLogs([]);
  };
  
  // Test newsletter subscription
  const testNewsletterForm = async () => {
    addLog('📧 Testing newsletter subscription...');
    updateTestStatus('Testing newsletter subscription...');
    
    try {
      // 1. Test local fallback service
      await FormServiceFallback.subscribeToNewsletter('test@example.com', 'test-automation');
      addLog('✅ Local fallback service worked successfully');
      
      // 2. Test the API endpoint
      try {
        const response = await apiClient.subscribe_to_newsletter({
          email: 'api-test@example.com',
          source: 'test-automation'
        });
        
        const data = await response.json();
        addLog(`✅ API endpoint returned: ${JSON.stringify(data)}`);
        
        // 3. Check for notifications (this will happen after a delay)
        setTimeout(async () => {
          const notifications = await fetchNotifications();
          const relevantNotification = notifications.find(
            (n) => n.type === 'newsletter_subscription' && n.data?.email === 'api-test@example.com'
          );
          
          if (relevantNotification) {
            addLog('✅ Notification record created for the subscription');
          } else {
            addLog('⚠️ No notification record found for this subscription');
          }
        }, 2000);
        
      } catch (error) {
        addLog(`❌ API endpoint error: ${error}`);
        console.error('API error:', error);
      }
      
      // 4. Test email notification by triggering the email test endpoint
      if (adminMode) {
        try {
          const response = await apiClient.test_notification({
            template_type: 'newsletter',
            recipient_email: 'test@example.com'
          });
          
          const data = await response.json();
          addLog(`✅ Test notification API returned: ${JSON.stringify(data)}`);
        } catch (error) {
          addLog(`❌ Test notification API error: ${error}`);
          console.error('Test notification error:', error);
        }
      }
      
      // Show the stored data
      const allData = FormServiceFallback.exportAllData();
      updateTestStatus('Newsletter subscription test complete!', allData.newsletter);
      
    } catch (error) {
      addLog(`❌ Test failed: ${error}`);
      console.error('Test failed:', error);
      updateTestStatus('Test failed. See console for details.');
    }
  };
  
  // Test contact form
  const testContactForm = async () => {
    addLog('📝 Testing contact form...');
    updateTestStatus('Testing contact form...');
    
    try {
      // 1. Test local fallback service
      await FormServiceFallback.submitContactForm({
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'This is a test message from the test automation.'
      });
      addLog('✅ Local fallback service worked successfully');
      
      // 2. Test the API endpoint
      try {
        const response = await apiClient.submit_contact({
          name: 'API Test User',
          email: 'api-test@example.com',
          subject: 'API Test Subject',
          message: 'This is a test message from the API test automation.',
          category: 'general'
        });
        
        const data = await response.json();
        addLog(`✅ API endpoint returned: ${JSON.stringify(data)}`);
        
        // 3. Check for notifications (this will happen after a delay)
        setTimeout(async () => {
          const notifications = await fetchNotifications();
          const relevantNotification = notifications.find(
            (n) => n.type === 'contact_form' && n.data?.email === 'api-test@example.com'
          );
          
          if (relevantNotification) {
            addLog('✅ Notification record created for the contact form');
          } else {
            addLog('⚠️ No notification record found for this contact form');
          }
        }, 2000);
        
      } catch (error) {
        addLog(`❌ API endpoint error: ${error}`);
        console.error('API error:', error);
      }
      
      // 4. Test email notification by triggering the email test endpoint
      if (adminMode) {
        try {
          const response = await apiClient.test_notification({
            template_type: 'contact_form',
            recipient_email: 'test@example.com'
          });
          
          const data = await response.json();
          addLog(`✅ Test notification API returned: ${JSON.stringify(data)}`);
        } catch (error) {
          addLog(`❌ Test notification API error: ${error}`);
          console.error('Test notification error:', error);
        }
      }
      
      // Show the stored data
      const allData = FormServiceFallback.exportAllData();
      updateTestStatus('Contact form test complete!', allData.contact);
      
    } catch (error) {
      addLog(`❌ Test failed: ${error}`);
      console.error('Test failed:', error);
      updateTestStatus('Test failed. See console for details.');
    }
  };
  
  // Test volunteer form
  const testVolunteerForm = async () => {
    addLog('🙋 Testing volunteer application...');
    updateTestStatus('Testing volunteer application...');
    
    try {
      // 1. Test local fallback service
      await FormServiceFallback.submitVolunteerApplication({
        name: 'Test Volunteer',
        email: 'volunteer@example.com',
        message: 'I want to volunteer for testing!',
        interests: ['Education', 'Technology']
      });
      addLog('✅ Local fallback service worked successfully');
      
      // 2. Test the API endpoint
      try {
        const response = await apiClient.submit_volunteer_application({
          name: 'API Test Volunteer',
          email: 'api-volunteer@example.com',
          message: 'I want to volunteer through the API!',
          interests: ['Community', 'Development'],
          skills: ['Testing', 'Automation'],
          availability: 'Weekends'
        });
        
        const data = await response.json();
        addLog(`✅ API endpoint returned: ${JSON.stringify(data)}`);
        
        // 3. Check for notifications (this will happen after a delay)
        setTimeout(async () => {
          const notifications = await fetchNotifications();
          const relevantNotification = notifications.find(
            (n) => n.type === 'volunteer_application' && n.data?.email === 'api-volunteer@example.com'
          );
          
          if (relevantNotification) {
            addLog('✅ Notification record created for the volunteer application');
          } else {
            addLog('⚠️ No notification record found for this volunteer application');
          }
        }, 2000);
        
      } catch (error) {
        addLog(`❌ API endpoint error: ${error}`);
        console.error('API error:', error);
      }
      
      // 4. Test email notification by triggering the email test endpoint
      if (adminMode) {
        try {
          const response = await apiClient.test_notification({
            template_type: 'volunteer_application',
            recipient_email: 'test@example.com'
          });
          
          const data = await response.json();
          addLog(`✅ Test notification API returned: ${JSON.stringify(data)}`);
        } catch (error) {
          addLog(`❌ Test notification API error: ${error}`);
          console.error('Test notification error:', error);
        }
      }
      
      // Show the stored data
      const allData = FormServiceFallback.exportAllData();
      updateTestStatus('Volunteer form test complete!', allData.volunteer);
      
    } catch (error) {
      addLog(`❌ Test failed: ${error}`);
      console.error('Test failed:', error);
      updateTestStatus('Test failed. See console for details.');
    }
  };
  
  // Test success story form
  const testSuccessStoryForm = async () => {
    addLog('📖 Testing success story submission...');
    updateTestStatus('Testing success story submission...');
    
    try {
      // 1. Test local fallback service
      await FormServiceFallback.submitSuccessStory({
        title: 'Test Success Story',
        story: 'This is a test success story for automated testing.',
        program: 'education',
        impact: 'High impact on test automation.',
        name: 'Test Storyteller',
        email: 'story@example.com'
      });
      addLog('✅ Local fallback service worked successfully');
      
      // 2. Test the API endpoint
      try {
        const response = await apiClient.submit_success_story({
          title: 'API Test Success Story',
          story: 'This is a test success story submitted through the API.',
          program: 'community-support',
          impact: 'High impact on API testing.',
          name: 'API Test Storyteller',
          email: 'api-story@example.com',
          tags: ['test', 'automation']
        });
        
        const data = await response.json();
        addLog(`✅ API endpoint returned: ${JSON.stringify(data)}`);
        
        // 3. Check for notifications (this will happen after a delay)
        setTimeout(async () => {
          const notifications = await fetchNotifications();
          const relevantNotification = notifications.find(
            (n) => n.type === 'success_story' && n.data?.email === 'api-story@example.com'
          );
          
          if (relevantNotification) {
            addLog('✅ Notification record created for the success story');
          } else {
            addLog('⚠️ No notification record found for this success story');
          }
        }, 2000);
        
      } catch (error) {
        addLog(`❌ API endpoint error: ${error}`);
        console.error('API error:', error);
      }
      
      // 4. Test email notification by triggering the email test endpoint
      if (adminMode) {
        try {
          const response = await apiClient.test_notification({
            template_type: 'success_story',
            recipient_email: 'test@example.com'
          });
          
          const data = await response.json();
          addLog(`✅ Test notification API returned: ${JSON.stringify(data)}`);
        } catch (error) {
          addLog(`❌ Test notification API error: ${error}`);
          console.error('Test notification error:', error);
        }
      }
      
      // Show the stored data
      const allData = FormServiceFallback.exportAllData();
      updateTestStatus('Success story form test complete!', allData.successStories);
      
    } catch (error) {
      addLog(`❌ Test failed: ${error}`);
      console.error('Test failed:', error);
      updateTestStatus('Test failed. See console for details.');
    }
  };
  
  // Test feedback form
  const testFeedbackForm = async () => {
    addLog('🔍 Testing feedback submission...');
    updateTestStatus('Testing feedback submission...');
    
    try {
      // 1. Test local fallback service
      await FormServiceFallback.submitFeedback({
        rating: 4,
        category: 'website',
        comment: 'This is a test feedback comment.',
        email: 'feedback@example.com'
      });
      addLog('✅ Local fallback service worked successfully');
      
      // 2. Test the API endpoint
      try {
        const response = await apiClient.submit_feedback({
          rating: 5,
          category: 'program',
          comment: 'This is a test feedback submitted via API.',
          email: 'api-feedback@example.com'
        });
        
        const data = await response.json();
        addLog(`✅ API endpoint returned: ${JSON.stringify(data)}`);
        
        // 3. Check for notifications (this will happen after a delay)
        setTimeout(async () => {
          const notifications = await fetchNotifications();
          const relevantNotification = notifications.find(
            (n) => n.type === 'feedback' && n.data?.email === 'api-feedback@example.com'
          );
          
          if (relevantNotification) {
            addLog('✅ Notification record created for the feedback');
          } else {
            addLog('⚠️ No notification record found for this feedback');
          }
        }, 2000);
        
      } catch (error) {
        addLog(`❌ API endpoint error: ${error}`);
        console.error('API error:', error);
      }
      
      // 4. Test email notification by triggering the email test endpoint
      if (adminMode) {
        try {
          const response = await apiClient.test_notification({
            template_type: 'feedback',
            recipient_email: 'test@example.com'
          });
          
          const data = await response.json();
          addLog(`✅ Test notification API returned: ${JSON.stringify(data)}`);
        } catch (error) {
          addLog(`❌ Test notification API error: ${error}`);
          console.error('Test notification error:', error);
        }
      }
      
      // Show the stored data
      const allData = FormServiceFallback.exportAllData();
      updateTestStatus('Feedback form test complete!', allData.feedback);
      
    } catch (error) {
      addLog(`❌ Test failed: ${error}`);
      console.error('Test failed:', error);
      updateTestStatus('Test failed. See console for details.');
    }
  };
  
  // Test donation form
  const testDonationForm = async () => {
    addLog('💰 Testing donation submission...');
    updateTestStatus('Testing donation submission...');
    
    try {
      // 1. Test local fallback service
      await FormServiceFallback.submitDonation({
        name: 'Test Donor',
        email: 'donor@example.com',
        amount: 50,
        program: 'education'
      });
      addLog('✅ Local fallback service worked successfully');
      
      // 2. Test the donation order API endpoint
      try {
        const response = await apiClient.create_donation_order({
          name: 'API Test Donor',
          email: 'api-donor@example.com',
          amount: 100,
          program: 'community-support',
          campaignId: ''
        });
        
        const data = await response.json();
        addLog(`✅ API endpoint returned: ${JSON.stringify(data)}`);
        
        // 3. Check for notifications (this will happen after a delay)
        setTimeout(async () => {
          const notifications = await fetchNotifications();
          const relevantNotification = notifications.find(
            (n) => n.type === 'donation' && n.data?.email === 'api-donor@example.com'
          );
          
          if (relevantNotification) {
            addLog('✅ Notification record created for the donation');
          } else {
            addLog('⚠️ No notification record found for this donation');
          }
        }, 2000);
        
      } catch (error) {
        addLog(`❌ API endpoint error: ${error}`);
        console.error('API error:', error);
      }
      
      // 4. Test email notification by triggering the email test endpoint
      if (adminMode) {
        try {
          const response = await apiClient.test_notification({
            template_type: 'donation',
            recipient_email: 'test@example.com'
          });
          
          const data = await response.json();
          addLog(`✅ Test notification API returned: ${JSON.stringify(data)}`);
        } catch (error) {
          addLog(`❌ Test notification API error: ${error}`);
          console.error('Test notification error:', error);
        }
      }
      
      // Show the stored data
      const allData = FormServiceFallback.exportAllData();
      updateTestStatus('Donation form test complete!', allData.donations);
      
    } catch (error) {
      addLog(`❌ Test failed: ${error}`);
      console.error('Test failed:', error);
      updateTestStatus('Test failed. See console for details.');
    }
  };
  
  // Test content moderation (success stories and feedback)
  const testContentModeration = async () => {
    addLog('🔍 Testing content moderation workflow...');
    updateTestStatus('Testing content moderation workflow...');
    
    try {
      // 1. First, create some content to moderate
      await FormServiceFallback.submitSuccessStory({
        title: 'Moderation Test Story',
        story: 'This is a test story for testing the moderation workflow.',
        program: 'community-support',
        impact: 'High impact on moderation testing.',
        name: 'Moderation Tester',
        email: 'moderation@example.com'
      });
      
      await FormServiceFallback.submitFeedback({
        rating: 5,
        category: 'website',
        comment: 'This is a test feedback for moderation testing.',
        email: 'moderation@example.com'
      });
      
      addLog('✅ Created test content for moderation');
      
      // 2. Test the API moderation endpoints
      try {
        // Submit content through the moderation API
        const submitResponse = await apiClient.submit_content({
          content_type: 'success_story',
          content: {
            title: 'API Moderation Test Story',
            story: 'This is a test story submitted through the API for moderation testing.',
            program: 'education',
            impact: 'High impact on API moderation testing.',
            name: 'API Moderation Tester',
            email: 'api-moderation@example.com'
          }
        });
        
        const submitData = await submitResponse.json();
        addLog(`✅ Content submission API returned: ${JSON.stringify(submitData)}`);
        
        // Get pending submissions
        const pendingResponse = await apiClient.get_pending_submissions();
        const pendingData = await pendingResponse.json();
        addLog(`✅ Found ${pendingData.total_pending || 0} pending submissions`);
        
        if (pendingData.success_stories && pendingData.success_stories.length > 0) {
          // Take moderation action on the first pending success story
          const storyToModerate = pendingData.success_stories[0];
          
          const moderationResponse = await apiClient.take_moderation_action({
            content_type: 'success_story',
            content_id: storyToModerate.id,
            action: 'approve',
            admin_notes: 'Approved during automated testing'
          });
          
          const moderationData = await moderationResponse.json();
          addLog(`✅ Moderation action API returned: ${JSON.stringify(moderationData)}`);
          
          // Now get the approved content to see if it appears correctly
          const storiesResponse = await apiClient.get_success_stories();
          const storiesData = await storiesResponse.json();
          
          const approvedStory = storiesData.find((s: any) => s.id === storyToModerate.id);
          if (approvedStory) {
            addLog('✅ Approved story appears in the success stories list');
          } else {
            addLog('⚠️ Approved story does not appear in the success stories list');
          }
        } else {
          addLog('⚠️ No pending success stories found to moderate');
        }
        
      } catch (error) {
        addLog(`❌ Moderation API error: ${error}`);
        console.error('Moderation API error:', error);
      }
      
      // Test the local moderation functions
      try {
        // Get all stored success stories
        const allData = FormServiceFallback.exportAllData();
        const storiesToModerate = allData.successStories.filter((s: any) => !s.approved);
        
        if (storiesToModerate.length > 0) {
          // Approve the first story
          FormServiceFallback.approveSuccessStory(storiesToModerate[0].id, true);
          addLog(`✅ Approved story with ID: ${storiesToModerate[0].id}`);
          
          // Check if it's now in the approved list
          const approvedStories = FormServiceFallback.getSuccessStories();
          const approvedStory = approvedStories.find((s: any) => s.id === storiesToModerate[0].id);
          
          if (approvedStory) {
            addLog('✅ Story appears in the approved stories list');
          } else {
            addLog('⚠️ Story does not appear in the approved stories list');
          }
        } else {
          addLog('⚠️ No pending stories found in local storage');
        }
        
        // Also test feedback moderation
        const feedbackToModerate = allData.feedback.filter((f: any) => !f.approved);
        
        if (feedbackToModerate.length > 0) {
          // Approve the first feedback
          FormServiceFallback.approveFeedback(feedbackToModerate[0].id, true);
          addLog(`✅ Approved feedback with ID: ${feedbackToModerate[0].id}`);
          
          // Check if it's shown in stats
          const feedbackStats = FormServiceFallback.getFeedbackStats();
          
          if (feedbackStats.total_feedback > 0) {
            addLog('✅ Approved feedback appears in feedback stats');
          } else {
            addLog('⚠️ No approved feedback appears in feedback stats');
          }
        } else {
          addLog('⚠️ No pending feedback found in local storage');
        }
        
      } catch (error) {
        addLog(`❌ Local moderation test failed: ${error}`);
        console.error('Local moderation test failed:', error);
      }
      
      updateTestStatus('Content moderation test complete!');
      
    } catch (error) {
      addLog(`❌ Test failed: ${error}`);
      console.error('Test failed:', error);
      updateTestStatus('Test failed. See console for details.');
    }
  };
  
  // Run all tests in sequence
  const runAllTests = async () => {
    clearResults();
    addLog('🚀 Starting comprehensive end-to-end testing of all forms...');
    
    await testNewsletterForm();
    addLog('-------------------------------------------');
    
    await testContactForm();
    addLog('-------------------------------------------');
    
    await testVolunteerForm();
    addLog('-------------------------------------------');
    
    await testSuccessStoryForm();
    addLog('-------------------------------------------');
    
    await testFeedbackForm();
    addLog('-------------------------------------------');
    
    await testDonationForm();
    addLog('-------------------------------------------');
    
    await testContentModeration();
    
    addLog('🎉 All tests completed!');
    updateTestStatus('All tests completed! See logs for details.');
  };
  
  return (
    <div className="bg-secondary-800/30 p-6 rounded-lg border border-secondary-700 shadow-lg mb-8">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-white">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <span>Form & Notification End-to-End Testing</span>
      </h2>
      
      <div className="mb-6 flex items-center gap-4">
        <label className="flex items-center space-x-2 text-white cursor-pointer">
          <input 
            type="checkbox" 
            checked={adminMode} 
            onChange={(e) => setAdminMode(e.target.checked)}
            className="w-4 h-4 accent-blue-500" 
          />
          <span>Enable Admin Mode (test email notifications)</span>
        </label>
      </div>
      
      <Tabs defaultValue="individual" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="individual">Individual Tests</TabsTrigger>
          <TabsTrigger value="comprehensive">Comprehensive Test</TabsTrigger>
        </TabsList>
        
        <TabsContent value="individual" className="space-y-4">
          <div className="flex flex-wrap gap-3 mb-6">
            <Button onClick={testNewsletterForm} size="small" variant="primary">
              Test Newsletter Form
            </Button>
            <Button onClick={testContactForm} size="small" variant="primary">
              Test Contact Form
            </Button>
            <Button onClick={testVolunteerForm} size="small" variant="primary">
              Test Volunteer Form
            </Button>
            <Button onClick={testSuccessStoryForm} size="small" variant="primary">
              Test Success Story Form
            </Button>
            <Button onClick={testFeedbackForm} size="small" variant="primary">
              Test Feedback Form
            </Button>
            <Button onClick={testDonationForm} size="small" variant="primary">
              Test Donation Form
            </Button>
            <Button onClick={testContentModeration} size="small" variant="primary">
              Test Content Moderation
            </Button>
            <Button onClick={clearResults} size="small" variant="outline">
              Clear Results
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="comprehensive">
          <div className="mb-6">
            <Button onClick={runAllTests} variant="success" className="w-full py-3">
              Run All Tests
            </Button>
            <p className="mt-2 text-gray-400 text-sm">This will run all tests in sequence and provide a comprehensive report.</p>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Test Logs Panel */}
        <Card className="bg-secondary-800/50 border-secondary-700">
          <CardHeader>
            <CardTitle className="text-white">Test Logs</CardTitle>
            <CardDescription>Real-time logs of the testing process</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-black/30 p-4 rounded h-[300px] overflow-y-auto font-mono text-sm text-white">
              {testLogs.length === 0 ? (
                <p className="text-gray-400">No logs yet. Run a test to see logs.</p>
              ) : (
                testLogs.map((log, index) => (
                  <div key={index} className="mb-1">{log}</div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Test Results Panel */}
        <Card className="bg-secondary-800/50 border-secondary-700">
          <CardHeader>
            <CardTitle className="text-white">Test Results</CardTitle>
            <CardDescription>Details of the latest test execution</CardDescription>
          </CardHeader>
          <CardContent>
            {testStatus ? (
              <div>
                <div className="bg-blue-900/30 p-3 rounded border border-blue-800 mb-4">
                  <p className="font-medium text-white">{testStatus}</p>
                </div>
                
                {testResult && (
                  <div className="mt-3">
                    <h3 className="text-sm font-bold mb-2 text-white">Latest Submission:</h3>
                    <div className="bg-secondary-800/50 p-3 rounded text-xs overflow-auto max-h-[200px]">
                      <pre className="text-gray-300">
                        {JSON.stringify(Array.isArray(testResult) && testResult.length > 0 ? 
                          testResult[testResult.length - 1] : 
                          testResult, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-400">No test results yet. Run a test to see results.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
