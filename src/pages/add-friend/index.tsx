import { View, Text, Input, ScrollView } from '@tarojs/components'
import { useState, useCallback, useRef } from 'react'
import { UserAvatar, EmptyState, LoadingView } from '../../components'
import { useFriendStore } from '../../stores'
import { platformService } from '../../platform'
import './index.scss'

export default function AddFriend() {
  const { searchResults, isLoading, searchUsers, sendRequest, clearSearchResults } = useFriendStore()
  const [keyword, setKeyword] = useState('')
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<{ id: string; nickname: string } | null>(null)
  const [requestMessage, setRequestMessage] = useState('')
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleKeywordChange = useCallback((e: { detail: { value: string } }) => {
    const value = e.detail.value
    setKeyword(value)

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    if (value.trim()) {
      debounceTimer.current = setTimeout(() => {
        searchUsers(value)
      }, 300)
    } else {
      clearSearchResults()
    }
  }, [searchUsers, clearSearchResults])

  const handleAddClick = useCallback((user: { id: string; nickname: string }) => {
    setSelectedUser(user)
    setShowRequestModal(true)
    setRequestMessage('')
  }, [])

  const handleMessageChange = useCallback((e: { detail: { value: string } }) => {
    setRequestMessage(e.detail.value)
  }, [])

  const handleSendRequest = useCallback(async () => {
    if (!selectedUser) return
    await sendRequest(selectedUser.id, requestMessage || undefined)
    setShowRequestModal(false)
    setSelectedUser(null)
    platformService.showToast({ title: '好友申请已发送', icon: 'success' })
  }, [selectedUser, requestMessage, sendRequest])

  const handleCloseModal = useCallback(() => {
    setShowRequestModal(false)
    setSelectedUser(null)
  }, [])

  return (
    <View className='add-friend'>
      <View className='add-friend__header'>
        <Text className='add-friend__title'>添加好友</Text>
      </View>

      <View className='add-friend__search'>
        <Input
          className='add-friend__search-input'
          placeholder='搜索昵称或ID'
          value={keyword}
          onInput={handleKeywordChange}
        />
      </View>

      <ScrollView className='add-friend__scroll' scrollY>
        {isLoading ? (
          <LoadingView text='搜索中...' />
        ) : searchResults.length > 0 ? (
          <View className='add-friend__results'>
            {searchResults.map((user) => (
              <View key={user.id} className='add-friend__item'>
                <UserAvatar
                  userId={user.id}
                  nickname={user.nickname}
                  avatarUrl={user.avatarUrl}
                  size='medium'
                />
                <View className='add-friend__info'>
                  <Text className='add-friend__name'>{user.nickname}</Text>
                  {user.city && (
                    <Text className='add-friend__city'>📍 {user.city}</Text>
                  )}
                </View>
                <View
                  className='add-friend__add-btn'
                  onClick={() => handleAddClick(user)}
                >
                  <Text className='add-friend__add-btn-text'>添加</Text>
                </View>
              </View>
            ))}
          </View>
        ) : keyword.trim() ? (
          <EmptyState
            icon='🔍'
            title='未找到用户'
            description='换个关键词试试'
          />
        ) : (
          <EmptyState
            icon='👋'
            title='搜索添加好友'
            description='输入昵称或ID搜索用户'
          />
        )}
      </ScrollView>

      {showRequestModal && (
        <View className='add-friend__mask' onClick={handleCloseModal}>
          <View className='add-friend__modal' onClick={(e) => e.stopPropagation()}>
            <Text className='add-friend__modal-title'>
              向 {selectedUser?.nickname} 发送好友申请
            </Text>
            <Input
              className='add-friend__modal-input'
              placeholder='写一句验证消息（可选）'
              value={requestMessage}
              onInput={handleMessageChange}
            />
            <View className='add-friend__modal-actions'>
              <View className='add-friend__modal-btn add-friend__modal-btn--cancel' onClick={handleCloseModal}>
                <Text className='add-friend__modal-btn-text'>取消</Text>
              </View>
              <View className='add-friend__modal-btn add-friend__modal-btn--send' onClick={handleSendRequest}>
                <Text className='add-friend__modal-btn-text'>发送</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
