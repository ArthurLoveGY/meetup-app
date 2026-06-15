import Taro from '@tarojs/taro'
import type { PlatformAdapter, ShareOptions, SubscribeOptions, ChooseImageOptions } from './index'

export class H5Platform implements PlatformAdapter {
  async login(): Promise<{ code: string }> {
    return { code: 'h5_mock_code_' + Date.now() }
  }

  async getUserProfile(): Promise<{ nickName: string; avatarUrl: string }> {
    return { nickName: 'H5用户', avatarUrl: '' }
  }

  async shareToFriend(_options: ShareOptions): Promise<void> {
    console.log('H5 shareToFriend:', _options.title)
  }

  async shareToTimeline(_options: ShareOptions): Promise<void> {
    console.log('H5 shareToTimeline:', _options.title)
  }

  async requestSubscribeMessage(_options: SubscribeOptions): Promise<void> {
    console.log('H5 requestSubscribeMessage')
  }

  async getLocation(): Promise<{ latitude: number; longitude: number }> {
    return { latitude: 30.5728, longitude: 104.0668 }
  }

  async chooseImage(_options: ChooseImageOptions): Promise<{ tempFilePaths: string[] }> {
    return { tempFilePaths: [] }
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
    Taro.navigateTo({ url })
  }

  navigateBack(): void {
    Taro.navigateBack()
  }

  redirectTo(url: string): void {
    Taro.redirectTo({ url })
  }
}
