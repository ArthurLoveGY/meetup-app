import { View, Text, ScrollView } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import { useState, useCallback } from 'react'
import { UserAvatar, TripCard, EmptyState, LoadingView } from '../../components'
import { useAuthStore, useTripStore } from '../../stores'
import { platformService } from '../../platform'
import type { TripWithCreator } from '../../types'
import './index.scss'

export default function Profile() {
  const { user, isLoggedIn, logout } = useAuthStore()
  const { myTrips, isLoading: tripsLoading, fetchMyTrips } = useTripStore()
  const [activeTab, setActiveTab] = useState<'created' | 'joined'>('created')

  useLoad(() => {
    if (isLoggedIn) {
      fetchMyTrips(true)
    }
  })

  const handleLogin = useCallback(async () => {
    try {
      await useAuthStore.getState().login()
      platformService.showToast({ title: '登录成功', icon: 'success' })
      fetchMyTrips(true)
    } catch (error) {
      platformService.showToast({ title: '登录失败', icon: 'error' })
    }
  }, [fetchMyTrips])

  const handleLogout = useCallback(async () => {
    const confirmed = await platformService.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
    })
    if (confirmed) {
      await logout()
      platformService.showToast({ title: '已退出登录', icon: 'success' })
    }
  }, [logout])

  const handleSettings = useCallback(() => {
    platformService.navigateTo('/pages/settings/index')
  }, [])

  const handleTripClick = useCallback((trip: TripWithCreator) => {
    platformService.navigateTo(`/pages/trip-detail/index?id=${trip.id}`)
  }, [])

  const handleCreateTrip = useCallback(() => {
    platformService.navigateTo('/pages/trip-create/index')
  }, [])

  if (!isLoggedIn) {
    return (
      <View className='profile'>
        <View className='profile__login'>
          <Text className='profile__login-icon'>👋</Text>
          <Text className='profile__login-title'>欢迎使用 TripCircle</Text>
          <Text className='profile__login-desc'>登录后可以创建和加入行程</Text>
          <View className='profile__login-btn' onClick={handleLogin}>
            <Text className='profile__login-btn-text'>微信登录</Text>
          </View>
        </View>
      </View>
    )
  }

  const createdTrips = myTrips.filter((t) => t.creatorId === user?.id)
  const joinedTrips = myTrips.filter((t) => t.creatorId !== user?.id)

  return (
    <View className='profile'>
      <ScrollView className='profile__scroll' scrollY>
        <View className='profile__header'>
          <View className='profile__user'>
            <UserAvatar
              userId={user?.id || ''}
              nickname={user?.nickname || ''}
              avatarUrl={user?.avatarUrl}
              size='large'
            />
            <View className='profile__user-info'>
              <Text className='profile__user-name'>{user?.nickname}</Text>
              {user?.bio && (
                <Text className='profile__user-bio'>{user.bio}</Text>
              )}
              {user?.city && (
                <Text className='profile__user-city'>📍 {user.city}</Text>
              )}
            </View>
          </View>

          <View className='profile__stats'>
            <View className='profile__stat'>
              <Text className='profile__stat-value'>{createdTrips.length}</Text>
              <Text className='profile__stat-label'>发起</Text>
            </View>
            <View className='profile__stat'>
              <Text className='profile__stat-value'>{joinedTrips.length}</Text>
              <Text className='profile__stat-label'>参与</Text>
            </View>
            <View className='profile__stat'>
              <Text className='profile__stat-value'>{myTrips.length}</Text>
              <Text className='profile__stat-label'>总行程</Text>
            </View>
          </View>

          <View className='profile__actions'>
            <View className='profile__action' onClick={handleSettings}>
              <Text className='profile__action-icon'>⚙️</Text>
              <Text className='profile__action-text'>设置</Text>
            </View>
            <View className='profile__action' onClick={handleLogout}>
              <Text className='profile__action-icon'>🚪</Text>
              <Text className='profile__action-text'>退出</Text>
            </View>
          </View>
        </View>

        <View className='profile__tabs'>
          <View
            className={`profile__tab ${activeTab === 'created' ? 'profile__tab--active' : ''}`}
            onClick={() => setActiveTab('created')}
          >
            <Text className='profile__tab-text'>我发起的</Text>
          </View>
          <View
            className={`profile__tab ${activeTab === 'joined' ? 'profile__tab--active' : ''}`}
            onClick={() => setActiveTab('joined')}
          >
            <Text className='profile__tab-text'>我参与的</Text>
          </View>
        </View>

        {tripsLoading ? (
          <LoadingView text='加载行程...' />
        ) : (
          <View className='profile__trips'>
            {activeTab === 'created' ? (
              createdTrips.length === 0 ? (
                <EmptyState
                  icon='📝'
                  title='还没有发起过行程'
                  description='快来发起第一个行程吧！'
                  actionText='发起行程'
                  onAction={handleCreateTrip}
                />
              ) : (
                createdTrips.map((trip) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    onClick={handleTripClick}
                  />
                ))
              )
            ) : (
              joinedTrips.length === 0 ? (
                <EmptyState
                  icon='🎉'
                  title='还没有参与过行程'
                  description='去看看朋友们在约什么吧！'
                  actionText='浏览行程'
                  onAction={() => platformService.redirectTo('/pages/index/index')}
                />
              ) : (
                joinedTrips.map((trip) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    onClick={handleTripClick}
                  />
                ))
              )
            )}
          </View>
        )}
      </ScrollView>
    </View>
  )
}
