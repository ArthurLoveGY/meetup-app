import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

export function formatDate(date: string | Date, format = 'YYYY-MM-DD'): string {
  return dayjs(date).format(format)
}

export function formatTime(date: string | Date, format = 'HH:mm'): string {
  return dayjs(date).format(format)
}

export function formatDateTime(date: string | Date, format = 'YYYY-MM-DD HH:mm'): string {
  return dayjs(date).format(format)
}

export function formatRelativeTime(date: string | Date): string {
  return dayjs(date).fromNow()
}

export function getDayOfWeek(date: string | Date): string {
  const day = dayjs(date).day()
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return days[day]
}

export function isToday(date: string | Date): boolean {
  return dayjs(date).isSame(dayjs(), 'day')
}

export function isTomorrow(date: string | Date): boolean {
  return dayjs(date).isSame(dayjs().add(1, 'day'), 'day')
}

export function isThisWeek(date: string | Date): boolean {
  return dayjs(date).isSame(dayjs(), 'week')
}

export function getSmartDate(date: string | Date): string {
  const d = dayjs(date)
  if (d.isSame(dayjs(), 'day')) {
    return `今天 ${d.format('HH:mm')}`
  }
  if (d.isSame(dayjs().add(1, 'day'), 'day')) {
    return `明天 ${d.format('HH:mm')}`
  }
  if (d.isSame(dayjs(), 'week')) {
    return `${getDayOfWeek(date)} ${d.format('HH:mm')}`
  }
  if (d.isSame(dayjs(), 'year')) {
    return d.format('M月D日 HH:mm')
  }
  return d.format('YYYY年M月D日 HH:mm')
}

export function getCountdown(targetDate: string | Date): string {
  const now = dayjs()
  const target = dayjs(targetDate)
  const diff = target.diff(now)

  if (diff <= 0) {
    return '已开始'
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) {
    return `${days}天${hours}小时后`
  }
  if (hours > 0) {
    return `${hours}小时${minutes}分钟后`
  }
  return `${minutes}分钟后`
}
