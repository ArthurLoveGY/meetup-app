import { commentService } from './comment.service'
import type { CommentWithUser } from '../types'

export interface ChatMessage {
  id: string
  userId: string
  nickname: string
  avatarUrl?: string
  content: string
  createdAt: string
}

function commentToMessage(comment: CommentWithUser): ChatMessage {
  return {
    id: comment.id,
    userId: comment.userId,
    nickname: comment.user?.nickname || '用户',
    avatarUrl: comment.user?.avatarUrl,
    content: comment.content,
    createdAt: comment.createdAt,
  }
}

export const chatService = {
  async getMessages(tripId: string, page = 1, pageSize = 50): Promise<ChatMessage[]> {
    const data = await commentService.getComments(tripId, page, pageSize)
    const list = data.list || data
    // Filter out parent comments that have replies (show only leaf messages for chat)
    return (Array.isArray(list) ? list : []).map(commentToMessage).reverse()
  },

  async sendMessage(tripId: string, content: string): Promise<ChatMessage> {
    const comment = await commentService.addComment(tripId, content)
    return commentToMessage(comment)
  },
}
