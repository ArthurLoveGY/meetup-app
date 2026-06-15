import { Controller, Get, Post, Put, Delete, Param, Query, UseGuards, Request } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { NotificationService } from './notification.service'

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationController {
  constructor(private notifService: NotificationService) {}

  @Get()
  findByUser(@Request() req, @Query('page') page = 1, @Query('limit') limit = 20) {
    return this.notifService.findByUser(req.user.id, +page, +limit)
  }

  @Get('unread-count')
  getUnreadCount(@Request() req) {
    return this.notifService.getUnreadCount(req.user.id)
  }

  @Put(':id/read')
  markAsRead(@Param('id') id: string, @Request() req) {
    return this.notifService.markAsRead(id, req.user.id)
  }

  @Post('read-all')
  markAllAsRead(@Request() req) {
    return this.notifService.markAllAsRead(req.user.id)
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Request() req) {
    return this.notifService.delete(id, req.user.id)
  }
}
