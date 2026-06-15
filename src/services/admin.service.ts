import { api } from './request'

interface PlatformStats {
  users: {
    total: number
    newToday: number
    activeToday: number
  }
  trips: {
    total: number
    published: number
    completed: number
  }
  participants: {
    total: number
    avgPerTrip: number
  }
  comments: {
    total: number
    today: number
  }
  shares: {
    total: number
    today: number
  }
}

interface SensitiveWord {
  id: string
  word: string
  createdAt: string
}

export const adminService = {
  async getStats(): Promise<PlatformStats> {
    return api.get<PlatformStats>('/admin/stats')
  },

  async getSensitiveWords(): Promise<SensitiveWord[]> {
    return api.get<SensitiveWord[]>('/admin/sensitive-words')
  },

  async addSensitiveWord(word: string): Promise<SensitiveWord> {
    return api.post<SensitiveWord>('/admin/sensitive-words', { word })
  },

  async removeSensitiveWord(wordId: string): Promise<void> {
    return api.delete<void>(`/admin/sensitive-words/${wordId}`)
  },

  async getUsers(page = 1, pageSize = 20): Promise<{ list: Array<{ id: string; nickname: string; status: string; createdAt: string }>; total: number }> {
    return api.get('/admin/users', { page, pageSize })
  },

  async updateUserStatus(userId: string, status: 'active' | 'disabled'): Promise<void> {
    return api.put<void>(`/admin/users/${userId}/status`, { status })
  },

  async getAnnouncements(): Promise<Array<{ id: string; title: string; content: string; createdAt: string }>> {
    return api.get('/admin/announcements')
  },

  async createAnnouncement(title: string, content: string): Promise<{ id: string }> {
    return api.post<{ id: string }>('/admin/announcements', { title, content })
  },
}
