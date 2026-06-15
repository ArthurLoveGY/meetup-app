import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BudgetItem } from './budget.entity'

@Injectable()
export class BudgetService {
  constructor(
    @InjectRepository(BudgetItem)
    private budgetRepo: Repository<BudgetItem>,
  ) {}

  async getBudget(tripId: string): Promise<BudgetItem[]> {
    return this.budgetRepo.find({ where: { tripId } })
  }

  async addBudgetItem(data: Partial<BudgetItem>): Promise<BudgetItem> {
    return this.budgetRepo.save(data)
  }

  async updateBudgetItem(itemId: string, data: Partial<BudgetItem>): Promise<void> {
    await this.budgetRepo.update(itemId, data)
  }

  async deleteBudgetItem(itemId: string): Promise<void> {
    await this.budgetRepo.delete(itemId)
  }

  async deleteBudgetByTrip(tripId: string): Promise<void> {
    await this.budgetRepo.delete({ tripId })
  }
}
