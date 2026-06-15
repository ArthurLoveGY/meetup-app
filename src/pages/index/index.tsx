import { View, Text, ScrollView, Input } from '@tarojs/components'
import { useLoad, usePullDownRefresh, stopPullDownRefresh } from '@tarojs/taro'
import { useState, useCallback } from 'react'
import { TripCard, EmptyState, LoadingView } from '../../components'
import { useTripStore } from '../../stores'
import { platformService } from '../../platform'
import { TRIP_TYPES } from '../../utils/constants'
import type { TripWithCreator } from '../../types'
import './index.scss'

export default function TripFeed() {
  const { trips, isLoading, isLoadingMore, hasMore, fetchTrips } = useTripStore()
  const [keyword, setKeyword] = useState('')
  const [filterType, setFilterType] = useState('')

  const doFetch = useCallback((refresh: boolean) => {
    const filters: { keyword?: string; type?: string } = {}
    if (keyword.trim()) filters.keyword = keyword.trim()
    if (filterType) filters.type = filterType
    fetchTrips(refresh, Object.keys(filters).length > 0 ? filters : undefined)
  }, [keyword, filterType, fetchTrips])

  useLoad(() => {
    doFetch(true)
  })

  usePullDownRefresh(() => {
    doFetch(true)
    stopPullDownRefresh()
  })

  const handleSearch = useCallback(() => {
    doFetch(true)
  }, [doFetch])

  const handleTypeFilter = useCallback((type: string) => {
    setFilterType((prev) => prev === type ? '' : type)
    setTimeout(() => {
      const filters: { keyword?: string; type?: string } = {}
      if (keyword.trim()) filters.keyword = keyword.trim()
      const nextType = filterType === type ? '' : type
      if (nextType) filters.type = nextType
      fetchTrips(true, Object.keys(filters).length > 0 ? filters : undefined)
    }, 0)
  }, [keyword, filterType, fetchTrips])

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      doFetch(false)
    }
  }, [isLoadingMore, hasMore, doFetch])

  const handleTripClick = useCallback((trip: TripWithCreator) => {
    platformService.navigateTo(`/pages/trip-detail/index?id=${trip.id}`)
  }, [])

  const handleCreateTrip = useCallback(() => {
    platformService.navigateTo('/pages/trip-create/index')
  }, [])

  if (isLoading && trips.length === 0) {
    return <LoadingView text='加载行程中...' />
  }

  return (
    <View className='trip-feed'>
      <View className='trip-feed__header'>
        <Text className='trip-feed__title'>行程圈</Text>
        <Text className='trip-feed__subtitle'>看看朋友们在约什么</Text>
        <View className='trip-feed__search'>
          <Input
            className='trip-feed__search-input'
            placeholder='搜索行程...'
            value={keyword}
            onInput={(e) => setKeyword(e.detail.value)}
            onConfirm={handleSearch}
          />
          <View className='trip-feed__search-btn' onClick={handleSearch}>
            <Text className='trip-feed__search-btn-text'>搜索</Text>
          </View>
        </View>
        <ScrollView className='trip-feed__filters' scrollX showScrollbar={false}>
          <View className='trip-feed__filter-list'>
            {TRIP_TYPES.map((t) => (
              <View
                key={t.value}
                className={`trip-feed__filter ${filterType === t.value ? 'trip-feed__filter--active' : ''}`}
                onClick={() => handleTypeFilter(t.value)}
              >
                <Text className='trip-feed__filter-text'>{t.icon} {t.label}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView
        className='trip-feed__scroll'
        scrollY
        enhanced
        showScrollbar={false}
        onScrollToLower={handleLoadMore}
      >
        {trips.length === 0 ? (
          <EmptyState
            icon='🌟'
            title={keyword || filterType ? '没有找到匹配的行程' : '还没有行程'}
            description={keyword || filterType ? '换个关键词试试' : '快来发起第一个行程吧！'}
            actionText='发起行程'
            onAction={handleCreateTrip}
          />
        ) : (
          <View className='trip-feed__list'>
            {trips.map((trip) => (
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

            {!hasMore && trips.length > 0 && (
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
