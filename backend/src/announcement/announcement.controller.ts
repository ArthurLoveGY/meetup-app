import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger'
import { AnnouncementService } from './announcement.service'

@ApiTags('公告')
@Controller('announcements')
export class AnnouncementController {
  constructor(private announcementService: AnnouncementService) {}

  @Get()
  @ApiOperation({ summary: '获取公告列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.announcementService.findAll(+page, +limit)
  }

  @Get(':id')
  @ApiOperation({ summary: '获取公告详情' })
  @ApiParam({ name: 'id', description: '公告 ID' })
  findById(@Param('id') id: string) {
    return this.announcementService.findById(id)
  }

  @Post()
  @ApiOperation({ summary: '创建公告' })
  create(@Body() body: any) {
    return this.announcementService.create(body)
  }

  @Put(':id')
  @ApiOperation({ summary: '更新公告' })
  @ApiParam({ name: 'id', description: '公告 ID' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.announcementService.update(id, body)
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除公告' })
  @ApiParam({ name: 'id', description: '公告 ID' })
  delete(@Param('id') id: string) {
    return this.announcementService.delete(id)
  }
}
