import { View, Text, Input, Textarea, ScrollView, Image } from '@tarojs/components'
import { DateTimePicker } from '../DateTimePicker'
import { useCallback } from 'react'
import { platformService } from '../../platform'
import { uploadService } from '../../services/upload.service'
import {
  TRIP_TYPES,
  COST_TYPES,
  VISIBILITY_OPTIONS,
  JOIN_RULES,
  MAX_TITLE_LENGTH,
  MAX_DESCRIPTION_LENGTH,
} from '../../utils/constants'
import type { TripType, CostType, Visibility, JoinRule } from '../../types'
import './index.scss'

export interface TripFormData {
  title: string
  type: TripType
  description: string
  startTime: string
  endTime: string
  locationName: string
  locationAddress: string
  coverUrl: string
  maxParticipants: string
  costType: CostType
  estimatedCost: string
  visibility: Visibility
  joinRule: JoinRule
}

interface TripFormProps {
  value: TripFormData
  onChange: (data: TripFormData) => void
}

export function TripForm({ value, onChange }: TripFormProps) {
  const update = useCallback((field: keyof TripFormData, val: string) => {
    onChange({ ...value, [field]: val })
  }, [value, onChange])

  const handlePickLocation = useCallback(async () => {
    try {
      const location = await platformService.getLocation()
      update('locationAddress', `${location.latitude},${location.longitude}`)
      platformService.showToast({ title: '已获取位置', icon: 'success' })
    } catch {
      platformService.showToast({ title: '获取位置失败', icon: 'error' })
    }
  }, [update])

  const handlePickImage = useCallback(async () => {
    try {
      const result = await platformService.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
      })
      if (result.tempFilePaths.length > 0) {
        platformService.showLoading('上传中...')
        const url = await uploadService.uploadImage(result.tempFilePaths[0])
        platformService.hideLoading()
        update('coverUrl', url)
        platformService.showToast({ title: '上传成功', icon: 'success' })
      }
    } catch {
      platformService.hideLoading()
      platformService.showToast({ title: '上传失败', icon: 'error' })
    }
  }, [update])

  return (
    <ScrollView className='trip-form__scroll' scrollY>
      <View className='trip-form__section'>
        <Text className='trip-form__label'>封面图</Text>
        {value.coverUrl ? (
          <View className='trip-form__cover-preview'>
            <Image className='trip-form__cover-image' src={value.coverUrl} mode='aspectFill' />
            <View className='trip-form__cover-remove' onClick={() => update('coverUrl', '')}>
              <Text className='trip-form__cover-remove-text'>✕</Text>
            </View>
          </View>
        ) : (
          <View className='trip-form__cover-upload' onClick={handlePickImage}>
            <Text className='trip-form__cover-upload-icon'>📷</Text>
            <Text className='trip-form__cover-upload-text'>上传封面图</Text>
          </View>
        )}
      </View>

      <View className='trip-form__section'>
        <Text className='trip-form__label'>行程标题 *</Text>
        <Input
          className='trip-form__input'
          placeholder='给行程起个名字'
          maxlength={MAX_TITLE_LENGTH}
          value={value.title}
          onInput={(e) => update('title', e.detail.value)}
        />
      </View>

      <View className='trip-form__section'>
        <Text className='trip-form__label'>行程类型</Text>
        <View className='trip-form__types'>
          {TRIP_TYPES.map((t) => (
            <View
              key={t.value}
              className={`trip-form__type ${value.type === t.value ? 'trip-form__type--active' : ''}`}
              onClick={() => update('type', t.value)}
            >
              <Text className='trip-form__type-icon'>{t.icon}</Text>
              <Text className='trip-form__type-text'>{t.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className='trip-form__section'>
        <Text className='trip-form__label'>开始时间 *</Text>
        <DateTimePicker
          value={value.startTime}
          onChange={(val) => update('startTime', val)}
          placeholder='请选择开始时间'
          required
        />
      </View>

      <View className='trip-form__section'>
        <Text className='trip-form__label'>结束时间</Text>
        <DateTimePicker
          value={value.endTime}
          onChange={(val) => update('endTime', val)}
          placeholder='请选择结束时间'
        />
      </View>

      <View className='trip-form__section'>
        <Text className='trip-form__label'>地点</Text>
        <View className='trip-form__location-row'>
          <Input
            className='trip-form__input trip-form__input--flex'
            placeholder='输入地点名称'
            value={value.locationName}
            onInput={(e) => update('locationName', e.detail.value)}
          />
          <View className='trip-form__location-btn' onClick={handlePickLocation}>
            <Text className='trip-form__location-btn-text'>📍 定位</Text>
          </View>
        </View>
      </View>

      <View className='trip-form__section'>
        <Text className='trip-form__label'>人数限制</Text>
        <Input
          className='trip-form__input'
          type='number'
          placeholder='不填表示不限人数'
          value={value.maxParticipants}
          onInput={(e) => update('maxParticipants', e.detail.value)}
        />
      </View>

      <View className='trip-form__section'>
        <Text className='trip-form__label'>费用方式</Text>
        <View className='trip-form__options'>
          {COST_TYPES.map((c) => (
            <View
              key={c.value}
              className={`trip-form__option ${value.costType === c.value ? 'trip-form__option--active' : ''}`}
              onClick={() => update('costType', c.value)}
            >
              <Text className='trip-form__option-text'>{c.label}</Text>
            </View>
          ))}
        </View>
        {value.costType === 'estimated' && (
          <Input
            className='trip-form__input trip-form__input--cost'
            type='digit'
            placeholder='预估每人费用'
            value={value.estimatedCost}
            onInput={(e) => update('estimatedCost', e.detail.value)}
          />
        )}
      </View>

      <View className='trip-form__section'>
        <Text className='trip-form__label'>可见范围</Text>
        <View className='trip-form__options'>
          {VISIBILITY_OPTIONS.map((v) => (
            <View
              key={v.value}
              className={`trip-form__option ${value.visibility === v.value ? 'trip-form__option--active' : ''}`}
              onClick={() => update('visibility', v.value)}
            >
              <Text className='trip-form__option-text'>{v.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className='trip-form__section'>
        <Text className='trip-form__label'>参与规则</Text>
        <View className='trip-form__options'>
          {JOIN_RULES.map((j) => (
            <View
              key={j.value}
              className={`trip-form__option ${value.joinRule === j.value ? 'trip-form__option--active' : ''}`}
              onClick={() => update('joinRule', j.value)}
            >
              <Text className='trip-form__option-text'>{j.label}</Text>
              <Text className='trip-form__option-desc'>{j.description}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className='trip-form__section'>
        <Text className='trip-form__label'>行程描述</Text>
        <Textarea
          className='trip-form__textarea'
          placeholder='添加更多详细信息...'
          maxlength={MAX_DESCRIPTION_LENGTH}
          value={value.description}
          onInput={(e) => update('description', e.detail.value)}
        />
      </View>
    </ScrollView>
  )
}
