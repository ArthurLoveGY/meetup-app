import { View, Text, Canvas } from '@tarojs/components'
import Taro, { useLoad, useRouter } from '@tarojs/taro'
import { useState, useCallback } from 'react'
import { UserAvatar, LoadingView, EmptyState } from '../../components'
import { useTripStore } from '../../stores'
import { platformService } from '../../platform'
import { getSmartDate, getDayOfWeek } from '../../utils/date'
import './index.scss'

export default function InvitePoster() {
  const router = useRouter()
  const { currentTrip, fetchTripDetail } = useTripStore()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useLoad(() => {
    const tripId = router.params.id
    if (tripId) {
      fetchTripDetail(tripId).finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  })

  const handleSave = useCallback(async () => {
    setIsSaving(true)
    try {
      // Use canvas to generate poster image
      const query = Taro.createSelectorQuery()
      query.select('#poster-canvas')
        .fields({ node: true, size: true })
        .exec(async (res) => {
          if (res[0]) {
            const canvas = res[0].node
            const ctx = canvas.getContext('2d')
            const dpr = Taro.getSystemInfoSync().pixelRatio
            canvas.width = res[0].width * dpr
            canvas.height = res[0].height * dpr
            ctx.scale(dpr, dpr)

            // Draw poster background
            ctx.fillStyle = '#FF6B35'
            ctx.fillRect(0, 0, 375, 667)

            // Draw title
            ctx.fillStyle = '#FFFFFF'
            ctx.font = 'bold 24px sans-serif'
            ctx.fillText(currentTrip?.title || '', 30, 80)

            // Draw date
            ctx.font = '16px sans-serif'
            ctx.fillText(`📅 ${getSmartDate(currentTrip?.startTime || '')} ${getDayOfWeek(currentTrip?.startTime || '')}`, 30, 120)

            // Draw location
            if (currentTrip?.locationName) {
              ctx.fillText(`📍 ${currentTrip.locationName}`, 30, 150)
            }

            // Draw participants count
            ctx.fillText(`👥 ${currentTrip?.participantCount || 0}人参加`, 30, 180)

            // Draw footer
            ctx.font = '14px sans-serif'
            ctx.fillText('长按识别参加行程', 30, 620)

            try {
              const tempPath = await Taro.canvasToTempFilePath({
                canvas,
                fileType: 'jpg',
                quality: 0.9,
              })
              await Taro.saveImageToPhotosAlbum({
                filePath: tempPath.tempFilePath,
              })
              platformService.showToast({ title: '海报已保存到相册', icon: 'success' })
            } catch (err: any) {
              if (err.errMsg?.includes('auth deny') || err.errMsg?.includes('authorize')) {
                platformService.showModal({
                  title: '需要授权',
                  content: '请在设置中允许保存图片到相册',
                })
              } else {
                platformService.showToast({ title: '保存失败', icon: 'error' })
              }
            }
          }
          setIsSaving(false)
        })
    } catch {
      setIsSaving(false)
      platformService.showToast({ title: '生成海报失败', icon: 'error' })
    }
  }, [currentTrip])

  const handleShare = useCallback(() => {
    if (!currentTrip) return
    platformService.shareToFriend({
      title: currentTrip.title,
      path: '/pages/trip-detail/index?id=' + currentTrip.id,
    })
  }, [currentTrip])

  if (isLoading) {
    return <LoadingView text='生成海报...' />
  }

  if (!currentTrip) {
    return (
      <EmptyState
        icon='😅'
        title='行程不存在'
        description=''
        actionText='返回'
        onAction={() => platformService.navigateBack()}
      />
    )
  }

  const trip = currentTrip

  return (
    <View className='invite-poster'>
      <View className='invite-poster__header'>
        <Text className='invite-poster__title'>邀请海报</Text>
      </View>

      <View className='invite-poster__preview'>
        <View className='invite-poster__poster'>
          <View className='invite-poster__poster-header'>
            <Text className='invite-poster__poster-logo'>🌟</Text>
            <Text className='invite-poster__poster-app'>TripCircle</Text>
          </View>
          <View className='invite-poster__poster-content'>
            <Text className='invite-poster__poster-title'>{trip.title}</Text>
            <View className='invite-poster__poster-info'>
              <Text className='invite-poster__poster-icon'>📅</Text>
              <Text className='invite-poster__poster-text'>{getSmartDate(trip.startTime)} {getDayOfWeek(trip.startTime)}</Text>
            </View>
            {trip.locationName && (
              <View className='invite-poster__poster-info'>
                <Text className='invite-poster__poster-icon'>📍</Text>
                <Text className='invite-poster__poster-text'>{trip.locationName}</Text>
              </View>
            )}
            <View className='invite-poster__poster-info'>
              <Text className='invite-poster__poster-icon'>👥</Text>
              <Text className='invite-poster__poster-text'>{trip.participantCount}人参加</Text>
            </View>
            <View className='invite-poster__poster-participants'>
              <Text className='invite-poster__poster-participants-label'>已参加：</Text>
              <View className='invite-poster__poster-avatars'>
                {trip.participants.slice(0, 5).map((p) => (
                  <UserAvatar
                    key={p.id}
                    userId={p.id}
                    nickname={p.nickname}
                    size='mini'
                  />
                ))}
              </View>
            </View>
          </View>
          <View className='invite-poster__poster-footer'>
            <Text className='invite-poster__poster-footer-text'>长按识别参加行程</Text>
          </View>
        </View>
        {/* Hidden canvas for generating poster image */}
        <Canvas
          id='poster-canvas'
          canvasId='poster-canvas'
          className='invite-poster__canvas'
          style='position:absolute;left:-9999px;width:375px;height:667px;'
        />
      </View>

      <View className='invite-poster__actions'>
        <View className='invite-poster__action' onClick={handleSave}>
          <Text className='invite-poster__action-icon'>{isSaving ? '⏳' : '💾'}</Text>
          <Text className='invite-poster__action-text'>{isSaving ? '保存中...' : '保存到相册'}</Text>
        </View>
        <View className='invite-poster__action' onClick={handleShare}>
          <Text className='invite-poster__action-icon'>📤</Text>
          <Text className='invite-poster__action-text'>分享海报</Text>
        </View>
      </View>
    </View>
  )
}
