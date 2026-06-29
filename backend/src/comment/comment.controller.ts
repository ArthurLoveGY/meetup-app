import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { CommentService } from './comment.service'

@ApiTags('评论')
@Controller('trips/:tripId/comments')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Get()
  @ApiOperation({ summary: '获取行程评论列表' })
  @ApiParam({ name: 'tripId', description: '行程 ID' })
  findByTrip(@Param('tripId') tripId: string) {
    return this.commentService.findByTrip(tripId)
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '发表评论' })
  @ApiParam({ name: 'tripId', description: '行程 ID' })
  @ApiBody({ schema: { properties: { content: { type: 'string' }, parentId: { type: 'string', nullable: true } }, required: ['content'] } })
  create(@Param('tripId') tripId: string, @Request() req, @Body() body: { content: string; parentId?: string }) {
    return this.commentService.create(tripId, req.user.id, body.content, body.parentId)
  }

  @Delete(':commentId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除评论' })
  @ApiParam({ name: 'tripId', description: '行程 ID' })
  @ApiParam({ name: 'commentId', description: '评论 ID' })
  delete(@Param('commentId') commentId: string, @Request() req) {
    return this.commentService.delete(commentId, req.user.id)
  }
}
