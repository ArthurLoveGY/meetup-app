import { View, Text, ScrollView, Image } from '@tarojs/components'
import { useLoad, useRouter } from '@tarojs/taro'
import { useState, useCallback } from 'react'
import {
  UserAvatar,
  ParticipantStatusBadge,
  ParticipantStatusSelector,
  EmptyState,
  LoadingView,
} from '../../components'
import { useTripStore, useAuthStore } from '../../stores'
import { platformService } from '../../platform'
import {
  getSmartDate,
  getDayOfWeek,
  getCountdown,
  formatDateTime,
} from '../../utils/date'
import {
  getTripTypeLabel,
  getCostTypeLabel,
  getVisibilityLabel,
} from '../../utils/permission'
import { TRIP_STATUS_LABELS } from '../../utils/constants'
import {
  canJoinTrip,
  canComment,
  canShareTrip,
} from '../../utils/permission'
import type { ParticipantStatus, TripTimelineItem, TripChecklistItem } from '../../types'
import './index.scss'

export default function TripDetail() {
  const router = useRouter()
  const { currentTrip, isLoading, fetchTripDetail, joinTrip, leaveTrip, clearCurrentTrip, deleteTrip } = useTripStore()
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'info' | 'timeline' | 'checklist' | 'comments'>('info')
  const [showStatusSelector, setShowStatusSelector] = useState(false)

  useLoad(() => {
    const tripId = router.params.id
    if (tripId) {
      fetchTripDetail(tripId)
    }
    return () => clearCurrentTrip()
  })

  const handleJoin = useCallback(async (status: ParticipantStatus) => {
    if (!currentTrip) return
    await joinTrip(currentTrip.id, status)
    setShowStatusSelector(false)
    platformService.showToast({ title: '报名成功！', icon: 'success' })
  }, [currentTrip, joinTrip])

  const handleLeave = useCallback(async () => {
    if (!currentTrip) return
    const confirmed = await platformService.showModal({
      title: '退出行程',
      content: '确定要退出这个行程吗？',
    })
    if (confirmed) {
      await leaveTrip(currentTrip.id)
      platformService.showToast({ title: '已退出行程', icon: 'success' })
    }
  }, [currentTrip, leaveTrip])

  const handleShare = useCallback(async () => {
    if (!currentTrip) return
    await platformService.shareToFriend({
      title: currentTrip.title,
      path: `/pages/trip-detail/index?id=${currentTrip.id}`,
    })
  }, [currentTrip])

  const handleEdit = useCallback(() => {
    if (!currentTrip) return
    platformService.navigateTo(`/pages/trip-edit/index?id=${currentTrip.id}`)
  }, [currentTrip])

  const handleViewParticipants = useCallback(() => {
    if (!currentTrip) return
    platformService.navigateTo(`/pages/trip-participants/index?id=${currentTrip.id}`)
  }, [currentTrip])

  const handleManageParticipants = useCallback(() => {
    if (!currentTrip) return
    platformService.navigateTo(`/pages/trip-manage-participants/index?id=${currentTrip.id}`)
  }, [currentTrip])

  const handleViewComments = useCallback(() => {
    if (!currentTrip) return
    platformService.navigateTo(`/pages/trip-comments/index?id=${currentTrip.id}`)
  }, [currentTrip])

  const handleEditTimeline = useCallback(() => {
    if (!currentTrip) return
    platformService.navigateTo(`/pages/trip-timeline-edit/index?id=${currentTrip.id}`)
  }, [currentTrip])

  const handleEditChecklist = useCallback(() => {
    if (!currentTrip) return
    platformService.navigateTo(`/pages/trip-checklist-edit/index?id=${currentTrip.id}`)
  }, [currentTrip])

  const handleEditBudget = useCallback(() => {
    if (!currentTrip) return
    platformService.navigateTo(`/pages/trip-budget-edit/index?id=${currentTrip.id}`)
  }, [currentTrip])

  const handleViewVote = useCallback(() => {
    if (!currentTrip) return
    platformService.navigateTo(`/pages/vote/index?id=${currentTrip.id}`)
  }, [currentTrip])

  const handleViewReview = useCallback(() => {
    if (!currentTrip) return
    platformService.navigateTo(`/pages/trip-review/index?id=${currentTrip.id}`)
  }, [currentTrip])

  const handleViewChat = useCallback(() => {
    if (!currentTrip) return
    platformService.navigateTo(`/pages/trip-chat/index?id=${currentTrip.id}`)
  }, [currentTrip])

  const handleDelete = useCallback(async () => {
    if (!currentTrip) return
    const confirmed = await platformService.showModal({
      title: '删除行程',
      content: '确定要删除这个行程吗？删除后无法恢复。',
    })
    if (confirmed) {
      try {
        await deleteTrip(currentTrip.id)
        platformService.showToast({ title: '已删除', icon: 'success' })
        setTimeout(() => {
          platformService.navigateBack()
        }, 1500)
      } catch {
        platformService.showToast({ title: '删除失败', icon: 'error' })
      }
    }
  }, [currentTrip, deleteTrip])

  if (isLoading) {
    return <LoadingView text='加载行程详情...' />
  }

  if (!currentTrip) {
    return (
      <EmptyState
        icon='😅'
        title='行程不存在'
        description='该行程可能已被删除'
        actionText='返回首页'
        onAction={() => platformService.navigateBack()}
      />
    )
  }

  const trip = currentTrip
  const isCreator = user?.id === trip.creatorId
  const canJoin = canJoinTrip(user, trip)
  const canCommentTrip = canComment(user, trip)
  const canShare = canShareTrip(user, trip)

  return (
    <View className='trip-detail'>
      <ScrollView className='trip-detail__scroll' scrollY>
        {trip.coverUrl && (
          <Image className='trip-detail__cover' src={trip.coverUrl} mode='aspectFill' />
        )}

        <View className='trip-detail__content'>
          <View className='trip-detail__header'>
            <View className='trip-detail__type-tag'>
              <Text className='trip-detail__type-text'>{getTripTypeLabel(trip.type)}</Text>
            </View>
            <View className='trip-detail__status'>
              <Text className='trip-detail__status-text'>
                {trip.status === 'published'
                  ? trip.maxParticipants && trip.participantCount >= trip.maxParticipants
                    ? '已满员'
                    : '报名中'
                  : TRIP_STATUS_LABELS[trip.status]}
              </Text>
            </View>
          </View>

          <Text className='trip-detail__title'>{trip.title}</Text>

          <View className='trip-detail__meta'>
            <View className='trip-detail__meta-item'>
              <Text className='trip-detail__meta-icon'>📅</Text>
              <View className='trip-detail__meta-content'>
                <Text className='trip-detail__meta-label'>时间</Text>
                <Text className='trip-detail__meta-value'>
                  {getSmartDate(trip.startTime)} {getDayOfWeek(trip.startTime)}
                </Text>
                {trip.endTime && (
                  <Text className='trip-detail__meta-sub'>
                    至 {formatDateTime(trip.endTime)}
                  </Text>
                )}
                <Text className='trip-detail__countdown'>
                  {getCountdown(trip.startTime)}
                </Text>
              </View>
            </View>

            {trip.locationName && (
              <View className='trip-detail__meta-item'>
                <Text className='trip-detail__meta-icon'>📍</Text>
                <View className='trip-detail__meta-content'>
                  <Text className='trip-detail__meta-label'>地点</Text>
                  <Text className='trip-detail__meta-value'>{trip.locationName}</Text>
                  {trip.locationAddress && (
                    <Text className='trip-detail__meta-sub'>{trip.locationAddress}</Text>
                  )}
                </View>
              </View>
            )}

            <View className='trip-detail__meta-item'>
              <Text className='trip-detail__meta-icon'>💰</Text>
              <View className='trip-detail__meta-content'>
                <Text className='trip-detail__meta-label'>费用</Text>
                <Text className='trip-detail__meta-value'>
                  {getCostTypeLabel(trip.costType, trip.estimatedCost)}
                </Text>
              </View>
            </View>

            <View className='trip-detail__meta-item'>
              <Text className='trip-detail__meta-icon'>👥</Text>
              <View className='trip-detail__meta-content'>
                <Text className='trip-detail__meta-label'>人数</Text>
                <Text className='trip-detail__meta-value'>
                  {trip.participantCount}人{trip.maxParticipants ? ` / ${trip.maxParticipants}人` : ' (不限)'}
                </Text>
              </View>
            </View>

            <View className='trip-detail__meta-item'>
              <Text className='trip-detail__meta-icon'>🔒</Text>
              <View className='trip-detail__meta-content'>
                <Text className='trip-detail__meta-label'>可见范围</Text>
                <Text className='trip-detail__meta-value'>
                  {getVisibilityLabel(trip.visibility)}
                </Text>
              </View>
            </View>
          </View>

          {trip.description && (
            <View className='trip-detail__section'>
              <Text className='trip-detail__section-title'>行程描述</Text>
              <Text className='trip-detail__description'>{trip.description}</Text>
            </View>
          )}

          {trip.tags.length > 0 && (
            <View className='trip-detail__tags'>
              {trip.tags.map((tag) => (
                <View key={tag} className='trip-detail__tag'>
                  <Text className='trip-detail__tag-text'>#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          <View className='trip-detail__tabs'>
            <View
              className={`trip-detail__tab ${activeTab === 'info' ? 'trip-detail__tab--active' : ''}`}
              onClick={() => setActiveTab('info')}
            >
              <Text className='trip-detail__tab-text'>详情</Text>
            </View>
            <View
              className={`trip-detail__tab ${activeTab === 'timeline' ? 'trip-detail__tab--active' : ''}`}
              onClick={() => setActiveTab('timeline')}
            >
              <Text className='trip-detail__tab-text'>时间线</Text>
            </View>
            <View
              className={`trip-detail__tab ${activeTab === 'checklist' ? 'trip-detail__tab--active' : ''}`}
              onClick={() => setActiveTab('checklist')}
            >
              <Text className='trip-detail__tab-text'>准备清单</Text>
            </View>
            <View
              className={`trip-detail__tab ${activeTab === 'comments' ? 'trip-detail__tab--active' : ''}`}
              onClick={() => setActiveTab('comments')}
            >
              <Text className='trip-detail__tab-text'>评论({trip.commentCount})</Text>
            </View>
          </View>

          {activeTab === 'info' && (
            <View className='trip-detail__section'>
              <View className='trip-detail__creator' onClick={() => platformService.navigateTo(`/pages/profile/index?id=${trip.creator.id}`)}>
                <Text className='trip-detail__section-title'>发起人</Text>
                <View className='trip-detail__creator-info'>
                  <UserAvatar
                    userId={trip.creator.id}
                    nickname={trip.creator.nickname}
                    avatarUrl={trip.creator.avatarUrl}
                    size='medium'
                  />
                  <View className='trip-detail__creator-detail'>
                    <Text className='trip-detail__creator-name'>{trip.creator.nickname}</Text>
                    <Text className='trip-detail__creator-trips'>发起了 {trip.participantCount} 个行程</Text>
                  </View>
                </View>
              </View>

              <View className='trip-detail__participants' onClick={handleViewParticipants}>
                <View className='trip-detail__participants-header'>
                  <Text className='trip-detail__section-title'>
                    参与者 ({trip.participantCount})
                  </Text>
                  {isCreator && (
                    <View className='trip-detail__manage-btn' onClick={(e) => { e.stopPropagation(); handleManageParticipants(); }}>
                      <Text className='trip-detail__manage-btn-text'>管理</Text>
                    </View>
                  )}
                </View>
                <View className='trip-detail__participant-list'>
                  {trip.participants.slice(0, 5).map((p) => (
                    <View key={p.id} className='trip-detail__participant'>
                      <UserAvatar
                        userId={p.id}
                        nickname={p.nickname}
                        avatarUrl={p.avatarUrl}
                        size='small'
                      />
                      <Text className='trip-detail__participant-name'>{p.nickname}</Text>
                      <ParticipantStatusBadge status={p.status} />
                    </View>
                  ))}
                  {trip.participantCount > 5 && (
                    <View className='trip-detail__more-participants'>
                      <Text className='trip-detail__more-text'>
                        查看全部 {trip.participantCount} 人
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          )}

          {activeTab === 'timeline' && (
            <View className='trip-detail__section'>
              <View className='trip-detail__section-header'>
                <Text className='trip-detail__section-title'>行程时间线</Text>
                {isCreator && (
                  <View className='trip-detail__edit-btn' onClick={handleEditTimeline}>
                    <Text className='trip-detail__edit-btn-text'>编辑</Text>
                  </View>
                )}
              </View>
              {trip.timeline.length === 0 ? (
                <EmptyState
                  icon='⏰'
                  title='暂无时间线'
                  description='发起人还没有添加时间安排'
                />
              ) : (
                <View className='trip-detail__timeline'>
                  {trip.timeline.map((item, index) => (
                    <TimelineItem
                      key={item.id}
                      item={item}
                      isLast={index === trip.timeline.length - 1}
                    />
                  ))}
                </View>
              )}
            </View>
          )}

          {activeTab === 'checklist' && (
            <View className='trip-detail__section'>
              <View className='trip-detail__section-header'>
                <Text className='trip-detail__section-title'>准备清单</Text>
                {isCreator && (
                  <View className='trip-detail__edit-btn' onClick={handleEditChecklist}>
                    <Text className='trip-detail__edit-btn-text'>编辑</Text>
                  </View>
                )}
              </View>
              {trip.checklist.length === 0 ? (
                <EmptyState
                  icon='📋'
                  title='暂无准备清单'
                  description='发起人还没有添加准备事项'
                />
              ) : (
                <View className='trip-detail__checklist'>
                  {trip.checklist.map((item) => (
                    <ChecklistItem
                      key={item.id}
                      item={item}
                      userId={user?.id}
                    />
                  ))}
                </View>
              )}
            </View>
          )}

          {activeTab === 'comments' && (
            <View className='trip-detail__section'>
              <View className='trip-detail__comments-header'>
                <Text className='trip-detail__section-title'>评论</Text>
                {canCommentTrip && (
                  <View
                    className='trip-detail__add-comment'
                    onClick={handleViewComments}
                  >
                    <Text className='trip-detail__add-comment-text'>写评论</Text>
                  </View>
                )}
              </View>
              <EmptyState
                icon='💬'
                title='暂无评论'
                description='快来第一个评论吧！'
                actionText='查看全部评论'
                onAction={handleViewComments}
              />
            </View>
          )}

          {activeTab === 'info' && isCreator && (
            <View className='trip-detail__section'>
              <Text className='trip-detail__section-title'>更多操作</Text>
              <View className='trip-detail__actions-grid'>
                <View className='trip-detail__action-item' onClick={handleEditBudget}>
                  <Text className='trip-detail__action-icon'>💰</Text>
                  <Text className='trip-detail__action-text'>预算编辑</Text>
                </View>
                <View className='trip-detail__action-item' onClick={handleViewVote}>
                  <Text className='trip-detail__action-icon'>📊</Text>
                  <Text className='trip-detail__action-text'>投票</Text>
                </View>
                <View className='trip-detail__action-item' onClick={handleViewReview}>
                  <Text className='trip-detail__action-icon'>📝</Text>
                  <Text className='trip-detail__action-text'>行程回顾</Text>
                </View>
                <View className='trip-detail__action-item' onClick={handleViewChat}>
                  <Text className='trip-detail__action-icon'>💬</Text>
                  <Text className='trip-detail__action-text'>聊天</Text>
                </View>
                <View className='trip-detail__action-item trip-detail__action-item--danger' onClick={handleDelete}>
                  <Text className='trip-detail__action-icon'>🗑️</Text>
                  <Text className='trip-detail__action-text'>删除行程</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View className='trip-detail__bottom-bar safe-area-bottom'>
        {isCreator ? (
          <>
            <View className='trip-detail__btn trip-detail__btn--share' onClick={handleShare}>
              <Text className='trip-detail__btn-text'>分享</Text>
            </View>
            <View className='trip-detail__btn trip-detail__btn--edit' onClick={handleEdit}>
              <Text className='trip-detail__btn-text'>编辑行程</Text>
            </View>
          </>
        ) : trip.isJoined ? (
          <>
            <View className='trip-detail__btn trip-detail__btn--share' onClick={handleShare}>
              <Text className='trip-detail__btn-text'>分享</Text>
            </View>
            <View className='trip-detail__btn trip-detail__btn--leave' onClick={handleLeave}>
              <Text className='trip-detail__btn-text'>退出行程</Text>
            </View>
          </>
        ) : (
          <>
            {canShare && (
              <View className='trip-detail__btn trip-detail__btn--share' onClick={handleShare}>
                <Text className='trip-detail__btn-text'>分享</Text>
              </View>
            )}
            {canJoin && (
              <View className='trip-detail__btn trip-detail__btn--join' onClick={() => setShowStatusSelector(true)}>
                <Text className='trip-detail__btn-text'>我要参加</Text>
              </View>
            )}
          </>
        )}
      </View>

      {showStatusSelector && (
        <View className='trip-detail__mask' onClick={() => setShowStatusSelector(false)}>
          <View className='trip-detail__status-modal' onClick={(e) => e.stopPropagation()}>
            <Text className='trip-detail__status-title'>选择参与状态</Text>
            <ParticipantStatusSelector onSelect={handleJoin} />
          </View>
        </View>
      )}
    </View>
  )
}

function TimelineItem({ item, isLast }: { item: TripTimelineItem; isLast: boolean }) {
  return (
    <View className={`timeline-item ${isLast ? 'timeline-item--last' : ''}`}>
      <View className='timeline-item__time'>
        <Text className='timeline-item__time-text'>{item.time || '--:--'}</Text>
      </View>
      <View className='timeline-item__dot-wrapper'>
        <View className='timeline-item__dot' />
        {!isLast && <View className='timeline-item__line' />}
      </View>
      <View className='timeline-item__content'>
        <Text className='timeline-item__title'>{item.title}</Text>
        {item.description && (
          <Text className='timeline-item__desc'>{item.description}</Text>
        )}
        {item.locationName && (
          <View className='timeline-item__location'>
            <Text className='timeline-item__location-icon'>📍</Text>
            <Text className='timeline-item__location-text'>{item.locationName}</Text>
          </View>
        )}
      </View>
    </View>
  )
}

function ChecklistItem({ item, userId }: { item: TripChecklistItem; userId?: string }) {
  const isChecked = userId ? item.checkedUserIds.includes(userId) : false

  return (
    <View className={`checklist-item ${isChecked ? 'checklist-item--checked' : ''}`}>
      <View className='checklist-item__checkbox'>
        <View className={`checklist-item__box ${isChecked ? 'checklist-item__box--checked' : ''}`}>
          {isChecked && <Text className='checklist-item__check'>✓</Text>}
        </View>
      </View>
      <View className='checklist-item__content'>
        <Text className='checklist-item__title'>{item.title}</Text>
        {item.description && (
          <Text className='checklist-item__desc'>{item.description}</Text>
        )}
        {item.required && (
          <View className='checklist-item__required'>
            <Text className='checklist-item__required-text'>必带</Text>
          </View>
        )}
      </View>
    </View>
  )
}
