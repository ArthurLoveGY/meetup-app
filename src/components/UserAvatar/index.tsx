import { View, Text, Image } from '@tarojs/components'
import { useState } from 'react'
import './index.scss'

type AvatarSize = 'mini' | 'small' | 'medium' | 'large'

interface UserAvatarProps {
  userId: string
  nickname: string
  avatarUrl?: string
  size?: AvatarSize
  onClick?: (userId: string) => void
}

export function UserAvatar({ userId, nickname, avatarUrl, size = 'medium', onClick }: UserAvatarProps) {
  const [imgError, setImgError] = useState(false)

  function getInitial(): string {
    if (!nickname) return '?'
    return nickname.charAt(0).toUpperCase()
  }

  function getColor(): string {
    const colors = [
      '#2563EB', '#10B981', '#1890FF', '#722ED1',
      '#F59E0B', '#EF4444', '#13C2C2', '#EB2F96',
    ]
    const index = userId.charCodeAt(0) % colors.length
    return colors[index]
  }

  function handleClick() {
    onClick?.(userId)
  }

  const showFallback = !avatarUrl || imgError

  return (
    <View
      className={`user-avatar user-avatar--${size}`}
      onClick={handleClick}
    >
      {showFallback ? (
        <View
          className='user-avatar__fallback'
          style={{ backgroundColor: getColor() }}
        >
          <Text className='user-avatar__initial'>{getInitial()}</Text>
        </View>
      ) : (
        <Image
          className='user-avatar__image'
          src={avatarUrl!}
          onError={() => setImgError(true)}
          mode='aspectFill'
        />
      )}
    </View>
  )
}
