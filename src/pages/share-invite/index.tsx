import { View, Text } from '@tarojs/components'
import { useLoad, useRouter, useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import Taro from '@tarojs/taro'
import { useState, useCallback } from 'react'
import { UserAvatar, LoadingView, EmptyState } from '../../components'
import { useTripStore } from '../../stores'
import { platformService } from '../../platform'
import { getSmartDate, getDayOfWeek } from '../../utils/date'
import { getTripTypeLabel, getCostTypeLabel } from '../../utils/permission'
import './index.scss'

export default function ShareInvite() {
  const router = useRouter()
  const { currentTrip, fetchTripDetail } = useTripStore()
  const [isLoading, setIsLoading] = useState(true)

  useLoad(() => {
    const tripId = router.params.id
    if (tripId) {
      fetchTripDetail(tripId).finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  })

  // 微信小程序分享钩子：注册转发到好友的分享内容
  useShareAppMessage(() => {
    if (!currentTrip) {
      return { title: 'TripCircle - 行程朋友圈', path: '/pages/index/index' }
    }
    return {
      title: `邀请你参加：${currentTrip.title}`,
      path: `/pages/trip-detail/index?id=${currentTrip.id}`,
      imageUrl: currentTrip.coverUrl,
    }
  })

  // 分享到朋友圈
  useShareTimeline(() => {
    if (!currentTrip) {
      return { title: 'TripCircle - 行程朋友圈' }
    }
    return {
      title: `邀请你参加：${currentTrip.title}`,
      query: `id=${currentTrip.id}`,
      imageUrl: currentTrip.coverUrl,
    }
  })

  const handleShareToFriend = useCallback(() => {
    platformService.showToast({ title: '请点击右上角“···”选择“转发”', icon: 'none' })
  }, [])

  const handleShareToTimeline = useCallback(() => {
    platformService.showToast({ title: '请点击右上角“···”选择“分享到朋友圈”', icon: 'none' })
  }, [])

  const handleCopyLink = useCallback(async () => {
    if (!currentTrip) return
    try {
      await Taro.setClipboardData({
        data: `/pages/trip-detail/index?id=${currentTrip.id}`,
      })
      platformService.showToast({ title: '链接已复制', icon: 'success' })
    } catch {
      platformService.showToast({ title: '复制失败', icon: 'error' })
    }
  }, [currentTrip])

  const handleGeneratePoster = useCallback(() => {
    if (!currentTrip) return
    platformService.navigateTo('/pages/invite-poster/index?id=' + currentTrip.id)
  }, [currentTrip])

  if (isLoading) {
    return <LoadingView text='加载行程...' />
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
    <View className='share-invite'>
      <View className='share-invite__header'>
        <Text className='share-invite__title'>邀请好友</Text>
      </View>

      <View className='share-invite__card'>
        {trip.coverUrl && (
          <View className='share-invite__cover' style={{ backgroundImage: `url(${trip.coverUrl})` }} />
        )}
        <View className='share-invite__card-content'>
          <View className='share-invite__card-tag'>
            <Text className='share-invite__card-tag-text'>{getTripTypeLabel(trip.type)}</Text>
          </View>
          <Text className='share-invite__card-title'>{trip.title}</Text>
          <View className='share-invite__card-info'>
            <Text className='share-invite__card-icon'>📅</Text>
            <Text className='share-invite__card-text'>
              {getSmartDate(trip.startTime)} {getDayOfWeek(trip.startTime)}
            </Text>
          </View>
          {trip.locationName && (
            <View className='share-invite__card-info'>
              <Text className='share-invite__card-icon'>📍</Text>
              <Text className='share-invite__card-text'>{trip.locationName}</Text>
            </View>
          )}
          <View className='share-invite__card-info'>
            <Text className='share-invite__card-icon'>💰</Text>
            <Text className='share-invite__card-text'>
              {getCostTypeLabel(trip.costType, trip.estimatedCost)}
            </Text>
          </View>
          <View className='share-invite__card-footer'>
            <View className='share-invite__card-creator'>
              <UserAvatar
                userId={trip.creator.id}
                nickname={trip.creator.nickname}
                avatarUrl={trip.creator.avatarUrl}
                size='small'
              />
              <Text className='share-invite__card-creator-name'>{trip.creator.nickname}</Text>
            </View>
            <Text className='share-invite__card-participants'>
              {trip.participantCount}人已参加
            </Text>
          </View>
        </View>
      </View>

      <View className='share-invite__actions'>
        <View className='share-invite__action' onClick={handleShareToFriend}>
          <Text className='share-invite__action-icon'>💬</Text>
          <Text className='share-invite__action-text'>分享给好友</Text>
        </View>
        <View className='share-invite__action' onClick={handleShareToTimeline}>
          <Text className='share-invite__action-icon'>📱</Text>
          <Text className='share-invite__action-text'>分享到朋友圈</Text>
        </View>
        <View className='share-invite__action' onClick={handleCopyLink}>
          <Text className='share-invite__action-icon'>🔗</Text>
          <Text className='share-invite__action-text'>复制链接</Text>
        </View>
        <View className='share-invite__action' onClick={handleGeneratePoster}>
          <Text className='share-invite__action-icon'>🖼️</Text>
          <Text className='share-invite__action-text'>生成海报</Text>
        </View>
      </View>
    </View>
  )
}
