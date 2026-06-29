import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { VoteService } from './vote.service'

@ApiTags('投票')
@Controller('trips/:tripId/votes')
export class VoteController {
  constructor(private voteService: VoteService) {}

  @Get()
  @ApiOperation({ summary: '获取行程投票列表' })
  @ApiParam({ name: 'tripId', description: '行程 ID' })
  findByTrip(@Param('tripId') tripId: string) {
    return this.voteService.findByTrip(tripId)
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建投票' })
  @ApiParam({ name: 'tripId', description: '行程 ID' })
  @ApiBody({ schema: { properties: { title: { type: 'string' }, type: { type: 'string', nullable: true }, options: { type: 'array', items: { type: 'string' } } }, required: ['title', 'options'] } })
  create(@Param('tripId') tripId: string, @Request() req, @Body() body: { title: string; type?: string; options: string[] }) {
    return this.voteService.create(tripId, req.user.id, body)
  }

  @Post(':voteId/options/:optionId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '投一票' })
  @ApiParam({ name: 'tripId', description: '行程 ID' })
  @ApiParam({ name: 'voteId', description: '投票 ID' })
  @ApiParam({ name: 'optionId', description: '选项 ID' })
  vote(@Param('voteId') voteId: string, @Param('optionId') optionId: string, @Request() req) {
    return this.voteService.vote(voteId, optionId, req.user.id)
  }

  @Delete(':voteId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除投票' })
  @ApiParam({ name: 'tripId', description: '行程 ID' })
  @ApiParam({ name: 'voteId', description: '投票 ID' })
  delete(@Param('voteId') voteId: string) {
    return this.voteService.delete(voteId)
  }
}
