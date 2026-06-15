import { View, Text } from '@tarojs/components'
import { useLoad, useRouter } from '@tarojs/taro'
import { useState, useCallback } from 'react'
import { LoadingView } from '../../components'
import { useAuthStore } from '../../stores'
import { platformService } from '../../platform'
import './index.scss'

export default function QrcodeLanding() {
  const router = useRouter()
  const { isLoggedIn } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  const [tripId, setTripId] = useState<string | null>(null)

  useLoad(() => {
    const scene = router.params.scene
    if (scene) {
      setTimeout(() => {
        setTripId(scene)
        setIsLoading(false)
      }, 500)
    } else {
      setIsLoading(false)
    }
  })

  const handleViewTrip = useCallback(() => {
    if (!isLoggedIn) {
      platformService.redirectTo('/pages/login/index')
      return
    }
    if (tripId) {
      platformService.redirectTo(`/pages/trip-detail/index?id=${tripId}`)
    }
  }, [isLoggedIn, tripId])

  const handleLogin = useCallback(() => {
    platformService.redirectTo('/pages/login/index')
  }, [])

  if (isLoading) {
    return <LoadingView text='识别中...' />
  }

  return (
    <View className='qrcode-landing'>
      <View className='qrcode-landing__header'>
        <Text className='qrcode-landing__logo'>🌟</Text>
        <Text className='qrcode-landing__app-name'>TripCircle</Text>
        <Text className='qrcode-landing__subtitle'>行程朋友圈</Text>
      </View>

      <View className='qrcode-landing__content'>
        {tripId ? (
          <>
            <Text className='qrcode-landing__text'>你扫描了一个行程邀请码</Text>
            <View className='qrcode-landing__actions'>
              {isLoggedIn ? (
                <View className='qrcode-landing__btn' onClick={handleViewTrip}>
                  <Text className='qrcode-landing__btn-text'>查看行程</Text>
                </View>
              ) : (
                <>
                  <View className='qrcode-landing__btn' onClick={handleLogin}>
                    <Text className='qrcode-landing__btn-text'>登录查看</Text>
                  </View>
                  <View className='qrcode-landing__btn qrcode-landing__btn--secondary' onClick={handleViewTrip}>
                    <Text className='qrcode-landing__btn-text'>先看看</Text>
                  </View>
                </>
              )}
            </View>
          </>
        ) : (
          <>
            <Text className='qrcode-landing__icon'>📷</Text>
            <Text className='qrcode-landing__text'>扫描行程小程序码</Text>
            <Text className='qrcode-landing__desc'>使用微信扫一扫功能扫描行程邀请码</Text>
          </>
        )}
      </View>
    </View>
  )
}
