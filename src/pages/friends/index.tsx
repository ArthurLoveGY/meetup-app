import { View, Text, ScrollView } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import { useCallback } from 'react'
import { UserAvatar, EmptyState, LoadingView } from '../../components'
import { useFriendStore } from '../../stores'
import { platformService } from '../../platform'
import './index.scss'

export default function Friends() {
  const { friends, isLoading, fetchFriends } = useFriendStore()

  useLoad(() => {
    fetchFriends()
  })

  const handleAddFriend = useCallback(() => {
    platformService.navigateTo('/pages/add-friend/index')
  }, [])

  const handleFriendClick = useCallback((friendId: string) => {
    platformService.navigateTo('/pages/friend-profile/index?id=' + friendId)
  }, [])

  if (isLoading) {
    return <LoadingView text='加载好友列表...' />
  }

  return (
    <View className='friends'>
      <View className='friends__header'>
        <Text className='friends__title'>好友</Text>
        <View className='friends__add' onClick={handleAddFriend}>
          <Text className='friends__add-icon'>+</Text>
        </View>
      </View>

      <ScrollView className='friends__scroll' scrollY>
        {friends.length === 0 ? (
          <EmptyState
            icon='👋'
            title='还没有好友'
            description='添加好友后可以一起约行程'
            actionText='添加好友'
            onAction={handleAddFriend}
          />
        ) : (
          <View className='friends__list'>
            {friends.map((friend) => (
              <View
                key={friend.id}
                className='friends__item'
                onClick={() => handleFriendClick(friend.friendId)}
              >
                <UserAvatar
                  userId={friend.friendId}
                  nickname={friend.friend.nickname}
                  avatarUrl={friend.friend.avatarUrl}
                  size='medium'
                />
                <View className='friends__info'>
                  <Text className='friends__name'>{friend.friend.nickname}</Text>
                  {friend.friend.bio && (
                    <Text className='friends__bio'>{friend.friend.bio}</Text>
                  )}
                  {friend.friend.city && (
                    <Text className='friends__city'>📍 {friend.friend.city}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}
