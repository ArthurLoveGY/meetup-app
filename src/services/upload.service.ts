import Taro from '@tarojs/taro'
import { getToken } from './request'
import { API_BASE_URL } from './config'

const ALLOWED_EXT = ['jpg', 'jpeg', 'png', 'webp', 'gif']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

function getExt(filePath: string): string {
  const clean = filePath.split('?')[0]
  const idx = clean.lastIndexOf('.')
  return idx >= 0 ? clean.slice(idx + 1).toLowerCase() : ''
}

export const uploadService = {
  async uploadImage(filePath: string): Promise<string> {
    const token = getToken()

    // 前端基础校验：扩展名白名单 + 大小限制，降低无效上传与后端压力
    const ext = getExt(filePath)
    if (!ALLOWED_EXT.includes(ext)) {
      throw new Error('不支持的图片格式')
    }

    let size = 0
    try {
      const info = await Taro.getFileInfo({ filePath })
      if (info && 'size' in info) {
        size = (info as { size: number }).size
      }
    } catch {
      // 部分平台/模拟器不支持 getFileInfo，跳过大小校验，交由后端兜底
      size = 0
    }
    if (size > MAX_SIZE) {
      throw new Error('图片大小不能超过10MB')
    }

    return new Promise((resolve, reject) => {
      Taro.uploadFile({
        url: `${API_BASE_URL}/upload/image`,
        filePath,
        name: 'file',
        header: {
          Authorization: token ? `Bearer ${token}` : '',
        },
        success: (res) => {
          if (res.statusCode === 200 || res.statusCode === 201) {
            try {
              const data = JSON.parse(res.data)
              // 校验业务 code，避免上传业务失败仍被误判为成功
              if (data.code !== 0) {
                reject(new Error(data.message || '上传失败'))
                return
              }
              const rawUrl = data.data?.url || data.url
              if (!rawUrl) {
                reject(new Error('上传响应缺少 url'))
                return
              }
              // 后端返回的可能是相对路径（如 /uploads/xxx），需要拼接完整 URL
              const url = rawUrl.startsWith('http') ? rawUrl : `${API_BASE_URL.replace('/api', '')}${rawUrl}`
              resolve(url)
            } catch {
              reject(new Error('解析上传响应失败'))
            }
          } else {
            reject(new Error(`上传失败: ${res.statusCode}`))
          }
        },
        fail: (err) => {
          reject(err)
        },
      })
    })
  },
}
