import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { TripService } from './trip.service'

@Controller('trips')
export class TripController {
  constructor(private tripService: TripService) {}

  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('keyword') keyword?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('sort') sort?: string,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
  ) {
    return this.tripService.findAll(+page, +limit, {
      keyword, type, status, sort,
      lat: lat ? +lat : undefined,
      lng: lng ? +lng : undefined,
    })
  }

  @Get('mine')
  @UseGuards(AuthGuard('jwt'))
  findMyTrips(@Request() req, @Query('page') page = 1, @Query('limit') limit = 10) {
    return this.tripService.findByCreator(req.user.id, +page, +limit)
  }

  @Get('joined')
  @UseGuards(AuthGuard('jwt'))
  findJoinedTrips(@Request() req, @Query('page') page = 1, @Query('limit') limit = 10) {
    return this.tripService.findByParticipant(req.user.id, +page, +limit)
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.tripService.findById(id)
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Request() req, @Body() body: any) {
    return this.tripService.create(req.user.id, body)
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  update(@Param('id') id: string, @Request() req, @Body() body: any) {
    return this.tripService.update(id, req.user.id, body)
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  delete(@Param('id') id: string, @Request() req) {
    return this.tripService.delete(id, req.user.id)
  }

  @Post(':id/join')
  @UseGuards(AuthGuard('jwt'))
  joinTrip(@Param('id') id: string, @Request() req, @Body() body: { status: string; note?: string }) {
    return this.tripService.joinTrip(id, req.user.id, body.status, body.note)
  }

  @Post(':id/leave')
  @UseGuards(AuthGuard('jwt'))
  leaveTrip(@Param('id') id: string, @Request() req) {
    return this.tripService.leaveTrip(id, req.user.id)
  }

  @Put(':id/participants/:userId')
  @UseGuards(AuthGuard('jwt'))
  updateParticipant(@Param('id') id: string, @Request() req, @Param('userId') userId: string, @Body() body: { status: string }) {
    return this.tripService.updateParticipantStatus(id, req.user.id, userId, body.status)
  }

  @Get(':id/participants')
  getParticipants(@Param('id') id: string) {
    return this.tripService.getParticipants(id)
  }

  @Delete(':id/participants/:userId')
  @UseGuards(AuthGuard('jwt'))
  removeParticipant(@Param('id') id: string, @Request() req, @Param('userId') userId: string) {
    return this.tripService.removeParticipant(id, req.user.id, userId)
  }

  @Put(':id/timeline')
  @UseGuards(AuthGuard('jwt'))
  updateTimeline(@Param('id') id: string, @Body() body: any[]) {
    return this.tripService.updateTimeline(id, body)
  }

  @Put(':id/checklist')
  @UseGuards(AuthGuard('jwt'))
  updateChecklist(@Param('id') id: string, @Body() body: any[]) {
    return this.tripService.updateChecklist(id, body)
  }
}
