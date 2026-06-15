import { View, Text, ScrollView } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import { useState, useCallback } from 'react'
import { UserAvatar, EmptyState, LoadingView } from '../../components'
import { useFriendStore } from '../../stores'
import { platformService } from '../../platform'
import './index.scss'

interface FrequentFriend {
  id: string
  nickname: string
  avatarUrl?: string
  tripCount: number
  lastTripDate: string
  isPinned: boolean
}

export default function FrequentFriends() {
  const { fetchFriends } = useFriendStore()
  const [frequentFriends, setFrequentFriends] = useState<FrequentFriend[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useLoad(() => {
    fetchFriends().then(() => {
      setTimeout(() => {
        setFrequentFriends([
          { id: 'user_2', nickname: '小红', tripCount: 15, lastTripDate: '2026-06-08', isPinned: true },
          { id: 'user_3', nickname: '小刚', tripCount: 12, lastTripDate: '2026-06-07', isPinned: true },
          { id: 'user_4', nickname: '小李', tripCount: 10, lastTripDate: '2026-06-05', isPinned: false },
          { id: 'user_5', nickname: '小王', tripCount: 8, lastTripDate: '2026-06-03', isPinned: false },
          { id: 'user_6', nickname: '小张', tripCount: 7, lastTripDate: '2026-06-01', isPinned: false },
        ])
        setIsLoading(false)
      }, 500)
    })
  })

  const handlePin = useCallback((friendId: string) => {
    setFrequentFriends((prev) =>
      prev.map((f) => (f.id === friendId ? { ...f, isPinned: !f.isPinned } : f))
    )
    platformService.showToast({ title: '已更新置顶', icon: 'success' })
  }, [])

  const handleInvite = useCallback((_friendId: string) => {
    platformService.navigateTo('/pages/share-invite/index')
  }, [])

  const sortedFriends = [...frequentFriends].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    return b.tripCount - a.tripCount
  })

  if (isLoading) {
    return <LoadingView text='加载常约朋友...' />
  }

  return (
    <View className='frequent-friends'>
      <View className='frequent-friends__header'>
        <Text className='frequent-friends__title'>常约朋友</Text>
        <Text className='frequent-friends__subtitle'>根据互动频率自动排序</Text>
      </View>

      <ScrollView className='frequent-friends__scroll' scrollY>
        {sortedFriends.length === 0 ? (
          <EmptyState
            icon='👥'
            title='暂无常约朋友'
            description='多和朋友一起参加行程，会自动出现在这里'
          />
        ) : (
          <View className='frequent-friends__list'>
            {sortedFriends.map((friend, index) => (
              <View key={friend.id} className='frequent-friends__item'>
                <View className='frequent-friends__rank'>
                  <Text className='frequent-friends__rank-text'>#{index + 1}</Text>
                </View>
                <UserAvatar
                  userId={friend.id}
                  nickname={friend.nickname}
                  avatarUrl={friend.avatarUrl}
                  size='medium'
                />
                <View className='frequent-friends__info'>
                  <View className='frequent-friends__name-row'>
                    <Text className='frequent-friends__name'>{friend.nickname}</Text>
                    {friend.isPinned && (
                      <View className='frequent-friends__pin'>
                        <Text className='frequent-friends__pin-text'>📌</Text>
                      </View>
                    )}
                  </View>
                  <Text className='frequent-friends__stats'>
                    一起参加 {friend.tripCount} 次行程
                  </Text>
                  <Text className='frequent-friends__last'>
                    最近：{new Date(friend.lastTripDate).toLocaleDateString()}
                  </Text>
                </View>
                <View className='frequent-friends__actions'>
                  <View
                    className='frequent-friends__action'
                    onClick={() => handlePin(friend.id)}
                  >
                    <Text className='frequent-friends__action-text'>
                      {friend.isPinned ? '取消置顶' : '置顶'}
                    </Text>
                  </View>
                  <View
                    className='frequent-friends__action frequent-friends__action--primary'
                    onClick={() => handleInvite(friend.id)}
                  >
                    <Text className='frequent-friends__action-text'>邀请</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}
