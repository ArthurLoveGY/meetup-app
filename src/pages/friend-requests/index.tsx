import { View, Text, ScrollView } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import { useCallback } from 'react'
import { UserAvatar, EmptyState, LoadingView } from '../../components'
import { useFriendStore } from '../../stores'
import { platformService } from '../../platform'
import { formatRelativeTime } from '../../utils/date'
import './index.scss'

export default function FriendRequests() {
  const { requests, isLoading, fetchRequests, acceptRequest, rejectRequest } = useFriendStore()

  useLoad(() => {
    fetchRequests()
  })

  const handleAccept = useCallback(async (requestId: string) => {
    await acceptRequest(requestId)
    platformService.showToast({ title: '已接受好友申请', icon: 'success' })
  }, [acceptRequest])

  const handleReject = useCallback(async (requestId: string) => {
    const confirmed = await platformService.showModal({
      title: '拒绝申请',
      content: '确定拒绝这个好友申请吗？',
    })
    if (confirmed) {
      await rejectRequest(requestId)
      platformService.showToast({ title: '已拒绝', icon: 'success' })
    }
  }, [rejectRequest])

  if (isLoading) {
    return <LoadingView text='加载好友申请...' />
  }

  const pendingRequests = requests.filter((r) => r.status === 'pending')

  return (
    <View className='friend-requests'>
      <View className='friend-requests__header'>
        <Text className='friend-requests__title'>好友申请</Text>
        <Text className='friend-requests__count'>{pendingRequests.length}条待处理</Text>
      </View>

      <ScrollView className='friend-requests__scroll' scrollY>
        {pendingRequests.length === 0 ? (
          <EmptyState
            icon='👋'
            title='暂无好友申请'
            description='当有人向你发送好友申请时，会在这里显示'
          />
        ) : (
          <View className='friend-requests__list'>
            {pendingRequests.map((request) => (
              <View key={request.id} className='friend-requests__item'>
                <UserAvatar
                  userId={request.fromUser.id}
                  nickname={request.fromUser.nickname}
                  avatarUrl={request.fromUser.avatarUrl}
                  size='medium'
                />
                <View className='friend-requests__info'>
                  <Text className='friend-requests__name'>{request.fromUser.nickname}</Text>
                  {request.message && (
                    <Text className='friend-requests__message'>{request.message}</Text>
                  )}
                  <Text className='friend-requests__time'>{formatRelativeTime(request.createdAt)}</Text>
                </View>
                <View className='friend-requests__actions'>
                  <View
                    className='friend-requests__btn friend-requests__btn--accept'
                    onClick={() => handleAccept(request.id)}
                  >
                    <Text className='friend-requests__btn-text'>接受</Text>
                  </View>
                  <View
                    className='friend-requests__btn friend-requests__btn--reject'
                    onClick={() => handleReject(request.id)}
                  >
                    <Text className='friend-requests__btn-text'>拒绝</Text>
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
