import { create } from 'zustand'
import { friendService } from '../services'
import type { FriendWithUser, FriendRequestWithUser, FriendGroup } from '../types'

interface FriendState {
  friends: FriendWithUser[]
  requests: FriendRequestWithUser[]
  groups: FriendGroup[]
  searchResults: Array<{ id: string; nickname: string; avatarUrl?: string; city?: string }>
  isLoading: boolean
  error: string | null

  fetchFriends: () => Promise<void>
  fetchBlockedUsers: () => Promise<void>
  fetchRequests: () => Promise<void>
  sendRequest: (userId: string, message?: string) => Promise<void>
  acceptRequest: (requestId: string) => Promise<void>
  rejectRequest: (requestId: string) => Promise<void>
  removeFriend: (friendId: string) => Promise<void>
  blockUser: (userId: string) => Promise<void>
  unblockUser: (userId: string) => Promise<void>
  fetchGroups: () => Promise<void>
  createGroup: (name: string) => Promise<void>
  updateGroup: (groupId: string, name: string) => Promise<void>
  deleteGroup: (groupId: string) => Promise<void>
  searchUsers: (keyword: string) => Promise<void>
  clearSearchResults: () => void
}

export const useFriendStore = create<FriendState>((set) => ({
  friends: [],
  requests: [],
  groups: [],
  searchResults: [],
  isLoading: false,
  error: null,

  fetchFriends: async () => {
    set({ isLoading: true, error: null })
    try {
      const friends = await friendService.getFriends()
      set({ friends, isLoading: false })
    } catch {
      set({ isLoading: false, error: '获取好友列表失败' })
    }
  },

  fetchBlockedUsers: async () => {
    set({ isLoading: true, error: null })
    try {
      const blocked = await friendService.getBlockedUsers()
      set({ friends: blocked, isLoading: false })
    } catch {
      set({ isLoading: false, error: '获取黑名单失败' })
    }
  },

  fetchRequests: async () => {
    set({ isLoading: true, error: null })
    try {
      const requests = await friendService.getFriendRequests()
      set({ requests, isLoading: false })
    } catch {
      set({ isLoading: false, error: '获取好友申请失败' })
    }
  },

  sendRequest: async (userId: string, message?: string) => {
    await friendService.sendFriendRequest(userId, message)
  },

  acceptRequest: async (requestId: string) => {
    await friendService.acceptFriendRequest(requestId)
    set((state) => ({
      requests: state.requests.map((r) =>
        r.id === requestId ? { ...r, status: 'accepted' as const } : r
      ),
    }))
  },

  rejectRequest: async (requestId: string) => {
    await friendService.rejectFriendRequest(requestId)
    set((state) => ({
      requests: state.requests.filter((r) => r.id !== requestId),
    }))
  },

  removeFriend: async (friendId: string) => {
    await friendService.removeFriend(friendId)
    set((state) => ({
      friends: state.friends.filter((f) => f.friendId !== friendId),
    }))
  },

  blockUser: async (userId: string) => {
    await friendService.blockUser(userId)
    set((state) => ({
      friends: state.friends.filter((f) => f.friendId !== userId),
    }))
  },

  unblockUser: async (userId: string) => {
    await friendService.unblockUser(userId)
  },

  fetchGroups: async () => {
    const groups = await friendService.getFriendGroups()
    set({ groups })
  },

  createGroup: async (name: string) => {
    const newGroup = await friendService.createFriendGroup(name)
    set((state) => ({ groups: [...state.groups, newGroup] }))
  },

  updateGroup: async (groupId: string, name: string) => {
    await friendService.updateFriendGroup(groupId, name)
    set((state) => ({
      groups: state.groups.map((g) => (g.id === groupId ? { ...g, name } : g)),
    }))
  },

  deleteGroup: async (groupId: string) => {
    await friendService.deleteFriendGroup(groupId)
    set((state) => ({
      groups: state.groups.filter((g) => g.id !== groupId),
    }))
  },

  searchUsers: async (keyword: string) => {
    if (!keyword.trim()) {
      set({ searchResults: [] })
      return
    }
    set({ isLoading: true })
    const results = await friendService.searchUsers(keyword)
    set({ searchResults: results, isLoading: false })
  },

  clearSearchResults: () => {
    set({ searchResults: [] })
  },
}))
