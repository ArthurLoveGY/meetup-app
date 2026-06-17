import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { StatsService } from './stats.service'

@Controller('stats')
@UseGuards(AuthGuard('jwt'))
export class StatsController {
  constructor(private statsService: StatsService) {}

  @Get('year-review')
  getYearReview(@Request() req, @Query('year') year?: string) {
    const targetYear = year ? parseInt(year) : new Date().getFullYear()
    return this.statsService.getYearReview(req.user.id, targetYear)
  }
}
