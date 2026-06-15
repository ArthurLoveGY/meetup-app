import { View, Input } from '@tarojs/components'
import { useCallback } from 'react'
import './index.scss'

interface MessageInputProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  placeholder?: string
}

export function MessageInput({ value, onChange, onSend, placeholder = '输入消息...' }: MessageInputProps) {
  const handleInput = useCallback((e: { detail: { value: string } }) => {
    onChange(e.detail.value)
  }, [onChange])

  const handleConfirm = useCallback(() => {
    onSend()
  }, [onSend])

  return (
    <View className='message-input safe-area-bottom'>
      <Input
        className='message-input__input'
        placeholder={placeholder}
        value={value}
        onInput={handleInput}
        confirmType='send'
        onConfirm={handleConfirm}
      />
      <View className='message-input__send' onClick={onSend}>
        <View className='message-input__send-text'>发送</View>
      </View>
    </View>
  )
}
