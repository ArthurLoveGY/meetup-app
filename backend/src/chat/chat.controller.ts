import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ChatService } from './chat.service'

@Controller('trips/:tripId/chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('messages')
  @UseGuards(AuthGuard('jwt'))
  getMessages(
    @Param('tripId') tripId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    return this.chatService.getMessages(tripId, +page, +limit)
  }
}
