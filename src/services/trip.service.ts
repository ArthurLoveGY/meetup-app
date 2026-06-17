import { api } from './request'
import type { Trip, TripWithCreator, TripDetail, CreateTripDTO, ParticipantStatus, TripTimelineItem, TripChecklistItem } from '../types'

export const tripService = {
  async getFeed(page = 1, pageSize = 10): Promise<{ list: TripWithCreator[]; total: number }> {
    return api.get('/trips/feed', { page, pageSize })
  },

  async getTrips(page = 1, pageSize = 10, filters?: {
    keyword?: string; type?: string; sort?: string; lat?: number; lng?: number;
  }): Promise<{ list: TripWithCreator[]; total: number }> {
    const params: Record<string, unknown> = { page, pageSize }
    if (filters?.keyword) params.keyword = filters.keyword
    if (filters?.type) params.type = filters.type
    if (filters?.sort) params.sort = filters.sort
    if (filters?.lat != null) params.lat = filters.lat
    if (filters?.lng != null) params.lng = filters.lng
    return api.get('/trips', params)
  },

  async getMyTrips(page = 1, pageSize = 10): Promise<{ list: TripWithCreator[]; total: number }> {
    return api.get('/trips/mine', { page, pageSize })
  },

  async getJoinedTrips(page = 1, pageSize = 10): Promise<{ list: TripWithCreator[]; total: number }> {
    return api.get('/trips/joined', { page, pageSize })
  },

  async getTripDetail(tripId: string): Promise<TripDetail> {
    return api.get<TripDetail>(`/trips/${tripId}`)
  },

  async createTrip(data: CreateTripDTO): Promise<TripWithCreator> {
    return api.post<TripWithCreator>('/trips', data as unknown as Record<string, unknown>)
  },

  async updateTrip(tripId: string, data: Partial<CreateTripDTO>): Promise<Trip> {
    return api.put<Trip>(`/trips/${tripId}`, data as Record<string, unknown>)
  },

  async deleteTrip(tripId: string): Promise<void> {
    return api.delete<void>(`/trips/${tripId}`)
  },

  async joinTrip(tripId: string, status: ParticipantStatus, note?: string): Promise<void> {
    return api.post<void>(`/trips/${tripId}/join`, { status, note })
  },

  async leaveTrip(tripId: string): Promise<void> {
    return api.post<void>(`/trips/${tripId}/leave`)
  },

  async updateParticipantStatus(
    tripId: string,
    userId: string,
    status: ParticipantStatus
  ): Promise<void> {
    return api.put<void>(`/trips/${tripId}/participants/${userId}`, { status })
  },

  async removeParticipant(tripId: string, userId: string): Promise<void> {
    return api.delete<void>(`/trips/${tripId}/participants/${userId}`)
  },

  async getParticipants(tripId: string): Promise<Array<{
    id: string
    userId: string
    nickname: string
    avatarUrl?: string
    status: ParticipantStatus
    note?: string
  }>> {
    return api.get(`/trips/${tripId}/participants`)
  },

  async updateTimeline(tripId: string, timeline: TripTimelineItem[]): Promise<void> {
    return api.put(`/trips/${tripId}/timeline`, { timeline })
  },

  async updateChecklist(tripId: string, checklist: TripChecklistItem[]): Promise<void> {
    return api.put(`/trips/${tripId}/checklist`, { checklist })
  },
}
