import Taro from '@tarojs/taro'
import { platformService } from '../platform'

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api'

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: Record<string, unknown>
  header?: Record<string, string>
  showLoading?: boolean
  loadingText?: string
}

interface ApiResponse<T = unknown> {
  code: number
  data: T
  message: string
}

let token: string | null = null

export function setToken(newToken: string) {
  token = newToken
  Taro.setStorageSync('token', newToken)
}

export function getToken(): string | null {
  if (!token) {
    token = Taro.getStorageSync('token') || null
  }
  return token
}

export function clearToken() {
  token = null
  Taro.removeStorageSync('token')
}

async function request<T = unknown>(options: RequestOptions): Promise<T> {
  const { url, method = 'GET', data, header = {}, showLoading = true, loadingText = '加载中...' } = options

  if (showLoading) {
    platformService.showLoading(loadingText)
  }

  const tokenValue = getToken()
  if (tokenValue) {
    header['Authorization'] = `Bearer ${tokenValue}`
  }

  header['Content-Type'] = header['Content-Type'] || 'application/json'

  try {
    const response = await Taro.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header,
    })

    if (showLoading) {
      platformService.hideLoading()
    }

    const statusCode = response.statusCode
    const result = response.data as ApiResponse<T>

    if (statusCode === 401) {
      clearToken()
      platformService.showToast({ title: '登录已过期，请重新登录', icon: 'error' })
      platformService.redirectTo('/pages/profile/index')
      throw new Error('Unauthorized')
    }

    if (statusCode >= 400) {
      platformService.showToast({ title: result.message || '请求失败', icon: 'error' })
      throw new Error(result.message || `HTTP Error: ${statusCode}`)
    }

    if (result.code !== 0) {
      platformService.showToast({ title: result.message || '请求失败', icon: 'error' })
      throw new Error(result.message || `API Error: ${result.code}`)
    }

    return result.data
  } catch (error) {
    if (showLoading) {
      platformService.hideLoading()
    }
    throw error
  }
}

export const api = {
  get<T = unknown>(url: string, data?: Record<string, unknown>, options?: Partial<RequestOptions>) {
    return request<T>({ url, method: 'GET', data, ...options })
  },

  post<T = unknown>(url: string, data?: Record<string, unknown>, options?: Partial<RequestOptions>) {
    return request<T>({ url, method: 'POST', data, ...options })
  },

  put<T = unknown>(url: string, data?: Record<string, unknown>, options?: Partial<RequestOptions>) {
    return request<T>({ url, method: 'PUT', data, ...options })
  },

  delete<T = unknown>(url: string, data?: Record<string, unknown>, options?: Partial<RequestOptions>) {
    return request<T>({ url, method: 'DELETE', data, ...options })
  },
}

export default request
