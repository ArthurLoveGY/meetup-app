import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Vote } from './vote.entity'
import { VoteOption } from './vote-option.entity'

@Injectable()
export class VoteService {
  constructor(
    @InjectRepository(Vote)
    private voteRepo: Repository<Vote>,
    @InjectRepository(VoteOption)
    private optionRepo: Repository<VoteOption>,
  ) {}

  async findByTrip(tripId: string): Promise<Vote[]> {
    return this.voteRepo.find({
      where: { tripId },
      relations: ['options', 'createdBy'],
      order: { createdAt: 'DESC' },
    })
  }

  async create(tripId: string, userId: string, data: { title: string; type?: string; options: string[] }): Promise<Vote> {
    const vote = this.voteRepo.create({
      tripId,
      title: data.title,
      type: (data.type || 'custom') as any,
      createdById: userId,
    })
    const savedVote = await this.voteRepo.save(vote)

    await this.optionRepo.save(
      data.options.map((text) => ({
        voteId: savedVote.id,
        text,
      })),
    )

    return this.voteRepo.findOne({
      where: { id: savedVote.id },
      relations: ['options', 'createdBy'],
    })
  }

  async vote(voteId: string, optionId: string, userId: string): Promise<void> {
    const vote = await this.voteRepo.findOne({ where: { id: voteId } })
    if (!vote) throw new NotFoundException('Vote not found')
    if (!vote.isActive) throw new Error('投票已结束')

    const option = await this.optionRepo.findOne({ where: { id: optionId, voteId } })
    if (!option) throw new NotFoundException('Option not found')

    // Single-choice semantics: remove the user's vote from any other option
    // in this vote first, to avoid double counting.
    const allOptions = await this.optionRepo.find({ where: { voteId } })
    const changedOptions: VoteOption[] = []
    for (const opt of allOptions) {
      if (opt.id === optionId) {
        if (!opt.votedUserIds.includes(userId)) {
          opt.votedUserIds = [...opt.votedUserIds, userId]
          changedOptions.push(opt)
        }
      } else if (opt.votedUserIds.includes(userId)) {
        opt.votedUserIds = opt.votedUserIds.filter((id) => id !== userId)
        changedOptions.push(opt)
      }
    }
    if (changedOptions.length > 0) {
      await this.optionRepo.save(changedOptions)
    }
  }

  async delete(voteId: string): Promise<void> {
    await this.optionRepo.delete({ voteId })
    await this.voteRepo.delete(voteId)
  }
}
