import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { StatsService } from './stats.service'

@ApiTags('统计')
@ApiBearerAuth()
@Controller('stats')
@UseGuards(AuthGuard('jwt'))
export class StatsController {
  constructor(private statsService: StatsService) {}

  @Get('year-review')
  @ApiOperation({ summary: '年度回顾统计' })
  @ApiQuery({ name: 'year', required: false, description: '年份，默认为当前年份' })
  getYearReview(@Request() req, @Query('year') year?: string) {
    const targetYear = year ? parseInt(year) : new Date().getFullYear()
    return this.statsService.getYearReview(req.user.id, targetYear)
  }
}
