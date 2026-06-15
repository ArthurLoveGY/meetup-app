import { View, Text, ScrollView, Input } from '@tarojs/components'
import { useLoad, useRouter } from '@tarojs/taro'
import { useState, useCallback, useEffect } from 'react'
import { EmptyState, LoadingView } from '../../components'
import { useTripStore } from '../../stores'
import { platformService } from '../../platform'
import type { TripTimelineItem } from '../../types'
import './index.scss'

export default function TripTimelineEdit() {
  const router = useRouter()
  const { currentTrip, fetchTripDetail, updateTimeline } = useTripStore()
  const [items, setItems] = useState<TripTimelineItem[]>([])
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
      setItems(currentTrip.timeline)
    }
  }, [currentTrip])

  const handleAdd = useCallback(() => {
    const newItem: TripTimelineItem = {
      id: 'tl_' + Date.now(),
      tripId: currentTrip?.id || '',
      time: '',
      title: '',
      description: '',
      locationName: '',
      sortOrder: items.length,
    }
    setItems((prev) => [...prev, newItem])
  }, [currentTrip, items.length])

  const handleRemove = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const handleUpdate = useCallback((id: string, field: keyof TripTimelineItem, value: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    )
  }, [])

  const handleSave = useCallback(async () => {
    if (!currentTrip) return
    await updateTimeline(currentTrip.id, items)
    platformService.showToast({ title: '已保存', icon: 'success' })
    platformService.navigateBack()
  }, [currentTrip, items, updateTimeline])

  if (isLoading) {
    return <LoadingView text='加载时间线...' />
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
    <View className='trip-timeline-edit'>
      <View className='trip-timeline-edit__header'>
        <Text className='trip-timeline-edit__title'>编辑时间线</Text>
        <View className='trip-timeline-edit__save' onClick={handleSave}>
          <Text className='trip-timeline-edit__save-text'>保存</Text>
        </View>
      </View>

      <ScrollView className='trip-timeline-edit__scroll' scrollY>
        {items.length === 0 ? (
          <EmptyState
            icon='⏰'
            title='暂无时间安排'
            description='添加时间节点来规划行程'
            actionText='添加节点'
            onAction={handleAdd}
          />
        ) : (
          <View className='trip-timeline-edit__list'>
            {items.map((item, index) => (
              <View key={item.id} className='trip-timeline-edit__item'>
                <View className='trip-timeline-edit__item-header'>
                  <Text className='trip-timeline-edit__item-number'>{index + 1}</Text>
                  <View
                    className='trip-timeline-edit__item-remove'
                    onClick={() => handleRemove(item.id)}
                  >
                    <Text className='trip-timeline-edit__item-remove-text'>删除</Text>
                  </View>
                </View>
                <View className='trip-timeline-edit__item-field'>
                  <Text className='trip-timeline-edit__item-label'>时间</Text>
                  <Input
                    className='trip-timeline-edit__item-input'
                    placeholder='HH:mm'
                    value={item.time}
                    onInput={(e) => handleUpdate(item.id, 'time', e.detail.value)}
                  />
                </View>
                <View className='trip-timeline-edit__item-field'>
                  <Text className='trip-timeline-edit__item-label'>标题</Text>
                  <Input
                    className='trip-timeline-edit__item-input'
                    placeholder='例如：集合出发'
                    value={item.title}
                    onInput={(e) => handleUpdate(item.id, 'title', e.detail.value)}
                  />
                </View>
                <View className='trip-timeline-edit__item-field'>
                  <Text className='trip-timeline-edit__item-label'>描述</Text>
                  <Input
                    className='trip-timeline-edit__item-input'
                    placeholder='可选'
                    value={item.description}
                    onInput={(e) => handleUpdate(item.id, 'description', e.detail.value)}
                  />
                </View>
                <View className='trip-timeline-edit__item-field'>
                  <Text className='trip-timeline-edit__item-label'>地点</Text>
                  <Input
                    className='trip-timeline-edit__item-input'
                    placeholder='可选'
                    value={item.locationName}
                    onInput={(e) => handleUpdate(item.id, 'locationName', e.detail.value)}
                  />
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View className='trip-timeline-edit__add safe-area-bottom' onClick={handleAdd}>
        <Text className='trip-timeline-edit__add-text'>+ 添加时间节点</Text>
      </View>
    </View>
  )
}
