import { View, Text, ScrollView, Image } from '@tarojs/components'
import { useLoad, useRouter } from '@tarojs/taro'
import { useState, useCallback } from 'react'
import { UserAvatar, LoadingView, EmptyState } from '../../components'
import { useTripStore } from '../../stores'
import { platformService } from '../../platform'
import { uploadService } from '../../services/upload.service'
import './index.scss'

export default function TripReview() {
  const router = useRouter()
  const { currentTrip, fetchTripDetail } = useTripStore()
  const [isLoading, setIsLoading] = useState(true)
  const [photos, setPhotos] = useState<string[]>([])

  useLoad(() => {
    const tripId = router.params.id
    if (tripId) {
      fetchTripDetail(tripId).finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  })

  const handleAddPhoto = useCallback(async () => {
    try {
      const result = await platformService.chooseImage({
        count: 9 - photos.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
      })
      if (result.tempFilePaths.length > 0) {
        platformService.showLoading('上传中...')
        const uploaded: string[] = []
        for (const path of result.tempFilePaths) {
          const url = await uploadService.uploadImage(path)
          uploaded.push(url)
        }
        platformService.hideLoading()
        setPhotos((prev) => [...prev, ...uploaded].slice(0, 9))
        platformService.showToast({ title: `已上传 ${uploaded.length} 张照片`, icon: 'success' })
      }
    } catch {
      platformService.hideLoading()
      platformService.showToast({ title: '上传失败', icon: 'error' })
    }
  }, [photos])

  const handleRemovePhoto = useCallback((index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }, [])

  if (isLoading) {
    return <LoadingView text='加载回顾...' />
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
    <View className='trip-review'>
      <View className='trip-review__header'>
        <Text className='trip-review__title'>行程回顾</Text>
      </View>

      <ScrollView className='trip-review__scroll' scrollY>
        <View className='trip-review__section'>
          <Text className='trip-review__trip-title'>{trip.title}</Text>
          <Text className='trip-review__date'>📅 {new Date(trip.startTime).toLocaleDateString()}</Text>
        </View>

        <View className='trip-review__section'>
          <Text className='trip-review__section-title'>参与者</Text>
          <View className='trip-review__participants'>
            {trip.participants.map((p) => (
              <View key={p.id} className='trip-review__participant'>
                <UserAvatar userId={p.id} nickname={p.nickname} size='medium' />
                <Text className='trip-review__participant-name'>{p.nickname}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className='trip-review__section'>
          <Text className='trip-review__section-title'>精选照片</Text>
          <View className='trip-review__photos'>
            {photos.map((url, index) => (
              <View key={index} className='trip-review__photo-item'>
                <Image className='trip-review__photo-image' src={url} mode='aspectFill' />
                <View className='trip-review__photo-remove' onClick={() => handleRemovePhoto(index)}>
                  <Text className='trip-review__photo-remove-text'>✕</Text>
                </View>
              </View>
            ))}
            {photos.length < 9 && (
              <View className='trip-review__photo-add' onClick={handleAddPhoto}>
                <Text className='trip-review__photo-add-icon'>+</Text>
                <Text className='trip-review__photo-add-text'>添加照片</Text>
              </View>
            )}
          </View>
          {photos.length === 0 && (
            <Text className='trip-review__photo-hint'>添加旅途中拍摄的精彩瞬间</Text>
          )}
        </View>

        <View className='trip-review__section'>
          <Text className='trip-review__section-title'>活动总结</Text>
          <Text className='trip-review__summary'>
            {trip.description || '行程已结束，期待下次相聚！'}
          </Text>
        </View>

        <View className='trip-review__section'>
          <Text className='trip-review__section-title'>行程信息</Text>
          <View className='trip-review__info'>
            <Text className='trip-review__info-item'>📅 {new Date(trip.startTime).toLocaleDateString()}</Text>
            {trip.locationName && <Text className='trip-review__info-item'>📍 {trip.locationName}</Text>}
            <Text className='trip-review__info-item'>👥 {trip.participantCount}人参加</Text>
          </View>
        </View>

        <View className='trip-review__actions'>
          <View
            className='trip-review__action'
            onClick={() => platformService.navigateTo('/pages/trip-create/index')}
          >
            <Text className='trip-review__action-text'>再次发起</Text>
          </View>
          <View
            className='trip-review__action trip-review__action--share'
            onClick={() => platformService.navigateTo('/pages/invite-poster/index?id=' + trip.id)}
          >
            <Text className='trip-review__action-text'>生成海报</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
