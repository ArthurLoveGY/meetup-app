import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { FriendService } from './friend.service'

@ApiTags('好友')
@ApiBearerAuth()
@Controller('friends')
@UseGuards(AuthGuard('jwt'))
export class FriendController {
  constructor(private friendService: FriendService) {}

  @Get()
  @ApiOperation({ summary: '获取好友列表' })
  getFriends(@Request() req) {
    return this.friendService.getFriends(req.user.id)
  }

  @Get('blocked')
  @ApiOperation({ summary: '获取黑名单' })
  getBlockedUsers(@Request() req) {
    return this.friendService.getBlockedUsers(req.user.id)
  }

  @Get('requests')
  @ApiOperation({ summary: '获取好友请求列表' })
  getRequests(@Request() req) {
    return this.friendService.getRequests(req.user.id)
  }

  @Get('groups')
  @ApiOperation({ summary: '获取好友分组' })
  getGroups(@Request() req) {
    return this.friendService.getGroups(req.user.id)
  }

  @Post('requests')
  @ApiOperation({ summary: '发送好友请求' })
  @ApiBody({ schema: { properties: { userId: { type: 'string' }, message: { type: 'string', nullable: true } }, required: ['userId'] } })
  sendRequest(@Request() req, @Body() body: { userId: string; message?: string }) {
    return this.friendService.sendRequest(req.user.id, body.userId, body.message)
  }

  @Post('requests/:id/accept')
  @ApiOperation({ summary: '接受好友请求' })
  @ApiParam({ name: 'id', description: '请求 ID' })
  acceptRequest(@Request() req, @Param('id') id: string) {
    return this.friendService.acceptRequest(id, req.user.id)
  }

  @Post('requests/:id/reject')
  @ApiOperation({ summary: '拒绝好友请求' })
  @ApiParam({ name: 'id', description: '请求 ID' })
  rejectRequest(@Request() req, @Param('id') id: string) {
    return this.friendService.rejectRequest(id, req.user.id)
  }

  @Delete(':friendId')
  @ApiOperation({ summary: '删除好友' })
  @ApiParam({ name: 'friendId', description: '好友 ID' })
  removeFriend(@Request() req, @Param('friendId') friendId: string) {
    return this.friendService.removeFriend(req.user.id, friendId)
  }

  @Post('block')
  @ApiOperation({ summary: '拉黑用户' })
  @ApiBody({ schema: { properties: { userId: { type: 'string' } }, required: ['userId'] } })
  blockUser(@Request() req, @Body() body: { userId: string }) {
    return this.friendService.blockUser(req.user.id, body.userId)
  }

  @Delete('block/:userId')
  @ApiOperation({ summary: '取消拉黑' })
  @ApiParam({ name: 'userId', description: '用户 ID' })
  unblockUser(@Request() req, @Param('userId') userId: string) {
    return this.friendService.unblockUser(req.user.id, userId)
  }

  @Post('groups')
  @ApiOperation({ summary: '创建好友分组' })
  @ApiBody({ schema: { properties: { name: { type: 'string' } }, required: ['name'] } })
  createGroup(@Request() req, @Body() body: { name: string }) {
    return this.friendService.createGroup(req.user.id, body.name)
  }

  @Put('groups/:id')
  @ApiOperation({ summary: '更新好友分组' })
  @ApiParam({ name: 'id', description: '分组 ID' })
  @ApiBody({ schema: { properties: { name: { type: 'string' } }, required: ['name'] } })
  updateGroup(@Param('id') id: string, @Body() body: { name: string }) {
    return this.friendService.updateGroup(id, body.name)
  }

  @Delete('groups/:id')
  @ApiOperation({ summary: '删除好友分组' })
  @ApiParam({ name: 'id', description: '分组 ID' })
  deleteGroup(@Param('id') id: string) {
    return this.friendService.deleteGroup(id)
  }

  @Get('search')
  @ApiOperation({ summary: '搜索用户' })
  @ApiQuery({ name: 'keyword', description: '搜索关键词' })
  searchUsers(@Query('keyword') keyword: string) {
    return this.friendService.searchUsers(keyword)
  }
}
