import { View, Text, ScrollView } from '@tarojs/components'
import { useState, useCallback } from 'react'
import { EmptyState } from '../../components'
import { platformService } from '../../platform'
import { getTripTypeLabel } from '../../utils/permission'
import './index.scss'

interface TripTemplate {
  id: string
  title: string
  type: string
  description: string
  locationName?: string
  duration: string
  useCount: number
}

export default function TripTemplates() {
  const [templates, setTemplates] = useState<TripTemplate[]>([
    {
      id: 'tpl_1',
      title: '周末徒步',
      type: 'travel',
      description: '周末一起去户外徒步，呼吸新鲜空气',
      locationName: '待定',
      duration: '1天',
      useCount: 8,
    },
    {
      id: 'tpl_2',
      title: '周五聚餐',
      type: 'meal',
      description: '工作日结束，一起去吃顿好的',
      locationName: '待定',
      duration: '3小时',
      useCount: 15,
    },
    {
      id: 'tpl_3',
      title: '周末骑行',
      type: 'sport',
      description: '环城绿道骑行，锻炼身体',
      locationName: '成都环城绿道',
      duration: '1天',
      useCount: 5,
    },
    {
      id: 'tpl_4',
      title: '桌游之夜',
      type: 'game',
      description: '一起玩桌游，放松心情',
      locationName: '桌游店',
      duration: '4小时',
      useCount: 12,
    },
  ])

  const handleUseTemplate = useCallback((templateId: string) => {
    platformService.navigateTo('/pages/trip-create/index?template=' + templateId)
  }, [])

  const handleCreateTemplate = useCallback(() => {
    const newTemplate: TripTemplate = {
      id: 'tpl_' + Date.now(),
      title: '新模板',
      type: 'other',
      description: '点击编辑模板内容',
      duration: '待定',
      useCount: 0,
    }
    setTemplates((prev) => [...prev, newTemplate])
    platformService.showToast({ title: '模板已创建', icon: 'success' })
  }, [])

  return (
    <View className='trip-templates'>
      <View className='trip-templates__header'>
        <Text className='trip-templates__title'>行程模板</Text>
        <View className='trip-templates__add' onClick={handleCreateTemplate}>
          <Text className='trip-templates__add-text'>+ 新建</Text>
        </View>
      </View>

      <ScrollView className='trip-templates__scroll' scrollY>
        {templates.length === 0 ? (
          <EmptyState
            icon='📋'
            title='暂无模板'
            description='创建模板可以快速发起重复行程'
            actionText='创建模板'
            onAction={handleCreateTemplate}
          />
        ) : (
          <View className='trip-templates__list'>
            {templates.map((tpl) => (
              <View key={tpl.id} className='trip-templates__item'>
                <View className='trip-templates__item-header'>
                  <View className='trip-templates__item-tag'>
                    <Text className='trip-templates__item-tag-text'>{getTripTypeLabel(tpl.type)}</Text>
                  </View>
                  <Text className='trip-templates__item-count'>使用{tpl.useCount}次</Text>
                </View>
                <Text className='trip-templates__item-title'>{tpl.title}</Text>
                <Text className='trip-templates__item-desc'>{tpl.description}</Text>
                <View className='trip-templates__item-meta'>
                  {tpl.locationName && (
                    <Text className='trip-templates__item-meta-text'>📍 {tpl.locationName}</Text>
                  )}
                  <Text className='trip-templates__item-meta-text'>⏱️ {tpl.duration}</Text>
                </View>
                <View
                  className='trip-templates__item-use'
                  onClick={() => handleUseTemplate(tpl.id)}
                >
                  <Text className='trip-templates__item-use-text'>使用模板</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}
