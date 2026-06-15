import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { VoteService } from './vote.service'

@Controller('trips/:tripId/votes')
export class VoteController {
  constructor(private voteService: VoteService) {}

  @Get()
  findByTrip(@Param('tripId') tripId: string) {
    return this.voteService.findByTrip(tripId)
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Param('tripId') tripId: string, @Request() req, @Body() body: { title: string; type?: string; options: string[] }) {
    return this.voteService.create(tripId, req.user.id, body)
  }

  @Post(':voteId/options/:optionId')
  @UseGuards(AuthGuard('jwt'))
  vote(@Param('voteId') voteId: string, @Param('optionId') optionId: string, @Request() req) {
    return this.voteService.vote(voteId, optionId, req.user.id)
  }

  @Delete(':voteId')
  @UseGuards(AuthGuard('jwt'))
  delete(@Param('voteId') voteId: string) {
    return this.voteService.delete(voteId)
  }
}
