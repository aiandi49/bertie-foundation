import { db } from '../utils/firebase';
import { collection, addDoc, getDocs, query, where, orderBy, Timestamp, onSnapshot } from 'firebase/firestore';

// Types for all form submissions
export interface NewsletterSubscription {
  email: string;
  source: string;
  status: 'active' | 'unsubscribed';
  subscribedAt: Date;
}

export interface ContactSubmission {
  name: string;
  email: string;
  subject?: string;
  message: string;
  submittedAt: Date;
  status: 'new' | 'read' | 'replied';
}

export interface VolunteerApplication {
  name: string;
  email: string;
  phone?: string;
  skills: string[];
  interests: string[];
  availability: string;
  message?: string;
  submittedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
}

export interface SuccessStory {
  title: string;
  story: string;
  program: string;
  impact: string;
  name: string;
  email: string;
  imageUrl?: string;
  submittedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
}

export interface FeedbackSubmission {
  id: string;
  approved?: boolean; // Require moderator approval
  name: string;
  email: string;
  rating: number;
  category: string;
  feedback: string;
  submittedAt: Date;
}

export interface DonationSubmission {
  name: string;
  email: string;
  amount: number;
  program?: string;
  message?: string;
  submittedAt: Date;
  status: 'pending' | 'processed' | 'failed';
}

// Collection names
const COLLECTIONS = {
  NEWSLETTER: 'newsletter_subscriptions',
  CONTACT: 'contact_submissions',
  VOLUNTEER: 'volunteer_applications',
  SUCCESS_STORIES: 'success_stories',
  FEEDBACK: 'feedback_submissions',
  DONATIONS: 'donation_submissions'
};

/**
 * Collection names exported for use in Firebase Cloud Functions
 * See firebaseFunctions.js for template implementation
 */
export { COLLECTIONS };


/**
 * Form Service - handles all form submissions to Firestore
 */
