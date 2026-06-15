import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Trip } from './trip.entity'
import { TripParticipant } from './trip-participant.entity'
import { TripTimeline } from './trip-timeline.entity'
import { TripChecklist } from './trip-checklist.entity'

@Injectable()
export class TripService {
  constructor(
    @InjectRepository(Trip)
    private tripRepo: Repository<Trip>,
    @InjectRepository(TripParticipant)
    private participantRepo: Repository<TripParticipant>,
    @InjectRepository(TripTimeline)
    private timelineRepo: Repository<TripTimeline>,
    @InjectRepository(TripChecklist)
    private checklistRepo: Repository<TripChecklist>,
  ) {}

  async findAll(page = 1, limit = 10, filters?: {
    keyword?: string; type?: string; status?: string;
    sort?: string; lat?: number; lng?: number;
  }): Promise<{ list: Trip[]; total: number }> {
    const qb = this.tripRepo.createQueryBuilder('trip')
      .leftJoinAndSelect('trip.creator', 'creator')
      .leftJoinAndSelect('trip.participants', 'participants')
      .leftJoinAndSelect('participants.user', 'participantUser')
      .where('trip.status = :status', { status: filters?.status || 'published' })

    if (filters?.keyword) {
      qb.andWhere('(trip.title LIKE :kw OR trip.description LIKE :kw OR trip.locationName LIKE :kw)', { kw: `%${filters.keyword}%` })
    }
    if (filters?.type) {
      qb.andWhere('trip.type = :type', { type: filters.type })
    }

    // Sorting: hot (by participant count), nearby (by distance), latest (default)
    const sort = filters?.sort || 'latest'
    if (sort === 'hot') {
      qb.loadRelationCountAndMap('trip._participantCount', 'trip.participants')
      qb.orderBy('trip._participantCount', 'DESC')
      qb.addOrderBy('trip.createdAt', 'DESC')
    } else if (sort === 'nearby' && filters?.lat != null && filters?.lng != null) {
      // Haversine formula for distance sorting
      qb.addSelect(
        `(6371 * acos(cos(radians(:lat)) * cos(radians(trip.latitude)) * cos(radians(trip.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(trip.latitude))))`,
        'distance',
      )
      qb.setParameters({ lat: filters.lat, lng: filters.lng })
      qb.orderBy('distance', 'ASC')
      qb.addOrderBy('trip.createdAt', 'DESC')
    } else {
      qb.orderBy('trip.createdAt', 'DESC')
    }

    qb.skip((page - 1) * limit).take(limit)

    const [list, total] = await qb.getManyAndCount()
    return { list, total }
  }

  async findByCreator(creatorId: string, page = 1, limit = 10): Promise<{ list: Trip[]; total: number }> {
    const [list, total] = await this.tripRepo.findAndCount({
      where: { creatorId },
      relations: ['creator', 'participants', 'participants.user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    })
    return { list, total }
  }

  async findByParticipant(userId: string, page = 1, limit = 10): Promise<{ list: Trip[]; total: number }> {
    const participants = await this.participantRepo.find({
      where: { userId },
      relations: ['trip', 'trip.creator', 'trip.participants'],
    })
    const trips = participants.map((p) => p.trip)
    return { list: trips.slice((page - 1) * limit, page * limit), total: trips.length }
  }

  async findById(id: string): Promise<Trip> {
    const trip = await this.tripRepo.findOne({
      where: { id },
      relations: ['creator', 'participants', 'participants.user', 'timeline', 'checklist'],
    })
    if (!trip) throw new NotFoundException('Trip not found')
    return trip
  }

  async create(userId: string, data: Partial<Trip>): Promise<Trip> {
    const trip = this.tripRepo.create({ ...data, creatorId: userId })
    const saved = await this.tripRepo.save(trip)
    
    await this.participantRepo.save({
      tripId: saved.id,
      userId,
      status: 'confirmed',
      role: 'creator',
    })
    
    return this.findById(saved.id)
  }

  async update(id: string, userId: string, data: Partial<Trip>): Promise<Trip> {
    await this.assertCreator(id, userId)
    // Never allow client to overwrite identity/ownership fields.
    const { id: _id, creatorId: _creatorId, ...safe } = data as Partial<Trip>
    await this.tripRepo.update(id, safe)
    return this.findById(id)
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.assertCreator(id, userId)
    await this.tripRepo.delete(id)
  }

  async joinTrip(tripId: string, userId: string, status: string, note?: string): Promise<TripParticipant> {
    const existing = await this.participantRepo.findOne({ where: { tripId, userId } })
    if (existing) {
      existing.status = status as any
      existing.note = note
      return this.participantRepo.save(existing)
    }
    
    return this.participantRepo.save({
      tripId,
      userId,
      status: status as any,
      note,
      role: 'participant',
    })
  }

  async leaveTrip(tripId: string, userId: string): Promise<void> {
    // The creator cannot leave their own trip (would orphan it).
    const participant = await this.participantRepo.findOne({ where: { tripId, userId } })
    if (participant?.role === 'creator') {
      throw new ForbiddenException('组织者不能退出，请先转让或删除行程')
    }
    await this.participantRepo.delete({ tripId, userId })
  }

  async updateParticipantStatus(tripId: string, requesterId: string, userId: string, status: string): Promise<void> {
    await this.assertCreator(tripId, requesterId)
    await this.participantRepo.update({ tripId, userId }, { status: status as any })
  }

  async getParticipants(tripId: string): Promise<TripParticipant[]> {
    return this.participantRepo.find({
      where: { tripId },
      relations: ['user'],
    })
  }

  async removeParticipant(tripId: string, requesterId: string, userId: string): Promise<void> {
    await this.assertCreator(tripId, requesterId)
    await this.participantRepo.delete({ tripId, userId })
  }

  async updateTimeline(tripId: string, items: Partial<TripTimeline>[]): Promise<void> {
    await this.timelineRepo.delete({ tripId })
    await this.timelineRepo.save(items.map((item, i) => ({
      ...item,
      tripId,
      sortOrder: i,
    })))
  }

  async updateChecklist(tripId: string, items: Partial<TripChecklist>[]): Promise<void> {
    await this.checklistRepo.delete({ tripId })
    await this.checklistRepo.save(items.map((item, i) => ({
      ...item,
      tripId,
      sortOrder: i,
    })))
  }

  /** Throws ForbiddenException unless `userId` is the creator of trip `tripId`. */
  private async assertCreator(tripId: string, userId: string): Promise<void> {
    const trip = await this.tripRepo.findOne({ where: { id: tripId }, select: ['id', 'creatorId'] })
    if (!trip) throw new NotFoundException('Trip not found')
    if (trip.creatorId !== userId) throw new ForbiddenException('无权操作该行程')
  }
}
