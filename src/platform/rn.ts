import Taro from '@tarojs/taro'
import { Alert } from 'react-native'
import * as Location from 'expo-location'
import * as ImagePicker from 'expo-image-picker'
import type { PlatformAdapter, ShareOptions, SubscribeOptions, ChooseImageOptions } from './index'

export class RNPlatform implements PlatformAdapter {
  async login(): Promise<{ code: string }> {
    // In RN, we use phone-based auth. The code is the phone number
    // passed from the login page. For RN, we trigger the phone auth flow.
    // The actual SMS verification happens in the auth service.
    return new Promise((resolve) => {
      // Return a placeholder code - the real auth flow uses phone+sms
      // This is called by useAuthStore.login() which passes the phone separately
      resolve({ code: 'rn_auth_' + Date.now() })
    })
  }

  async getUserProfile(): Promise<{ nickName: string; avatarUrl: string }> {
    // Fetch real user profile from storage (set during login)
    try {
      const userInfo = Taro.getStorageSync('userInfo')
      if (userInfo) {
        return {
          nickName: userInfo.nickname || '用户',
          avatarUrl: userInfo.avatarUrl || '',
        }
      }
    } catch {
      // Ignore storage errors
    }
    return { nickName: '用户', avatarUrl: '' }
  }

  async shareToFriend(options: ShareOptions): Promise<void> {
    try {
      const { Share } = await import('react-native')
      await Share.share({
        message: `${options.title}\n${options.path}`,
        title: options.title,
      })
    } catch {
      // User cancelled or share failed
    }
  }

  async shareToTimeline(options: ShareOptions): Promise<void> {
    try {
      const { Share } = await import('react-native')
      await Share.share({
        message: `${options.title}\n${options.path}`,
        title: options.title,
      })
    } catch {
      // User cancelled or share failed
    }
  }

  async requestSubscribeMessage(_options: SubscribeOptions): Promise<void> {
    // RN uses push notifications instead of subscribe messages
    // In production, integrate with expo-notifications or a push service
    console.log('RN: Push notification registration requested')
  }

  async getLocation(): Promise<{ latitude: number; longitude: number }> {
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') {
      throw new Error('位置权限未授权')
    }
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    })
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    }
  }

  async chooseImage(options: ChooseImageOptions): Promise<{ tempFilePaths: string[] }> {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: (options.count || 1) > 1,
      quality: options.sizeType?.includes('compressed') ? 0.7 : 1,
      selectionLimit: options.count || 1,
    })

    if (result.canceled || !result.assets) {
      return { tempFilePaths: [] }
    }

    return {
      tempFilePaths: result.assets.map((asset) => asset.uri),
    }
  }

  showToast(options: { title: string; icon: 'success' | 'error' | 'none' }): void {
    // React Native doesn't have a built-in toast. Use Alert as fallback.
    // In production, use a toast library like react-native-root-toast
    if (options.icon === 'error') {
      Alert.alert('提示', options.title)
    } else {
      // For success/none, use a brief alert
      Alert.alert('', options.title)
    }
  }

  async showModal(options: { title: string; content: string; showCancel?: boolean }): Promise<boolean> {
    return new Promise((resolve) => {
      const buttons = options.showCancel !== false
        ? [
            { text: '取消', style: 'cancel' as const, onPress: () => resolve(false) },
            { text: '确定', onPress: () => resolve(true) },
          ]
        : [{ text: '确定', onPress: () => resolve(true) }]

      Alert.alert(options.title, options.content, buttons)
    })
  }

  showLoading(title: string): void {
    // In production, use a loading overlay component
    // For now, use console logging as indicator
    console.log('Loading:', title)
  }

  hideLoading(): void {
    console.log('Hide Loading')
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
