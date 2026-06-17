import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ChatMessage } from './chat.entity'

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMessage)
    private messageRepo: Repository<ChatMessage>,
  ) {}

  async getMessages(tripId: string, page = 1, limit = 50): Promise<{ list: ChatMessage[]; total: number }> {
    const [list, total] = await this.messageRepo.findAndCount({
      where: { tripId },
      relations: ['user'],
      order: { createdAt: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    })
    return { list, total }
  }

  async createMessage(tripId: string, userId: string, content: string, type = 'text'): Promise<ChatMessage> {
    const message = this.messageRepo.create({
      tripId,
      userId,
      content,
      type: type as any,
    })
    const saved = await this.messageRepo.save(message)
    // Reload with user relation
    return this.messageRepo.findOne({
      where: { id: saved.id },
      relations: ['user'],
    })
  }

  async deleteMessage(messageId: string, userId: string): Promise<void> {
    await this.messageRepo.delete({ id: messageId, userId })
  }
}
