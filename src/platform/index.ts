export interface PlatformAdapter {
  login(): Promise<{ code: string }>
  getUserProfile(): Promise<{ nickName: string; avatarUrl: string }>
  shareToFriend(options: ShareOptions): Promise<void>
  shareToTimeline(options: ShareOptions): Promise<void>
  requestSubscribeMessage(options: SubscribeOptions): Promise<void>
  getLocation(): Promise<{ latitude: number; longitude: number }>
  chooseImage(options: ChooseImageOptions): Promise<{ tempFilePaths: string[] }>
  showToast(options: { title: string; icon: 'success' | 'error' | 'none' }): void
  showModal(options: { title: string; content: string; showCancel?: boolean }): Promise<boolean>
  showLoading(title: string): void
  hideLoading(): void
  navigateTo(url: string): void
  navigateBack(): void
  redirectTo(url: string): void
}

export interface ShareOptions {
  title: string
  path: string
  imageUrl?: string
}

export interface SubscribeOptions {
  templateIds: string[]
}

export interface ChooseImageOptions {
  count: number
  sizeType?: Array<'original' | 'compressed'>
  sourceType?: Array<'album' | 'camera'>
}

let platform: PlatformAdapter

export function getPlatform(): PlatformAdapter {
  if (!platform) {
    if (process.env.TARO_ENV === 'weapp') {
      const { WeappPlatform } = require('./weapp')
      platform = new WeappPlatform()
    } else if (process.env.TARO_ENV === 'rn') {
      const { RNPlatform } = require('./rn')
      platform = new RNPlatform()
    } else {
      const { H5Platform } = require('./h5')
      platform = new H5Platform()
    }
  }
  return platform
}

export const platformService = {
  login: () => getPlatform().login(),
  getUserProfile: () => getPlatform().getUserProfile(),
  shareToFriend: (options: ShareOptions) => getPlatform().shareToFriend(options),
  shareToTimeline: (options: ShareOptions) => getPlatform().shareToTimeline(options),
  requestSubscribeMessage: (options: SubscribeOptions) => getPlatform().requestSubscribeMessage(options),
  getLocation: () => getPlatform().getLocation(),
  chooseImage: (options: ChooseImageOptions) => getPlatform().chooseImage(options),
  showToast: (options: { title: string; icon: 'success' | 'error' | 'none' }) => getPlatform().showToast(options),
  showModal: (options: { title: string; content: string; showCancel?: boolean }) => getPlatform().showModal(options),
  showLoading: (title: string) => getPlatform().showLoading(title),
  hideLoading: () => getPlatform().hideLoading(),
  navigateTo: (url: string) => getPlatform().navigateTo(url),
  navigateBack: () => getPlatform().navigateBack(),
  redirectTo: (url: string) => getPlatform().redirectTo(url),
}
