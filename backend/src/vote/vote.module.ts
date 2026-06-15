import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { VoteService } from './vote.service'
import { VoteController } from './vote.controller'
import { Vote } from './vote.entity'
import { VoteOption } from './vote-option.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Vote, VoteOption])],
  providers: [VoteService],
  controllers: [VoteController],
  exports: [VoteService],
})
export class VoteModule {}
