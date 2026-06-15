import { View, Text, ScrollView } from '@tarojs/components'
import { useLoad, useRouter } from '@tarojs/taro'
import { useState } from 'react'
import { UserAvatar, ParticipantStatusBadge, LoadingView, EmptyState } from '../../components'
import { useTripStore } from '../../stores'
import { platformService } from '../../platform'
import './index.scss'

export default function TripParticipants() {
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

  const participants = currentTrip?.participants || []

  if (isLoading) {
    return <LoadingView text='加载参与者...' />
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

  return (
    <View className='trip-participants'>
      <View className='trip-participants__header'>
        <Text className='trip-participants__title'>参与者</Text>
        <Text className='trip-participants__count'>{participants.length}人</Text>
      </View>

      <ScrollView className='trip-participants__scroll' scrollY>
        <View className='trip-participants__list'>
          {participants.map((p) => (
            <View key={p.id} className='trip-participants__item'>
              <UserAvatar
                userId={p.id}
                nickname={p.nickname}
                avatarUrl={p.avatarUrl}
                size='medium'
              />
              <View className='trip-participants__info'>
                <Text className='trip-participants__name'>{p.nickname}</Text>
              </View>
              <ParticipantStatusBadge status={p.status} />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}
