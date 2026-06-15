import { View, Text, Textarea } from '@tarojs/components'
import { useState, useCallback } from 'react'
import { platformService } from '../../platform'
import './index.scss'

const REPORT_REASONS = [
  { value: 'spam', label: '垃圾信息' },
  { value: 'inappropriate', label: '不当内容' },
  { value: 'harassment', label: '骚扰行为' },
  { value: 'fake', label: '虚假信息' },
  { value: 'other', label: '其他' },
]

export default function Report() {
  const [selectedReason, setSelectedReason] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleReasonChange = useCallback((reason: string) => {
    setSelectedReason(reason)
  }, [])

  const handleDescriptionChange = useCallback((e: { detail: { value: string } }) => {
    setDescription(e.detail.value)
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!selectedReason) {
      platformService.showToast({ title: '请选择举报原因', icon: 'error' })
      return
    }
    setIsSubmitting(true)
    try {
      await new Promise((r) => setTimeout(r, 500))
      platformService.showToast({ title: '举报已提交', icon: 'success' })
      setTimeout(() => {
        platformService.navigateBack()
      }, 1500)
    } catch {
      platformService.showToast({ title: '提交失败', icon: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }, [selectedReason, description])

  return (
    <View className='report'>
      <View className='report__header'>
        <Text className='report__title'>举报</Text>
      </View>

      <View className='report__content'>
        <View className='report__section'>
          <Text className='report__section-title'>举报原因</Text>
          <View className='report__reasons'>
            {REPORT_REASONS.map((reason) => (
              <View
                key={reason.value}
                className={`report__reason ${selectedReason === reason.value ? 'report__reason--selected' : ''}`}
                onClick={() => handleReasonChange(reason.value)}
              >
                <Text className='report__reason-text'>{reason.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className='report__section'>
          <Text className='report__section-title'>详细描述（可选）</Text>
          <Textarea
            className='report__textarea'
            placeholder='请详细描述问题...'
            maxlength={500}
            value={description}
            onInput={handleDescriptionChange}
          />
        </View>
      </View>

      <View className='report__bottom safe-area-bottom'>
        <View
          className={`report__submit ${isSubmitting ? 'report__submit--loading' : ''}`}
          onClick={handleSubmit}
        >
          <Text className='report__submit-text'>
            {isSubmitting ? '提交中...' : '提交举报'}
          </Text>
        </View>
      </View>
    </View>
  )
}
