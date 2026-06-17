import { api } from './request'

export interface YearReviewData {
  year: number
  totalTrips: number
  completedTrips: number
  totalParticipants: number
  uniqueFriends: number
  topTripType: string
  topLocation: string
  longestTrip: string
  busiestMonth: string
  highlights: Array<{
    month: string
    trip: string
    participants: number
  }>
  topFriends: Array<{
    id: string
    nickname: string
    tripCount: number
  }>
  stats: {
    totalTrips: number
    completedTrips: number
    totalParticipants: number
    uniqueFriends: number
    topTripType: string
    topLocation: string
    longestTrip: string
    busiestMonth: string
  }
}

export const statsService = {
  async getYearReview(year?: number): Promise<YearReviewData> {
    const params: Record<string, unknown> = {}
    if (year) params.year = year
    return api.get<YearReviewData>('/stats/year-review', params)
  },
}
