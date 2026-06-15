import { View, Text, ScrollView } from '@tarojs/components'
import { useState, useCallback } from 'react'
import { platformService } from '../../platform'
import './index.scss'

export default function DataExport() {
  const [isExporting, setIsExporting] = useState(false)
  const [exported, setExported] = useState(false)

  const handleExport = useCallback(async () => {
    setIsExporting(true)
    try {
      await new Promise((r) => setTimeout(r, 2000))
      setExported(true)
      platformService.showToast({ title: '数据导出成功', icon: 'success' })
    } catch {
      platformService.showToast({ title: '导出失败', icon: 'error' })
    } finally {
      setIsExporting(false)
    }
  }, [])

  const dataTypes = [
    { icon: '👤', name: '个人资料', desc: '昵称、头像、简介、城市、兴趣标签' },
    { icon: '🗺️', name: '行程数据', desc: '您创建和参与的所有行程' },
    { icon: '👥', name: '好友关系', desc: '好友列表、分组信息' },
    { icon: '💬', name: '评论记录', desc: '您发布的所有评论' },
    { icon: '🔔', name: '通知记录', desc: '历史通知消息' },
  ]

  return (
    <View className='data-export'>
      <View className='data-export__header'>
        <Text className='data-export__title'>数据导出</Text>
      </View>

      <ScrollView className='data-export__scroll' scrollY>
        <View className='data-export__info'>
          <Text className='data-export__info-title'>导出说明</Text>
          <Text className='data-export__info-text'>
            您可以导出您的所有个人数据。导出的数据将以JSON格式打包，包含以下内容：
          </Text>
        </View>

        <View className='data-export__types'>
          {dataTypes.map((type) => (
            <View key={type.name} className='data-export__type'>
              <Text className='data-export__type-icon'>{type.icon}</Text>
              <View className='data-export__type-content'>
                <Text className='data-export__type-name'>{type.name}</Text>
                <Text className='data-export__type-desc'>{type.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {exported && (
          <View className='data-export__result'>
            <Text className='data-export__result-icon'>✅</Text>
            <Text className='data-export__result-text'>数据已准备好，正在发送到您的邮箱</Text>
          </View>
        )}
      </ScrollView>

      <View className='data-export__bottom safe-area-bottom'>
        <View
          className={`data-export__btn ${isExporting ? 'data-export__btn--loading' : ''}`}
          onClick={handleExport}
        >
          <Text className='data-export__btn-text'>
            {isExporting ? '导出中...' : exported ? '重新导出' : '导出我的数据'}
          </Text>
        </View>
      </View>
    </View>
  )
}
