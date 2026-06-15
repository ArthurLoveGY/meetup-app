import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { CommentService } from './comment.service'

@Controller('trips/:tripId/comments')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Get()
  findByTrip(@Param('tripId') tripId: string) {
    return this.commentService.findByTrip(tripId)
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Param('tripId') tripId: string, @Request() req, @Body() body: { content: string; parentId?: string }) {
    return this.commentService.create(tripId, req.user.id, body.content, body.parentId)
  }

  @Delete(':commentId')
  @UseGuards(AuthGuard('jwt'))
  delete(@Param('commentId') commentId: string, @Request() req) {
    return this.commentService.delete(commentId, req.user.id)
  }
}
