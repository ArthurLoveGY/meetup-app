import Taro from '@tarojs/taro'
import { io, Socket } from 'socket.io-client'
import { getToken, clearToken } from './request'
import { SOCKET_BASE_URL } from './config'

let socket: Socket | null = null

// 鉴权类连接错误 → 清 token 并跳登录页，避免无效 token 反复重连
function isAuthError(err: unknown): boolean {
  const e = err as { message?: string; data?: unknown }
  const text = `${e.message ?? ''} ${
    typeof e.data === 'string' ? e.data : JSON.stringify(e.data ?? '')
  }`
  return /token|auth|unauthorized|401/i.test(text)
}

export function getSocket(): Socket {
  if (!socket) {
    socket = io(`${SOCKET_BASE_URL}/chat`, {
      auth: {
        token: getToken(),
      },
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    })
    socket.on('connect_error', (err) => {
      if (isAuthError(err)) {
        clearToken()
        try {
          Taro.reLaunch({ url: '/pages/login/index' })
        } catch {
          /* ignore */
        }
      } else {
        console.warn('socket connect_error', err)
      }
    })
  }
  return socket
}

export function connectSocket(): Socket {
  const s = getSocket()
  if (!s.connected) {
    // 连接/重连前刷新 token，避免使用过期凭证
    s.auth = { token: getToken() }
    s.connect()
  }
  return s
}

/** 登录/恢复后用最新 token 重新建立 socket 连接。 */
export function reconnectSocket(): Socket {
  const s = getSocket()
  s.disconnect()
  s.auth = { token: getToken() }
  s.connect()
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
