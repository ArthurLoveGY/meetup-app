import { View, Text, ScrollView, Input } from '@tarojs/components'
import { useLoad, useRouter } from '@tarojs/taro'
import { useState, useCallback } from 'react'
import { UserAvatar, EmptyState, LoadingView } from '../../components'
import { useVoteStore, useAuthStore } from '../../stores'
import { platformService } from '../../platform'
import './index.scss'

export default function Vote() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { votes, isLoading, fetchVotes, vote, createVote, closeVote, deleteVote } = useVoteStore()
  const [selectedVotes, setSelectedVotes] = useState<Record<string, string>>({})
  const [showCreate, setShowCreate] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newOptions, setNewOptions] = useState(['', ''])

  useLoad(() => {
    const tripId = router.params.id
    if (tripId) {
      fetchVotes(tripId)
    }
  })

  const handleVote = useCallback((voteId: string, optionId: string) => {
    setSelectedVotes((prev) => ({ ...prev, [voteId]: optionId }))
    vote(voteId, optionId)
    platformService.showToast({ title: '投票成功', icon: 'success' })
  }, [vote])

  const handleCreateVote = useCallback(async () => {
    const tripId = router.params.id
    if (!tripId) return

    const validOptions = newOptions.filter((o) => o.trim())
    if (!newTitle.trim()) {
      platformService.showToast({ title: '请输入投票标题', icon: 'error' })
      return
    }
    if (validOptions.length < 2) {
      platformService.showToast({ title: '至少需要2个选项', icon: 'error' })
      return
    }

    await createVote(tripId, newTitle.trim(), 'custom', validOptions)
    platformService.showToast({ title: '投票已创建', icon: 'success' })
    setShowCreate(false)
    setNewTitle('')
    setNewOptions(['', ''])
  }, [router.params.id, newTitle, newOptions, createVote])

  const handleAddOption = useCallback(() => {
    if (newOptions.length < 6) {
      setNewOptions((prev) => [...prev, ''])
    }
  }, [newOptions.length])

  const handleRemoveOption = useCallback((index: number) => {
    if (newOptions.length > 2) {
      setNewOptions((prev) => prev.filter((_, i) => i !== index))
    }
  }, [newOptions.length])

  const handleCloseVote = useCallback(async (voteId: string) => {
    const confirmed = await platformService.showModal({
      title: '关闭投票',
      content: '关闭后将无法继续投票，确定关闭吗？',
    })
    if (confirmed) {
      await closeVote(voteId)
      platformService.showToast({ title: '投票已关闭', icon: 'success' })
    }
  }, [closeVote])

  const handleDeleteVote = useCallback(async (voteId: string) => {
    const confirmed = await platformService.showModal({
      title: '删除投票',
      content: '确定要删除这个投票吗？',
    })
    if (confirmed) {
      await deleteVote(voteId)
      platformService.showToast({ title: '已删除', icon: 'success' })
    }
  }, [deleteVote])

  const getVoteTypeIcon = (type: string): string => {
    const iconMap: Record<string, string> = {
      date: '📅',
      location: '📍',
      restaurant: '🍜',
      budget: '💰',
      custom: '📊',
    }
    return iconMap[type] || '📊'
  }

  if (isLoading) {
    return <LoadingView text='加载投票...' />
  }

  return (
    <View className='vote'>
      <View className='vote__header'>
        <Text className='vote__title'>投票</Text>
        <View className='vote__add' onClick={() => setShowCreate(true)}>
          <Text className='vote__add-text'>+ 发起</Text>
        </View>
      </View>

      <ScrollView className='vote__scroll' scrollY>
        {votes.length === 0 ? (
          <EmptyState
            icon='📊'
            title='暂无投票'
            description='发起一个投票来决定行程安排'
            actionText='发起投票'
            onAction={() => setShowCreate(true)}
          />
        ) : (
          <View className='vote__list'>
            {votes.map((v) => (
              <View key={v.id} className='vote__item'>
                <View className='vote__item-header'>
                  <Text className='vote__item-icon'>{getVoteTypeIcon(v.type)}</Text>
                  <Text className='vote__item-title'>{v.title}</Text>
                  {!v.isActive && (
                    <View className='vote__item-closed'>
                      <Text className='vote__item-closed-text'>已结束</Text>
                    </View>
                  )}
                </View>
                <View className='vote__options'>
                  {v.options.map((option) => {
                    const isSelected = selectedVotes[v.id] === option.id
                    const totalVotes = v.options.reduce((sum, o) => sum + o.votes.length, 0)
                    const percentage = totalVotes > 0 ? Math.round((option.votes.length / totalVotes) * 100) : 0

                    return (
                      <View
                        key={option.id}
                        className={`vote__option ${isSelected ? 'vote__option--selected' : ''}`}
                        onClick={() => v.isActive && handleVote(v.id, option.id)}
                      >
                        <View className='vote__option-content'>
                          <Text className='vote__option-text'>{option.text}</Text>
                          <Text className='vote__option-count'>{option.votes.length}票</Text>
                        </View>
                        <View className='vote__option-bar'>
                          <View
                            className='vote__option-bar-fill'
                            style={{ width: `${percentage}%` }}
                          />
                        </View>
                        <View className='vote__option-voters'>
                          {option.votes.slice(0, 3).map((voter) => (
                            <UserAvatar
                              key={voter.userId}
                              userId={voter.userId}
                              nickname={voter.nickname}
                              size='mini'
                            />
                          ))}
                        </View>
                      </View>
                    )
                  })}
                </View>
                {user?.id === v.createdBy.id && (
                  <View className='vote__item-actions'>
                    {v.isActive && (
                      <View className='vote__item-action' onClick={() => handleCloseVote(v.id)}>
                        <Text className='vote__item-action-text'>关闭投票</Text>
                      </View>
                    )}
                    <View className='vote__item-action vote__item-action--delete' onClick={() => handleDeleteVote(v.id)}>
                      <Text className='vote__item-action-text'>删除</Text>
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {showCreate && (
        <View className='vote__mask' onClick={() => setShowCreate(false)}>
          <View className='vote__create-modal' onClick={(e) => e.stopPropagation()}>
            <Text className='vote__create-title'>发起投票</Text>
            <View className='vote__create-field'>
              <Text className='vote__create-label'>标题</Text>
              <Input
                className='vote__create-input'
                placeholder='投票标题'
                value={newTitle}
                onInput={(e) => setNewTitle(e.detail.value)}
              />
            </View>
            <View className='vote__create-field'>
              <Text className='vote__create-label'>选项</Text>
              {newOptions.map((opt, index) => (
                <View key={index} className='vote__create-option-row'>
                  <Input
                    className='vote__create-input'
                    placeholder={`选项 ${index + 1}`}
                    value={opt}
                    onInput={(e) => {
                      const updated = [...newOptions]
                      updated[index] = e.detail.value
                      setNewOptions(updated)
                    }}
                  />
                  {newOptions.length > 2 && (
                    <View className='vote__create-option-remove' onClick={() => handleRemoveOption(index)}>
                      <Text className='vote__create-option-remove-text'>✕</Text>
                    </View>
                  )}
                </View>
              ))}
              {newOptions.length < 6 && (
                <View className='vote__create-add-option' onClick={handleAddOption}>
                  <Text className='vote__create-add-option-text'>+ 添加选项</Text>
                </View>
              )}
            </View>
            <View className='vote__create-actions'>
              <View className='vote__create-cancel' onClick={() => setShowCreate(false)}>
                <Text className='vote__create-cancel-text'>取消</Text>
              </View>
              <View className='vote__create-submit' onClick={handleCreateVote}>
                <Text className='vote__create-submit-text'>创建</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
