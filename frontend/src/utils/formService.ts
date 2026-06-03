import { supabase } from './supabaseClient';

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
  approved?: boolean;
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
  submittedAt: Date;
}

export const formService = {
  async submitNewsletter(data: Omit<NewsletterSubscription, 'subscribedAt'>) {
    const { error } = await supabase.from('newsletter_subscribers').insert({
      email: data.email,
      source: data.source,
      status: data.status,
      subscribed_at: new Date().toISOString(),
    });
    if (error) throw error;
  },

  async getNewsletterSubscribers(): Promise<NewsletterSubscription[]> {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .order('subscribed_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((s: any) => ({
      email: s.email,
      source: s.source,
      status: s.status,
      subscribedAt: new Date(s.subscribed_at),
    }));
  },

  async submitContact(data: Omit<ContactSubmission, 'submittedAt' | 'status'>) {
    const { error } = await supabase.from('contact_requests').insert({
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
      submitted_at: new Date().toISOString(),
      status: 'new',
    });
    if (error) throw error;
  },

  async getContactSubmissions(): Promise<ContactSubmission[]> {
    const { data, error } = await supabase
      .from('contact_requests')
      .select('*')
      .order('submitted_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((s: any) => ({
      name: s.name,
      email: s.email,
      subject: s.subject,
      message: s.message,
      submittedAt: new Date(s.submitted_at),
      status: s.status,
    }));
  },

  async submitVolunteer(data: Omit<VolunteerApplication, 'submittedAt' | 'status'>) {
    const { error } = await supabase.from('volunteer_applications').insert({
      name: data.name,
      email: data.email,
      message: data.message,
      interests: data.interests,
      skills: data.skills,
      availability: data.availability,
      submitted_at: new Date().toISOString(),
      status: 'pending',
    });
    if (error) throw error;
  },

  async getVolunteerApplications(): Promise<VolunteerApplication[]> {
    const { data, error } = await supabase
      .from('volunteer_applications')
      .select('*')
      .order('submitted_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((s: any) => ({
      name: s.name,
      email: s.email,
      skills: s.skills || [],
      interests: s.interests || [],
      availability: s.availability,
      message: s.message,
      submittedAt: new Date(s.submitted_at),
      status: s.status,
    }));
  },

  async submitSuccessStory(data: Omit<SuccessStory, 'submittedAt' | 'status'>) {
    const { error } = await supabase.from('success_stories').insert({
      title: data.title,
      story: data.story,
      program: data.program,
      impact: data.impact,
      name: data.name,
      email: data.email,
      image_url: data.imageUrl,
      timestamp: new Date().toISOString(),
      status: 'pending',
    });
    if (error) throw error;
  },

  async submitFeedback(data: Omit<FeedbackSubmission, 'id' | 'submittedAt'>) {
    const { error } = await supabase.from('feedback').insert({
      name: data.name,
      email: data.email,
      rating: data.rating,
      category: data.category,
      comment: data.feedback,
      created_at: new Date().toISOString(),
      status: 'pending',
    });
    if (error) throw error;
  },
};

export default formService;
