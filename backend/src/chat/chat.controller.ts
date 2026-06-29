import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { ChatService } from './chat.service'

@ApiTags('聊天')
@Controller('trips/:tripId/chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('messages')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取聊天记录' })
  @ApiParam({ name: 'tripId', description: '行程 ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getMessages(
    @Param('tripId') tripId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    return this.chatService.getMessages(tripId, +page, +limit)
  }
}
