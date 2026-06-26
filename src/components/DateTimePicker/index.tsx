import { View, Text, Picker } from '@tarojs/components'
import { useState, useMemo } from 'react'
import dayjs from 'dayjs'
import './index.scss'

interface DateTimePickerProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  required?: boolean
}

function formatDisplay(val: string): string {
  if (!val) return ''
  const d = dayjs(val)
  if (!d.isValid()) return val
  return d.format('YYYY年M月D日 HH:mm')
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = '请选择日期和时间',
  required = false,
}: DateTimePickerProps) {
  const [visible, setVisible] = useState(false)
  const [dateVal, setDateVal] = useState(value ? dayjs(value).format('YYYY-MM-DD') : '')
  const [timeVal, setTimeVal] = useState(value ? dayjs(value).format('HH:mm') : '')

  const today = useMemo(() => dayjs().format('YYYY-MM-DD'), [])

  const handleOpen = () => {
    setDateVal(value ? dayjs(value).format('YYYY-MM-DD') : today)
    setTimeVal(value ? dayjs(value).format('HH:mm') : '12:00')
    setVisible(true)
  }

  const handleConfirm = () => {
    if (dateVal && timeVal) {
      onChange(`${dateVal} ${timeVal}`)
    }
    setVisible(false)
  }

  const handleCancel = () => {
    setVisible(false)
  }

  const handleClear = (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    onChange('')
  }

  const display = formatDisplay(value)
  const titleText = required ? '选择开始日期和时间' : '选择日期和时间'

  return (
    <>
      <View className='dtp-trigger' onClick={handleOpen}>
        {display ? (
          <Text className='dtp-trigger__text'>{display}</Text>
        ) : (
          <Text className='dtp-trigger__placeholder'>{placeholder}</Text>
        )}
        {value ? (
          <View className='dtp-trigger__clear' onClick={handleClear}>
            <Text className='dtp-trigger__clear-icon'>✕</Text>
          </View>
        ) : (
          <Text className='dtp-trigger__arrow'>▸</Text>
        )}
      </View>

      {visible && (
        <View className='dtp-modal' onClick={handleCancel}>
          <View className='dtp-modal__content' onClick={(e) => e.stopPropagation()}>
            <View className='dtp-modal__header'>
              <Text className='dtp-modal__title'>{titleText}</Text>
            </View>

            <View className='dtp-modal__body'>
              <View className='dtp-modal__row'>
                <Text className='dtp-modal__label'>日期</Text>
                <View className='dtp-modal__picker-wrap'>
                  <Picker
                    mode='date'
                    value={dateVal}
                    start='2020-01-01'
                    end='2030-12-31'
                    onChange={(e) => setDateVal(e.detail.value)}
                  >
                    <View className='dtp-modal__picker-value'>
                      <Text className='dtp-modal__picker-text'>
                        {dateVal || '选择日期'}
                      </Text>
                      <Text className='dtp-modal__picker-arrow'>▸</Text>
                    </View>
                  </Picker>
                </View>
              </View>

              <View className='dtp-modal__row'>
                <Text className='dtp-modal__label'>时间</Text>
                <View className='dtp-modal__picker-wrap'>
                  <Picker
                    mode='time'
                    value={timeVal}
                    onChange={(e) => setTimeVal(e.detail.value)}
                  >
                    <View className='dtp-modal__picker-value'>
                      <Text className='dtp-modal__picker-text'>
                        {timeVal || '选择时间'}
                      </Text>
                      <Text className='dtp-modal__picker-arrow'>▸</Text>
                    </View>
                  </Picker>
                </View>
              </View>
            </View>

            <View className='dtp-modal__footer'>
              <View className='dtp-modal__btn dtp-modal__btn--cancel' onClick={handleCancel}>
                <Text className='dtp-modal__btn-text dtp-modal__btn-text--cancel'>取消</Text>
              </View>
              <View className='dtp-modal__btn dtp-modal__btn--confirm' onClick={handleConfirm}>
                <Text className='dtp-modal__btn-text dtp-modal__btn-text--confirm'>确认</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </>
  )
}
