import type { User } from '../types'

// 微信小程序没有 process.env，Taro 在构建期通过 webpack DefinePlugin 注入 NODE_ENV。
// 域名 api.arthurzhang.top 已备案、解析到云服务器（106.53.52.88），并已配置 HTTPS（Let's Encrypt）。
// dev 与 prod 统一走 HTTPS：真机预览与生产行为一致。
// 如需本地后端联调，把 dev 分支改回 'http://localhost:3000/api' 即可（开发者工具保持 urlCheck:false）。
const isProd = process.env.NODE_ENV === 'production'

export const API_BASE_URL = isProd ? 'https://api.arthurzhang.top/api' : 'https://api.arthurzhang.top/api'
export const SOCKET_BASE_URL = isProd ? 'https://api.arthurzhang.top' : 'https://api.arthurzhang.top'

/** 后端可能返回相对路径（如 /uploads/xxx），统一转换为绝对 URL。 */
export function resolveImageUrl(url?: string): string {
  if (!url) return ''
  if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('wxfile://') || url.startsWith('http://tmp')) return url
  return `${SOCKET_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`
}

// 持久化到本地 storage 前需剔除的敏感字段：weapp 无系统级安全存储区，
// 这些字段只在登录/请求时即时使用，不落盘。
export const SENSITIVE_USER_FIELDS = [
  'phone',
  'email',
  'wechatOpenId',
  'unionId',
  'appleUserId',
] as const

/** 返回剔除敏感字段后的用户对象副本，用于写入本地 storage。 */
export function sanitizeUser(user: User): User {
  const copy = { ...user }
  for (const field of SENSITIVE_USER_FIELDS) {
    delete copy[field]
  }
  return copy
}
