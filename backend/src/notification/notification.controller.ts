import { Controller, Get, Post, Put, Delete, Param, Query, UseGuards, Request } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { NotificationService } from './notification.service'

@ApiTags('通知')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationController {
  constructor(private notifService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: '获取通知列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findByUser(@Request() req, @Query('page') page = 1, @Query('limit') limit = 20) {
    return this.notifService.findByUser(req.user.id, +page, +limit)
  }

  @Get('unread-count')
  @ApiOperation({ summary: '获取未读通知数' })
  getUnreadCount(@Request() req) {
    return this.notifService.getUnreadCount(req.user.id)
  }

  @Put(':id/read')
  @ApiOperation({ summary: '标记通知为已读' })
  @ApiParam({ name: 'id', description: '通知 ID' })
  markAsRead(@Param('id') id: string, @Request() req) {
    return this.notifService.markAsRead(id, req.user.id)
  }

  @Post('read-all')
  @ApiOperation({ summary: '标记全部已读' })
  markAllAsRead(@Request() req) {
    return this.notifService.markAllAsRead(req.user.id)
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除通知' })
  @ApiParam({ name: 'id', description: '通知 ID' })
  delete(@Param('id') id: string, @Request() req) {
    return this.notifService.delete(id, req.user.id)
  }
}