export class FormService {
  /**
   * Helper method to handle Firestore errors consistently
   */
  private static handleFirestoreError(operation: string, error: any): Error {
    console.error(`Error during ${operation}:`, error);
    
    // Network connectivity issues
    if (error.code === 'unavailable' || error.code === 'failed-precondition') {
      return new Error('Unable to connect to the database. Please check your internet connection and try again.');
    }
    
    // Permission denied issues
    if (error.code === 'permission-denied') {
      return new Error('You don\'t have permission to perform this action. Please contact the administrator.');
    }
    
    // Generic error with code details if available
    return new Error(`${error.message || 'An unknown error occurred'} ${error.code ? `(Code: ${error.code})` : ''}`);
  }
  /**
   * Subscribe to newsletter
   */
  static async subscribeToNewsletter(email: string, source: string = 'website'): Promise<void> {
    try {
      // Check network connectivity first
      if (!window.navigator.onLine) {
        throw new Error('You appear to be offline. Please check your internet connection and try again.');
      }

      console.log(`Attempting to subscribe email: ${email} from source: ${source}`);
      
      // Check if email already exists
      const q = query(
        collection(db, COLLECTIONS.NEWSLETTER),
        where('email', '==', email.toLowerCase())
      );
      
      try {
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          throw new Error('This email is already subscribed to our newsletter.');
        }
        
        // Add new subscription
        await addDoc(collection(db, COLLECTIONS.NEWSLETTER), {
          email: email.toLowerCase(),
          subscribedAt: Timestamp.now(),
          status: 'active',
          source
        });
        
        // Later: trigger cloud function for welcome email
        console.log(`Successfully subscribed: ${email}`);
      } catch (firestoreError) {
        throw FormService.handleFirestoreError('newsletter subscription', firestoreError);
      }
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      throw error;
    }
  }
  
  /**
   * Submit contact form
   */
  static async submitContactForm(data: Omit<ContactSubmission, 'submittedAt' | 'status'>): Promise<void> {
    try {
      // Check network connectivity first
      if (!window.navigator.onLine) {
        throw new Error('You appear to be offline. Please check your internet connection and try again.');
      }

      console.log('Submitting contact form...');
      
      try {
        await addDoc(collection(db, COLLECTIONS.CONTACT), {
          ...data,
          submittedAt: Timestamp.now(),
          status: 'new'
        });
        
        // Later: trigger cloud function for notification email
        console.log('Contact form submitted successfully');
      } catch (firestoreError) {
        throw FormService.handleFirestoreError('contact form submission', firestoreError);
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      throw error;
    }
  }
  
  /**
   * Submit volunteer application
   */
  static async submitVolunteerApplication(data: Omit<VolunteerApplication, 'submittedAt' | 'status'>): Promise<void> {
    try {
      // Check network connectivity first
      if (!window.navigator.onLine) {
        throw new Error('You appear to be offline. Please check your internet connection and try again.');
      }

      console.log('Submitting volunteer application...');
      
      try {
        await addDoc(collection(db, COLLECTIONS.VOLUNTEER), {
          ...data,
          submittedAt: Timestamp.now(),
          status: 'pending'
        });
        
        // Later: trigger cloud function for notification email
        console.log('Volunteer application submitted successfully');
      } catch (firestoreError) {
        throw FormService.handleFirestoreError('volunteer application submission', firestoreError);
      }
    } catch (error) {
      console.error('Error submitting volunteer application:', error);
      throw error;
    }
  }
  
  /**
   * Submit success story
   */
  static async submitSuccessStory(data: Omit<SuccessStory, 'submittedAt' | 'status'>): Promise<void> {
    try {
      // Check network connectivity first
      if (!window.navigator.onLine) {
        throw new Error('You appear to be offline. Please check your internet connection and try again.');
      }

      console.log('Submitting success story...');
      
      try {
        await addDoc(collection(db, COLLECTIONS.SUCCESS_STORIES), {
          ...data,
          submittedAt: Timestamp.now(),
          status: 'pending'
        });
        
        // Later: trigger cloud function for notification email
        console.log('Success story submitted successfully');
      } catch (firestoreError) {
        throw FormService.handleFirestoreError('success story submission', firestoreError);
      }
    } catch (error) {
      console.error('Error submitting success story:', error);
      throw error;
    }
  }
  
  /**
   * Submit feedback
   */
  static async submitFeedback(data: Omit<FeedbackSubmission, 'submittedAt'>): Promise<void> {
    try {
      // Check network connectivity first
      if (!window.navigator.onLine) {
        throw new Error('You appear to be offline. Please check your internet connection and try again.');
      }

      console.log('Submitting feedback...');
      
      try {
        await addDoc(collection(db, COLLECTIONS.FEEDBACK), {
          ...data,
          submittedAt: Timestamp.now()
        });
        
        // Later: trigger cloud function for notification email
        console.log('Feedback submitted successfully');
      } catch (firestoreError) {
        throw FormService.handleFirestoreError('feedback submission', firestoreError);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  }
  
  /**
   * Submit donation
   * 
   * This will be enhanced with Firebase Cloud Functions in the future to:
   * 1. Send a thank you email to the donor
   * 2. Send a notification to the admin about the new donation
   * 3. Track donation statistics for reporting
   */
  static async submitDonation(data: Omit<DonationSubmission, 'submittedAt' | 'status'>): Promise<void> {
    try {
      // Check network connectivity first
      if (!window.navigator.onLine) {
        throw new Error('You appear to be offline. Please check your internet connection and try again.');
      }

      console.log('Submitting donation...');
      
      try {
        await addDoc(collection(db, COLLECTIONS.DONATIONS), {
          ...data,
          submittedAt: Timestamp.now(),
          status: 'pending'
        });
        
        // Later: trigger cloud function for payment processing and notification email
        console.log('Donation submitted successfully');
      } catch (firestoreError) {
        throw FormService.handleFirestoreError('donation submission', firestoreError);
      }
    } catch (error) {
      console.error('Error submitting donation:', error);
      throw error;
    }
  }
  
  /**
   * Get newsletter subscribers
   */
  static async getNewsletterSubscribers(): Promise<NewsletterSubscription[]> {
    try {
      // Check network connectivity first
      if (!window.navigator.onLine) {
        throw new Error('You appear to be offline. Please check your internet connection and try again.');
      }

      console.log('Getting newsletter subscribers...');
      
      try {
        const q = query(
          collection(db, COLLECTIONS.NEWSLETTER),
          where('status', '==', 'active'),
          orderBy('subscribedAt', 'desc')
        );
        
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            subscribedAt: data.subscribedAt.toDate()
          } as NewsletterSubscription;
        });
      } catch (firestoreError) {
        throw FormService.handleFirestoreError('retrieving newsletter subscribers', firestoreError);
      }
    } catch (error) {
      console.error('Error getting newsletter subscribers:', error);
      throw error;
    }
  }
  
  /**
   * Listen to form submissions in real-time
   * @returns Unsubscribe function
   */
  static subscribeToFormSubmissions(
    formType: keyof typeof COLLECTIONS,
    callback: (submissions: any[]) => void
  ) {
    // Check network connectivity first
    if (!window.navigator.onLine) {
      console.warn('User appears to be offline. Real-time updates will resume when back online.');
      // Return a dummy unsubscribe function
      return () => {};
    }

    console.log(`Subscribing to ${formType} submissions...`);
    
    const collectionName = COLLECTIONS[formType];
    const q = query(collection(db, collectionName), orderBy('submittedAt', 'desc'));
    
    try {
      return onSnapshot(q, 
        // On successful snapshot
        (snapshot) => {
          const submissions = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              ...data,
              id: doc.id,
              submittedAt: data.submittedAt.toDate()
            };
          });
          
          callback(submissions);
        },
        // On error
        (error) => {
          console.error(`Error in ${formType} subscription:`, error);
          if (error.code === 'unavailable') {
            console.warn('Network connection issue. Will retry when connection is restored.');
          }
        }
      );
    } catch (error) {
      console.error(`Error setting up ${formType} subscription:`, error);
      // Return a dummy unsubscribe function
      return () => {};
    }
  }
}
