import Taro from '@tarojs/taro'
import { authService } from '../services/auth.service'
import type { PlatformAdapter, ShareOptions, SubscribeOptions, ChooseImageOptions } from './index'

export class H5Platform implements PlatformAdapter {
  async login(): Promise<{ code: string }> {
    // H5 uses phone-based auth. Return a session code that the auth service
    // will use with the backend phone-login endpoint.
    return { code: 'h5_auth_' + Date.now() }
  }

  async getUserProfile(): Promise<{ nickName: string; avatarUrl: string }> {
    try {
      const userInfo = Taro.getStorageSync('userInfo')
      if (userInfo) {
        return {
          nickName: userInfo.nickname || '用户',
          avatarUrl: userInfo.avatarUrl || '',
        }
      }
      // Try fetching from API if we have a token
      const token = Taro.getStorageSync('token')
      if (token) {
        const user = await authService.getCurrentUser()
        return {
          nickName: user.nickname || '用户',
          avatarUrl: user.avatarUrl || '',
        }
      }
    } catch {
      // Ignore errors
    }
    return { nickName: '用户', avatarUrl: '' }
  }

  async shareToFriend(_options: ShareOptions): Promise<void> {
    // H5 doesn't have native share API. Copy link to clipboard.
    try {
      await Taro.setClipboardData({
        data: _options.path,
      })
      Taro.showToast({ title: '链接已复制', icon: 'success' })
    } catch {
      // Ignore clipboard errors
    }
  }

  async shareToTimeline(_options: ShareOptions): Promise<void> {
    try {
      await Taro.setClipboardData({
        data: _options.path,
      })
      Taro.showToast({ title: '链接已复制', icon: 'success' })
    } catch {
      // Ignore clipboard errors
    }
  }

  async requestSubscribeMessage(_options: SubscribeOptions): Promise<void> {
    // H5 doesn't support subscribe messages. In production,
    // integrate with web push notifications.
    console.log('H5: Subscribe message requested (not available on web)')
  }

  async getLocation(): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('浏览器不支持定位'))
        return
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        },
        (error) => {
          reject(new Error('获取位置失败: ' + error.message))
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 60000,
        },
      )
    })
  }

  async chooseImage(_options: ChooseImageOptions): Promise<{ tempFilePaths: string[] }> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.multiple = (_options.count || 1) > 1

      input.onchange = () => {
        const files = input.files
        if (!files || files.length === 0) {
          resolve({ tempFilePaths: [] })
          return
        }

        const paths: string[] = []
        const maxCount = _options.count || 1

        Array.from(files)
          .slice(0, maxCount)
          .forEach((file) => {
            const url = URL.createObjectURL(file)
            paths.push(url)
          })

        resolve({ tempFilePaths: paths })
      }

      input.onerror = () => {
        reject(new Error('选择图片失败'))
      }

      input.click()
    })
  }

  showToast(options: { title: string; icon: 'success' | 'error' | 'none' }): void {
    Taro.showToast({
      title: options.title,
      icon: options.icon,
      duration: 2000,
    })
  }

  async showModal(options: { title: string; content: string; showCancel?: boolean }): Promise<boolean> {
    const res = await Taro.showModal({
      title: options.title,
      content: options.content,
      showCancel: options.showCancel ?? true,
    })
    return res.confirm
  }

  showLoading(title: string): void {
    Taro.showLoading({ title })
  }

  hideLoading(): void {
    Taro.hideLoading()
  }

  navigateTo(url: string): void {
    const path = url.split('?')[0]
    const tabbarPages = [
      '/pages/index/index',
      '/pages/discover/index',
      '/pages/trip-create/index',
      '/pages/messages/index',
      '/pages/profile/index',
    ]
    if (tabbarPages.some((p) => path === p || path.startsWith(p + '/'))) {
      Taro.switchTab({ url: path })
    } else {
      Taro.navigateTo({ url })
    }
  }

  navigateBack(): void {
    Taro.navigateBack()
  }

  redirectTo(url: string): void {
    Taro.redirectTo({ url })
  }
}
