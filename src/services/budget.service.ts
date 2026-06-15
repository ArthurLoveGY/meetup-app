import { api } from './request'

interface BudgetItem {
  id: string
  tripId: string
  category: string
  description: string
  amount: number
  paidBy?: string
  splitAmong: string[]
}

interface CreateBudgetItemDTO {
  tripId: string
  category: string
  description: string
  amount: number
  paidBy?: string
  splitAmong?: string[]
}

export const budgetService = {
  async getBudget(tripId: string): Promise<BudgetItem[]> {
    return api.get<BudgetItem[]>(`/trips/${tripId}/budget`)
  },

  async addBudgetItem(data: CreateBudgetItemDTO): Promise<BudgetItem> {
    return api.post<BudgetItem>(`/trips/${data.tripId}/budget`, data as unknown as Record<string, unknown>)
  },

  async updateBudgetItem(tripId: string, itemId: string, data: Partial<CreateBudgetItemDTO>): Promise<BudgetItem> {
    return api.put<BudgetItem>(`/trips/${tripId}/budget/${itemId}`, data as Record<string, unknown>)
  },

  async deleteBudgetItem(tripId: string, itemId: string): Promise<void> {
    return api.delete<void>(`/trips/${tripId}/budget/${itemId}`)
  },

  async settleBudget(tripId: string): Promise<Array<{ from: string; to: string; amount: number }>> {
    return api.get(`/trips/${tripId}/budget/settle`)
  },
}
