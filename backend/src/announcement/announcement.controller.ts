import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common'
import { AnnouncementService } from './announcement.service'

@Controller('announcements')
export class AnnouncementController {
  constructor(private announcementService: AnnouncementService) {}

  @Get()
  findAll(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.announcementService.findAll(+page, +limit)
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.announcementService.findById(id)
  }

  @Post()
  create(@Body() body: any) {
    return this.announcementService.create(body)
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.announcementService.update(id, body)
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.announcementService.delete(id)
  }
}
