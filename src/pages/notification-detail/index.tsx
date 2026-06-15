import { View, Text } from '@tarojs/components'
import { useLoad, useRouter } from '@tarojs/taro'
import { useState } from 'react'
import { LoadingView, EmptyState } from '../../components'
import { platformService } from '../../platform'
import { formatDateTime } from '../../utils/date'
import './index.scss'

interface NotificationDetail {
  id: string
  type: string
  title: string
  content: string
  createdAt: string
  relatedId?: string
}

export default function NotificationDetail() {
  const router = useRouter()
  const [notification, setNotification] = useState<NotificationDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useLoad(() => {
    const id = router.params.id
    if (id) {
      setTimeout(() => {
        setNotification({
          id,
          type: 'trip_invite',
          title: '行程邀请',
          content: '小红邀请你参加「周五晚聚餐 - 火锅」\n\n时间：周五 19:00\n地点：小龙坎火锅(春熙路店)\n费用：AA 约120元/人\n\n已有4人参加，快来确认吧！',
          createdAt: '2026-06-08T10:00:00Z',
          relatedId: 'trip_2',
        })
        setIsLoading(false)
      }, 500)
    }
  })

  const handleViewRelated = () => {
    if (notification?.relatedId) {
      platformService.navigateTo('/pages/trip-detail/index?id=' + notification.relatedId)
    }
  }

  if (isLoading) {
    return <LoadingView text='加载中...' />
  }

  if (!notification) {
    return (
      <EmptyState
        icon='😅'
        title='通知不存在'
        description=''
        actionText='返回'
        onAction={() => platformService.navigateBack()}
      />
    )
  }

  return (
    <View className='notification-detail'>
      <View className='notification-detail__header'>
        <Text className='notification-detail__title'>{notification.title}</Text>
      </View>

      <View className='notification-detail__content'>
        <View className='notification-detail__meta'>
          <Text className='notification-detail__time'>{formatDateTime(notification.createdAt)}</Text>
        </View>
        <Text className='notification-detail__text'>{notification.content}</Text>
      </View>

      {notification.relatedId && (
        <View className='notification-detail__action' onClick={handleViewRelated}>
          <Text className='notification-detail__action-text'>查看详情</Text>
        </View>
      )}
    </View>
  )
}
