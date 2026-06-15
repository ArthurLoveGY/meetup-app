import { View, Text, Image } from '@tarojs/components'
import { useState, useEffect } from 'react'
import type { TripWithCreator } from '../../types'
import { UserAvatar } from '../UserAvatar'
import { ParticipantStatusBadge } from '../ParticipantStatus'
import { getSmartDate, getDayOfWeek, getCountdown } from '../../utils/date'
import { getTripTypeLabel, getTripTypeIcon, getCostTypeLabel } from '../../utils/permission'
import { TRIP_STATUS_LABELS } from '../../utils/constants'
import './index.scss'

interface TripCardProps {
  trip: TripWithCreator
  onClick?: (trip: TripWithCreator) => void
}

export function TripCard({ trip, onClick }: TripCardProps) {
  const [countdown, setCountdown] = useState(getCountdown(trip.startTime))

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getCountdown(trip.startTime))
    }, 60000)
    return () => clearInterval(timer)
  }, [trip.startTime])

  function handleClick() {
    onClick?.(trip)
  }

  function getStatusColor(): string {
    if (trip.status === 'cancelled') return '#999'
    if (trip.status === 'completed') return '#999'
    if (trip.maxParticipants && trip.participantCount >= trip.maxParticipants) return '#FAAD14'
    return '#52C41A'
  }

  return (
    <View className='trip-card' onClick={handleClick}>
      {trip.coverUrl && (
        <Image className='trip-card__cover' src={trip.coverUrl} mode='aspectFill' />
      )}

      <View className='trip-card__content'>
        <View className='trip-card__header'>
          <View className='trip-card__type-tag'>
            <Text className='trip-card__type-icon'>{getTripTypeIcon(trip.type)}</Text>
            <Text className='trip-card__type-text'>{getTripTypeLabel(trip.type)}</Text>
          </View>
          <View className='trip-card__status' style={{ backgroundColor: getStatusColor() }}>
            <Text className='trip-card__status-text'>
              {trip.status === 'published'
                ? trip.maxParticipants && trip.participantCount >= trip.maxParticipants
                  ? '已满员'
                  : '报名中'
                : TRIP_STATUS_LABELS[trip.status]}
            </Text>
          </View>
        </View>

        <Text className='trip-card__title'>{trip.title}</Text>

        <View className='trip-card__info'>
          <Text className='trip-card__info-icon'>📅</Text>
          <Text className='trip-card__info-text'>
            {getSmartDate(trip.startTime)} {getDayOfWeek(trip.startTime)}
          </Text>
          {countdown && (
            <Text className='trip-card__countdown'>{countdown}</Text>
          )}
        </View>

        {trip.locationName && (
          <View className='trip-card__info'>
            <Text className='trip-card__info-icon'>📍</Text>
            <Text className='trip-card__info-text'>{trip.locationName}</Text>
          </View>
        )}

        <View className='trip-card__info'>
          <Text className='trip-card__info-icon'>💰</Text>
          <Text className='trip-card__info-text'>
            {getCostTypeLabel(trip.costType, trip.estimatedCost)}
          </Text>
        </View>

        {trip.description && (
          <Text className='trip-card__desc'>{trip.description}</Text>
        )}

        <View className='trip-card__footer'>
          <View className='trip-card__creator'>
            <UserAvatar
              userId={trip.creator.id}
              nickname={trip.creator.nickname}
              avatarUrl={trip.creator.avatarUrl}
              size='small'
            />
            <Text className='trip-card__creator-name'>{trip.creator.nickname}</Text>
          </View>

          <View className='trip-card__participants'>
            <View className='trip-card__avatars'>
              {trip.participants.slice(0, 3).map((p) => (
                <UserAvatar
                  key={p.id}
                  userId={p.id}
                  nickname={p.nickname}
                  avatarUrl={p.avatarUrl}
                  size='mini'
                />
              ))}
              {trip.participantCount > 3 && (
                <View className='trip-card__avatar-more'>
                  <Text className='trip-card__avatar-more-text'>+{trip.participantCount - 3}</Text>
                </View>
              )}
            </View>
            <Text className='trip-card__participant-count'>
              {trip.participantCount}人{trip.maxParticipants ? `/${trip.maxParticipants}` : ''}
            </Text>
          </View>
        </View>

        {trip.isJoined && trip.myStatus && (
          <View className='trip-card__my-status'>
            <ParticipantStatusBadge status={trip.myStatus} />
          </View>
        )}
      </View>
    </View>
  )
}
