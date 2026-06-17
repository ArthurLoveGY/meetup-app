import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Trip } from '../trip/trip.entity'
import { TripParticipant } from '../trip/trip-participant.entity'
import { Comment } from '../comment/comment.entity'
import { User } from '../user/user.entity'
import { StatsService } from './stats.service'
import { StatsController } from './stats.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Trip, TripParticipant, Comment, User])],
  providers: [StatsService],
  controllers: [StatsController],
  exports: [StatsService],
})
export class StatsModule {}
