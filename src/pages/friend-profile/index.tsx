import { View, Text, ScrollView } from '@tarojs/components'
import { useLoad, useRouter } from '@tarojs/taro'
import { useState, useCallback } from 'react'
import { UserAvatar, TripCard, EmptyState, LoadingView } from '../../components'
import { useFriendStore } from '../../stores'
import { platformService } from '../../platform'
import type { TripWithCreator } from '../../types'
import './index.scss'

interface FriendProfile {
  id: string
  nickname: string
  avatarUrl?: string
  bio?: string
  city?: string
  interests: string[]
  friendCount: number
  tripCount: number
  isFriend: boolean
}

export default function FriendProfile() {
  const router = useRouter()
  const { sendRequest } = useFriendStore()
  const [profile, setProfile] = useState<FriendProfile | null>(null)
  const [trips, setTrips] = useState<TripWithCreator[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'created' | 'joined'>('created')

  useLoad(() => {
    const userId = router.params.id
    if (userId) {
      setTimeout(() => {
        setProfile({
          id: userId,
          nickname: '小明',
          bio: '热爱生活，喜欢户外活动',
          city: '成都',
          interests: ['徒步', '露营', '摄影'],
          friendCount: 42,
          tripCount: 15,
          isFriend: true,
        })
        setTrips([])
        setIsLoading(false)
      }, 500)
    }
  })

  const handleAddFriend = useCallback(async () => {
    if (!profile) return
    await sendRequest(profile.id)
    platformService.showToast({ title: '好友申请已发送', icon: 'success' })
  }, [profile, sendRequest])

  const handleMessage = useCallback(() => {
    platformService.navigateTo('/pages/trip-chat/index')
  }, [])

  if (isLoading) {
    return <LoadingView text='加载中...' />
  }

  if (!profile) {
    return (
      <EmptyState
        icon='😅'
        title='用户不存在'
        description=''
        actionText='返回'
        onAction={() => platformService.navigateBack()}
      />
    )
  }

  return (
    <View className='friend-profile'>
      <ScrollView className='friend-profile__scroll' scrollY>
        <View className='friend-profile__header'>
          <UserAvatar
            userId={profile.id}
            nickname={profile.nickname}
            avatarUrl={profile.avatarUrl}
            size='large'
          />
          <Text className='friend-profile__name'>{profile.nickname}</Text>
          {profile.bio && (
            <Text className='friend-profile__bio'>{profile.bio}</Text>
          )}
          {profile.city && (
            <Text className='friend-profile__city'>📍 {profile.city}</Text>
          )}
          {profile.interests.length > 0 && (
            <View className='friend-profile__interests'>
              {profile.interests.map((interest) => (
                <View key={interest} className='friend-profile__interest'>
                  <Text className='friend-profile__interest-text'>{interest}</Text>
                </View>
              ))}
            </View>
          )}
          <View className='friend-profile__stats'>
            <View className='friend-profile__stat'>
              <Text className='friend-profile__stat-value'>{profile.friendCount}</Text>
              <Text className='friend-profile__stat-label'>好友</Text>
            </View>
            <View className='friend-profile__stat'>
              <Text className='friend-profile__stat-value'>{profile.tripCount}</Text>
              <Text className='friend-profile__stat-label'>行程</Text>
            </View>
          </View>
          <View className='friend-profile__actions'>
            {profile.isFriend ? (
              <View className='friend-profile__action' onClick={handleMessage}>
                <Text className='friend-profile__action-text'>发消息</Text>
              </View>
            ) : (
              <View className='friend-profile__action friend-profile__action--primary' onClick={handleAddFriend}>
                <Text className='friend-profile__action-text'>添加好友</Text>
              </View>
            )}
          </View>
        </View>

        <View className='friend-profile__tabs'>
          <View
            className={`friend-profile__tab ${activeTab === 'created' ? 'friend-profile__tab--active' : ''}`}
            onClick={() => setActiveTab('created')}
          >
            <Text className='friend-profile__tab-text'>发起的行程</Text>
          </View>
          <View
            className={`friend-profile__tab ${activeTab === 'joined' ? 'friend-profile__tab--active' : ''}`}
            onClick={() => setActiveTab('joined')}
          >
            <Text className='friend-profile__tab-text'>参与的行程</Text>
          </View>
        </View>

        <View className='friend-profile__trips'>
          {trips.length === 0 ? (
            <EmptyState
              icon='📝'
              title={activeTab === 'created' ? '还没有发起过行程' : '还没有参与过行程'}
              description=''
            />
          ) : (
            trips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onClick={(t) => platformService.navigateTo(`/pages/trip-detail/index?id=${t.id}`)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  )
}
