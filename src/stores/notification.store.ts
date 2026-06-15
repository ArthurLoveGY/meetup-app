import { create } from 'zustand'
import { notificationService } from '../services'
import type { Notification } from '../types'

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  hasMore: boolean
  page: number
  error: string | null

  fetchNotifications: (refresh?: boolean) => Promise<void>
  fetchUnreadCount: () => Promise<void>
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (notificationId: string) => Promise<void>
  loadMore: () => Promise<void>
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  hasMore: true,
  page: 1,
  error: null,

  fetchNotifications: async (refresh = false) => {
    const { page } = get()
    set({ isLoading: true, error: null })
    try {
      const response = await notificationService.getNotifications(refresh ? 1 : page, 20)
      set({
        notifications: refresh ? response.list : [...get().notifications, ...response.list],
        isLoading: false,
        hasMore: response.list.length === 20,
        page: (refresh ? 1 : page) + 1,
      })
      get().fetchUnreadCount()
    } catch {
      set({ isLoading: false, error: '获取通知失败' })
    }
  },

  fetchUnreadCount: async () => {
    try {
      const count = await notificationService.getUnreadCount()
      set({ unreadCount: count })
    } catch {
      // Ignore errors
    }
  },

  markAsRead: async (notificationId: string) => {
    await notificationService.markAsRead(notificationId)
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }))
  },

  markAllAsRead: async () => {
    await notificationService.markAllAsRead()
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }))
  },

  deleteNotification: async (notificationId: string) => {
    await notificationService.deleteNotification(notificationId)
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== notificationId),
    }))
  },

  loadMore: async () => {
    if (get().isLoading || !get().hasMore) return
    await get().fetchNotifications(false)
  },
}))
