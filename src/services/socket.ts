import { io, Socket } from 'socket.io-client'
import { getToken } from './request'

// 小程序环境没有 process.env，与 request.ts 保持一致
const SOCKET_URL = 'http://localhost:3000'

let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    socket = io(`${SOCKET_URL}/chat`, {
      auth: {
        token: getToken(),
      },
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    })
  }
  return socket
}

export function connectSocket(): Socket {
  const s = getSocket()
  if (!s.connected) {
    // Update token before connecting
    s.auth = { token: getToken() }
    s.connect()
  }
  return s
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export function joinTripRoom(tripId: string): void {
  const s = getSocket()
  s.emit('join_trip', { tripId })
}

export function leaveTripRoom(tripId: string): void {
  const s = getSocket()
  s.emit('leave_trip', { tripId })
}

export function sendSocketMessage(tripId: string, content: string, type = 'text'): void {
  const s = getSocket()
  s.emit('send_message', { tripId, content, type })
}

export type MessageHandler = (message: {
  id: string
  userId: string
  nickname: string
  avatarUrl?: string
  content: string
  type: string
  createdAt: string
}) => void

export type UserEventHandler = (data: { userId: string; onlineCount: number }) => void

export function onNewMessage(handler: MessageHandler): void {
  const s = getSocket()
  s.on('new_message', handler)
}

export function offNewMessage(handler: MessageHandler): void {
  const s = getSocket()
  s.off('new_message', handler)
}

export function onUserJoined(handler: UserEventHandler): void {
  const s = getSocket()
  s.on('user_joined', handler)
}

export function offUserJoined(handler: UserEventHandler): void {
  const s = getSocket()
  s.off('user_joined', handler)
}

export function onUserLeft(handler: UserEventHandler): void {
  const s = getSocket()
  s.on('user_left', handler)
}

export function offUserLeft(handler: UserEventHandler): void {
  const s = getSocket()
  s.off('user_left', handler)
}
