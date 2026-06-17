import { View, Text, ScrollView } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import { UserAvatar, LoadingView } from '../../components'
import { statsService } from '../../services/stats.service'
import { platformService } from '../../platform'
import type { YearReviewData } from '../../services/stats.service'
import './index.scss'

export default function YearInReview() {
  const [year] = useState(new Date().getFullYear())
  const [data, setData] = useState<YearReviewData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useLoad(() => {
    statsService.getYearReview(year)
      .then((result) => {
        setData(result)
        setIsLoading(false)
      })
      .catch(() => {
        platformService.showToast({ title: '加载失败', icon: 'error' })
        setIsLoading(false)
      })
  })

  if (isLoading) {
    return <LoadingView text='生成年度回顾...' />
  }

  if (!data) {
    return (
      <View className='year-in-review'>
        <View className='year-in-review__header'>
          <Text className='year-in-review__year'>{year}</Text>
          <Text className='year-in-review__title'>年度行程回顾</Text>
          <Text className='year-in-review__subtitle'>暂无数据，多参加行程来生成你的年度回顾吧！</Text>
        </View>
      </View>
    )
  }

  return (
    <View className='year-in-review'>
      <View className='year-in-review__header'>
        <Text className='year-in-review__year'>{data.year}</Text>
        <Text className='year-in-review__title'>年度行程回顾</Text>
        <Text className='year-in-review__subtitle'>记录每一次美好相聚</Text>
      </View>

      <ScrollView className='year-in-review__scroll' scrollY>
        <View className='year-in-review__stats'>
          <View className='year-in-review__stat'>
            <Text className='year-in-review__stat-value'>{data.stats.totalTrips}</Text>
            <Text className='year-in-review__stat-label'>发起行程</Text>
          </View>
          <View className='year-in-review__stat'>
            <Text className='year-in-review__stat-value'>{data.stats.completedTrips}</Text>
            <Text className='year-in-review__stat-label'>完成行程</Text>
          </View>
          <View className='year-in-review__stat'>
            <Text className='year-in-review__stat-value'>{data.stats.totalParticipants}</Text>
            <Text className='year-in-review__stat-label'>参与人次</Text>
          </View>
          <View className='year-in-review__stat'>
            <Text className='year-in-review__stat-value'>{data.stats.uniqueFriends}</Text>
            <Text className='year-in-review__stat-label'>同行好友</Text>
          </View>
        </View>

        {data.stats.topTripType && (
          <View className='year-in-review__section'>
            <Text className='year-in-review__section-title'>你的年度标签</Text>
            <View className='year-in-review__tags'>
              <View className='year-in-review__tag'>
                <Text className='year-in-review__tag-icon'>🏔️</Text>
                <Text className='year-in-review__tag-text'>{data.stats.topTripType}达人</Text>
              </View>
              {data.stats.topLocation && (
                <View className='year-in-review__tag'>
                  <Text className='year-in-review__tag-icon'>📍</Text>
                  <Text className='year-in-review__tag-text'>{data.stats.topLocation}常客</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {data.highlights.length > 0 && (
          <View className='year-in-review__section'>
            <Text className='year-in-review__section-title'>精彩瞬间</Text>
            <View className='year-in-review__highlights'>
              {data.highlights.map((h) => (
                <View key={h.month} className='year-in-review__highlight'>
                  <Text className='year-in-review__highlight-month'>{h.month}</Text>
                  <Text className='year-in-review__highlight-trip'>{h.trip}</Text>
                  <Text className='year-in-review__highlight-participants'>{h.participants}人参加</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {data.topFriends.length > 0 && (
          <View className='year-in-review__section'>
            <Text className='year-in-review__section-title'>最佳旅伴</Text>
            <View className='year-in-review__friends'>
              {data.topFriends.map((f, index) => (
                <View key={f.id} className='year-in-review__friend'>
                  <Text className='year-in-review__friend-rank'>#{index + 1}</Text>
                  <UserAvatar userId={f.id} nickname={f.nickname} size='medium' />
                  <Text className='year-in-review__friend-name'>{f.nickname}</Text>
                  <Text className='year-in-review__friend-count'>同行{f.tripCount}次</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View className='year-in-review__section'>
          <Text className='year-in-review__section-title'>趣闻数据</Text>
          <View className='year-in-review__fun-stats'>
            {data.stats.longestTrip && (
              <View className='year-in-review__fun-stat'>
                <Text className='year-in-review__fun-stat-icon'>🏆</Text>
                <Text className='year-in-review__fun-stat-text'>最长行程：{data.stats.longestTrip}</Text>
              </View>
            )}
            {data.stats.busiestMonth && (
              <View className='year-in-review__fun-stat'>
                <Text className='year-in-review__fun-stat-icon'>📅</Text>
                <Text className='year-in-review__fun-stat-text'>最忙碌月份：{data.stats.busiestMonth}</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
