import { api } from './request'
import {
  connectSocket,
  joinTripRoom,
  leaveTripRoom,
  sendSocketMessage,
  onNewMessage,
  offNewMessage,
  onUserJoined,
  offUserJoined,
  onUserLeft,
  offUserLeft,
  disconnectSocket,
} from './socket'
import type { MessageHandler, UserEventHandler } from './socket'

export interface ChatMessage {
  id: string
  userId: string
  nickname: string
  avatarUrl?: string
  content: string
  type: string
  createdAt: string
}

export const chatService = {
  /** Fetch historical messages via REST API */
  async getMessages(tripId: string, page = 1, pageSize = 50): Promise<ChatMessage[]> {
    const data = await api.get<{ list: Array<{
      id: string
      userId: string
      user?: { nickname: string; avatarUrl?: string }
      content: string
      type: string
      createdAt: string
    }> }>(`/trips/${tripId}/chat/messages`, { page, limit: pageSize })

    const list = data.list || (data as unknown as ChatMessage[])
    return (Array.isArray(list) ? list : []).map((msg) => ({
      id: msg.id,
      userId: msg.userId,
      nickname: msg.user?.nickname || '用户',
      avatarUrl: msg.user?.avatarUrl,
      content: msg.content,
      type: msg.type || 'text',
      createdAt: msg.createdAt,
    }))
  },

  /** Connect to WebSocket and join a trip chat room */
  joinTrip(tripId: string): void {
    connectSocket()
    joinTripRoom(tripId)
  },

  /** Leave a trip chat room */
  leaveTrip(tripId: string): void {
    leaveTripRoom(tripId)
  },

  /** Send a message via WebSocket */
  sendMessage(tripId: string, content: string): void {
    sendSocketMessage(tripId, content, 'text')
  },

  /** Subscribe to real-time message events */
  onMessage(handler: MessageHandler): void {
    connectSocket()
    onNewMessage(handler)
  },

  offMessage(handler: MessageHandler): void {
    offNewMessage(handler)
  },

  onUserJoined(handler: UserEventHandler): void {
    onUserJoined(handler)
  },

  offUserJoined(handler: UserEventHandler): void {
    offUserJoined(handler)
  },

  onUserLeft(handler: UserEventHandler): void {
    onUserLeft(handler)
  },

  offUserLeft(handler: UserEventHandler): void {
    offUserLeft(handler)
  },

  /** Disconnect from WebSocket */
  disconnect(): void {
    disconnectSocket()
  },
}
