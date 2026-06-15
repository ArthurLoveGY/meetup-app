import { create } from 'zustand'
import { tripService } from '../services'
import type { TripWithCreator, TripDetail, CreateTripDTO, ParticipantStatus, TripTimelineItem, TripChecklistItem } from '../types'

interface TripState {
  trips: TripWithCreator[]
  myTrips: TripWithCreator[]
  currentTrip: TripDetail | null
  isLoading: boolean
  isLoadingMore: boolean
  hasMore: boolean
  page: number
  error: string | null

  fetchTrips: (refresh?: boolean, filters?: { keyword?: string; type?: string; sort?: string; lat?: number; lng?: number }) => Promise<void>
  fetchMyTrips: (refresh?: boolean) => Promise<void>
  fetchTripDetail: (tripId: string) => Promise<void>
  createTrip: (data: CreateTripDTO) => Promise<TripWithCreator>
  joinTrip: (tripId: string, status: ParticipantStatus) => Promise<void>
  leaveTrip: (tripId: string) => Promise<void>
  updateTrip: (tripId: string, data: Partial<CreateTripDTO>) => Promise<void>
  updateParticipantStatus: (tripId: string, participantId: string, status: ParticipantStatus) => Promise<void>
  removeParticipant: (tripId: string, participantId: string) => Promise<void>
  updateTimeline: (tripId: string, timeline: TripTimelineItem[]) => Promise<void>
  updateChecklist: (tripId: string, checklist: TripChecklistItem[]) => Promise<void>
  clearCurrentTrip: () => void
  deleteTrip: (tripId: string) => Promise<void>
}

