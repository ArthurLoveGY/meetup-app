import Taro from '@tarojs/taro'
import { api, clearToken } from './request'
import type { User } from '../types'

interface LoginResponse {
  token: string
  user: User
}

export const authService = {
  async loginWithWechat(code: string): Promise<LoginResponse> {
    return api.post<LoginResponse>('/auth/wechat-login', { code })
  },

  async loginWithPhone(phone: string, code: string): Promise<LoginResponse> {
    return api.post<LoginResponse>('/auth/phone-login', { phone, code })
  },

  async sendSmsCode(phone: string): Promise<void> {
    return api.post<void>('/auth/send-sms', { phone })
  },

  async refreshToken(): Promise<{ user: User }> {
    return api.post<{ user: User }>('/auth/refresh')
  },

  async logout(): Promise<void> {
    try {
      await api.post<void>('/auth/logout')
    } finally {
      clearToken()
    }
  },

  async getCurrentUser(): Promise<User> {
    return api.get<User>('/auth/me')
  },

  async getUserProfile(userId: string): Promise<User> {
    return api.get<User>(`/users/${userId}`)
  },

  async updateProfile(updates: Partial<User>): Promise<User> {
    return api.put<User>('/auth/profile', updates as Record<string, unknown>)
  },

  async uploadAvatar(filePath: string): Promise<{ url: string }> {
    const token = Taro.getStorageSync('token')
    const res = await Taro.uploadFile({
      url: 'https://api.tripcircle.com/auth/avatar',
      filePath,
      name: 'avatar',
      header: {
        Authorization: `Bearer ${token}`,
      },
    })
    return JSON.parse(res.data)
  },
}
