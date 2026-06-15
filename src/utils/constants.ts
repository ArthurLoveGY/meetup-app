export const APP_NAME = 'TripCircle'
export const APP_DESCRIPTION = '行程朋友圈'

export const TRIP_TYPES = [
  { value: 'meal', label: '聚餐', icon: '🍜' },
  { value: 'travel', label: '旅行', icon: '✈️' },
  { value: 'sport', label: '运动', icon: '⚽' },
  { value: 'exhibition', label: '看展', icon: '🎨' },
  { value: 'game', label: '游戏', icon: '🎮' },
  { value: 'study', label: '学习', icon: '📚' },
  { value: 'other', label: '其他', icon: '📌' },
] as const

export const COST_TYPES = [
  { value: 'aa', label: 'AA' },
  { value: 'free', label: '免费' },
  { value: 'host_pay', label: '我请客' },
  { value: 'estimated', label: '预估预算' },
] as const

export const VISIBILITY_OPTIONS = [
  { value: 'private', label: '仅自己可见', description: '只有你能看到这个行程' },
  { value: 'friends', label: '好友可见', description: '所有好友都能看到' },
  { value: 'selected_friends', label: '指定好友', description: '选择哪些好友可以看到' },
  { value: 'link', label: '链接可见', description: '有链接的人可以申请加入' },
] as const

export const JOIN_RULES = [
  { value: 'direct', label: '直接加入', description: '好友可以直接参加' },
  { value: 'approval', label: '需要确认', description: '需要你审核后才能参加' },
  { value: 'waitlist', label: '候补', description: '人满后自动进入候补队列' },
] as const

export const PARTICIPANT_STATUSES = [
  { value: 'interested', label: '想去', color: '#1890FF' },
  { value: 'confirmed', label: '确认参加', color: '#52C41A' },
  { value: 'uncertain', label: '暂不确定', color: '#FAAD14' },
  { value: 'waitlist', label: '候补', color: '#722ED1' },
  { value: 'declined', label: '不参加', color: '#999999' },
  { value: 'cancelled', label: '已取消', color: '#FF4D4F' },
] as const

export const MAX_TITLE_LENGTH = 50
export const MAX_DESCRIPTION_LENGTH = 1000
export const MAX_COMMENT_LENGTH = 500
export const MAX_PARTICIPANTS = 999
export const MAX_IMAGES_PER_TRIP = 9
export const MAX_TIMELINE_ITEMS = 20
export const MAX_CHECKLIST_ITEMS = 20

export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER_INFO: 'userInfo',
  TRIP_DRAFT: 'tripDraft',
  LAST_LOCATION: 'lastLocation',
} as const

export const PAGE_SIZES = {
  TRIP_LIST: 10,
  COMMENT_LIST: 20,
  NOTIFICATION_LIST: 20,
  FRIEND_LIST: 50,
} as const

export const TRIP_STATUS_LABELS: Record<string, string> = {
  draft: '草稿',
  published: '报名中',
  cancelled: '已取消',
  completed: '已结束',
}
