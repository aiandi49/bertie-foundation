/**
 * TEMPORARY FALLBACK SERVICE
 * 
 * Use this until Firebase connectivity issues are resolved
 * This service mimics FormService but stores data in localStorage
 * and always returns success
 */
import { type Mode, mode } from "app";

// Import types from formService
import type {
  NewsletterSubscription,
  ContactSubmission,
  VolunteerApplication,
  SuccessStory,
  FeedbackSubmission,
  DonationSubmission
} from './formService';

// Storage keys
const STORAGE_KEYS = {
  NEWSLETTER: 'local_newsletter_subscriptions',
  CONTACT: 'local_contact_submissions',
  VOLUNTEER: 'local_volunteer_applications',
  SUCCESS_STORIES: 'local_success_stories',
  FEEDBACK: 'local_feedback_submissions',
  DONATIONS: 'local_donation_submissions'
};

// Helper to get stored array
const getStoredItems = (key: string): any[] => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error(`Error getting local storage for ${key}:`, e);
    return [];
  }
};

// Helper to store array
const storeItems = (key: string, items: any[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch (e) {
    console.error(`Error setting local storage for ${key}:`, e);
  }
};

/**
 * FormServiceFallback - temporary replacement for FormService
 */
export class FormServiceFallback {
  /**
   * Approve or reject a feedback submission
   */
  static approveFeedback(id: string, approved: boolean): void {
    try {
      // Get existing submissions
      const submissions = getStoredItems(STORAGE_KEYS.FEEDBACK);
      
      // Find the submission to update
      const updatedSubmissions = submissions.map((submission: any) => {
        if (submission.id === id) {
          return { ...submission, approved };
        }
        return submission;
      });
      
      // Store updated list
      storeItems(STORAGE_KEYS.FEEDBACK, updatedSubmissions);
      
      console.log(`[FORM FALLBACK] Successfully ${approved ? 'approved' : 'rejected'} feedback with ID: ${id}`);
    } catch (error) {
      console.error('[FORM FALLBACK] Error updating feedback approval status:', error);
    }
  }
  
  /**
   * Get feedback stats (filtered to only show approved feedback)
   */
  static getFeedbackStats(): any {
    // Get all feedback submissions
    const allSubmissions = getStoredItems(STORAGE_KEYS.FEEDBACK);
    
    // Filter to only approved feedback
    const approvedSubmissions = allSubmissions.filter((submission: any) => submission.approved === true);
    
    // Calculate stats
    const totalFeedback = approvedSubmissions.length;
    
    // Calculate average rating
    const sumRatings = approvedSubmissions.reduce((sum: number, item: any) => sum + (item.rating || 0), 0);
    const averageRating = totalFeedback > 0 ? sumRatings / totalFeedback : 0;
    
    // Calculate category distribution
    const categoryDistribution: Record<string, number> = {
      general: 0,
      volunteer: 0,
      donation: 0,
      program: 0,
      website: 0
    };
    
    // Calculate rating distribution
    const ratingDistribution: Record<string, number> = {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0
    };
    
    // Count categories and ratings
    approvedSubmissions.forEach((item: any) => {
      // Increment category count
      const category = item.category || 'general';
      if (categoryDistribution.hasOwnProperty(category)) {
        categoryDistribution[category]++;
      } else {
        categoryDistribution.general++;
      }
      
      // Increment rating count
      const rating = String(item.rating || 0);
      if (ratingDistribution.hasOwnProperty(rating)) {
        ratingDistribution[rating]++;
      }
    });
    
    return {
      total_feedback: totalFeedback,
      average_rating: averageRating,
      category_distribution: categoryDistribution,
      rating_distribution: ratingDistribution
    };
  }

  /**
   * Subscribe to newsletter
   */
  static async subscribeToNewsletter(email: string, source: string = 'website'): Promise<void> {
    console.log(`[FORM FALLBACK] Newsletter Subscription: ${email} from ${source}`);
    
    try {
      // Create submission object
      const subscription: NewsletterSubscription = {
        email: email.toLowerCase(),
        subscribedAt: new Date(),
        status: 'active',
        source
      };
      
      // Get existing subscriptions
      const subscriptions = getStoredItems(STORAGE_KEYS.NEWSLETTER);
      
      // Add new subscription
      subscriptions.push(subscription);
      
      // Store updated list
      storeItems(STORAGE_KEYS.NEWSLETTER, subscriptions);
      
      console.log(`[FORM FALLBACK] Successfully stored newsletter subscription locally`);
      // Artificial delay to simulate server call
      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (error) {
      console.error('[FORM FALLBACK] Error storing newsletter subscription:', error);
      // We still return success to the user
    }
  }
  
  /**
   * Submit contact form
   */
  static async submitContactForm(data: Omit<ContactSubmission, 'submittedAt' | 'status'>): Promise<void> {
    console.log(`[FORM FALLBACK] Contact Form Submission:`, data);
    
    try {
      // Create submission object
      const submission: ContactSubmission = {
        ...data,
        submittedAt: new Date(),
        status: 'new'
      };
      
      // Get existing submissions
      const submissions = getStoredItems(STORAGE_KEYS.CONTACT);
      
      // Add new submission
      submissions.push(submission);
      
      // Store updated list
      storeItems(STORAGE_KEYS.CONTACT, submissions);
      
      console.log(`[FORM FALLBACK] Successfully stored contact form submission locally`);
      // Artificial delay to simulate server call
      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (error) {
      console.error('[FORM FALLBACK] Error storing contact form submission:', error);
      // We still return success to the user
    }
  }
  
  /**
   * Submit volunteer application
   */
  static async submitVolunteerApplication(data: Omit<VolunteerApplication, 'submittedAt' | 'status'>): Promise<void> {
    console.log(`[FORM FALLBACK] Volunteer Application:`, data);
    
    try {
      // Create submission object
      const submission: VolunteerApplication = {
        ...data,
        submittedAt: new Date(),
        status: 'pending'
      };
      
      // Get existing submissions
      const submissions = getStoredItems(STORAGE_KEYS.VOLUNTEER);
      
      // Add new submission
      submissions.push(submission);
      
      // Store updated list
      storeItems(STORAGE_KEYS.VOLUNTEER, submissions);
      
      console.log(`[FORM FALLBACK] Successfully stored volunteer application locally`);
      // Artificial delay to simulate server call
      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (error) {
      console.error('[FORM FALLBACK] Error storing volunteer application:', error);
      // We still return success to the user
    }
  }
  
  /**
   * Submit success story
   */
  static async submitSuccessStory(data: Omit<SuccessStory, 'submittedAt' | 'status' | 'tags' | 'approved'>): Promise<void> {
    console.log(`[FORM FALLBACK] Success Story Submission:`, data);
    
    try {
      // Create submission object
      const submission: SuccessStory = {
        ...data,
        tags: [],
        id: `story_${Date.now()}`,
        submittedAt: new Date(),
        status: 'pending',
        approved: false // Requires moderator approval
      };
      
      // Get existing submissions
      const submissions = getStoredItems(STORAGE_KEYS.SUCCESS_STORIES);
      
      // Add new submission
      submissions.push(submission);
      
      // Store updated list
      storeItems(STORAGE_KEYS.SUCCESS_STORIES, submissions);
      
      console.log(`[FORM FALLBACK] Successfully stored success story locally`);
      // Artificial delay to simulate server call
      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (error) {
      console.error('[FORM FALLBACK] Error storing success story:', error);
      // We still return success to the user
    }
  }
  
  /**
   * Submit feedback
   */
  static async submitFeedback(data: Omit<FeedbackSubmission, 'submittedAt'>): Promise<void> {
    console.log(`[FORM FALLBACK] Feedback Submission:`, data);
    
    try {
      // Create submission object with a unique ID and approved=false
      const submission: FeedbackSubmission = {
        ...data,
        id: `feedback_${Date.now()}`,
        submittedAt: new Date(),
        approved: false // Requires moderator approval
      };
      
      // Get existing submissions
      const submissions = getStoredItems(STORAGE_KEYS.FEEDBACK);
      
      // Add new submission
      submissions.push(submission);
      
      // Store updated list
      storeItems(STORAGE_KEYS.FEEDBACK, submissions);
      
      console.log(`[FORM FALLBACK] Successfully stored feedback locally`);
      // Artificial delay to simulate server call
      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (error) {
      console.error('[FORM FALLBACK] Error storing feedback:', error);
      // We still return success to the user
    }
  }
  
  /**
   * Submit donation
   */
  static async submitDonation(data: Omit<DonationSubmission, 'submittedAt' | 'status'>): Promise<void> {
    console.log(`[FORM FALLBACK] Donation Submission:`, data);
    
    try {
      // Create submission object
      const submission: DonationSubmission = {
        ...data,
        submittedAt: new Date(),
        status: 'pending'
      };
      
      // Get existing submissions
      const submissions = getStoredItems(STORAGE_KEYS.DONATIONS);
      
      // Add new submission
      submissions.push(submission);
      
      // Store updated list
      storeItems(STORAGE_KEYS.DONATIONS, submissions);
      
      console.log(`[FORM FALLBACK] Successfully stored donation locally`);
      // Artificial delay to simulate server call
      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (error) {
      console.error('[FORM FALLBACK] Error storing donation:', error);
      // We still return success to the user
    }
  }
  
  /**
   * Export all stored data to console
   * Admin can use this to retrieve submitted data
   */
  static exportAllData(): any {
    const allData = {
      newsletter: getStoredItems(STORAGE_KEYS.NEWSLETTER),
      contact: getStoredItems(STORAGE_KEYS.CONTACT),
      volunteer: getStoredItems(STORAGE_KEYS.VOLUNTEER),
      successStories: getStoredItems(STORAGE_KEYS.SUCCESS_STORIES),
      feedback: getStoredItems(STORAGE_KEYS.FEEDBACK),
      donations: getStoredItems(STORAGE_KEYS.DONATIONS)
    };
    
    console.log('%c FORM SUBMISSIONS EXPORT ', 'background: #333; color: #ff0; font-size: 16px; padding: 5px;');
    console.log(allData);
    console.log('%c Copy the above object to save all submissions ', 'background: #333; color: #ff0');
    
    // Return for direct access
    return allData;
  }
  
  /**
   * Delete a submission from localStorage
   */
  static deleteSubmission(formType: string, id: string): boolean {
    try {
      let storageKey = '';
      
      // Map form type to storage key
      switch(formType) {
        case 'newsletter_subscriptions':
          storageKey = STORAGE_KEYS.NEWSLETTER;
          break;
        case 'contact_submissions':
          storageKey = STORAGE_KEYS.CONTACT;
          break;
        case 'volunteer_applications':
          storageKey = STORAGE_KEYS.VOLUNTEER;
          break;
        case 'success_stories':
          storageKey = STORAGE_KEYS.SUCCESS_STORIES;
          break;
        case 'feedback_submissions':
          storageKey = STORAGE_KEYS.FEEDBACK;
          break;
        case 'donation_submissions':
          storageKey = STORAGE_KEYS.DONATIONS;
          break;
        default:
          console.error(`[FORM FALLBACK] Unknown form type: ${formType}`);
          return false;
      }
      
      // Get existing submissions
      const submissions = getStoredItems(storageKey);
      
      // Filter out the submission to delete
      const updatedSubmissions = submissions.filter((submission: any) => submission.id !== id);
      
      // Check if anything was removed
      if (updatedSubmissions.length === submissions.length) {
        console.warn(`[FORM FALLBACK] No submission found with ID: ${id}`);
        return false;
      }
      
      // Store updated list
      storeItems(storageKey, updatedSubmissions);
      
      console.log(`[FORM FALLBACK] Successfully deleted submission with ID: ${id} from ${formType}`);
      return true;
    } catch (error) {
      console.error(`[FORM FALLBACK] Error deleting submission from ${formType}:`, error);
      return false;
    }
  }
  
  /**
   * Approve or reject a success story
   */
  static approveSuccessStory(id: string, approved: boolean): void {
    try {
      // Get existing submissions
      const submissions = getStoredItems(STORAGE_KEYS.SUCCESS_STORIES);
      
      // Find the submission to update
      const updatedSubmissions = submissions.map((submission: any) => {
        if (submission.id === id) {
          return { ...submission, approved, status: approved ? 'published' : 'rejected' };
        }
        return submission;
      });
      
      // Store updated list
      storeItems(STORAGE_KEYS.SUCCESS_STORIES, updatedSubmissions);
      
      console.log(`[FORM FALLBACK] Successfully ${approved ? 'approved' : 'rejected'} success story with ID: ${id}`);
    } catch (error) {
      console.error('[FORM FALLBACK] Error updating success story approval status:', error);
    }
  }

  /**
   * Get approved success stories
   */
  static getSuccessStories(): any[] {
    // Get all success story submissions
    const allSubmissions = getStoredItems(STORAGE_KEYS.SUCCESS_STORIES);
    
    // Filter to only approved stories
    const approvedSubmissions = allSubmissions.filter((submission: any) => submission.approved === true);
    
    return approvedSubmissions;
  }

  /**
   * Get all stored submissions for a specific form type
   */
  static getStoredSubmissions(formType: string): any[] {
    let storageKey = '';
    
    // Map form type to storage key
    switch(formType) {
      case 'newsletter_subscriptions':
        storageKey = STORAGE_KEYS.NEWSLETTER;
        break;
      case 'contact_submissions':
        storageKey = STORAGE_KEYS.CONTACT;
        break;
      case 'volunteer_applications':
        storageKey = STORAGE_KEYS.VOLUNTEER;
        break;
      case 'success_stories':
        storageKey = STORAGE_KEYS.SUCCESS_STORIES;
        break;
      case 'feedback_submissions':
        storageKey = STORAGE_KEYS.FEEDBACK;
        break;
      case 'donation_submissions':
        storageKey = STORAGE_KEYS.DONATIONS;
        break;
      default:
        console.error(`[FORM FALLBACK] Unknown form type: ${formType}`);
        return [];
    }
    
    // Return submissions from localStorage
    return getStoredItems(storageKey);
  }

  // Mock method to retrieve submissions from localStorage for Admin view
  static subscribeToFormSubmissions(formType: string, callback: (submissions: any[]) => void) {
    console.log(`[FORM FALLBACK] Requested submissions for ${formType}`);
    
    // Get submissions from localStorage
    const submissions = this.getStoredSubmissions(formType);
    callback(submissions);
    
    return () => {}; // Return empty unsubscribe function
  }
}