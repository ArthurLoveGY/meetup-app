import { View, Text, ScrollView } from '@tarojs/components'
import { useLoad, useRouter } from '@tarojs/taro'
import { useState, useCallback, useEffect, useRef } from 'react'
import { UserAvatar, EmptyState, LoadingView, MessageInput } from '../../components'
import { useAuthStore } from '../../stores'
import { chatService } from '../../services/chat.service'
import { formatRelativeTime } from '../../utils/date'
import type { ChatMessage } from '../../services/chat.service'
import './index.scss'

export default function TripChat() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [inputValue, setInputValue] = useState('')
  const [tripId, setTripId] = useState('')
  const [onlineCount, setOnlineCount] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Load historical messages
  useLoad(() => {
    const id = router.params.id
    if (id) {
      setTripId(id)
      chatService.getMessages(id)
        .then((msgs) => {
          setMessages(msgs)
          setIsLoading(false)
        })
        .catch(() => {
          setIsLoading(false)
        })
    }
  })

  // WebSocket: join room and listen for events
  useEffect(() => {
    if (!tripId) return

    chatService.joinTrip(tripId)

    const handleMessage = (msg: ChatMessage) => {
      setMessages((prev) => {
        // Deduplicate: skip if message ID already exists
        if (prev.some((m) => m.id === msg.id)) return prev
        return [...prev, msg]
      })
    }

    const handleUserJoined = (data: { userId: string; onlineCount: number }) => {
      setOnlineCount(data.onlineCount)
    }

    const handleUserLeft = (data: { userId: string; onlineCount: number }) => {
      setOnlineCount(data.onlineCount)
    }

    chatService.onMessage(handleMessage)
    chatService.onUserJoined(handleUserJoined)
    chatService.onUserLeft(handleUserLeft)

    return () => {
      chatService.offMessage(handleMessage)
      chatService.offUserJoined(handleUserJoined)
      chatService.offUserLeft(handleUserLeft)
      chatService.leaveTrip(tripId)
    }
  }, [tripId])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        const el = scrollRef.current
        if (el) {
          el.scrollTop = el.scrollHeight
        }
      }, 100)
    }
  }, [messages.length])

  const handleSend = useCallback(() => {
    if (!inputValue.trim() || !tripId) return

    const content = inputValue.trim()
    setInputValue('')

    // Send via WebSocket (message will arrive back via 'new_message' event)
    chatService.sendMessage(tripId, content)
  }, [inputValue, tripId])

  if (isLoading) {
    return <LoadingView text='加载聊天...' />
  }

  return (
    <View className='trip-chat'>
      <View className='trip-chat__header'>
        <Text className='trip-chat__title'>行程聊天</Text>
        <View className='trip-chat__info'>
          <Text className='trip-chat__count'>{messages.length}条消息</Text>
          {onlineCount > 0 && (
            <Text className='trip-chat__online'>{onlineCount}人在线</Text>
          )}
        </View>
      </View>

      <ScrollView
        className='trip-chat__scroll'
        scrollY
        scrollIntoView={`msg-${messages[messages.length - 1]?.id}`}
      >
        {messages.length === 0 ? (
          <EmptyState
            icon='💬'
            title='暂无消息'
            description='快来第一个发言吧！'
          />
        ) : (
          <View className='trip-chat__messages'>
            {messages.map((msg) => {
              const isMe = msg.userId === user?.id

              return (
                <View
                  key={msg.id}
                  id={`msg-${msg.id}`}
                  className={`trip-chat__message ${isMe ? 'trip-chat__message--me' : ''}`}
                >
                  {!isMe && (
                    <UserAvatar
                      userId={msg.userId}
                      nickname={msg.nickname}
                      avatarUrl={msg.avatarUrl}
                      size='small'
                    />
                  )}
                  <View className='trip-chat__message-content'>
                    {!isMe && (
                      <Text className='trip-chat__message-name'>{msg.nickname}</Text>
                    )}
                    <View className='trip-chat__message-bubble'>
                      <Text className='trip-chat__message-text'>{msg.content}</Text>
                    </View>
                    <Text className='trip-chat__message-time'>{formatRelativeTime(msg.createdAt)}</Text>
                  </View>
                </View>
              )
            })}
          </View>
        )}
      </ScrollView>

      <MessageInput
        value={inputValue}
        onChange={setInputValue}
        onSend={handleSend}
        placeholder='输入消息...'
      />
    </View>
  )
}
