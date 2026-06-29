import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiQuery, ApiParam } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { TripService } from './trip.service'
import { FriendService } from '../friend/friend.service'

@ApiTags('行程')
@Controller('trips')
export class TripController {
  constructor(
    private tripService: TripService,
    private friendService: FriendService,
  ) {}

  @Get()
  @ApiOperation({ summary: '获取行程列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'keyword', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'sort', required: false })
  @ApiQuery({ name: 'lat', required: false, type: Number })
  @ApiQuery({ name: 'lng', required: false, type: Number })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('keyword') keyword?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('sort') sort?: string,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
  ) {
    return this.tripService.findAll(+page, +limit, {
      keyword, type, status, sort,
      lat: lat ? +lat : undefined,
      lng: lng ? +lng : undefined,
    })
  }

  @Get('feed')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '好友动态 Feed' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getFeed(@Request() req, @Query('page') page = 1, @Query('limit') limit = 10) {
    const friendIds = await this.friendService.getFriendIds(req.user.id)
    return this.tripService.getFeed(req.user.id, friendIds, +page, +limit)
  }

  @Get('mine')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '我创建的行程' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findMyTrips(@Request() req, @Query('page') page = 1, @Query('limit') limit = 10) {
    return this.tripService.findByCreator(req.user.id, +page, +limit)
  }

  @Get('joined')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '我参加的行程' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findJoinedTrips(@Request() req, @Query('page') page = 1, @Query('limit') limit = 10) {
    return this.tripService.findByParticipant(req.user.id, +page, +limit)
  }

  @Get(':id')
  @ApiOperation({ summary: '获取行程详情' })
  @ApiParam({ name: 'id', description: '行程 ID' })
  findById(@Param('id') id: string) {
    return this.tripService.findById(id)
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建行程' })
  create(@Request() req, @Body() body: any) {
    return this.tripService.create(req.user.id, body)
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新行程' })
  @ApiParam({ name: 'id', description: '行程 ID' })
  update(@Param('id') id: string, @Request() req, @Body() body: any) {
    return this.tripService.update(id, req.user.id, body)
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除行程' })
  @ApiParam({ name: 'id', description: '行程 ID' })
  delete(@Param('id') id: string, @Request() req) {
    return this.tripService.delete(id, req.user.id)
  }

  @Post(':id/join')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '加入行程' })
  @ApiParam({ name: 'id', description: '行程 ID' })
  @ApiBody({ schema: { properties: { status: { type: 'string' }, note: { type: 'string' } }, required: ['status'] } })
  joinTrip(@Param('id') id: string, @Request() req, @Body() body: { status: string; note?: string }) {
    return this.tripService.joinTrip(id, req.user.id, body.status, body.note)
  }

  @Post(':id/leave')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '退出行程' })
  @ApiParam({ name: 'id', description: '行程 ID' })
  leaveTrip(@Param('id') id: string, @Request() req) {
    return this.tripService.leaveTrip(id, req.user.id)
  }

  @Put(':id/participants/:userId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新参与者状态' })
  @ApiParam({ name: 'id', description: '行程 ID' })
  @ApiParam({ name: 'userId', description: '用户 ID' })
  @ApiBody({ schema: { properties: { status: { type: 'string' } }, required: ['status'] } })
  updateParticipant(@Param('id') id: string, @Request() req, @Param('userId') userId: string, @Body() body: { status: string }) {
    return this.tripService.updateParticipantStatus(id, req.user.id, userId, body.status)
  }

  @Get(':id/participants')
  @ApiOperation({ summary: '获取参与者列表' })
  @ApiParam({ name: 'id', description: '行程 ID' })
  getParticipants(@Param('id') id: string) {
    return this.tripService.getParticipants(id)
  }

  @Delete(':id/participants/:userId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '移除参与者' })
  @ApiParam({ name: 'id', description: '行程 ID' })
  @ApiParam({ name: 'userId', description: '用户 ID' })
  removeParticipant(@Param('id') id: string, @Request() req, @Param('userId') userId: string) {
    return this.tripService.removeParticipant(id, req.user.id, userId)
  }

  @Put(':id/timeline')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新时间线' })
  @ApiParam({ name: 'id', description: '行程 ID' })
  updateTimeline(@Param('id') id: string, @Body() body: any[]) {
    return this.tripService.updateTimeline(id, body)
  }

  @Put(':id/checklist')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新清单' })
  @ApiParam({ name: 'id', description: '行程 ID' })
  updateChecklist(@Param('id') id: string, @Body() body: any[]) {
    return this.tripService.updateChecklist(id, body)
  }
}
