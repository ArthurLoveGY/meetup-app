export type NotificationType =
  | 'friend_request'
  | 'trip_invite'
  | 'trip_update'
  | 'join_status'
  | 'comment'
  | 'reminder'
  | 'system'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  content: string
  relatedId?: string
  read: boolean
  createdAt: string
}

export interface Comment {
  id: string
  tripId: string
  userId: string
  parentId?: string
  content: string
  likeCount?: number
  isLiked?: boolean
  createdAt: string
  updatedAt: string
}

export interface CommentWithUser extends Comment {
  user: {
    id: string
    nickname: string
    avatarUrl?: string
  }
  replies?: CommentWithUser[]
}
