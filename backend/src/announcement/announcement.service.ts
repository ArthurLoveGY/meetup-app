import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Announcement } from './announcement.entity'

@Injectable()
export class AnnouncementService {
  constructor(
    @InjectRepository(Announcement)
    private announcementRepo: Repository<Announcement>,
  ) {}

  async findAll(page = 1, limit = 20): Promise<{ list: Announcement[]; total: number }> {
    const [list, total] = await this.announcementRepo.findAndCount({
      where: { active: true },
      order: { priority: 'DESC', publishedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    })
    return { list, total }
  }

  async findById(id: string): Promise<Announcement> {
    return this.announcementRepo.findOne({ where: { id } })
  }

  async create(data: Partial<Announcement>): Promise<Announcement> {
    const announcement = this.announcementRepo.create({
      ...data,
      publishedAt: data.publishedAt || new Date(),
    })
    return this.announcementRepo.save(announcement)
  }

  async update(id: string, data: Partial<Announcement>): Promise<Announcement> {
    await this.announcementRepo.update(id, data)
    return this.announcementRepo.findOne({ where: { id } })
  }

  async delete(id: string): Promise<void> {
    await this.announcementRepo.delete(id)
  }
}
