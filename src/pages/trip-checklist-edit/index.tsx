import { View, Text, ScrollView, Input } from '@tarojs/components'
import { useLoad, useRouter } from '@tarojs/taro'
import { useState, useCallback, useEffect } from 'react'
import { EmptyState, LoadingView } from '../../components'
import { useTripStore } from '../../stores'
import { platformService } from '../../platform'
import type { TripChecklistItem } from '../../types'
import './index.scss'

export default function TripChecklistEdit() {
  const router = useRouter()
  const { currentTrip, fetchTripDetail, updateChecklist } = useTripStore()
  const [items, setItems] = useState<TripChecklistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useLoad(() => {
    const tripId = router.params.id
    if (tripId) {
      fetchTripDetail(tripId).finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  })

  useEffect(() => {
    if (currentTrip) {
      setItems(currentTrip.checklist)
    }
  }, [currentTrip])

  const handleAdd = useCallback(() => {
    const newItem: TripChecklistItem = {
      id: 'cl_' + Date.now(),
      tripId: currentTrip?.id || '',
      title: '',
      description: '',
      required: false,
      checkedUserIds: [],
      sortOrder: items.length,
    }
    setItems((prev) => [...prev, newItem])
  }, [currentTrip, items.length])

  const handleRemove = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const handleUpdate = useCallback((id: string, field: keyof TripChecklistItem, value: string | boolean) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    )
  }, [])

  const handleToggleRequired = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, required: !item.required } : item))
    )
  }, [])

  const handleSave = useCallback(async () => {
    if (!currentTrip) return
    await updateChecklist(currentTrip.id, items)
    platformService.showToast({ title: '已保存', icon: 'success' })
    platformService.navigateBack()
  }, [currentTrip, items, updateChecklist])

  if (isLoading) {
    return <LoadingView text='加载准备清单...' />
  }

  if (!currentTrip) {
    return (
      <EmptyState
        icon='😅'
        title='行程不存在'
        description=''
        actionText='返回'
        onAction={() => platformService.navigateBack()}
      />
    )
  }

  return (
    <View className='trip-checklist-edit'>
      <View className='trip-checklist-edit__header'>
        <Text className='trip-checklist-edit__title'>编辑准备清单</Text>
        <View className='trip-checklist-edit__save' onClick={handleSave}>
          <Text className='trip-checklist-edit__save-text'>保存</Text>
        </View>
      </View>

      <ScrollView className='trip-checklist-edit__scroll' scrollY>
        {items.length === 0 ? (
          <EmptyState
            icon='📋'
            title='暂无准备事项'
            description='添加需要准备的物品或事项'
            actionText='添加事项'
            onAction={handleAdd}
          />
        ) : (
          <View className='trip-checklist-edit__list'>
            {items.map((item) => (
              <View key={item.id} className='trip-checklist-edit__item'>
                <View className='trip-checklist-edit__item-header'>
                  <View
                    className={`trip-checklist-edit__item-required ${item.required ? 'trip-checklist-edit__item-required--active' : ''}`}
                    onClick={() => handleToggleRequired(item.id)}
                  >
                    <Text className='trip-checklist-edit__item-required-text'>
                      {item.required ? '必带' : '可选'}
                    </Text>
                  </View>
                  <View
                    className='trip-checklist-edit__item-remove'
                    onClick={() => handleRemove(item.id)}
                  >
                    <Text className='trip-checklist-edit__item-remove-text'>删除</Text>
                  </View>
                </View>
                <View className='trip-checklist-edit__item-field'>
                  <Text className='trip-checklist-edit__item-label'>物品名称</Text>
                  <Input
                    className='trip-checklist-edit__item-input'
                    placeholder='例如：防晒霜'
                    value={item.title}
                    onInput={(e) => handleUpdate(item.id, 'title', e.detail.value)}
                  />
                </View>
                <View className='trip-checklist-edit__item-field'>
                  <Text className='trip-checklist-edit__item-label'>备注</Text>
                  <Input
                    className='trip-checklist-edit__item-input'
                    placeholder='可选'
                    value={item.description}
                    onInput={(e) => handleUpdate(item.id, 'description', e.detail.value)}
                  />
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View className='trip-checklist-edit__add safe-area-bottom' onClick={handleAdd}>
        <Text className='trip-checklist-edit__add-text'>+ 添加准备事项</Text>
      </View>
    </View>
  )
}
