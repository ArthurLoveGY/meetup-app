import { create } from 'zustand'
import Taro from '@tarojs/taro'
import { setToken, clearToken } from '../services/request'
import { authService } from '../services'
import { sanitizeUser } from '../services/config'
import { platformService } from '../platform'
import type { User } from '../types'

interface AuthState {
  token: string | null
  user: User | null
  isLoggedIn: boolean
  isLoading: boolean

  login: (phone?: string, smsCode?: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<void>
}

const storedUser = Taro.getStorageSync('userInfo')

export const useAuthStore = create<AuthState>((set) => ({
  token: Taro.getStorageSync('token') || null,
  user: storedUser ? sanitizeUser(storedUser) : null,
  isLoggedIn: !!Taro.getStorageSync('token'),
  isLoading: false,

  login: async (phone?: string, smsCode?: string) => {
    set({ isLoading: true })
    try {
      let response: { token: string; user: User }
      if (phone && smsCode) {
        response = await authService.loginWithPhone(phone, smsCode)
      } else if (phone) {
        // Phone without code: trigger SMS flow first
        await authService.sendSmsCode(phone)
        throw new Error('请先获取验证码')
      } else {
        const { code } = await platformService.login()
        response = await authService.loginWithWechat(code)
      }

      setToken(response.token)
      const safeUser = sanitizeUser(response.user)
      Taro.setStorageSync('userInfo', safeUser)
      set({
        token: response.token,
        user: safeUser,
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
    if (!token) {
      set({ isLoggedIn: false, token: null, user: null })
      return
    }
    // 不再仅凭本地 token 存在判定登录：调 /auth/me 校验有效性。
    // 后端 /auth/refresh 不发新 token，过期 token 校验会 401 → 登出兜底。
    try {
      const user = await authService.getCurrentUser()
      const safeUser = sanitizeUser(user)
      Taro.setStorageSync('userInfo', safeUser)
      set({ isLoggedIn: true, token, user: safeUser })
    } catch {
      clearToken()
      Taro.removeStorageSync('userInfo')
      set({ isLoggedIn: false, token: null, user: null })
    }
  },

  updateProfile: async (updates: Partial<User>) => {
    const updatedUser = await authService.updateProfile(updates)
    const safeUser = sanitizeUser(updatedUser)
    Taro.setStorageSync('userInfo', safeUser)
    set({ user: safeUser })
  },
}))
