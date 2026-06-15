import type { PlatformAdapter, ShareOptions, SubscribeOptions, ChooseImageOptions } from './index'

export class RNPlatform implements PlatformAdapter {
  async login(): Promise<{ code: string }> {
    return { code: 'rn_mock_code_' + Date.now() }
  }

  async getUserProfile(): Promise<{ nickName: string; avatarUrl: string }> {
    return { nickName: 'RN用户', avatarUrl: '' }
  }

  async shareToFriend(_options: ShareOptions): Promise<void> {
    console.log('RN shareToFriend:', _options.title)
  }

  async shareToTimeline(_options: ShareOptions): Promise<void> {
    console.log('RN shareToTimeline:', _options.title)
  }

  async requestSubscribeMessage(_options: SubscribeOptions): Promise<void> {
    console.log('RN requestSubscribeMessage')
  }

  async getLocation(): Promise<{ latitude: number; longitude: number }> {
    return { latitude: 30.5728, longitude: 104.0668 }
  }

  async chooseImage(_options: ChooseImageOptions): Promise<{ tempFilePaths: string[] }> {
    return { tempFilePaths: [] }
  }

  showToast(options: { title: string; icon: 'success' | 'error' | 'none' }): void {
    console.log('Toast:', options.title)
  }

  async showModal(options: { title: string; content: string; showCancel?: boolean }): Promise<boolean> {
    console.log('Modal:', options.title, options.content)
    return true
  }

  showLoading(title: string): void {
    console.log('Loading:', title)
  }

  hideLoading(): void {
    console.log('Hide Loading')
  }

  navigateTo(url: string): void {
    console.log('Navigate to:', url)
  }

  navigateBack(): void {
    console.log('Navigate back')
  }

  redirectTo(url: string): void {
    console.log('Redirect to:', url)
  }
}
