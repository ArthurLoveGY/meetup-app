import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { FriendService } from './friend.service'

@Controller('friends')
@UseGuards(AuthGuard('jwt'))
export class FriendController {
  constructor(private friendService: FriendService) {}

  @Get()
  getFriends(@Request() req) {
    return this.friendService.getFriends(req.user.id)
  }

  @Get('blocked')
  getBlockedUsers(@Request() req) {
    return this.friendService.getBlockedUsers(req.user.id)
  }

  @Get('requests')
  getRequests(@Request() req) {
    return this.friendService.getRequests(req.user.id)
  }

  @Get('groups')
  getGroups(@Request() req) {
    return this.friendService.getGroups(req.user.id)
  }

  @Post('requests')
  sendRequest(@Request() req, @Body() body: { userId: string; message?: string }) {
    return this.friendService.sendRequest(req.user.id, body.userId, body.message)
  }

  @Post('requests/:id/accept')
  acceptRequest(@Request() req, @Param('id') id: string) {
    return this.friendService.acceptRequest(id, req.user.id)
  }

  @Post('requests/:id/reject')
  rejectRequest(@Request() req, @Param('id') id: string) {
    return this.friendService.rejectRequest(id, req.user.id)
  }

  @Delete(':friendId')
  removeFriend(@Request() req, @Param('friendId') friendId: string) {
    return this.friendService.removeFriend(req.user.id, friendId)
  }

  @Post('block')
  blockUser(@Request() req, @Body() body: { userId: string }) {
    return this.friendService.blockUser(req.user.id, body.userId)
  }

  @Delete('block/:userId')
  unblockUser(@Request() req, @Param('userId') userId: string) {
    return this.friendService.unblockUser(req.user.id, userId)
  }

  @Post('groups')
  createGroup(@Request() req, @Body() body: { name: string }) {
    return this.friendService.createGroup(req.user.id, body.name)
  }

  @Put('groups/:id')
  updateGroup(@Param('id') id: string, @Body() body: { name: string }) {
    return this.friendService.updateGroup(id, body.name)
  }

  @Delete('groups/:id')
  deleteGroup(@Param('id') id: string) {
    return this.friendService.deleteGroup(id)
  }

  @Get('search')
  searchUsers(@Query('keyword') keyword: string) {
    return this.friendService.searchUsers(keyword)
  }
}
