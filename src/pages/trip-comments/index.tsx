import { View, Text, ScrollView } from '@tarojs/components'
import { useLoad, useRouter } from '@tarojs/taro'
import { useState, useCallback } from 'react'
import { UserAvatar, EmptyState, LoadingView, MessageInput } from '../../components'
import { useAuthStore } from '../../stores'
import { commentService, tripService } from '../../services'
import { platformService } from '../../platform'
import { formatRelativeTime } from '../../utils/date'
import { canDeleteComment } from '../../utils/permission'
import type { CommentWithUser } from '../../types'
import './index.scss'

export default function TripComments() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [comments, setComments] = useState<CommentWithUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [inputValue, setInputValue] = useState('')
  const [tripId, setTripId] = useState('')
  const [tripCreatorId, setTripCreatorId] = useState('')

  useLoad(() => {
    const id = router.params.id
    if (id) {
      setTripId(id)
      tripService.getTripDetail(id).then((trip) => {
        setTripCreatorId(trip.creatorId)
      }).catch(() => {})
      commentService.getComments(id)
        .then((data) => {
          const list = data.list || data
          setComments(Array.isArray(list) ? list : [])
          setIsLoading(false)
        })
        .catch(() => {
          setIsLoading(false)
        })
    }
  })

  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || !tripId) return

    try {
      const newComment = await commentService.addComment(tripId, inputValue)
      setComments([newComment, ...comments])
      setInputValue('')
      platformService.showToast({ title: '评论成功', icon: 'success' })
    } catch {
      platformService.showToast({ title: '评论失败', icon: 'error' })
    }
  }, [inputValue, tripId, comments])

  const handleDelete = useCallback(async (commentId: string) => {
    if (!tripId) return
    const confirmed = await platformService.showModal({
      title: '删除评论',
      content: '确定要删除这条评论吗？',
    })
    if (confirmed) {
      try {
        await commentService.deleteComment(tripId, commentId)
        setComments((prev) => prev.filter((c) => c.id !== commentId))
        platformService.showToast({ title: '已删除', icon: 'success' })
      } catch {
        platformService.showToast({ title: '删除失败', icon: 'error' })
      }
    }
  }, [tripId])

  const handleLike = useCallback(async (comment: CommentWithUser) => {
    if (!tripId) return
    try {
      if (comment.isLiked) {
        await commentService.unlikeComment(tripId, comment.id)
      } else {
        await commentService.likeComment(tripId, comment.id)
      }
      setComments((prev) =>
        prev.map((c) =>
          c.id === comment.id
            ? { ...c, isLiked: !c.isLiked, likeCount: c.isLiked ? (c.likeCount || 1) - 1 : (c.likeCount || 0) + 1 }
            : c
        )
      )
    } catch {
      // Silently fail for like operations
    }
  }, [tripId])

  const handleViewReplies = useCallback((commentId: string) => {
    platformService.navigateTo(`/pages/comment-replies/index?id=${commentId}&tripId=${tripId}`)
  }, [tripId])

  if (isLoading) {
    return <LoadingView text='加载评论...' />
  }

  return (
    <View className='trip-comments'>
      <View className='trip-comments__header'>
        <Text className='trip-comments__title'>评论</Text>
        <Text className='trip-comments__count'>{comments.length}条</Text>
      </View>

      <ScrollView className='trip-comments__scroll' scrollY>
        {comments.length === 0 ? (
          <EmptyState
            icon='💬'
            title='暂无评论'
            description='快来第一个评论吧！'
          />
        ) : (
          <View className='trip-comments__list'>
            {comments.filter((c) => !c.parentId).map((comment) => (
              <View key={comment.id} className='trip-comments__item'>
                <UserAvatar
                  userId={comment.userId}
                  nickname={comment.user?.nickname || '用户'}
                  avatarUrl={comment.user?.avatarUrl}
                  size='small'
                />
                <View className='trip-comments__content'>
                  <View className='trip-comments__content-header'>
                    <Text className='trip-comments__name'>{comment.user?.nickname || '用户'}</Text>
                    <Text className='trip-comments__time'>{formatRelativeTime(comment.createdAt)}</Text>
                  </View>
                  <Text className='trip-comments__text'>{comment.content}</Text>
                  <View className='trip-comments__actions'>
                    <View
                      className={`trip-comments__action ${comment.isLiked ? 'trip-comments__action--liked' : ''}`}
                      onClick={() => handleLike(comment)}
                    >
                      <Text className='trip-comments__action-icon'>{comment.isLiked ? '❤️' : '🤍'}</Text>
                      {(comment.likeCount ?? 0) > 0 && (
                        <Text className='trip-comments__action-count'>{comment.likeCount}</Text>
                      )}
                    </View>
                    <View
                      className='trip-comments__action'
                      onClick={() => handleViewReplies(comment.id)}
                    >
                      <Text className='trip-comments__action-icon'>💬</Text>
                      <Text className='trip-comments__action-text'>回复</Text>
                    </View>
                    {canDeleteComment(user, comment.userId, tripCreatorId) && (
                      <View
                        className='trip-comments__action trip-comments__action--delete'
                        onClick={() => handleDelete(comment.id)}
                      >
                        <Text className='trip-comments__action-icon'>🗑️</Text>
                        <Text className='trip-comments__action-text'>删除</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <MessageInput
        value={inputValue}
        onChange={setInputValue}
        onSend={handleSend}
        placeholder='写评论...'
      />
    </View>
  )
}
