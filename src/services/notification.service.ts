import { api } from './request'
import type { Notification } from '../types'

export const notificationService = {
  async getNotifications(page = 1, pageSize = 20): Promise<{ list: Notification[]; total: number }> {
    return api.get('/notifications', { page, limit: pageSize })
  },

  async getUnreadCount(): Promise<number> {
    return api.get<number>('/notifications/unread-count')
  },

  async markAsRead(notificationId: string): Promise<void> {
    return api.put<void>(`/notifications/${notificationId}/read`)
  },

  async markAllAsRead(): Promise<void> {
    return api.post<void>('/notifications/read-all')
  },

  async deleteNotification(notificationId: string): Promise<void> {
    return api.delete<void>(`/notifications/${notificationId}`)
  },
}
