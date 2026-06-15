import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Notification } from './notification.entity'

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notifRepo: Repository<Notification>,
  ) {}

  async findByUser(userId: string, page = 1, limit = 20): Promise<{ data: Notification[]; total: number }> {
    const [data, total] = await this.notifRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    })
    return { data, total }
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notifRepo.count({ where: { userId, read: false } })
  }

  async create(userId: string, type: string, title: string, content: string, relatedId?: string): Promise<Notification> {
    return this.notifRepo.save({
      userId,
      type: type as any,
      title,
      content,
      relatedId,
    })
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await this.notifRepo.update({ id: notificationId, userId }, { read: true })
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notifRepo.update({ userId, read: false }, { read: true })
  }

  async delete(notificationId: string, userId: string): Promise<void> {
    await this.notifRepo.delete({ id: notificationId, userId })
  }
}
