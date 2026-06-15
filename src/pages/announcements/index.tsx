import { View, Text, ScrollView } from '@tarojs/components'
import { useState } from 'react'
import { EmptyState } from '../../components'
import { formatRelativeTime } from '../../utils/date'
import './index.scss'

interface Announcement {
  id: string
  title: string
  content: string
  createdAt: string
}

export default function Announcements() {
  const [announcements] = useState<Announcement[]>([
    {
      id: 'ann_1',
      title: 'TripCircle v0.2 发布',
      content: '新增好友系统、参与者管理、分享邀请等功能。感谢大家的反馈！',
      createdAt: '2026-06-08T10:00:00Z',
    },
    {
      id: 'ann_2',
      title: '端午节活动推荐',
      content: '端午节快到了，快约上好友一起去露营、徒步或聚餐吧！',
      createdAt: '2026-06-05T10:00:00Z',
    },
  ])

  return (
    <View className='announcements'>
      <View className='announcements__header'>
        <Text className='announcements__title'>系统公告</Text>
      </View>

      <ScrollView className='announcements__scroll' scrollY>
        {announcements.length === 0 ? (
          <EmptyState
            icon='📢'
            title='暂无公告'
            description='系统公告会在这里显示'
          />
        ) : (
          <View className='announcements__list'>
            {announcements.map((ann) => (
              <View key={ann.id} className='announcements__item'>
                <Text className='announcements__item-title'>{ann.title}</Text>
                <Text className='announcements__item-content'>{ann.content}</Text>
                <Text className='announcements__item-time'>{formatRelativeTime(ann.createdAt)}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}
