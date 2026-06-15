import { View, Text, ScrollView } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import { useCallback } from 'react'
import { EmptyState, LoadingView } from '../../components'
import { useNotificationStore } from '../../stores'
import { platformService } from '../../platform'
import './index.scss'

export default function Messages() {
  const { notifications, isLoading, fetchNotifications, markAsRead } = useNotificationStore()

  useLoad(() => {
    fetchNotifications(true)
  })

  const handleNotificationClick = useCallback((notificationId: string, relatedId?: string) => {
    markAsRead(notificationId)
    if (relatedId) {
      platformService.navigateTo('/pages/notification-detail/index?id=' + notificationId)
    }
  }, [markAsRead])

  function getMessageIcon(type: string): string {
    const iconMap: Record<string, string> = {
      friend_request: '👋',
      trip_invite: '🎫',
      trip_update: '📝',
      comment: '💬',
      system: '📢',
    }
    return iconMap[type] || '📩'
  }

  if (isLoading) {
    return <LoadingView text='加载消息...' />
  }

  return (
    <View className='messages'>
      <View className='messages__header'>
        <Text className='messages__title'>消息</Text>
      </View>

      <ScrollView className='messages__scroll' scrollY>
        {notifications.length === 0 ? (
          <EmptyState
            icon='📭'
            title='暂无消息'
            description='当有新的邀请、评论或通知时，会在这里显示'
          />
        ) : (
          <View className='messages__list'>
            {notifications.map((notif) => (
              <View
                key={notif.id}
                className={`messages__item ${!notif.read ? 'messages__item--unread' : ''}`}
                onClick={() => handleNotificationClick(notif.id, notif.relatedId)}
              >
                <View className='messages__icon'>
                  <Text className='messages__icon-text'>{getMessageIcon(notif.type)}</Text>
                </View>
                <View className='messages__content'>
                  <View className='messages__content-header'>
                    <Text className='messages__content-title'>{notif.title}</Text>
                    <Text className='messages__content-time'>{new Date(notif.createdAt).toLocaleDateString()}</Text>
                  </View>
                  <Text className='messages__content-text'>{notif.content}</Text>
                </View>
                {!notif.read && <View className='messages__unread-dot' />}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}
