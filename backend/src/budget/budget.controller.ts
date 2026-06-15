import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { BudgetService } from './budget.service'

@Controller('trips/:tripId/budget')
export class BudgetController {
  constructor(private budgetService: BudgetService) {}

  @Get()
  getBudget(@Param('tripId') tripId: string) {
    return this.budgetService.getBudget(tripId)
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  addBudgetItem(@Param('tripId') tripId: string, @Body() body: { category: string; description: string; amount: number }) {
    return this.budgetService.addBudgetItem({ tripId, ...body })
  }

  @Put(':itemId')
  @UseGuards(AuthGuard('jwt'))
  updateBudgetItem(@Param('itemId') itemId: string, @Body() body: Partial<{ category: string; description: string; amount: number }>) {
    return this.budgetService.updateBudgetItem(itemId, body)
  }

  @Delete(':itemId')
  @UseGuards(AuthGuard('jwt'))
  deleteBudgetItem(@Param('itemId') itemId: string) {
    return this.budgetService.deleteBudgetItem(itemId)
  }
}
