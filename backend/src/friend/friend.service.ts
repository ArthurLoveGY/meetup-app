import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { FriendRelation } from './friend.entity'

@Injectable()
export class FriendService {
  constructor(
    @InjectRepository(FriendRelation)
    private friendRepo: Repository<FriendRelation>,
  ) {}

  async getFriends(userId: string): Promise<FriendRelation[]> {
    return this.friendRepo.find({
      where: { userId, status: 'accepted' },
      relations: ['friend'],
    })
  }

  async getBlockedUsers(userId: string): Promise<FriendRelation[]> {
    return this.friendRepo.find({
      where: { userId, status: 'blocked' },
      relations: ['friend'],
    })
  }

  async getRequests(userId: string): Promise<FriendRelation[]> {
    return this.friendRepo.find({
      where: { friendId: userId, status: 'pending' },
      relations: ['user'],
    })
  }

  async sendRequest(userId: string, friendId: string, message?: string): Promise<FriendRelation> {
    const existing = await this.friendRepo.findOne({ where: { userId, friendId } })
    if (existing) return existing
    
    return this.friendRepo.save({
      userId,
      friendId,
      status: 'pending',
      source: 'search',
    })
  }

  async acceptRequest(requestId: string, currentUserId: string): Promise<void> {
    const request = await this.friendRepo.findOne({ where: { id: requestId } })
    if (!request) throw new NotFoundException()
    // Only the user who received the request (friendId) may accept it.
    if (request.friendId !== currentUserId) throw new NotFoundException()
    if (request.status !== 'pending') return

    request.status = 'accepted'
    await this.friendRepo.save(request)

    // Create or update the reverse relation idempotently to avoid duplicates.
    const reverse = await this.friendRepo.findOne({
      where: { userId: request.friendId, friendId: request.userId },
    })
    if (reverse) {
      reverse.status = 'accepted'
      await this.friendRepo.save(reverse)
    } else {
      await this.friendRepo.save({
        userId: request.friendId,
        friendId: request.userId,
        status: 'accepted',
        source: request.source,
      })
    }
  }

  async rejectRequest(requestId: string, currentUserId: string): Promise<void> {
    const request = await this.friendRepo.findOne({ where: { id: requestId } })
    if (!request) throw new NotFoundException()
    // Only the user who received the request (friendId) may reject it.
    if (request.friendId !== currentUserId) throw new NotFoundException()
    await this.friendRepo.update(requestId, { status: 'rejected' })
  }

  async removeFriend(userId: string, friendId: string): Promise<void> {
    await this.friendRepo.delete({ userId, friendId })
    await this.friendRepo.delete({ userId: friendId, friendId: userId })
  }

  async blockUser(userId: string, friendId: string): Promise<void> {
    await this.friendRepo.delete({ userId, friendId })
    await this.friendRepo.save({
      userId,
      friendId,
      status: 'blocked',
    })
  }

  async unblockUser(userId: string, friendId: string): Promise<void> {
    await this.friendRepo.delete({ userId, friendId, status: 'blocked' })
  }

  async getGroups(userId: string): Promise<any[]> {
    return []
  }

  async createGroup(userId: string, name: string): Promise<any> {
    return { id: 'grp_' + Date.now(), name, userId }
  }

  async updateGroup(groupId: string, name: string): Promise<void> {
    return
  }

  async deleteGroup(groupId: string): Promise<void> {
    return
  }

  async searchUsers(keyword: string): Promise<any[]> {
    return []
  }
}
