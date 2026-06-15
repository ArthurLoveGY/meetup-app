import { View, Text, ScrollView } from '@tarojs/components'
import { useState } from 'react'
import './index.scss'

export default function AdminStats() {
  const [stats] = useState({
    users: { total: 1250, newToday: 25, activeToday: 380 },
    trips: { total: 856, published: 620, completed: 450 },
    participants: { total: 3200, avgPerTrip: 5.2 },
    comments: { total: 4500, today: 120 },
    shares: { total: 2800, today: 45 },
  })

  const [recentActivity] = useState([
    { id: '1', type: 'user_register', content: '新用户注册：小赵', time: '10分钟前' },
    { id: '2', type: 'trip_create', content: '新行程发布：周末徒步', time: '30分钟前' },
    { id: '3', type: 'trip_join', content: '小红参加了「周五聚餐」', time: '1小时前' },
    { id: '4', type: 'comment', content: '小刚评论了「青城山徒步」', time: '2小时前' },
  ])

  return (
    <View className='admin-stats'>
      <View className='admin-stats__header'>
        <Text className='admin-stats__title'>数据统计</Text>
      </View>

      <ScrollView className='admin-stats__scroll' scrollY>
        <View className='admin-stats__section'>
          <Text className='admin-stats__section-title'>用户数据</Text>
          <View className='admin-stats__cards'>
            <View className='admin-stats__card'>
              <Text className='admin-stats__card-value'>{stats.users.total}</Text>
              <Text className='admin-stats__card-label'>总用户数</Text>
            </View>
            <View className='admin-stats__card'>
              <Text className='admin-stats__card-value'>{stats.users.newToday}</Text>
              <Text className='admin-stats__card-label'>今日新增</Text>
            </View>
            <View className='admin-stats__card'>
              <Text className='admin-stats__card-value'>{stats.users.activeToday}</Text>
              <Text className='admin-stats__card-label'>今日活跃</Text>
            </View>
          </View>
        </View>

        <View className='admin-stats__section'>
          <Text className='admin-stats__section-title'>行程数据</Text>
          <View className='admin-stats__cards'>
            <View className='admin-stats__card'>
              <Text className='admin-stats__card-value'>{stats.trips.total}</Text>
              <Text className='admin-stats__card-label'>总行程数</Text>
            </View>
            <View className='admin-stats__card'>
              <Text className='admin-stats__card-value'>{stats.trips.published}</Text>
              <Text className='admin-stats__card-label'>进行中</Text>
            </View>
            <View className='admin-stats__card'>
              <Text className='admin-stats__card-value'>{stats.trips.completed}</Text>
              <Text className='admin-stats__card-label'>已完成</Text>
            </View>
          </View>
        </View>

        <View className='admin-stats__section'>
          <Text className='admin-stats__section-title'>互动数据</Text>
          <View className='admin-stats__cards'>
            <View className='admin-stats__card'>
              <Text className='admin-stats__card-value'>{stats.participants.total}</Text>
              <Text className='admin-stats__card-label'>总参与人次</Text>
            </View>
            <View className='admin-stats__card'>
              <Text className='admin-stats__card-value'>{stats.participants.avgPerTrip}</Text>
              <Text className='admin-stats__card-label'>平均参与人数</Text>
            </View>
            <View className='admin-stats__card'>
              <Text className='admin-stats__card-value'>{stats.comments.total}</Text>
              <Text className='admin-stats__card-label'>总评论数</Text>
            </View>
            <View className='admin-stats__card'>
              <Text className='admin-stats__card-value'>{stats.shares.total}</Text>
              <Text className='admin-stats__card-label'>总分享次数</Text>
            </View>
          </View>
        </View>

        <View className='admin-stats__section'>
          <Text className='admin-stats__section-title'>最近活动</Text>
          <View className='admin-stats__activities'>
            {recentActivity.map((activity) => (
              <View key={activity.id} className='admin-stats__activity'>
                <Text className='admin-stats__activity-content'>{activity.content}</Text>
                <Text className='admin-stats__activity-time'>{activity.time}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
