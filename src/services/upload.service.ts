import Taro from '@tarojs/taro'
import { getToken } from './request'

const BASE_URL = 'http://localhost:3000/api'

export const uploadService = {
  async uploadImage(filePath: string): Promise<string> {
    const token = getToken()
    return new Promise((resolve, reject) => {
      Taro.uploadFile({
        url: `${BASE_URL}/upload/image`,
        filePath,
        name: 'file',
        header: {
          Authorization: token ? `Bearer ${token}` : '',
        },
        success: (res) => {
          if (res.statusCode === 200 || res.statusCode === 201) {
            try {
              const data = JSON.parse(res.data)
              resolve(data.data?.url || data.url)
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
