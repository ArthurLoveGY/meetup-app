import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Trip } from '../trip/trip.entity'
import { TripParticipant } from '../trip/trip-participant.entity'
import { Comment } from '../comment/comment.entity'
import { User } from '../user/user.entity'

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Trip)
    private tripRepo: Repository<Trip>,
    @InjectRepository(TripParticipant)
    private participantRepo: Repository<TripParticipant>,
    @InjectRepository(Comment)
    private commentRepo: Repository<Comment>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async getYearReview(userId: string, year: number) {
    const startDate = new Date(year, 0, 1)
    const endDate = new Date(year + 1, 0, 1)

    // Trips created by user
    const createdTrips = await this.tripRepo.find({
      where: {
        creatorId: userId,
      },
      relations: ['participants', 'participants.user'],
    })
    const yearCreatedTrips = createdTrips.filter(
      (t) => new Date(t.createdAt) >= startDate && new Date(t.createdAt) < endDate,
    )

    // Trips joined by user
    const participations = await this.participantRepo.find({
      where: { userId },
      relations: ['trip', 'trip.creator', 'trip.participants'],
    })
    const yearParticipations = participations.filter(
      (p) => new Date(p.joinedAt) >= startDate && new Date(p.joinedAt) < endDate,
    )

    // All trips user was involved in (created + joined)
    const allTripIds = new Set<string>()
    yearCreatedTrips.forEach((t) => allTripIds.add(t.id))
    yearParticipations.forEach((p) => allTripIds.add(p.tripId))

    // Calculate stats
    const totalTrips = allTripIds.size
    const completedTrips = [...allTripIds].filter((id) => {
      const trip = yearCreatedTrips.find((t) => t.id === id) || yearParticipations.find((p) => p.tripId === id)?.trip
      return trip && (trip.status === 'completed' || new Date(trip.endTime || trip.startTime) < new Date())
    }).length

    // Count unique participants across all trips
    const uniqueParticipants = new Set<string>()
    let totalParticipantCount = 0
    yearCreatedTrips.forEach((t) => {
      t.participants?.forEach((p) => {
        uniqueParticipants.add(p.userId)
        totalParticipantCount++
      })
    })
    yearParticipations.forEach((p) => {
      if (p.trip?.participants) {
        p.trip.participants.forEach((pp) => {
          uniqueParticipants.add(pp.userId)
          totalParticipantCount++
        })
      }
    })

    // Top trip type
    const typeCounts: Record<string, number> = {}
    const allTrips = [
      ...yearCreatedTrips,
      ...yearParticipations.map((p) => p.trip).filter(Boolean),
    ]
    allTrips.forEach((t) => {
      typeCounts[t.type] = (typeCounts[t.type] || 0) + 1
    })
    const topTripType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'other'

    // Top location
    const locationCounts: Record<string, number> = {}
    allTrips.forEach((t) => {
      if (t.locationName) {
        locationCounts[t.locationName] = (locationCounts[t.locationName] || 0) + 1
      }
    })
    const topLocation = Object.entries(locationCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || ''

    // Top friends (most frequent co-participants)
    const friendCounts: Record<string, { nickname: string; count: number }> = {}
    const allParticipantRecords = await this.participantRepo.find({
      where: { userId },
      relations: ['trip', 'trip.participants', 'trip.participants.user'],
    })
    const yearRecords = allParticipantRecords.filter(
      (p) => new Date(p.joinedAt) >= startDate && new Date(p.joinedAt) < endDate,
    )
    yearRecords.forEach((p) => {
      p.trip?.participants?.forEach((pp) => {
        if (pp.userId !== userId && pp.user) {
          if (!friendCounts[pp.userId]) {
            friendCounts[pp.userId] = { nickname: pp.user.nickname, count: 0 }
          }
          friendCounts[pp.userId].count++
        }
      })
    })
    const topFriends = Object.entries(friendCounts)
      .map(([id, data]) => ({ id, nickname: data.nickname, tripCount: data.count }))
      .sort((a, b) => b.tripCount - a.tripCount)
      .slice(0, 5)

    // Monthly highlights
    const monthlyHighlights: Array<{ month: string; trip: string; participants: number }> = []
    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    for (let m = 0; m < 12; m++) {
      const monthTrips = allTrips.filter((t) => {
        const d = new Date(t.startTime)
        return d.getMonth() === m && d.getFullYear() === year
      })
      if (monthTrips.length > 0) {
        // Pick the trip with most participants for this month
        const best = monthTrips.reduce((prev, curr) => {
          const prevCount = prev.participants?.length || 0
          const currCount = curr.participants?.length || 0
          return currCount > prevCount ? curr : prev
        })
        monthlyHighlights.push({
          month: monthNames[m],
          trip: best.title,
          participants: best.participants?.length || 0,
        })
      }
    }

    // Longest trip
    const longestTrip = allTrips.reduce(
      (best, t) => {
        if (!t.endTime) return best
        const days = Math.ceil(
          (new Date(t.endTime).getTime() - new Date(t.startTime).getTime()) / (1000 * 60 * 60 * 24),
        )
        return days > best.days ? { title: t.title, days } : best
      },
      { title: '', days: 0 },
    )

    // Busiest month
    const monthTripCounts: Record<number, number> = {}
    allTrips.forEach((t) => {
      const m = new Date(t.startTime).getMonth()
      monthTripCounts[m] = (monthTripCounts[m] || 0) + 1
    })
    const busiestMonthIdx = Object.entries(monthTripCounts).sort((a, b) => Number(b[1]) - Number(a[1]))[0]?.[0]
    const busiestMonth = busiestMonthIdx != null ? monthNames[Number(busiestMonthIdx)] : ''

    return {
      year,
      totalTrips,
      completedTrips,
      totalParticipants: totalParticipantCount,
      uniqueFriends: uniqueParticipants.size,
      topTripType: this.translateType(topTripType),
      topLocation,
      longestTrip: longestTrip.title ? `${longestTrip.days}天${longestTrip.title}` : '',
      busiestMonth,
      highlights: monthlyHighlights,
      topFriends,
      stats: {
        totalTrips,
        completedTrips,
        totalParticipants: totalParticipantCount,
        uniqueFriends: uniqueParticipants.size,
        topTripType: this.translateType(topTripType),
        topLocation,
        longestTrip: longestTrip.title ? `${longestTrip.days}天${longestTrip.title}` : '',
        busiestMonth,
      },
    }
  }

  private translateType(type: string): string {
    const map: Record<string, string> = {
      meal: '聚餐',
      travel: '旅行',
      sport: '运动',
      exhibition: '看展',
      game: '游戏',
      study: '学习',
      other: '其他',
    }
    return map[type] || type
  }
}
