export type FriendStatus = 'pending' | 'accepted' | 'rejected' | 'blocked'

export type FriendSource = 'search' | 'qrcode' | 'trip' | 'invite_link'

export interface FriendRelation {
  id: string
  userId: string
  friendId: string
  status: FriendStatus
  source: FriendSource
  remarkName?: string
  groupIds: string[]
  createdAt: string
  updatedAt: string
}

export interface FriendGroup {
  id: string
  name: string
  icon?: string
  sortOrder: number
  createdAt: string
}

export interface FriendWithUser extends FriendRelation {
  friend: {
    id: string
    nickname: string
    avatarUrl?: string
    bio?: string
    city?: string
  }
}

export interface FriendRequest {
  id: string
  fromUserId: string
  toUserId: string
  message?: string
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: string
}

export interface FriendRequestWithUser extends FriendRequest {
  fromUser: {
    id: string
    nickname: string
    avatarUrl?: string
  }
}
