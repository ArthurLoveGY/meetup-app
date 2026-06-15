import { View, Text, ScrollView } from '@tarojs/components'
import { useState, useCallback } from 'react'
import { useAuthStore } from '../../stores'
import { platformService } from '../../platform'
import './index.scss'

export default function AccountDeletion() {
  const { user, logout } = useAuthStore()
  const [confirmed, setConfirmed] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = useCallback(async () => {
    if (!confirmed) {
      platformService.showToast({ title: '请先确认了解后果', icon: 'error' })
      return
    }

    const finalConfirm = await platformService.showModal({
      title: '最终确认',
      content: '账号注销后将无法恢复，所有数据将被永久删除。确定要注销吗？',
    })

    if (finalConfirm) {
      setIsDeleting(true)
      try {
        await new Promise((r) => setTimeout(r, 1000))
        await logout()
        platformService.showToast({ title: '账号已注销', icon: 'success' })
        setTimeout(() => {
          platformService.redirectTo('/pages/login/index')
        }, 1500)
      } catch {
        platformService.showToast({ title: '注销失败', icon: 'error' })
      } finally {
        setIsDeleting(false)
      }
    }
  }, [confirmed, logout])

  const handleConfirmChange = useCallback(() => {
    setConfirmed((prev) => !prev)
  }, [])

  return (
    <View className='account-deletion'>
      <View className='account-deletion__header'>
        <Text className='account-deletion__title'>注销账号</Text>
      </View>

      <ScrollView className='account-deletion__scroll' scrollY>
        <View className='account-deletion__warning'>
          <Text className='account-deletion__warning-icon'>⚠️</Text>
          <Text className='account-deletion__warning-title'>注销账号将导致以下后果：</Text>
        </View>

        <View className='account-deletion__consequences'>
          <View className='account-deletion__item'>
            <Text className='account-deletion__item-icon'>❌</Text>
            <Text className='account-deletion__item-text'>您的所有个人信息将被永久删除</Text>
          </View>
          <View className='account-deletion__item'>
            <Text className='account-deletion__item-icon'>❌</Text>
            <Text className='account-deletion__item-text'>您创建的行程将被删除或转移给其他参与者</Text>
          </View>
          <View className='account-deletion__item'>
            <Text className='account-deletion__item-icon'>❌</Text>
            <Text className='account-deletion__item-text'>您的评论和互动记录将被删除</Text>
          </View>
          <View className='account-deletion__item'>
            <Text className='account-deletion__item-icon'>❌</Text>
            <Text className='account-deletion__item-text'>您的好友关系将被解除</Text>
          </View>
          <View className='account-deletion__item'>
            <Text className='account-deletion__item-icon'>❌</Text>
            <Text className='account-deletion__item-text'>此操作不可逆，无法恢复</Text>
          </View>
        </View>

        <View className='account-deletion__info'>
          <Text className='account-deletion__info-title'>当前账号信息</Text>
          <Text className='account-deletion__info-item'>昵称：{user?.nickname || '未知'}</Text>
          <Text className='account-deletion__info-item'>ID：{user?.id || '未知'}</Text>
        </View>

        <View className='account-deletion__confirm' onClick={handleConfirmChange}>
          <View className={`account-deletion__checkbox ${confirmed ? 'account-deletion__checkbox--checked' : ''}`}>
            {confirmed && <Text className='account-deletion__check'>✓</Text>}
          </View>
          <Text className='account-deletion__confirm-text'>
            我已了解注销后果，确定要注销账号
          </Text>
        </View>
      </ScrollView>

      <View className='account-deletion__bottom safe-area-bottom'>
        <View
          className={`account-deletion__btn ${!confirmed ? 'account-deletion__btn--disabled' : ''} ${isDeleting ? 'account-deletion__btn--loading' : ''}`}
          onClick={confirmed ? handleDelete : undefined}
        >
          <Text className='account-deletion__btn-text'>
            {isDeleting ? '注销中...' : '确认注销'}
          </Text>
        </View>
      </View>
    </View>
  )
}
