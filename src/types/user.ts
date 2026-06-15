export interface User {
  id: string
  nickname: string
  avatarUrl?: string
  bio?: string
  city?: string
  interests: string[]
  phone?: string
  email?: string
  wechatOpenId?: string
  unionId?: string
  appleUserId?: string
  status: 'active' | 'disabled' | 'deleted'
  createdAt: string
  updatedAt: string
}

export interface UserProfile extends User {
  friendCount: number
  tripCount: number
  joinedTripCount: number
}

export interface UpdateUserDTO {
  nickname?: string
  avatarUrl?: string
  bio?: string
  city?: string
  interests?: string[]
}
