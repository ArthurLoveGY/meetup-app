import { api } from './request'
import type { FriendWithUser, FriendRequestWithUser, FriendGroup } from '../types'

export const friendService = {
  async getFriends(): Promise<FriendWithUser[]> {
    return api.get<FriendWithUser[]>('/friends')
  },

  async getBlockedUsers(): Promise<FriendWithUser[]> {
    return api.get<FriendWithUser[]>('/friends/blocked')
  },

  async getFriendRequests(): Promise<FriendRequestWithUser[]> {
    return api.get<FriendRequestWithUser[]>('/friends/requests')
  },

  async sendFriendRequest(userId: string, message?: string): Promise<void> {
    return api.post<void>('/friends/requests', { userId, message })
  },

  async acceptFriendRequest(requestId: string): Promise<void> {
    return api.post<void>(`/friends/requests/${requestId}/accept`)
  },

  async rejectFriendRequest(requestId: string): Promise<void> {
    return api.post<void>(`/friends/requests/${requestId}/reject`)
  },

  async removeFriend(friendId: string): Promise<void> {
    return api.delete<void>(`/friends/${friendId}`)
  },

  async blockUser(userId: string): Promise<void> {
    return api.post<void>(`/friends/block`, { userId })
  },

  async unblockUser(userId: string): Promise<void> {
    return api.delete<void>(`/friends/block/${userId}`)
  },

  async getFriendGroups(): Promise<FriendGroup[]> {
    return api.get<FriendGroup[]>('/friends/groups')
  },

  async createFriendGroup(name: string): Promise<FriendGroup> {
    return api.post<FriendGroup>('/friends/groups', { name })
  },

  async updateFriendGroup(groupId: string, name: string): Promise<void> {
    return api.put<void>(`/friends/groups/${groupId}`, { name })
  },

  async deleteFriendGroup(groupId: string): Promise<void> {
    return api.delete<void>(`/friends/groups/${groupId}`)
  },

  async searchUsers(keyword: string): Promise<Array<{ id: string; nickname: string; avatarUrl?: string; city?: string }>> {
    return api.get('/friends/search', { keyword })
  },
}
