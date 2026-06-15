import type { Trip, TripWithCreator, User } from '../types'
import { TRIP_TYPES, COST_TYPES, VISIBILITY_OPTIONS, PARTICIPANT_STATUSES } from './constants'

export function canViewTrip(user: User | null, trip: TripWithCreator): boolean {
  if (trip.visibility === 'link') return true
  if (!user) return false
  if (trip.creatorId === user.id) return true
  if (trip.visibility === 'friends') return true
  if (trip.visibility === 'groups') return true
  if (trip.visibility === 'selected_friends') return true
  return false
}

export function canJoinTrip(user: User | null, trip: TripWithCreator): boolean {
  if (!user) return false
  if (trip.creatorId === user.id) return false
  if (trip.isJoined) return false
  if (trip.status !== 'published') return false
  if (trip.maxParticipants && trip.participantCount >= trip.maxParticipants) {
    return trip.joinRule === 'waitlist'
  }
  return true
}

export function canEditTrip(user: User | null, trip: Trip): boolean {
  if (!user) return false
  return trip.creatorId === user.id
}

export function canDeleteTrip(user: User | null, trip: Trip): boolean {
  if (!user) return false
  return trip.creatorId === user.id
}

export function canManageParticipants(user: User | null, trip: Trip): boolean {
  if (!user) return false
  return trip.creatorId === user.id
}

export function canComment(user: User | null, trip: TripWithCreator): boolean {
  if (!user) return false
  return trip.isJoined || trip.creatorId === user.id
}

export function canDeleteComment(user: User | null, commentUserId: string, tripCreatorId: string): boolean {
  if (!user) return false
  if (user.id === commentUserId) return true
  if (user.id === tripCreatorId) return true
  return false
}

export function canShareTrip(user: User | null, trip: TripWithCreator): boolean {
  if (trip.visibility === 'private') return false
  if (trip.visibility === 'link') return true
  if (!user) return false
  return true
}

export function getParticipantStatusLabel(status: string): string {
  const config = PARTICIPANT_STATUSES.find((s) => s.value === status)
  return config?.label || status
}

export function getTripTypeLabel(type: string): string {
  const config = TRIP_TYPES.find((t) => t.value === type)
  return config?.label || type
}

export function getTripTypeIcon(type: string): string {
  const config = TRIP_TYPES.find((t) => t.value === type)
  return config?.icon || '📌'
}

export function getCostTypeLabel(costType: string, estimatedCost?: number): string {
  if (costType === 'estimated' && estimatedCost) {
    return `约¥${estimatedCost}/人`
  }
  const config = COST_TYPES.find((c) => c.value === costType)
  return config?.label || costType
}

export function getVisibilityLabel(visibility: string): string {
  const config = VISIBILITY_OPTIONS.find((v) => v.value === visibility)
  return config?.label || visibility
}
