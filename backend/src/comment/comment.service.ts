import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Comment } from './comment.entity'

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepo: Repository<Comment>,
  ) {}

  async findByTrip(tripId: string): Promise<Comment[]> {
    return this.commentRepo.find({
      where: { tripId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    })
  }

  async create(tripId: string, userId: string, content: string, parentId?: string): Promise<Comment> {
    return this.commentRepo.save({
      tripId,
      userId,
      content,
      parentId,
    })
  }

  async delete(commentId: string, userId: string): Promise<void> {
    await this.commentRepo.delete({ id: commentId, userId })
  }
}
