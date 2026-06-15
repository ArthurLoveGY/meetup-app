import { View, Text, ScrollView } from '@tarojs/components'
import { useLoad, useRouter } from '@tarojs/taro'
import { useState, useCallback } from 'react'
import { UserAvatar, LoadingView, MessageInput } from '../../components'
import { useAuthStore } from '../../stores'
import { commentService } from '../../services'
import { platformService } from '../../platform'
import { formatRelativeTime } from '../../utils/date'
import type { CommentWithUser } from '../../types'
import './index.scss'

export default function CommentReplies() {
  const router = useRouter()
  useAuthStore()
  const [parentComment, setParentComment] = useState<CommentWithUser | null>(null)
  const [replies, setReplies] = useState<CommentWithUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [replyContent, setReplyContent] = useState('')
  const [tripId, setTripId] = useState('')

  useLoad(() => {
    const commentId = router.params.id
    const tid = router.params.tripId
    if (commentId && tid) {
      setTripId(tid)
      // Load all comments for the trip, then filter
      commentService.getComments(tid)
        .then((data) => {
          const list = data.list || data
          const allComments = Array.isArray(list) ? list : []
          const parent = allComments.find((c: CommentWithUser) => c.id === commentId)
          if (parent) {
            setParentComment(parent)
            // Find replies (comments with parentId matching this comment)
            const replyList = allComments.filter((c: CommentWithUser) => c.parentId === commentId)
            setReplies(replyList)
          }
          setIsLoading(false)
        })
        .catch(() => {
          setIsLoading(false)
        })
    }
  })

  const handleSend = useCallback(async () => {
    if (!replyContent.trim() || !tripId || !parentComment) return

    try {
      const newReply = await commentService.addComment(tripId, replyContent, parentComment.id)
      setReplies((prev) => [...prev, newReply])
      setReplyContent('')
      platformService.showToast({ title: '回复成功', icon: 'success' })
    } catch {
      platformService.showToast({ title: '回复失败', icon: 'error' })
    }
  }, [replyContent, tripId, parentComment])

  if (isLoading) {
    return <LoadingView text='加载中...' />
  }

  if (!parentComment) {
    return null
  }

  return (
    <View className='comment-replies'>
      <View className='comment-replies__header'>
        <Text className='comment-replies__title'>评论回复</Text>
      </View>

      <ScrollView className='comment-replies__scroll' scrollY>
        <View className='comment-replies__comment'>
          <UserAvatar
            userId={parentComment.userId}
            nickname={parentComment.user?.nickname || '用户'}
            avatarUrl={parentComment.user?.avatarUrl}
            size='small'
          />
          <View className='comment-replies__comment-content'>
            <Text className='comment-replies__comment-name'>{parentComment.user?.nickname || '用户'}</Text>
            <Text className='comment-replies__comment-text'>{parentComment.content}</Text>
            <Text className='comment-replies__comment-time'>{formatRelativeTime(parentComment.createdAt)}</Text>
          </View>
        </View>

        <View className='comment-replies__divider'>
          <Text className='comment-replies__divider-text'>{replies.length}条回复</Text>
        </View>

        <View className='comment-replies__replies'>
          {replies.map((reply) => (
            <View key={reply.id} className='comment-replies__reply'>
              <UserAvatar
                userId={reply.userId}
                nickname={reply.user?.nickname || '用户'}
                avatarUrl={reply.user?.avatarUrl}
                size='small'
              />
              <View className='comment-replies__reply-content'>
                <Text className='comment-replies__reply-name'>{reply.user?.nickname || '用户'}</Text>
                <Text className='comment-replies__reply-text'>{reply.content}</Text>
                <Text className='comment-replies__reply-time'>{formatRelativeTime(reply.createdAt)}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <MessageInput
        value={replyContent}
        onChange={setReplyContent}
        onSend={handleSend}
        placeholder='写回复...'
      />
    </View>
  )
}
