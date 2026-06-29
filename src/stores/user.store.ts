import { create } from 'zustand'
import { authService } from '../services'
import { resolveImageUrl } from '../services/config'
import type { UserProfile } from '../types'

interface UserState {
  profiles: Record<string, UserProfile>
  isLoading: boolean
  error: string | null

  fetchUserProfile: (userId: string) => Promise<UserProfile>
  getCachedProfile: (userId: string) => UserProfile | null
  clearCache: () => void
}

export const useUserStore = create<UserState>((set, get) => ({
  profiles: {},
  isLoading: false,
  error: null,

  fetchUserProfile: async (userId: string) => {
    const cached = get().profiles[userId]
    if (cached) return cached

    set({ isLoading: true, error: null })
    try {
      const profile = await authService.getUserProfile(userId) as UserProfile
      profile.avatarUrl = resolveImageUrl(profile.avatarUrl)
      set((state) => ({
        profiles: { ...state.profiles, [userId]: profile },
        isLoading: false,
      }))
      return profile
    } catch (error) {
      set({ isLoading: false, error: '获取用户信息失败' })
      throw error
    }
  },

  getCachedProfile: (userId: string) => {
    return get().profiles[userId] || null
  },

  clearCache: () => {
    set({ profiles: {} })
  },
}))
