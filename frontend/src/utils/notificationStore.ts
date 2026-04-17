import { create } from 'zustand';
import { apiClient } from 'app';

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
      const response = await apiClient.get_notifications();
      const data = await response.json();
      set({ notifications: data });
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      set({ loading: false });
    }
  },
  addNotification: async (notification) => {
    try {
      const response = await apiClient.create_notification(
        notification
      );
      const newNotification = await response.json();
      set((state) => ({
        notifications: [...state.notifications, newNotification]
      }));
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  },
}));
