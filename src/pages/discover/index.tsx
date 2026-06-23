import { View, Text, ScrollView, Input } from '@tarojs/components'
import { useLoad, usePullDownRefresh, stopPullDownRefresh } from '@tarojs/taro'
import { useState, useCallback } from 'react'
import { TripCard, EmptyState, LoadingView } from '../../components'
import { useTripStore } from '../../stores'
import { platformService } from '../../platform'
import { TRIP_TYPES } from '../../utils/constants'
import type { TripWithCreator } from '../../types'
import './index.scss'

const SORT_OPTIONS = [
  { value: 'latest', label: '最新' },
  { value: 'nearby', label: '附近' },
] as const

export default function Discover() {
  const { trips, isLoading, isLoadingMore, hasMore, fetchTrips } = useTripStore()
  const [keyword, setKeyword] = useState('')
  const [filterType, setFilterType] = useState('')
  const [sortType, setSortType] = useState<string>('latest')
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | undefined>()
  const [isLocating, setIsLocating] = useState(false)

  const buildFilters = useCallback((kw: string, type: string, sort: string, location?: { lat: number; lng: number }) => {
    const filters: { keyword?: string; type?: string; sort?: string; lat?: number; lng?: number } = {}
    if (kw.trim()) filters.keyword = kw.trim()
    if (type) filters.type = type
    if (sort) filters.sort = sort
    if (location) {
      filters.lat = location.lat
      filters.lng = location.lng
    }
    return Object.keys(filters).length > 0 ? filters : undefined
  }, [])

  const doFetch = useCallback((refresh: boolean, location?: { lat: number; lng: number }) => {
    fetchTrips(refresh, buildFilters(keyword, filterType, sortType, location ?? userLocation))
  }, [keyword, filterType, sortType, userLocation, fetchTrips, buildFilters])

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
    const nextType = filterType === type ? '' : type
    setFilterType(nextType)
    fetchTrips(true, buildFilters(keyword, nextType, sortType, userLocation))
  }, [filterType, keyword, sortType, userLocation, fetchTrips, buildFilters])

  const handleSortChange = useCallback(async (sort: string) => {
    if (sort === 'nearby' && !userLocation) {
      setIsLocating(true)
      try {
        const coords = await platformService.getLocation()
        const loc = { lat: coords.latitude, lng: coords.longitude }
        setUserLocation(loc)
        setSortType(sort)
        fetchTrips(true, buildFilters(keyword, filterType, sort, loc))
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : '获取位置失败'
        platformService.showModal({
          title: '定位失败',
          content: `${errMsg}，请检查定位权限或网络连接后重试。`,
          showCancel: false,
        })
        // Stay on current sort on failure
      } finally {
        setIsLocating(false)
      }
    } else {
      setSortType(sort)
      fetchTrips(true, buildFilters(keyword, filterType, sort, sort === 'nearby' ? userLocation : undefined))
    }
  }, [keyword, filterType, userLocation, fetchTrips, buildFilters])

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
    return <LoadingView text='加载中...' />
  }

  return (
    <View className='discover'>
      <View className='discover__header'>
        <Text className='discover__title'>发现</Text>
        <Text className='discover__subtitle'>探索更多精彩活动</Text>
        <View className='discover__search'>
          <Input
            className='discover__search-input'
            placeholder='搜索行程标题/地点...'
            value={keyword}
            onInput={(e) => setKeyword(e.detail.value)}
            onConfirm={handleSearch}
          />
          <View className='discover__search-btn' onClick={handleSearch}>
            <Text className='discover__search-btn-text'>搜索</Text>
          </View>
        </View>
      </View>

      <ScrollView
        className='discover__scroll'
        scrollY
        enhanced
        showScrollbar={false}
        onScrollToLower={handleLoadMore}
      >
        {/* Sort tabs */}
        <View className='discover__sort'>
          {SORT_OPTIONS.map((s) => (
            <View
              key={s.value}
              className={`discover__sort-tab ${sortType === s.value ? 'discover__sort-tab--active' : ''}`}
              onClick={() => handleSortChange(s.value)}
            >
              <Text className='discover__sort-text'>
                {s.label}
                {s.value === 'nearby' && isLocating ? '...' : ''}
              </Text>
            </View>
          ))}
        </View>

        {/* Category grid */}
        <View className='discover__categories'>
          {TRIP_TYPES.map((t) => (
            <View
              key={t.value}
              className={`discover__category ${filterType === t.value ? 'discover__category--active' : ''}`}
              onClick={() => handleTypeFilter(t.value)}
            >
              <Text className='discover__category-icon'>{t.icon}</Text>
              <Text className='discover__category-label'>{t.label}</Text>
            </View>
          ))}
        </View>

        {/* Trip list */}
        <View className='discover__section'>
          <Text className='discover__section-title'>
            {filterType
              ? `${TRIP_TYPES.find((t) => t.value === filterType)?.label || ''}行程`
              : sortType === 'nearby'
                ? '📍 附近的行程'
                : '🕐 最新行程'}
          </Text>

          {trips.length === 0 ? (
            <EmptyState
              icon='🔍'
              title={keyword || filterType ? '没有找到匹配的行程' : '暂无行程'}
              description={keyword || filterType ? '换个关键词或分类试试' : '快来创建第一个行程吧！'}
              actionText='发起行程'
              onAction={handleCreateTrip}
            />
          ) : (
            <View className='discover__list'>
              {trips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onClick={handleTripClick}
                />
              ))}

              {isLoadingMore && (
                <View className='discover__loading'>
                  <LoadingView text='加载更多...' />
                </View>
              )}

              {!hasMore && trips.length > 0 && (
                <View className='discover__end'>
                  <Text className='discover__end-text'>没有更多了</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      <View className='discover__fab' onClick={handleCreateTrip}>
        <Text className='discover__fab-icon'>+</Text>
      </View>
    </View>
  )
}