export const useTripStore = create<TripState>((set, get) => ({
  trips: [],
  myTrips: [],
  currentTrip: null,
  isLoading: false,
  isLoadingMore: false,
  hasMore: true,
  page: 1,
  error: null,

  fetchTrips: async (refresh = false, filters) => {
    const { page } = get()
    if (refresh) {
      set({ isLoading: true, page: 1 })
    } else {
      set({ isLoadingMore: true })
    }

    try {
      const response = await tripService.getTrips(refresh ? 1 : page, 10, filters)
      set({
        trips: refresh ? response.list : [...get().trips, ...response.list],
        isLoading: false,
        isLoadingMore: false,
        hasMore: response.list.length === 10,
        page: (refresh ? 1 : page) + 1,
      })
    } catch {
      set({
        isLoading: false,
        isLoadingMore: false,
        error: '获取行程列表失败',
      })
    }
  },

  fetchMyTrips: async (_refresh = false) => {
    set({ isLoading: true })
    try {
      const response = await tripService.getMyTrips(1, 50)
      set({
        myTrips: response.list,
        isLoading: false,
      })
    } catch {
      set({ isLoading: false, error: '获取我的行程失败' })
    }
  },

  fetchTripDetail: async (tripId: string) => {
    set({ isLoading: true, currentTrip: null, error: null })
    try {
      const trip = await tripService.getTripDetail(tripId)
      set({ currentTrip: trip, isLoading: false })
    } catch {
      set({ isLoading: false, error: '获取行程详情失败' })
    }
  },

  createTrip: async (data: CreateTripDTO) => {
    set({ isLoading: true, error: null })
    try {
      const newTrip = await tripService.createTrip(data)
      set((state) => ({
        trips: [newTrip, ...state.trips],
        myTrips: [newTrip, ...state.myTrips],
        isLoading: false,
      }))
      return newTrip
    } catch {
      set({ isLoading: false, error: '创建行程失败' })
      throw new Error('创建行程失败')
    }
  },

  joinTrip: async (tripId: string, status: ParticipantStatus) => {
    await tripService.joinTrip(tripId, status)
    const shouldCount = status !== 'declined' && status !== 'cancelled'
    
    const updateTrip = (t: TripWithCreator): TripWithCreator => {
      if (t.id !== tripId) return t
      return {
        ...t,
        isJoined: true,
        myStatus: status,
        participantCount: shouldCount ? t.participantCount + 1 : t.participantCount,
      }
    }

    set((state) => {
      const updatedTrips = state.trips.map(updateTrip)
      const updatedMyTrips = state.myTrips.some((t) => t.id === tripId)
        ? state.myTrips.map(updateTrip)
        : [...state.myTrips, ...updatedTrips.filter((t) => t.id === tripId)]

      return {
        trips: updatedTrips,
        myTrips: updatedMyTrips,
        currentTrip: state.currentTrip?.id === tripId
          ? {
              ...state.currentTrip,
              isJoined: true,
              myStatus: status,
              participantCount: shouldCount ? state.currentTrip.participantCount + 1 : state.currentTrip.participantCount,
            }
          : state.currentTrip,
      }
    })
  },

  leaveTrip: async (tripId: string) => {
    await tripService.leaveTrip(tripId)
    const updateTrip = (t: TripWithCreator): TripWithCreator => {
      if (t.id !== tripId) return t
      return {
        ...t,
        isJoined: false,
        myStatus: undefined,
        participantCount: Math.max(0, t.participantCount - 1),
      }
    }

    set((state) => ({
      trips: state.trips.map(updateTrip),
      myTrips: state.myTrips.filter((t) => t.id !== tripId),
      currentTrip: state.currentTrip?.id === tripId
        ? {
            ...state.currentTrip,
            isJoined: false,
            myStatus: undefined,
            participantCount: Math.max(0, state.currentTrip.participantCount - 1),
          }
        : state.currentTrip,
    }))
  },

  updateTrip: async (tripId: string, data: Partial<CreateTripDTO>) => {
    set({ isLoading: true })
    try {
      await tripService.updateTrip(tripId, data)
      
      const updateTrip = (t: TripWithCreator): TripWithCreator => {
        if (t.id !== tripId) return t
        return {
          ...t,
          ...data,
          updatedAt: new Date().toISOString(),
        }
      }

      set((state) => {
        const updatedTrip = state.currentTrip?.id === tripId
          ? {
              ...state.currentTrip,
              title: data.title ?? state.currentTrip.title,
              type: data.type ?? state.currentTrip.type,
              description: data.description ?? state.currentTrip.description,
              startTime: data.startTime ?? state.currentTrip.startTime,
              endTime: data.endTime ?? state.currentTrip.endTime,
              locationName: data.locationName ?? state.currentTrip.locationName,
              locationAddress: data.locationAddress ?? state.currentTrip.locationAddress,
              maxParticipants: data.maxParticipants ?? state.currentTrip.maxParticipants,
              costType: data.costType ?? state.currentTrip.costType,
              estimatedCost: data.estimatedCost ?? state.currentTrip.estimatedCost,
              visibility: data.visibility ?? state.currentTrip.visibility,
              joinRule: data.joinRule ?? state.currentTrip.joinRule,
              tags: data.tags ?? state.currentTrip.tags,
              updatedAt: new Date().toISOString(),
            }
          : state.currentTrip

        return {
          trips: state.trips.map(updateTrip),
          myTrips: state.myTrips.map(updateTrip),
          currentTrip: updatedTrip,
          isLoading: false,
        }
      })
    } catch {
      set({ isLoading: false, error: '更新行程失败' })
    }
  },

  updateParticipantStatus: async (tripId: string, participantId: string, newStatus: ParticipantStatus) => {
    await tripService.updateParticipantStatus(tripId, participantId, newStatus)
    const updateTripParticipants = (t: TripWithCreator): TripWithCreator => {
      if (t.id !== tripId) return t
      return {
        ...t,
        participants: t.participants.map((p) =>
          p.id === participantId ? { ...p, status: newStatus } : p
        ),
      }
    }

    set((state) => ({
      trips: state.trips.map(updateTripParticipants),
      myTrips: state.myTrips.map(updateTripParticipants),
      currentTrip: state.currentTrip?.id === tripId
        ? {
            ...state.currentTrip,
            participants: state.currentTrip.participants.map((p) =>
              p.id === participantId ? { ...p, status: newStatus } : p
            ),
          }
        : state.currentTrip,
    }))
  },

  removeParticipant: async (tripId: string, participantId: string) => {
    await tripService.removeParticipant(tripId, participantId)
    const updateTripParticipants = (t: TripWithCreator): TripWithCreator => {
      if (t.id !== tripId) return t
      return {
        ...t,
        participantCount: Math.max(0, t.participantCount - 1),
        participants: t.participants.filter((p) => p.id !== participantId),
      }
    }

    set((state) => ({
      trips: state.trips.map(updateTripParticipants),
      myTrips: state.myTrips.map(updateTripParticipants),
      currentTrip: state.currentTrip?.id === tripId
        ? {
            ...state.currentTrip,
            participantCount: Math.max(0, state.currentTrip.participantCount - 1),
            participants: state.currentTrip.participants.filter((p) => p.id !== participantId),
          }
        : state.currentTrip,
    }))
  },

  updateTimeline: async (tripId: string, timeline: TripTimelineItem[]) => {
    await tripService.updateTimeline(tripId, timeline)
    set((state) => ({
      currentTrip: state.currentTrip?.id === tripId
        ? { ...state.currentTrip, timeline }
        : state.currentTrip,
    }))
  },

  updateChecklist: async (tripId: string, checklist: TripChecklistItem[]) => {
    await tripService.updateChecklist(tripId, checklist)
    set((state) => ({
      currentTrip: state.currentTrip?.id === tripId
        ? { ...state.currentTrip, checklist }
        : state.currentTrip,
    }))
  },

  clearCurrentTrip: () => {
    set({ currentTrip: null })
  },

  deleteTrip: async (tripId: string) => {
    await tripService.deleteTrip(tripId)
    set((state) => ({
      trips: state.trips.filter((t) => t.id !== tripId),
      myTrips: state.myTrips.filter((t) => t.id !== tripId),
      currentTrip: state.currentTrip?.id === tripId ? null : state.currentTrip,
    }))
  },
}))
