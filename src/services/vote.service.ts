import { api } from './request'

interface Vote {
  id: string
  tripId: string
  title: string
  type: 'date' | 'location' | 'restaurant' | 'budget' | 'custom'
  description?: string
  options: VoteOption[]
  createdBy: string
  createdAt: string
  deadline?: string
  isActive: boolean
}

interface VoteOption {
  id: string
  text: string
  votes: Array<{ userId: string; nickname: string }>
}

interface CreateVoteDTO {
  tripId: string
  title: string
  type: Vote['type']
  description?: string
  options: string[]
  deadline?: string
}

export const voteService = {
  async getVotes(tripId: string): Promise<Vote[]> {
    return api.get<Vote[]>(`/trips/${tripId}/votes`)
  },

  async getVoteDetail(tripId: string, voteId: string): Promise<Vote> {
    return api.get<Vote>(`/trips/${tripId}/votes/${voteId}`)
  },

  async createVote(data: CreateVoteDTO): Promise<Vote> {
    return api.post<Vote>(`/trips/${data.tripId}/votes`, data as unknown as Record<string, unknown>)
  },

  async vote(tripId: string, voteId: string, optionId: string): Promise<void> {
    return api.post<void>(`/trips/${tripId}/votes/${voteId}/options/${optionId}`)
  },

  async deleteVote(tripId: string, voteId: string): Promise<void> {
    return api.delete<void>(`/trips/${tripId}/votes/${voteId}`)
  },

  async closeVote(tripId: string, voteId: string): Promise<void> {
    return api.post<void>(`/trips/${tripId}/votes/${voteId}/close`)
  },
}
