import { api } from './request'

interface Report {
  id: string
  type: 'user' | 'trip' | 'comment'
  targetId: string
  reason: string
  description?: string
  reporterId: string
  status: 'pending' | 'resolved' | 'dismissed'
  createdAt: string
}

interface CreateReportDTO {
  type: Report['type']
  targetId: string
  reason: string
  description?: string
}

export const reportService = {
  async getReports(): Promise<Report[]> {
    return api.get<Report[]>('/admin/reports')
  },

  async createReport(data: CreateReportDTO): Promise<Report> {
    return api.post<Report>('/reports', data as unknown as Record<string, unknown>)
  },

  async resolveReport(reportId: string, action: 'resolve' | 'dismiss'): Promise<void> {
    return api.post<void>(`/admin/reports/${reportId}/${action}`)
  },

  async getReportDetail(reportId: string): Promise<Report> {
    return api.get<Report>(`/admin/reports/${reportId}`)
  },
}
