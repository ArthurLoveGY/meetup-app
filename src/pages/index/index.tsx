import { View, Text, ScrollView } from '@tarojs/components'
import { useLoad, usePullDownRefresh, stopPullDownRefresh } from '@tarojs/taro'
import { useCallback } from 'react'
import { TripCard, EmptyState, LoadingView } from '../../components'
import { useTripStore } from '../../stores'
import { platformService } from '../../platform'
import type { TripWithCreator } from '../../types'
import './index.scss'

export default function TripFeed() {
  const { feedTrips, isLoading, isLoadingMore, feedHasMore, fetchFeedTrips } = useTripStore()

  const doFetch = useCallback((refresh: boolean) => {
    fetchFeedTrips(refresh)
  }, [fetchFeedTrips])

  useLoad(() => {
    doFetch(true)
  })

  usePullDownRefresh(() => {
    doFetch(true)
    stopPullDownRefresh()
  })

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && feedHasMore) {
      doFetch(false)
    }
  }, [isLoadingMore, feedHasMore, doFetch])

  const handleTripClick = useCallback((trip: TripWithCreator) => {
    platformService.navigateTo(`/pages/trip-detail/index?id=${trip.id}`)
  }, [])

  const handleCreateTrip = useCallback(() => {
    platformService.navigateTo('/pages/trip-create/index')
  }, [])

  if (isLoading && feedTrips.length === 0) {
    return <LoadingView text='加载行程中...' />
  }

  return (
    <View className='trip-feed'>
      <View className='trip-feed__header'>
        <Text className='trip-feed__title'>行程圈</Text>
        <Text className='trip-feed__subtitle'>看看朋友们在约什么</Text>
      </View>

      <ScrollView
        className='trip-feed__scroll'
        scrollY
        enhanced
        showScrollbar={false}
        onScrollToLower={handleLoadMore}
      >
        {feedTrips.length === 0 ? (
          <EmptyState
            icon='🌟'
            title='还没有动态'
            description='添加好友后，他们的行程会出现在这里'
            actionText='去发现页看看'
            onAction={() => platformService.navigateTo('/pages/discover/index')}
          />
        ) : (
          <View className='trip-feed__list'>
            {feedTrips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onClick={handleTripClick}
              />
            ))}

            {isLoadingMore && (
              <View className='trip-feed__loading'>
                <LoadingView text='加载更多...' />
              </View>
            )}

            {!feedHasMore && feedTrips.length > 0 && (
              <View className='trip-feed__end'>
                <Text className='trip-feed__end-text'>没有更多了</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <View className='trip-feed__fab' onClick={handleCreateTrip}>
        <Text className='trip-feed__fab-icon'>+</Text>
      </View>
    </View>
  )
}
