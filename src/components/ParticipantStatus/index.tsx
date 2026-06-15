import { View, Text } from '@tarojs/components'
import type { ParticipantStatus as ParticipantStatusType } from '../../types'
import { PARTICIPANT_STATUSES } from '../../utils/constants'
import './index.scss'

interface ParticipantStatusBadgeProps {
  status: ParticipantStatusType
  showLabel?: boolean
}

export function ParticipantStatusBadge({ status, showLabel = true }: ParticipantStatusBadgeProps) {
  const statusConfig = PARTICIPANT_STATUSES.find((s) => s.value === status)

  if (!statusConfig) {
    return null
  }

  return (
    <View className='participant-status' style={{ backgroundColor: `${statusConfig.color}15` }}>
      <View className='participant-status__dot' style={{ backgroundColor: statusConfig.color }} />
      {showLabel && (
        <Text className='participant-status__label' style={{ color: statusConfig.color }}>
          {statusConfig.label}
        </Text>
      )}
    </View>
  )
}

interface ParticipantStatusSelectorProps {
  currentStatus?: ParticipantStatusType
  onSelect: (status: ParticipantStatusType) => void
}

export function ParticipantStatusSelector({ currentStatus, onSelect }: ParticipantStatusSelectorProps) {
  const statuses: ParticipantStatusType[] = ['interested', 'confirmed', 'uncertain', 'waitlist', 'declined']

  return (
    <View className='participant-status-selector'>
      {statuses.map((status) => {
        const config = PARTICIPANT_STATUSES.find((s) => s.value === status)
        if (!config) return null

        const isActive = currentStatus === status

        return (
          <View
            key={status}
            className={`participant-status-selector__item ${isActive ? 'participant-status-selector__item--active' : ''}`}
            style={isActive ? { backgroundColor: `${config.color}15`, borderColor: config.color } : {}}
            onClick={() => onSelect(status)}
          >
            <View className='participant-status-selector__dot' style={{ backgroundColor: isActive ? config.color : '#ccc' }} />
            <Text
              className='participant-status-selector__label'
              style={{ color: isActive ? config.color : '#666' }}
            >
              {config.label}
            </Text>
          </View>
        )
      })}
    </View>
  )
}
