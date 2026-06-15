import { View, Text } from '@tarojs/components'
import { useLoad, useRouter } from '@tarojs/taro'
import { useState, useCallback, useEffect } from 'react'
import { TripForm, LoadingView } from '../../components'
import type { TripFormData } from '../../components'
import { useTripStore } from '../../stores'
import { platformService } from '../../platform'
import type { CreateTripDTO } from '../../types'
import './index.scss'

export default function TripEdit() {
  const router = useRouter()
  const { currentTrip, fetchTripDetail, updateTrip, isLoading } = useTripStore()
  const [formData, setFormData] = useState<TripFormData | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useLoad(() => {
    const tripId = router.params.id
    if (tripId) {
      fetchTripDetail(tripId)
    }
  })

  useEffect(() => {
    if (currentTrip) {
      setFormData({
        title: currentTrip.title,
        type: currentTrip.type,
        description: currentTrip.description || '',
        startTime: currentTrip.startTime,
        endTime: currentTrip.endTime || '',
        locationName: currentTrip.locationName || '',
        locationAddress: currentTrip.locationAddress || '',
        coverUrl: currentTrip.coverUrl || '',
        maxParticipants: currentTrip.maxParticipants?.toString() || '',
        costType: currentTrip.costType,
        estimatedCost: currentTrip.estimatedCost?.toString() || '',
        visibility: currentTrip.visibility,
        joinRule: currentTrip.joinRule,
      })
    }
  }, [currentTrip])

  const handleSave = useCallback(async () => {
    if (!formData || !currentTrip) return

    if (!formData.title.trim()) {
      platformService.showToast({ title: '请输入标题', icon: 'error' })
      return
    }
    if (!formData.startTime) {
      platformService.showToast({ title: '请选择开始时间', icon: 'error' })
      return
    }

    setIsSaving(true)
    try {
      const data: Partial<CreateTripDTO> = {
        title: formData.title,
        type: formData.type,
        description: formData.description,
        startTime: formData.startTime,
        endTime: formData.endTime || undefined,
        locationName: formData.locationName || undefined,
        locationAddress: formData.locationAddress || undefined,
        coverUrl: formData.coverUrl || undefined,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined,
        costType: formData.costType,
        estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : undefined,
        visibility: formData.visibility,
        joinRule: formData.joinRule,
      }
      await updateTrip(currentTrip.id, data)
      platformService.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => {
        platformService.navigateBack()
      }, 1500)
    } catch {
      platformService.showToast({ title: '保存失败', icon: 'error' })
    } finally {
      setIsSaving(false)
    }
  }, [formData, currentTrip, updateTrip])

  if (isLoading || !formData) {
    return <LoadingView text='加载行程...' />
  }

  return (
    <View className='trip-edit'>
      <View className='trip-edit__header'>
        <Text className='trip-edit__title'>编辑行程</Text>
        <View className='trip-edit__save' onClick={handleSave}>
          <Text className='trip-edit__save-text'>{isSaving ? '保存中...' : '保存'}</Text>
        </View>
      </View>

      <TripForm value={formData} onChange={setFormData} />
    </View>
  )
}
