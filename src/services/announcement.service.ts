import { api } from './request'

export interface Announcement {
  id: string
  title: string
  content: string
  type: 'info' | 'update' | 'event' | 'maintenance'
  priority: number
  publishedAt: string
  createdAt: string
}

export const announcementService = {
  async getAnnouncements(page = 1, pageSize = 20): Promise<{ list: Announcement[]; total: number }> {
    return api.get('/announcements', { page, limit: pageSize })
  },

  async getAnnouncementDetail(id: string): Promise<Announcement> {
    return api.get<Announcement>(`/announcements/${id}`)
  },
}
