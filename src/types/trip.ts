export type TripType = 'meal' | 'travel' | 'sport' | 'exhibition' | 'game' | 'study' | 'other'

export type CostType = 'aa' | 'free' | 'host_pay' | 'estimated'

export type Visibility = 'private' | 'friends' | 'groups' | 'selected_friends' | 'link'

export type JoinRule = 'direct' | 'approval' | 'waitlist'

export type TripStatus = 'draft' | 'published' | 'cancelled' | 'completed'

export type ParticipantStatus = 'interested' | 'confirmed' | 'uncertain' | 'waitlist' | 'declined' | 'cancelled'

export type ParticipantRole = 'creator' | 'participant'

export interface Trip {
  id: string
  creatorId: string
  title: string
  coverUrl?: string
  type: TripType
  description?: string
  startTime: string
  endTime?: string
  locationName?: string
  locationAddress?: string
  latitude?: number
  longitude?: number
  onlineUrl?: string
  maxParticipants?: number
  costType: CostType
  estimatedCost?: number
  visibility: Visibility
  joinRule: JoinRule
  status: TripStatus
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface TripParticipant {
  id: string
  tripId: string
  userId: string
  status: ParticipantStatus
  note?: string
  role: ParticipantRole
  joinedAt: string
  updatedAt: string
}

export interface TripTimelineItem {
  id: string
  tripId: string
  time?: string
  title: string
  description?: string
  locationName?: string
  sortOrder: number
}

export interface TripChecklistItem {
  id: string
  tripId: string
  title: string
  description?: string
  required: boolean
  assignedUserId?: string
  checkedUserIds: string[]
  sortOrder: number
}

export interface CreateTripDTO {
  title: string
  coverUrl?: string
  type: TripType
  description?: string
  startTime: string
  endTime?: string
  locationName?: string
  locationAddress?: string
  latitude?: number
  longitude?: number
  onlineUrl?: string
  maxParticipants?: number
  costType: CostType
  estimatedCost?: number
  visibility: Visibility
  joinRule: JoinRule
  tags?: string[]
  timeline?: Omit<TripTimelineItem, 'id' | 'tripId'>[]
  checklist?: Omit<TripChecklistItem, 'id' | 'tripId'>[]
}

export interface TripWithCreator extends Trip {
  creator: {
    id: string
    nickname: string
    avatarUrl?: string
  }
  participantCount: number
  participants: Array<{
    id: string
    nickname: string
    avatarUrl?: string
    status: ParticipantStatus
  }>
  isJoined: boolean
  myStatus?: ParticipantStatus
}

export interface TripDetail extends TripWithCreator {
  timeline: TripTimelineItem[]
  checklist: TripChecklistItem[]
  commentCount: number
}
