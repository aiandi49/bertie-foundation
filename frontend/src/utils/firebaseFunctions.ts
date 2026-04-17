// Firebase Cloud Functions Template
// To use this:
// 1. Create a firebase/functions directory in your project
// 2. Initialize Firebase Functions with firebase init functions
// 3. Copy this code to your index.js file in the functions directory
// 4. Deploy with firebase deploy --only functions

/**
 * This file contains Firebase Cloud Functions that handle email notifications
 * when new form submissions arrive in the Firestore database.
 */

/*
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer'); // Install with npm install nodemailer

admin.initializeApp();

// Configure nodemailer with SMTP settings
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your preferred email service
  auth: {
    user: 'info@bertiefoundation.org', // Official foundation email
    pass: 'your-app-password', // Replace with your app password
  },
});

// Email templates for different form types
const emailTemplates = {
  newsletter: (data) => ({
    subject: 'New Newsletter Subscription',
    html: `
      <h1>New Newsletter Subscription</h1>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Subscribed At:</strong> ${new Date(data.subscribedAt.toDate()).toLocaleString()}</p>
      <p><strong>Source:</strong> ${data.source || 'Website'}</p>
    `,
  }),
  contact: (data) => ({
    subject: `New Contact Form Submission: ${data.subject}`,
    html: `
      <h1>New Contact Form Submission</h1>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Subject:</strong> ${data.subject}</p>
      <p><strong>Message:</strong></p>
      <p>${data.message.replace(/\n/g, '<br>')}</p>
    `,
  }),
  volunteer: (data) => ({
    subject: 'New Volunteer Application',
    html: `
      <h1>New Volunteer Application</h1>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Interests:</strong> ${Array.isArray(data.interests) ? data.interests.join(', ') : data.interests}</p>
      <p><strong>Message:</strong></p>
      <p>${data.message ? data.message.replace(/\n/g, '<br>') : 'No message provided'}</p>
    `,
  }),
  success_stories: (data) => ({
    subject: `New Success Story: ${data.title}`,
    html: `
      <h1>New Success Story Submission</h1>
      <p><strong>Title:</strong> ${data.title}</p>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Program:</strong> ${data.program}</p>
      <p><strong>Impact:</strong> ${data.impact}</p>
      <p><strong>Story:</strong></p>
      <p>${data.story.replace(/\n/g, '<br>')}</p>
    `,
  }),
  feedback: (data) => ({
    subject: `New Feedback: ${data.category}`,
    html: `
      <h1>New Feedback Submission</h1>
      <p><strong>Name:</strong> ${data.name || 'Anonymous'}</p>
      <p><strong>Email:</strong> ${data.email || 'Not provided'}</p>
      <p><strong>Rating:</strong> ${data.rating}/5</p>
      <p><strong>Category:</strong> ${data.category}</p>
      <p><strong>Feedback:</strong></p>
      <p>${(data.feedback || data.comment || '').replace(/\n/g, '<br>')}</p>
    `,
  }),
  donation: (data) => ({
    subject: `New Donation: $${data.amount}`,
    html: `
      <h1>New Donation</h1>
      <p><strong>Amount:</strong> $${data.amount}</p>
      <p><strong>Name:</strong> ${data.name || 'Anonymous'}</p>
      <p><strong>Email:</strong> ${data.email || 'Not provided'}</p>
      <p><strong>Message:</strong></p>
      <p>${data.message ? data.message.replace(/\n/g, '<br>') : 'No message provided'}</p>
    `,
  }),
};

// Generic function to send notification emails for any form submission
const sendFormNotificationEmail = async (snapshot, context, collectionName) => {
  const data = snapshot.data();
  const id = snapshot.id;
  
  // Skip if this is not a new document or has already been processed
  if (data.notificationSent) {
    return null;
  }
  
  // Get form type from the collection name
  // Convert collection name to template key (e.g., newsletter_subscriptions -> newsletter)
  const formType = collectionName.replace(/_submissions|_applications|_subscriptions|_stories/g, '');
  
  // Skip if we don't have a template for this form type
  if (!emailTemplates[formType]) {
    console.error(`No email template found for form type: ${formType}`);
    return null;
  }
  
  try {
    // Get template for this form type
    const template = emailTemplates[formType](data);
    
    // Send email to admin
    const mailOptions = {
      from: 'Bertie Foundation <info@bertiefoundation.org>',
      to: 'info@bertiefoundation.org', // Admin email
      subject: template.subject,
      html: template.html,
    };
    
    await transporter.sendMail(mailOptions);
    
    // Mark notification as sent
    await admin.firestore()
      .collection(collectionName)
      .doc(id)
      .update({ notificationSent: true });
    
    console.log(`Notification email sent for ${formType} submission with ID: ${id}`);
    return null;
  } catch (error) {
    console.error(`Error sending notification email for ${formType} submission:`, error);
    return null;
  }
};

// Create a function for each form type
exports.onNewNewsletterSubscription = functions.firestore
  .document('newsletter_subscriptions/{subscriptionId}')
  .onCreate((snapshot, context) => {
    return sendFormNotificationEmail(snapshot, context, 'newsletter_subscriptions');
  });

exports.onNewContactSubmission = functions.firestore
  .document('contact_submissions/{submissionId}')
  .onCreate((snapshot, context) => {
    return sendFormNotificationEmail(snapshot, context, 'contact_submissions');
  });

exports.onNewVolunteerApplication = functions.firestore
  .document('volunteer_applications/{applicationId}')
  .onCreate((snapshot, context) => {
    return sendFormNotificationEmail(snapshot, context, 'volunteer_applications');
  });

exports.onNewSuccessStory = functions.firestore
  .document('success_stories/{storyId}')
  .onCreate((snapshot, context) => {
    return sendFormNotificationEmail(snapshot, context, 'success_stories');
  });

exports.onNewFeedbackSubmission = functions.firestore
  .document('feedback_submissions/{submissionId}')
  .onCreate((snapshot, context) => {
    return sendFormNotificationEmail(snapshot, context, 'feedback_submissions');
  });

exports.onNewDonation = functions.firestore
  .document('donation_submissions/{donationId}')
  .onCreate((snapshot, context) => {
    return sendFormNotificationEmail(snapshot, context, 'donation_submissions');
  });

// Welcome email for newsletter subscribers
exports.sendWelcomeEmail = functions.firestore
  .document('newsletter_subscriptions/{subscriptionId}')
  .onCreate(async (snapshot, context) => {
    const data = snapshot.data();
    
    // Skip if invalid email or already welcomed
    if (!data.email || data.welcomeEmailSent) {
      return null;
    }
    
    try {
      // Send welcome email to subscriber
      const mailOptions = {
        from: 'Bertie Foundation <info@bertiefoundation.org>',
        to: data.email,
        subject: 'Welcome to the Bertie Foundation Newsletter!',
        html: `
          <h1>Welcome to Our Community!</h1>
          <p>Thank you for subscribing to the Bertie Foundation newsletter.</p>
          <p>You'll now receive updates about our programs, events, and success stories.</p>
          <p>If you have any questions, feel free to contact us at <a href="mailto:info@bertiefoundation.org">info@bertiefoundation.org</a>.</p>
          <p>Best regards,<br>The Bertie Foundation Team</p>
        `,
      };
      
      await transporter.sendMail(mailOptions);
      
      // Mark welcome email as sent
      await admin.firestore()
        .collection('newsletter_subscriptions')
        .doc(snapshot.id)
        .update({ welcomeEmailSent: true });
      
      console.log(`Welcome email sent to ${data.email}`);
      return null;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return null;
    }
  });
*/

// This is a template file only - uncomment and modify when deploying Firebase Functions
console.log('Firebase Functions template file - not for production use');
