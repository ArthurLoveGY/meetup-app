import Taro from '@tarojs/taro'
import type { PlatformAdapter, ShareOptions, SubscribeOptions, ChooseImageOptions } from './index'

export class WeappPlatform implements PlatformAdapter {
  async login(): Promise<{ code: string }> {
    const res = await Taro.login()
    return { code: res.code }
  }

  async getUserProfile(): Promise<{ nickName: string; avatarUrl: string }> {
    const res = await Taro.getUserProfile({
      desc: '用于完善用户资料',
    })
    return {
      nickName: res.userInfo.nickName,
      avatarUrl: res.userInfo.avatarUrl,
    }
  }

  async shareToFriend(_options: ShareOptions): Promise<void> {
    await Taro.showShareMenu({
      withShareTicket: true,
    })
  }

  async shareToTimeline(_options: ShareOptions): Promise<void> {
    await Taro.showShareMenu({
      withShareTicket: true,
    })
  }

  async requestSubscribeMessage(_options: SubscribeOptions): Promise<void> {
    // WeChat subscribe message API
    console.log('Request subscribe message')
  }

  async getLocation(): Promise<{ latitude: number; longitude: number }> {
    const res = await Taro.getLocation({
      type: 'gcj02',
    })
    return {
      latitude: res.latitude,
      longitude: res.longitude,
    }
  }

  async chooseImage(options: ChooseImageOptions): Promise<{ tempFilePaths: string[] }> {
    const res = await Taro.chooseImage({
      count: options.count,
      sizeType: (options.sizeType || ['compressed']) as ('original' | 'compressed')[],
      sourceType: (options.sourceType || ['album', 'camera']) as ('album' | 'camera')[],
    })
    return { tempFilePaths: res.tempFilePaths }
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
