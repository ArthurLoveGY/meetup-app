import { View, Text, Input, Textarea, ScrollView, Image } from '@tarojs/components'
import { DateTimePicker } from '../../components/DateTimePicker'
import Taro, { useLoad, useRouter } from '@tarojs/taro'
import { useState, useCallback, useEffect } from 'react'
import { useTripStore } from '../../stores'
import { templateService, uploadService } from '../../services'
import { platformService } from '../../platform'
import {
  TRIP_TYPES,
  COST_TYPES,
  VISIBILITY_OPTIONS,
  JOIN_RULES,
  MAX_TITLE_LENGTH,
  MAX_DESCRIPTION_LENGTH,
} from '../../utils/constants'
import { validateTripTitle, validateTripDescription } from '../../utils/validator'
import type { TripType, CostType, Visibility, JoinRule, CreateTripDTO } from '../../types'
import './index.scss'

const DRAFT_KEY = 'trip_create_draft'

interface DraftData {
  title: string
  type: TripType
  description: string
  startTime: string
  endTime: string
  locationName: string
  coverUrl: string
  maxParticipants: string
  costType: CostType
  estimatedCost: string
  visibility: Visibility
  joinRule: JoinRule
  tags: string[]
}

function loadDraft(): DraftData | null {
  try {
    const raw = Taro.getStorageSync(DRAFT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveDraft(data: DraftData) {
  try {
    Taro.setStorageSync(DRAFT_KEY, JSON.stringify(data))
  } catch {}
}

function clearDraft() {
  try {
    Taro.removeStorageSync(DRAFT_KEY)
  } catch {}
}

export default function TripCreate() {
  const router = useRouter()
  const { createTrip, isLoading } = useTripStore()

  const draft = loadDraft()
  const [title, setTitle] = useState(draft?.title || '')
  const [type, setType] = useState<TripType>(draft?.type || 'other')
  const [description, setDescription] = useState(draft?.description || '')
  const [startTime, setStartTime] = useState(draft?.startTime || '')
  const [endTime, setEndTime] = useState(draft?.endTime || '')
  const [locationName, setLocationName] = useState(draft?.locationName || '')
  const [coverUrl, setCoverUrl] = useState(draft?.coverUrl || '')
  const [maxParticipants, setMaxParticipants] = useState<string>(draft?.maxParticipants || '')
  const [costType, setCostType] = useState<CostType>(draft?.costType || 'aa')
  const [estimatedCost, setEstimatedCost] = useState<string>(draft?.estimatedCost || '')
  const [visibility, setVisibility] = useState<Visibility>(draft?.visibility || 'friends')
  const [joinRule, setJoinRule] = useState<JoinRule>(draft?.joinRule || 'direct')
  const [tags, setTags] = useState<string[]>(draft?.tags || [])

  // Auto-save draft on change
  useEffect(() => {
    saveDraft({ title, type, description, startTime, endTime, locationName, coverUrl, maxParticipants, costType, estimatedCost, visibility, joinRule, tags })
  }, [title, type, description, startTime, endTime, locationName, coverUrl, maxParticipants, costType, estimatedCost, visibility, joinRule, tags])

  useLoad(() => {
    const templateId = router.params.template
    if (templateId) {
      templateService.getTemplateDetail(templateId).then((template) => {
        if (template.title) setTitle(template.title)
        if (template.type) setType(template.type as TripType)
        if (template.description) setDescription(template.description)
        if (template.locationName) setLocationName(template.locationName)
        if (template.maxParticipants) setMaxParticipants(template.maxParticipants.toString())
        if (template.costType) setCostType(template.costType as CostType)
        if (template.visibility) setVisibility(template.visibility as Visibility)
        if (template.joinRule) setJoinRule(template.joinRule as JoinRule)
        if (template.tags) setTags(template.tags)
      }).catch(() => {
        platformService.showToast({ title: '加载模板失败', icon: 'error' })
      })
    }
  })

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
        setCoverUrl(url)
        platformService.showToast({ title: '上传成功', icon: 'success' })
      }
    } catch {
      platformService.hideLoading()
      platformService.showToast({ title: '上传失败', icon: 'error' })
    }
  }, [])

  const handlePickLocation = useCallback(async () => {
    try {
      const location = await platformService.getLocation()
      setLocationName(`位置 ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`)
      platformService.showToast({ title: '已获取位置', icon: 'success' })
    } catch {
      platformService.showToast({ title: '获取位置失败', icon: 'error' })
    }
  }, [])

  const handleSubmit = useCallback(async () => {
    const titleValidation = validateTripTitle(title)
    if (!titleValidation.valid) {
      platformService.showToast({ title: titleValidation.message!, icon: 'error' })
      return
    }

    const descValidation = validateTripDescription(description)
    if (!descValidation.valid) {
      platformService.showToast({ title: descValidation.message!, icon: 'error' })
      return
    }

    if (!startTime) {
      platformService.showToast({ title: '请选择开始时间', icon: 'error' })
      return
    }

    const data: CreateTripDTO = {
      title,
      type,
      description,
      startTime,
      endTime: endTime || undefined,
      locationName: locationName || undefined,
      coverUrl: coverUrl || undefined,
      maxParticipants: maxParticipants ? parseInt(maxParticipants) : undefined,
      costType,
      estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
      visibility,
      joinRule,
      tags: tags.length > 0 ? tags : undefined,
    }

    try {
      const trip = await createTrip(data)
      clearDraft()
      platformService.showToast({ title: '发布成功！', icon: 'success' })
      setTimeout(() => {
        try {
          platformService.navigateTo(`/pages/trip-detail/index?id=${trip.id}`)
        } catch {
          // 跳转失败不影响发布结果
        }
      }, 1500)
    } catch (error) {
      platformService.showToast({ title: '发布失败，请重试', icon: 'error' })
    }
  }, [title, type, description, startTime, endTime, locationName, coverUrl, maxParticipants, costType, estimatedCost, visibility, joinRule, tags, createTrip])

  return (
    <View className='trip-create'>
      <ScrollView className='trip-create__scroll' scrollY>
        <View className='trip-create__section'>
          <Text className='trip-create__label'>封面图</Text>
          {coverUrl ? (
            <View className='trip-create__cover-preview'>
              <Image className='trip-create__cover-image' src={coverUrl} mode='aspectFill' />
              <View className='trip-create__cover-remove' onClick={() => setCoverUrl('')}>
                <Text className='trip-create__cover-remove-text'>✕</Text>
              </View>
            </View>
          ) : (
            <View className='trip-create__cover-upload' onClick={handlePickImage}>
              <Text className='trip-create__cover-upload-icon'>📷</Text>
              <Text className='trip-create__cover-upload-text'>上传封面图</Text>
            </View>
          )}
        </View>

        <View className='trip-create__section'>
          <Text className='trip-create__label'>行程标题 *</Text>
          <Input
            className='trip-create__input'
            placeholder='给行程起个名字'
            maxlength={MAX_TITLE_LENGTH}
            value={title}
            onInput={(e) => setTitle(e.detail.value)}
          />
        </View>

        <View className='trip-create__section'>
          <Text className='trip-create__label'>行程类型</Text>
          <View className='trip-create__types'>
            {TRIP_TYPES.map((t) => (
              <View
                key={t.value}
                className={`trip-create__type ${type === t.value ? 'trip-create__type--active' : ''}`}
                onClick={() => setType(t.value)}
              >
                <Text className='trip-create__type-icon'>{t.icon}</Text>
                <Text className='trip-create__type-text'>{t.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className='trip-create__section'>
          <Text className='trip-create__label'>开始时间 *</Text>
          <DateTimePicker
            value={startTime}
            onChange={setStartTime}
            placeholder='请选择开始时间'
            required
          />
        </View>

        <View className='trip-create__section'>
          <Text className='trip-create__label'>结束时间</Text>
          <DateTimePicker
            value={endTime}
            onChange={setEndTime}
            placeholder='请选择结束时间'
          />
        </View>

        <View className='trip-create__section'>
          <Text className='trip-create__label'>地点</Text>
          <View className='trip-create__location-row'>
            <Input
              className='trip-create__input trip-create__input--flex'
              placeholder='输入地点名称'
              value={locationName}
              onInput={(e) => setLocationName(e.detail.value)}
            />
            <View className='trip-create__location-btn' onClick={handlePickLocation}>
              <Text className='trip-create__location-btn-text'>📍 定位</Text>
            </View>
          </View>
        </View>

        <View className='trip-create__section'>
          <Text className='trip-create__label'>人数限制</Text>
          <Input
            className='trip-create__input'
            type='number'
            placeholder='不填表示不限人数'
            value={maxParticipants}
            onInput={(e) => setMaxParticipants(e.detail.value)}
          />
        </View>

        <View className='trip-create__section'>
          <Text className='trip-create__label'>费用方式</Text>
          <View className='trip-create__options'>
            {COST_TYPES.map((c) => (
              <View
                key={c.value}
                className={`trip-create__option ${costType === c.value ? 'trip-create__option--active' : ''}`}
                onClick={() => setCostType(c.value)}
              >
                <Text className='trip-create__option-text'>{c.label}</Text>
              </View>
            ))}
          </View>
          {costType === 'estimated' && (
            <Input
              className='trip-create__input trip-create__input--cost'
              type='digit'
              placeholder='预估每人费用'
              value={estimatedCost}
              onInput={(e) => setEstimatedCost(e.detail.value)}
            />
          )}
        </View>

        <View className='trip-create__section'>
          <Text className='trip-create__label'>可见范围</Text>
          <View className='trip-create__options'>
            {VISIBILITY_OPTIONS.map((v) => (
              <View
                key={v.value}
                className={`trip-create__option ${visibility === v.value ? 'trip-create__option--active' : ''}`}
                onClick={() => setVisibility(v.value)}
              >
                <Text className='trip-create__option-text'>{v.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className='trip-create__section'>
          <Text className='trip-create__label'>参与规则</Text>
          <View className='trip-create__options'>
            {JOIN_RULES.map((j) => (
              <View
                key={j.value}
                className={`trip-create__option ${joinRule === j.value ? 'trip-create__option--active' : ''}`}
                onClick={() => setJoinRule(j.value)}
              >
                <Text className='trip-create__option-text'>{j.label}</Text>
                <Text className='trip-create__option-desc'>{j.description}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className='trip-create__section'>
          <Text className='trip-create__label'>行程描述</Text>
          <Textarea
            className='trip-create__textarea'
            placeholder='添加更多详细信息...'
            maxlength={MAX_DESCRIPTION_LENGTH}
            value={description}
            onInput={(e) => setDescription(e.detail.value)}
          />
        </View>
      </ScrollView>

      <View className='trip-create__bottom safe-area-bottom'>
        <View
          className={`trip-create__submit ${isLoading ? 'trip-create__submit--loading' : ''}`}
          onClick={handleSubmit}
        >
          <Text className='trip-create__submit-text'>
            {isLoading ? '发布中...' : '发布行程'}
          </Text>
        </View>
      </View>
    </View>
  )
}
