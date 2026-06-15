import { View, Text, ScrollView } from '@tarojs/components'
import { useLoad, useRouter } from '@tarojs/taro'
import { useState, useCallback } from 'react'
import { UserAvatar, ParticipantStatusBadge, EmptyState, LoadingView } from '../../components'
import { useTripStore } from '../../stores'
import { platformService } from '../../platform'
import './index.scss'

type TabType = 'pending' | 'confirmed' | 'waitlist' | 'all'

const TABS: Array<{ key: TabType; label: string }> = [
  { key: 'pending', label: '待审核' },
  { key: 'confirmed', label: '已确认' },
  { key: 'waitlist', label: '候补' },
  { key: 'all', label: '全部' },
]

export default function TripManageParticipants() {
  const router = useRouter()
  const { currentTrip, fetchTripDetail, updateParticipantStatus, removeParticipant } = useTripStore()
  const [activeTab, setActiveTab] = useState<TabType>('pending')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isBatchMode, setIsBatchMode] = useState(false)

  useLoad(() => {
    const tripId = router.params.id
    if (tripId) {
      fetchTripDetail(tripId).finally(() => setIsLoading(false))
    }
  })

  const participants = currentTrip?.participants || []

  const handleApprove = useCallback(async (participantId: string) => {
    if (!currentTrip) return
    await updateParticipantStatus(currentTrip.id, participantId, 'confirmed')
    platformService.showToast({ title: '已确认参加', icon: 'success' })
  }, [currentTrip, updateParticipantStatus])

  const handleReject = useCallback(async (participantId: string) => {
    if (!currentTrip) return
    const confirmed = await platformService.showModal({
      title: '拒绝申请',
      content: '确定拒绝这个参加申请吗？',
    })
    if (confirmed) {
      await removeParticipant(currentTrip.id, participantId)
      platformService.showToast({ title: '已拒绝', icon: 'success' })
    }
  }, [currentTrip, removeParticipant])

  const handleRemove = useCallback(async (participantId: string) => {
    if (!currentTrip) return
    const confirmed = await platformService.showModal({
      title: '移除参与者',
      content: '确定移除这个参与者吗？移除后对方将无法查看此行程。',
    })
    if (confirmed) {
      await removeParticipant(currentTrip.id, participantId)
      platformService.showToast({ title: '已移除', icon: 'success' })
    }
  }, [currentTrip, removeParticipant])

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleSelectAll = useCallback(() => {
    const filtered = activeTab === 'all'
      ? participants
      : participants.filter((p) => {
          if (activeTab === 'pending') return p.status === 'interested' || p.status === 'uncertain'
          if (activeTab === 'confirmed') return p.status === 'confirmed'
          if (activeTab === 'waitlist') return p.status === 'waitlist'
          return true
        })
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map((p) => p.id)))
    }
  }, [participants, activeTab, selectedIds])

  const handleBatchApprove = useCallback(async () => {
    if (!currentTrip || selectedIds.size === 0) return
    const confirmed = await platformService.showModal({
      title: '批量确认',
      content: `确定确认选中的 ${selectedIds.size} 位参与者吗？`,
    })
    if (confirmed) {
      for (const id of selectedIds) {
        await updateParticipantStatus(currentTrip.id, id, 'confirmed')
      }
      setSelectedIds(new Set())
      platformService.showToast({ title: `已确认 ${selectedIds.size} 人`, icon: 'success' })
    }
  }, [currentTrip, selectedIds, updateParticipantStatus])

  const handleBatchReject = useCallback(async () => {
    if (!currentTrip || selectedIds.size === 0) return
    const confirmed = await platformService.showModal({
      title: '批量拒绝',
      content: `确定拒绝选中的 ${selectedIds.size} 位参与者吗？`,
    })
    if (confirmed) {
      for (const id of selectedIds) {
        await removeParticipant(currentTrip.id, id)
      }
      setSelectedIds(new Set())
      platformService.showToast({ title: `已拒绝 ${selectedIds.size} 人`, icon: 'success' })
    }
  }, [currentTrip, selectedIds, removeParticipant])

  if (isLoading) {
    return <LoadingView text='加载参与者...' />
  }

  if (!currentTrip) {
    return (
      <EmptyState
        icon='😅'
        title='行程不存在'
        description='该行程可能已被删除'
        actionText='返回'
        onAction={() => platformService.navigateBack()}
      />
    )
  }

  const filteredParticipants = activeTab === 'all'
    ? participants
    : participants.filter((p) => {
        if (activeTab === 'pending') return p.status === 'interested' || p.status === 'uncertain'
        if (activeTab === 'confirmed') return p.status === 'confirmed'
        if (activeTab === 'waitlist') return p.status === 'waitlist'
        return true
      })

  return (
    <View className='manage-participants'>
      <View className='manage-participants__header'>
        <Text className='manage-participants__title'>参与者管理</Text>
        <View className='manage-participants__header-right'>
          <Text className='manage-participants__count'>{participants.length}人</Text>
          <View
            className='manage-participants__batch-toggle'
            onClick={() => { setIsBatchMode(!isBatchMode); setSelectedIds(new Set()) }}
          >
            <Text className='manage-participants__batch-toggle-text'>
              {isBatchMode ? '取消' : '批量'}
            </Text>
          </View>
        </View>
      </View>

      <View className='manage-participants__tabs'>
        {TABS.map((tab) => (
          <View
            key={tab.key}
            className={`manage-participants__tab ${activeTab === tab.key ? 'manage-participants__tab--active' : ''}`}
            onClick={() => { setActiveTab(tab.key); setSelectedIds(new Set()) }}
          >
            <Text className='manage-participants__tab-text'>{tab.label}</Text>
          </View>
        ))}
      </View>

      {isBatchMode && filteredParticipants.length > 0 && (
        <View className='manage-participants__batch-bar'>
          <View className='manage-participants__select-all' onClick={toggleSelectAll}>
            <View className={`manage-participants__checkbox ${selectedIds.size === filteredParticipants.length ? 'manage-participants__checkbox--checked' : ''}`}>
              {selectedIds.size === filteredParticipants.length && <Text className='manage-participants__check'>✓</Text>}
            </View>
            <Text className='manage-participants__select-all-text'>全选</Text>
          </View>
          <View className='manage-participants__batch-actions'>
            <View
              className='manage-participants__batch-btn manage-participants__batch-btn--approve'
              onClick={handleBatchApprove}
            >
              <Text className='manage-participants__batch-btn-text'>确认({selectedIds.size})</Text>
            </View>
            <View
              className='manage-participants__batch-btn manage-participants__batch-btn--reject'
              onClick={handleBatchReject}
            >
              <Text className='manage-participants__batch-btn-text'>拒绝({selectedIds.size})</Text>
            </View>
          </View>
        </View>
      )}

      <ScrollView className='manage-participants__scroll' scrollY>
        {filteredParticipants.length === 0 ? (
          <EmptyState
            icon='👥'
            title={`暂无${TABS.find((t) => t.key === activeTab)?.label || ''}参与者`}
            description=''
          />
        ) : (
          <View className='manage-participants__list'>
            {filteredParticipants.map((p) => (
              <View key={p.id} className='manage-participants__item'>
                {isBatchMode && (
                  <View className='manage-participants__item-check' onClick={() => toggleSelect(p.id)}>
                    <View className={`manage-participants__checkbox ${selectedIds.has(p.id) ? 'manage-participants__checkbox--checked' : ''}`}>
                      {selectedIds.has(p.id) && <Text className='manage-participants__check'>✓</Text>}
                    </View>
                  </View>
                )}
                <UserAvatar
                  userId={p.id}
                  nickname={p.nickname}
                  size='medium'
                />
                <View className='manage-participants__info'>
                  <Text className='manage-participants__name'>{p.nickname}</Text>
                  <ParticipantStatusBadge status={p.status} />
                </View>
                {!isBatchMode && (
                  <View className='manage-participants__actions'>
                    {(p.status === 'interested' || p.status === 'uncertain') && (
                      <>
                        <View
                          className='manage-participants__action manage-participants__action--approve'
                          onClick={() => handleApprove(p.id)}
                        >
                          <Text className='manage-participants__action-text'>✓</Text>
                        </View>
                        <View
                          className='manage-participants__action manage-participants__action--reject'
                          onClick={() => handleReject(p.id)}
                        >
                          <Text className='manage-participants__action-text'>✕</Text>
                        </View>
                      </>
                    )}
                    {p.status === 'confirmed' && (
                      <View
                        className='manage-participants__action manage-participants__action--remove'
                        onClick={() => handleRemove(p.id)}
                      >
                        <Text className='manage-participants__action-text'>移除</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}
