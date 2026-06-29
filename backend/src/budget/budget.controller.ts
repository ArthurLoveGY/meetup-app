import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { BudgetService } from './budget.service'

@ApiTags('预算')
@Controller('trips/:tripId/budget')
export class BudgetController {
  constructor(private budgetService: BudgetService) {}

  @Get()
  @ApiOperation({ summary: '获取预算列表' })
  @ApiParam({ name: 'tripId', description: '行程 ID' })
  getBudget(@Param('tripId') tripId: string) {
    return this.budgetService.getBudget(tripId)
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '添加预算项' })
  @ApiParam({ name: 'tripId', description: '行程 ID' })
  @ApiBody({ schema: { properties: { category: { type: 'string' }, description: { type: 'string' }, amount: { type: 'number' } }, required: ['category', 'description', 'amount'] } })
  addBudgetItem(@Param('tripId') tripId: string, @Body() body: { category: string; description: string; amount: number }) {
    return this.budgetService.addBudgetItem({ tripId, ...body })
  }

  @Put(':itemId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新预算项' })
  @ApiParam({ name: 'tripId', description: '行程 ID' })
  @ApiParam({ name: 'itemId', description: '预算项 ID' })
  updateBudgetItem(@Param('itemId') itemId: string, @Body() body: Partial<{ category: string; description: string; amount: number }>) {
    return this.budgetService.updateBudgetItem(itemId, body)
  }

  @Delete(':itemId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除预算项' })
  @ApiParam({ name: 'tripId', description: '行程 ID' })
  @ApiParam({ name: 'itemId', description: '预算项 ID' })
  deleteBudgetItem(@Param('itemId') itemId: string) {
    return this.budgetService.deleteBudgetItem(itemId)
  }
}
