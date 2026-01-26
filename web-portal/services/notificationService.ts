import api from './api';

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  is_read: boolean;
  created_at: string;
}

export const notificationService = {
  getMyNotifications: async (skip: number = 0, limit: number = 100) => {
    return api.get<Notification[]>(`/notifications/?skip=${skip}&limit=${limit}`);
  },

  getUnreadCount: async () => {
    return api.get<number>('/notifications/unread-count');
  },

  markAllRead: async () => {
    return api.post('/notifications/mark-read', {});
  }
};
