import { View, Text } from '@tarojs/components'
import './index.scss'

interface LoadingViewProps {
  text?: string
  fullScreen?: boolean
}

export function LoadingView({ text = '加载中...', fullScreen = false }: LoadingViewProps) {
  return (
    <View className={`loading-view ${fullScreen ? 'loading-view--fullscreen' : ''}`}>
      <View className='loading-view__spinner'>
        <View className='loading-view__dot' />
        <View className='loading-view__dot' />
        <View className='loading-view__dot' />
      </View>
      <Text className='loading-view__text'>{text}</Text>
    </View>
  )
}
