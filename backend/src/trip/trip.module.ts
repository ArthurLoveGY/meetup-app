import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TripService } from './trip.service'
import { TripController } from './trip.controller'
import { Trip } from './trip.entity'
import { TripParticipant } from './trip-participant.entity'
import { TripTimeline } from './trip-timeline.entity'
import { TripChecklist } from './trip-checklist.entity'
import { FriendModule } from '../friend/friend.module'

@Module({
  imports: [TypeOrmModule.forFeature([Trip, TripParticipant, TripTimeline, TripChecklist]), FriendModule],
  providers: [TripService],
  controllers: [TripController],
  exports: [TripService],
})
export class TripModule {}
