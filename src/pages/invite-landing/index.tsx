import { View, Text } from '@tarojs/components'
import { useLoad, useRouter } from '@tarojs/taro'
import { useState, useCallback } from 'react'
import { UserAvatar, LoadingView } from '../../components'
import { useAuthStore } from '../../stores'
import { platformService } from '../../platform'
import { getSmartDate, getDayOfWeek } from '../../utils/date'
import { getTripTypeLabel, getCostTypeLabel } from '../../utils/permission'
import './index.scss'

export default function InviteLanding() {
  const router = useRouter()
  const { isLoggedIn, requireLogin } = useAuthStore()
  const [trip, setTrip] = useState<{
    id: string
    title: string
    type: string
    startTime: string
    locationName?: string
    costType: string
    estimatedCost?: number
    participantCount: number
    creator: { id: string; nickname: string; avatarUrl?: string }
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useLoad(() => {
    const tripId = router.params.id
    if (tripId) {
      setTimeout(() => {
        setTrip({
          id: tripId,
          title: '周六青城山轻徒步',
          type: 'travel',
          startTime: '2026-06-14T09:00:00Z',
          locationName: '青城山前山',
          costType: 'aa',
          estimatedCost: 150,
          participantCount: 5,
          creator: { id: 'user_1', nickname: '小明' },
        })
        setIsLoading(false)
      }, 500)
    }
  })

  const handleJoin = useCallback(() => {
    if (!requireLogin()) return
    if (trip) {
      platformService.navigateTo(`/pages/trip-detail/index?id=${trip.id}`)
    }
  }, [requireLogin, trip])

  if (isLoading) {
    return <LoadingView text='加载中...' />
  }

  if (!trip) {
    return (
      <View className='invite-landing'>
        <View className='invite-landing__error'>
          <Text className='invite-landing__error-icon'>😅</Text>
          <Text className='invite-landing__error-text'>行程不存在或已过期</Text>
        </View>
      </View>
    )
  }

  return (
    <View className='invite-landing'>
      <View className='invite-landing__header'>
        <Text className='invite-landing__logo'>🌟</Text>
        <Text className='invite-landing__app-name'>TripCircle</Text>
      </View>

      <View className='invite-landing__card'>
        <View className='invite-landing__card-tag'>
          <Text className='invite-landing__card-tag-text'>{getTripTypeLabel(trip.type)}</Text>
        </View>
        <Text className='invite-landing__card-title'>{trip.title}</Text>
        <View className='invite-landing__card-info'>
          <Text className='invite-landing__card-icon'>📅</Text>
          <Text className='invite-landing__card-text'>
            {getSmartDate(trip.startTime)} {getDayOfWeek(trip.startTime)}
          </Text>
        </View>
        {trip.locationName && (
          <View className='invite-landing__card-info'>
            <Text className='invite-landing__card-icon'>📍</Text>
            <Text className='invite-landing__card-text'>{trip.locationName}</Text>
          </View>
        )}
        <View className='invite-landing__card-info'>
          <Text className='invite-landing__card-icon'>💰</Text>
          <Text className='invite-landing__card-text'>
            {getCostTypeLabel(trip.costType, trip.estimatedCost)}
          </Text>
        </View>
        <View className='invite-landing__card-footer'>
          <View className='invite-landing__card-creator'>
            <UserAvatar
              userId={trip.creator.id}
              nickname={trip.creator.nickname}
              avatarUrl={trip.creator.avatarUrl}
              size='small'
            />
            <Text className='invite-landing__card-creator-name'>{trip.creator.nickname}</Text>
          </View>
          <Text className='invite-landing__card-participants'>
            {trip.participantCount}人已参加
          </Text>
        </View>
      </View>

      <View className='invite-landing__actions'>
        {isLoggedIn ? (
          <View className='invite-landing__btn' onClick={handleJoin}>
            <Text className='invite-landing__btn-text'>查看详情并参加</Text>
          </View>
        ) : (
          <>
            <View className='invite-landing__btn' onClick={() => requireLogin()}>
              <Text className='invite-landing__btn-text'>登录后参加</Text>
            </View>
            <View className='invite-landing__btn invite-landing__btn--secondary' onClick={handleJoin}>
              <Text className='invite-landing__btn-text'>先看看详情</Text>
            </View>
          </>
        )}
      </View>
    </View>
  )
}
