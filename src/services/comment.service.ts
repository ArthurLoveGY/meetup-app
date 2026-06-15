import { api } from './request'
import type { CommentWithUser } from '../types'

export const commentService = {
  async getComments(tripId: string, page = 1, pageSize = 20): Promise<{
    list: CommentWithUser[]
    total: number
  }> {
    return api.get(`/trips/${tripId}/comments`, { page, pageSize })
  },

  async addComment(tripId: string, content: string, parentId?: string): Promise<CommentWithUser> {
    return api.post<CommentWithUser>(`/trips/${tripId}/comments`, { content, parentId })
  },

  async deleteComment(tripId: string, commentId: string): Promise<void> {
    return api.delete<void>(`/trips/${tripId}/comments/${commentId}`)
  },

  async likeComment(tripId: string, commentId: string): Promise<void> {
    return api.post<void>(`/trips/${tripId}/comments/${commentId}/like`)
  },

  async unlikeComment(tripId: string, commentId: string): Promise<void> {
    return api.delete<void>(`/trips/${tripId}/comments/${commentId}/like`)
  },

  async getCommentDetail(tripId: string, commentId: string): Promise<CommentWithUser> {
    return api.get<CommentWithUser>(`/trips/${tripId}/comments/${commentId}`)
  },
}
