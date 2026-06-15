import { create } from 'zustand'
import Taro from '@tarojs/taro'
import { setToken, clearToken } from '../services/request'
import { authService } from '../services'
import { platformService } from '../platform'
import type { User } from '../types'

interface AuthState {
  token: string | null
  user: User | null
  isLoggedIn: boolean
  isLoading: boolean

  login: (phone?: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  token: Taro.getStorageSync('token') || null,
  user: Taro.getStorageSync('userInfo') || null,
  isLoggedIn: !!Taro.getStorageSync('token'),
  isLoading: false,

  login: async (phone?: string) => {
    set({ isLoading: true })
    try {
      const { code } = await platformService.login()
      
      let response: { token: string; user: User }
      if (phone) {
        response = await authService.loginWithPhone(phone, code)
      } else {
        response = await authService.loginWithWechat(code)
      }

      setToken(response.token)
      Taro.setStorageSync('userInfo', response.user)
      set({
        token: response.token,
        user: response.user,
        isLoggedIn: true,
        isLoading: false,
      })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  logout: async () => {
    try {
      await authService.logout()
    } catch {
      // Ignore logout errors
    }
    clearToken()
    Taro.removeStorageSync('userInfo')
    set({
      token: null,
      user: null,
      isLoggedIn: false,
    })
  },

  checkAuth: async () => {
    const token = Taro.getStorageSync('token')
    if (token) {
      set({ isLoggedIn: true, token })
    }
  },

  updateProfile: async (updates: Partial<User>) => {
    try {
      const updatedUser = await authService.updateProfile(updates)
      Taro.setStorageSync('userInfo', updatedUser)
      set({ user: updatedUser })
    } catch (error) {
      throw error
    }
  },
}))
