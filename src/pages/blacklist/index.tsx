import { View, Text, ScrollView } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import { useState, useCallback } from 'react'
import { UserAvatar, EmptyState, LoadingView } from '../../components'
import { useFriendStore } from '../../stores'
import { platformService } from '../../platform'
import './index.scss'

export default function Blacklist() {
  const { isLoading, fetchBlockedUsers, unblockUser } = useFriendStore()
  const [blockedUsers, setBlockedUsers] = useState<Array<{ id: string; nickname: string; avatarUrl?: string }>>([])

  useLoad(() => {
    fetchBlockedUsers().then(() => {
      const storeFriends = useFriendStore.getState().friends
      setBlockedUsers(storeFriends.map((f) => ({ id: f.friendId, nickname: f.friend.nickname, avatarUrl: f.friend.avatarUrl })))
    })
  })

  const handleUnblock = useCallback(async (userId: string) => {
    const confirmed = await platformService.showModal({
      title: '取消屏蔽',
      content: '确定取消屏蔽这个用户吗？取消后对方可以重新向你发送好友申请。',
    })
    if (confirmed) {
      await unblockUser(userId)
      setBlockedUsers((prev) => prev.filter((u) => u.id !== userId))
      platformService.showToast({ title: '已取消屏蔽', icon: 'success' })
    }
  }, [unblockUser])

  if (isLoading) {
    return <LoadingView text='加载黑名单...' />
  }

  return (
    <View className='blacklist'>
      <View className='blacklist__header'>
        <Text className='blacklist__title'>黑名单</Text>
        <Text className='blacklist__count'>{blockedUsers.length}人</Text>
      </View>

      <ScrollView className='blacklist__scroll' scrollY>
        {blockedUsers.length === 0 ? (
          <EmptyState
            icon='✅'
            title='暂无屏蔽用户'
            description='你还没有屏蔽任何用户'
          />
        ) : (
          <View className='blacklist__list'>
            {blockedUsers.map((user) => (
              <View key={user.id} className='blacklist__item'>
                <UserAvatar
                  userId={user.id}
                  nickname={user.nickname}
                  avatarUrl={user.avatarUrl}
                  size='medium'
                />
                <View className='blacklist__info'>
                  <Text className='blacklist__name'>{user.nickname}</Text>
                  <Text className='blacklist__time'>已屏蔽</Text>
                </View>
                <View
                  className='blacklist__unblock-btn'
                  onClick={() => handleUnblock(user.id)}
                >
                  <Text className='blacklist__unblock-text'>取消屏蔽</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}
