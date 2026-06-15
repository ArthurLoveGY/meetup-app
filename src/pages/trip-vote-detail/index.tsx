import { View, Text, ScrollView } from '@tarojs/components'
import { useLoad, useRouter } from '@tarojs/taro'
import { useState, useCallback } from 'react'
import { UserAvatar, LoadingView, EmptyState } from '../../components'
import { platformService } from '../../platform'
import './index.scss'

interface VoteOption {
  id: string
  text: string
  votes: Array<{ userId: string; nickname: string }>
}

interface VoteDetail {
  id: string
  tripId: string
  title: string
  type: 'date' | 'location' | 'restaurant' | 'budget' | 'custom'
  description: string
  options: VoteOption[]
  createdBy: { id: string; nickname: string }
  createdAt: string
  deadline?: string
  isActive: boolean
}

export default function TripVoteDetail() {
  const router = useRouter()
  const [vote, setVote] = useState<VoteDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  useLoad(() => {
    const voteId = router.params.id
    if (voteId) {
      setTimeout(() => {
        setVote({
          id: voteId,
          tripId: 'trip_1',
          title: '选择聚餐日期',
          type: 'date',
          description: '请大家投票选择最方便的日期',
          options: [
            { id: 'opt_1', text: '周五晚上', votes: [{ userId: 'user_1', nickname: '小明' }, { userId: 'user_2', nickname: '小红' }] },
            { id: 'opt_2', text: '周六中午', votes: [{ userId: 'user_3', nickname: '小刚' }] },
            { id: 'opt_3', text: '周日晚上', votes: [] },
          ],
          createdBy: { id: 'user_1', nickname: '小明' },
          createdAt: '2026-06-08T10:00:00Z',
          deadline: '2026-06-10T18:00:00Z',
          isActive: true,
        })
        setIsLoading(false)
      }, 500)
    }
  })

  const handleVote = useCallback((optionId: string) => {
    setSelectedOption(optionId)
    platformService.showToast({ title: '投票成功', icon: 'success' })
  }, [])

  const getVoteTypeIcon = (type: string): string => {
    const iconMap: Record<string, string> = { date: '📅', location: '📍', restaurant: '🍜', budget: '💰', custom: '📊' }
    return iconMap[type] || '📊'
  }

  if (isLoading) {
    return <LoadingView text='加载投票...' />
  }

  if (!vote) {
    return (
      <EmptyState
        icon='😅'
        title='投票不存在'
        description=''
        actionText='返回'
        onAction={() => platformService.navigateBack()}
      />
    )
  }

  const totalVotes = vote.options.reduce((sum, opt) => sum + opt.votes.length, 0)

  return (
    <View className='trip-vote-detail'>
      <View className='trip-vote-detail__header'>
        <Text className='trip-vote-detail__title'>{vote.title}</Text>
        <View className='trip-vote-detail__status'>
          <Text className='trip-vote-detail__status-text'>
            {vote.isActive ? '进行中' : '已结束'}
          </Text>
        </View>
      </View>

      <ScrollView className='trip-vote-detail__scroll' scrollY>
        <View className='trip-vote-detail__info'>
          <View className='trip-vote-detail__meta'>
            <Text className='trip-vote-detail__icon'>{getVoteTypeIcon(vote.type)}</Text>
            <View className='trip-vote-detail__meta-content'>
              <Text className='trip-vote-detail__creator'>发起人：{vote.createdBy.nickname}</Text>
              <Text className='trip-vote-detail__time'>发起时间：{new Date(vote.createdAt).toLocaleDateString()}</Text>
              {vote.deadline && (
                <Text className='trip-vote-detail__deadline'>截止时间：{new Date(vote.deadline).toLocaleDateString()}</Text>
              )}
            </View>
          </View>
          {vote.description && (
            <Text className='trip-vote-detail__desc'>{vote.description}</Text>
          )}
          <Text className='trip-vote-detail__total'>共 {totalVotes} 人投票</Text>
        </View>

        <View className='trip-vote-detail__options'>
          {vote.options.map((option) => {
            const isSelected = selectedOption === option.id
            const percentage = totalVotes > 0 ? Math.round((option.votes.length / totalVotes) * 100) : 0

            return (
              <View
                key={option.id}
                className={`trip-vote-detail__option ${isSelected ? 'trip-vote-detail__option--selected' : ''}`}
                onClick={() => vote.isActive && handleVote(option.id)}
              >
                <View className='trip-vote-detail__option-header'>
                  <Text className='trip-vote-detail__option-text'>{option.text}</Text>
                  <Text className='trip-vote-detail__option-count'>{option.votes.length}票 ({percentage}%)</Text>
                </View>
                <View className='trip-vote-detail__option-bar'>
                  <View
                    className='trip-vote-detail__option-bar-fill'
                    style={{ width: `${percentage}%` }}
                  />
                </View>
                <View className='trip-vote-detail__option-voters'>
                  {option.votes.map((v) => (
                    <View key={v.userId} className='trip-vote-detail__voter'>
                      <UserAvatar userId={v.userId} nickname={v.nickname} size='mini' />
                      <Text className='trip-vote-detail__voter-name'>{v.nickname}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )
          })}
        </View>
      </ScrollView>
    </View>
  )
}
