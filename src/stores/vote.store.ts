import { create } from 'zustand'
import { voteService } from '../services'

interface VoteOption {
  id: string
  text: string
  votes: Array<{ userId: string; nickname: string }>
}

interface Vote {
  id: string
  tripId: string
  title: string
  type: 'date' | 'location' | 'restaurant' | 'budget' | 'custom'
  description?: string
  options: VoteOption[]
  createdBy: { id: string; nickname: string }
  createdAt: string
  deadline?: string
  isActive: boolean
}

interface VoteState {
  votes: Vote[]
  currentVote: Vote | null
  isLoading: boolean
  error: string | null

  fetchVotes: (tripId: string) => Promise<void>
  fetchVoteDetail: (voteId: string) => Promise<void>
  createVote: (tripId: string, title: string, type: Vote['type'], options: string[]) => Promise<void>
  vote: (voteId: string, optionId: string) => Promise<void>
  deleteVote: (voteId: string) => Promise<void>
  closeVote: (voteId: string) => Promise<void>
}

export const useVoteStore = create<VoteState>((set, get) => ({
  votes: [],
  currentVote: null,
  isLoading: false,
  error: null,

  fetchVotes: async (tripId: string) => {
    set({ isLoading: true, error: null })
    try {
      const votes = await voteService.getVotes(tripId) as unknown as Vote[]
      set({ votes, isLoading: false })
    } catch {
      set({ isLoading: false, error: '获取投票列表失败' })
    }
  },

  fetchVoteDetail: async (voteId: string) => {
    set({ isLoading: true, error: null, currentVote: null })
    try {
      const vote = get().votes.find((v) => v.id === voteId)
      if (vote) {
        const detail = await voteService.getVoteDetail(vote.tripId, voteId) as unknown as Vote
        set({ currentVote: detail, isLoading: false })
      } else {
        set({ isLoading: false, error: '投票不存在' })
      }
    } catch {
      set({ isLoading: false, error: '获取投票详情失败' })
    }
  },

  createVote: async (tripId: string, title: string, type: Vote['type'], options: string[]) => {
    set({ isLoading: true })
    try {
      const newVote = await voteService.createVote({ tripId, title, type, options }) as unknown as Vote
      set((state) => ({
        votes: [...state.votes, newVote],
        isLoading: false,
      }))
    } catch {
      set({ isLoading: false, error: '创建投票失败' })
    }
  },

  vote: async (voteId: string, optionId: string) => {
    const vote = get().votes.find((v) => v.id === voteId)
    if (!vote) return
    await voteService.vote(vote.tripId, voteId, optionId)
    set((state) => ({
      votes: state.votes.map((v) =>
        v.id === voteId
          ? {
              ...v,
              options: v.options.map((o) =>
                o.id === optionId
                  ? { ...o, votes: [...o.votes, { userId: 'current_user', nickname: 'Me' }] }
                  : o
              ),
            }
          : v
      ),
      currentVote:
        state.currentVote?.id === voteId
          ? {
              ...state.currentVote,
              options: state.currentVote.options.map((o) =>
                o.id === optionId
                  ? { ...o, votes: [...o.votes, { userId: 'current_user', nickname: 'Me' }] }
                  : o
              ),
            }
          : state.currentVote,
    }))
  },

  deleteVote: async (voteId: string) => {
    const vote = get().votes.find((v) => v.id === voteId)
    if (!vote) return
    await voteService.deleteVote(vote.tripId, voteId)
    set((state) => ({
      votes: state.votes.filter((v) => v.id !== voteId),
    }))
  },

  closeVote: async (voteId: string) => {
    const vote = get().votes.find((v) => v.id === voteId)
    if (!vote) return
    await voteService.closeVote(vote.tripId, voteId)
    set((state) => ({
      votes: state.votes.map((v) => (v.id === voteId ? { ...v, isActive: false } : v)),
      currentVote: state.currentVote?.id === voteId ? { ...state.currentVote, isActive: false } : state.currentVote,
    }))
  },
}))
