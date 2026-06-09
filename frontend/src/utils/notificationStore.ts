import { create } from 'zustand';
import { supabase } from './supabaseClient';

type Notification = {
  id: string;
  title: string;
  description: string;
  type: 'volunteer' | 'event';
  date: string;
  created_at: string;
};

type CreateNotificationRequest = {
  title: string;
  description: string;
  type: 'volunteer' | 'event';
  date: string;
};

type NotificationStore = {
  notifications: Notification[];
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  addNotification: (notification: CreateNotificationRequest) => Promise<void>;
};

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  loading: false,
  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (!error && data) {
        set({ notifications: data as Notification[] });
      }
    } catch (error) {
      // Silently fail — notifications are non-critical
    } finally {
      set({ loading: false });
    }
  },
  addNotification: async (notification) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({ ...notification })
        .select()
        .single();
      if (!error && data) {
        set((state) => ({
          notifications: [data as Notification, ...state.notifications],
        }));
      }
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  },
}));
