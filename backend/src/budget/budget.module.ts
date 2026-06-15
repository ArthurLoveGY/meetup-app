import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BudgetService } from './budget.service'
import { BudgetController } from './budget.controller'
import { BudgetItem } from './budget.entity'

@Module({
  imports: [TypeOrmModule.forFeature([BudgetItem])],
  providers: [BudgetService],
  controllers: [BudgetController],
  exports: [BudgetService],
})
export class BudgetModule {}
