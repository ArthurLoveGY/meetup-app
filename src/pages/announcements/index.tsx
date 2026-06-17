import { View, Text, ScrollView } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import { EmptyState, LoadingView } from '../../components'
import { announcementService } from '../../services/announcement.service'
import { platformService } from '../../platform'
import { formatRelativeTime } from '../../utils/date'
import type { Announcement } from '../../services/announcement.service'
import './index.scss'

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useLoad(() => {
    announcementService.getAnnouncements(1, 50)
      .then((data) => {
        setAnnouncements(data.list || [])
        setIsLoading(false)
      })
      .catch(() => {
        platformService.showToast({ title: '加载失败', icon: 'error' })
        setIsLoading(false)
      })
  })

  if (isLoading) {
    return <LoadingView text='加载公告...' />
  }

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
                <View className='announcements__item-header'>
                  <Text className='announcements__item-title'>{ann.title}</Text>
                  {ann.type === 'update' && <Text className='announcements__item-badge'>更新</Text>}
                  {ann.type === 'event' && <Text className='announcements__item-badge'>活动</Text>}
                  {ann.type === 'maintenance' && <Text className='announcements__item-badge'>维护</Text>}
                </View>
                <Text className='announcements__item-content'>{ann.content}</Text>
                <Text className='announcements__item-time'>{formatRelativeTime(ann.publishedAt || ann.createdAt)}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}
