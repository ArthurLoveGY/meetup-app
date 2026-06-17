import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { JwtService } from '@nestjs/jwt'
import { ChatService } from './chat.service'

interface AuthenticatedSocket extends Socket {
  userId?: string
}

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:10086', 'https://servicewechat.com'],
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  private onlineUsers = new Map<string, Set<string>>() // tripId -> Set<userId>

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.query?.token
      if (!token) {
        client.disconnect()
        return
      }
      const payload = this.jwtService.verify(token as string)
      client.userId = payload.sub
    } catch {
      client.disconnect()
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      // Remove from all trip rooms
      this.onlineUsers.forEach((users, tripId) => {
        if (users.has(client.userId)) {
          users.delete(client.userId)
          this.server.to(`trip:${tripId}`).emit('user_left', {
            userId: client.userId,
            onlineCount: users.size,
          })
        }
      })
    }
  }

  @SubscribeMessage('join_trip')
  async handleJoinTrip(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { tripId: string },
  ) {
    const { tripId } = data
    client.join(`trip:${tripId}`)

    if (!this.onlineUsers.has(tripId)) {
      this.onlineUsers.set(tripId, new Set())
    }
    this.onlineUsers.get(tripId).add(client.userId)

    this.server.to(`trip:${tripId}`).emit('user_joined', {
      userId: client.userId,
      onlineCount: this.onlineUsers.get(tripId).size,
    })
  }

  @SubscribeMessage('leave_trip')
  async handleLeaveTrip(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { tripId: string },
  ) {
    const { tripId } = data
    client.leave(`trip:${tripId}`)

    const users = this.onlineUsers.get(tripId)
    if (users) {
      users.delete(client.userId)
      this.server.to(`trip:${tripId}`).emit('user_left', {
        userId: client.userId,
        onlineCount: users.size,
      })
    }
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { tripId: string; content: string; type?: string },
  ) {
    const { tripId, content, type } = data
    if (!content?.trim()) return

    const message = await this.chatService.createMessage(tripId, client.userId, content.trim(), type)

    this.server.to(`trip:${tripId}`).emit('new_message', {
      id: message.id,
      userId: message.userId,
      nickname: message.user?.nickname || '用户',
      avatarUrl: message.user?.avatarUrl,
      content: message.content,
      type: message.type,
      createdAt: message.createdAt,
    })
  }
}
