import { View, Text, ScrollView } from '@tarojs/components'
import { useState } from 'react'
import { UserAvatar } from '../../components'
import './index.scss'

export default function YearInReview() {
  const [year] = useState(2026)

  const stats = {
    totalTrips: 28,
    completedTrips: 24,
    totalParticipants: 156,
    uniqueFriends: 42,
    topTripType: '旅行',
    topLocation: '成都',
    favoriteActivity: '徒步',
    longestTrip: '7天川西自驾',
    busiestMonth: '10月',
  }

  const highlights = [
    { month: '1月', trip: '元旦露营', participants: 8 },
    { month: '3月', trip: '春日骑行', participants: 12 },
    { month: '5月', trip: '五一徒步', participants: 15 },
    { month: '7月', trip: '川西自驾', participants: 6 },
    { month: '10月', trip: '国庆露营', participants: 20 },
    { month: '12月', trip: '年末聚餐', participants: 25 },
  ]

  const topFriends = [
    { id: 'user_2', nickname: '小红', tripCount: 15 },
    { id: 'user_3', nickname: '小刚', tripCount: 12 },
    { id: 'user_4', nickname: '小李', tripCount: 10 },
    { id: 'user_5', nickname: '小王', tripCount: 8 },
    { id: 'user_6', nickname: '小张', tripCount: 7 },
  ]

  return (
    <View className='year-in-review'>
      <View className='year-in-review__header'>
        <Text className='year-in-review__year'>{year}</Text>
        <Text className='year-in-review__title'>年度行程回顾</Text>
        <Text className='year-in-review__subtitle'>记录每一次美好相聚</Text>
      </View>

      <ScrollView className='year-in-review__scroll' scrollY>
        <View className='year-in-review__stats'>
          <View className='year-in-review__stat'>
            <Text className='year-in-review__stat-value'>{stats.totalTrips}</Text>
            <Text className='year-in-review__stat-label'>发起行程</Text>
          </View>
          <View className='year-in-review__stat'>
            <Text className='year-in-review__stat-value'>{stats.completedTrips}</Text>
            <Text className='year-in-review__stat-label'>完成行程</Text>
          </View>
          <View className='year-in-review__stat'>
            <Text className='year-in-review__stat-value'>{stats.totalParticipants}</Text>
            <Text className='year-in-review__stat-label'>参与人次</Text>
          </View>
          <View className='year-in-review__stat'>
            <Text className='year-in-review__stat-value'>{stats.uniqueFriends}</Text>
            <Text className='year-in-review__stat-label'>同行好友</Text>
          </View>
        </View>

        <View className='year-in-review__section'>
          <Text className='year-in-review__section-title'>你的年度标签</Text>
          <View className='year-in-review__tags'>
            <View className='year-in-review__tag'>
              <Text className='year-in-review__tag-icon'>🏔️</Text>
              <Text className='year-in-review__tag-text'>{stats.topTripType}达人</Text>
            </View>
            <View className='year-in-review__tag'>
              <Text className='year-in-review__tag-icon'>📍</Text>
              <Text className='year-in-review__tag-text'>{stats.topLocation}常客</Text>
            </View>
            <View className='year-in-review__tag'>
              <Text className='year-in-review__tag-icon'>⭐</Text>
              <Text className='year-in-review__tag-text'>{stats.favoriteActivity}爱好者</Text>
            </View>
          </View>
        </View>

        <View className='year-in-review__section'>
          <Text className='year-in-review__section-title'>精彩瞬间</Text>
          <View className='year-in-review__highlights'>
            {highlights.map((h) => (
              <View key={h.month} className='year-in-review__highlight'>
                <Text className='year-in-review__highlight-month'>{h.month}</Text>
                <Text className='year-in-review__highlight-trip'>{h.trip}</Text>
                <Text className='year-in-review__highlight-participants'>{h.participants}人参加</Text>
              </View>
            ))}
          </View>
        </View>

        <View className='year-in-review__section'>
          <Text className='year-in-review__section-title'>最佳旅伴</Text>
          <View className='year-in-review__friends'>
            {topFriends.map((f, index) => (
              <View key={f.id} className='year-in-review__friend'>
                <Text className='year-in-review__friend-rank'>#{index + 1}</Text>
                <UserAvatar userId={f.id} nickname={f.nickname} size='medium' />
                <Text className='year-in-review__friend-name'>{f.nickname}</Text>
                <Text className='year-in-review__friend-count'>同行{f.tripCount}次</Text>
              </View>
            ))}
          </View>
        </View>

        <View className='year-in-review__section'>
          <Text className='year-in-review__section-title'>趣闻数据</Text>
          <View className='year-in-review__fun-stats'>
            <View className='year-in-review__fun-stat'>
              <Text className='year-in-review__fun-stat-icon'>🏆</Text>
              <Text className='year-in-review__fun-stat-text'>最长行程：{stats.longestTrip}</Text>
            </View>
            <View className='year-in-review__fun-stat'>
              <Text className='year-in-review__fun-stat-icon'>📅</Text>
              <Text className='year-in-review__fun-stat-text'>最忙碌月份：{stats.busiestMonth}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
