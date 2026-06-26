import Taro from '@tarojs/taro'
import { platformService } from '../platform'
import { API_BASE_URL } from './config'

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

// 标记已弹过的错误，避免 catch 中重复 toast
const NETWORK_ERROR_MSG = '网络请求失败，请重试'

/** 401 时跳转登录页，带循环守卫：已在登录/验证页则不再跳转，避免死循环。 */
function redirectToLogin() {
  const pages = Taro.getCurrentPages()
  const current = pages[pages.length - 1]
  const route = current?.route || ''
  if (route.startsWith('pages/login') || route.startsWith('pages/phone-auth')) {
    return
  }
  // profile 是 tabbar 页，redirectTo 在 weapp 下会被静默拒绝；用 reLaunch 到非 tabbar 的 login 页。
  try {
    Taro.reLaunch({ url: '/pages/login/index' })
  } catch {
    /* ignore */
  }
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
      url: `${API_BASE_URL}${url}`,
      method,
      data,
      header,
      timeout: 15000,
    })

    const statusCode = response.statusCode
    const result = response.data as ApiResponse<T> | undefined

    if (statusCode === 401) {
      clearToken()
      Taro.removeStorageSync('userInfo')
      platformService.showToast({ title: '登录已过期，请重新登录', icon: 'error' })
      redirectToLogin()
      throw new Error('Unauthorized')
    }

    if (statusCode >= 400) {
      // 网关/服务端错误：不透传后端 message，避免泄漏堆栈/字段名
      platformService.showToast({ title: '网络异常，请稍后重试', icon: 'error' })
      throw new Error(`HTTP Error: ${statusCode}`)
    }

    // 非 JSON 响应或缺少 code 字段（如 CDN/网关返回 HTML），统一兜底
    if (!result || typeof result.code !== 'number') {
      platformService.showToast({ title: '网络异常，请稍后重试', icon: 'error' })
      throw new Error('Unexpected response')
    }

    if (result.code !== 0) {
      // 业务错误：后端有意下发的用户文案，可展示
      platformService.showToast({ title: result.message || '请求失败', icon: 'error' })
      throw new Error(result.message || `API Error: ${result.code}`)
    }

    return result.data
  } catch (error) {
    // 仅对“未被上面处理过”的网络层失败补充提示
    if (
      error instanceof Error &&
      error.message !== NETWORK_ERROR_MSG &&
      !['Unauthorized'].includes(error.message) &&
      !error.message.includes('HTTP Error') &&
      !error.message.includes('API Error') &&
      !error.message.includes('Unexpected response')
    ) {
      platformService.showToast({ title: NETWORK_ERROR_MSG, icon: 'error' })
    }
    throw error
  } finally {
    if (showLoading) {
      try { platformService.hideLoading() } catch { /* ignore */ }
    }
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
