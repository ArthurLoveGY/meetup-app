import { api } from './request'

interface TripTemplate {
  id: string
  userId: string
  title: string
  type: string
  description?: string
  locationName?: string
  duration: string
  maxParticipants?: number
  costType: string
  visibility: string
  joinRule: string
  tags: string[]
  useCount: number
  createdAt: string
}

interface CreateTemplateDTO {
  title: string
  type: string
  description?: string
  locationName?: string
  duration: string
  maxParticipants?: number
  costType: string
  visibility: string
  joinRule: string
  tags?: string[]
}

export const templateService = {
  async getTemplates(): Promise<TripTemplate[]> {
    return api.get<TripTemplate[]>('/templates')
  },

  async getTemplateDetail(templateId: string): Promise<TripTemplate> {
    return api.get<TripTemplate>(`/templates/${templateId}`)
  },

  async createTemplate(data: CreateTemplateDTO): Promise<TripTemplate> {
    return api.post<TripTemplate>('/templates', data as unknown as Record<string, unknown>)
  },

  async updateTemplate(templateId: string, data: Partial<CreateTemplateDTO>): Promise<TripTemplate> {
    return api.put<TripTemplate>(`/templates/${templateId}`, data as Record<string, unknown>)
  },

  async deleteTemplate(templateId: string): Promise<void> {
    return api.delete<void>(`/templates/${templateId}`)
  },

  async useTemplate(templateId: string): Promise<{ tripId: string }> {
    return api.post<{ tripId: string }>(`/templates/${templateId}/use`)
  },
}
