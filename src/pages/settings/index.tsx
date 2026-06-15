import { View, Text, ScrollView } from '@tarojs/components'
import { useState, useCallback } from 'react'
import { platformService } from '../../platform'
import './index.scss'

export default function Settings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  const handleEditProfile = useCallback(() => {
    platformService.navigateTo('/pages/profile-edit/index')
  }, [])

  const handlePrivacy = useCallback(() => {
    platformService.navigateTo('/pages/privacy-settings/index')
  }, [])

  const handleBlacklist = useCallback(() => {
    platformService.navigateTo('/pages/blacklist/index')
  }, [])

  const handleAbout = useCallback(() => {
    platformService.showModal({
      title: '关于 TripCircle',
      content: 'TripCircle v0.1.0\n\n一个围绕熟人小圈子的行程发布与协作平台',
      showCancel: false,
    })
  }, [])

  const handleDeleteAccount = useCallback(async () => {
    platformService.navigateTo('/pages/account-deletion/index')
  }, [])

  return (
    <View className='settings'>
      <View className='settings__header'>
        <Text className='settings__title'>设置</Text>
      </View>

      <ScrollView className='settings__scroll' scrollY>
        <View className='settings__section'>
          <Text className='settings__section-title'>账号</Text>
          <View className='settings__item' onClick={handleEditProfile}>
            <Text className='settings__item-label'>编辑资料</Text>
            <Text className='settings__item-arrow'>›</Text>
          </View>
          <View className='settings__item' onClick={handlePrivacy}>
            <Text className='settings__item-label'>隐私设置</Text>
            <Text className='settings__item-arrow'>›</Text>
          </View>
          <View className='settings__item' onClick={handleBlacklist}>
            <Text className='settings__item-label'>黑名单</Text>
            <Text className='settings__item-arrow'>›</Text>
          </View>
        </View>

        <View className='settings__section'>
          <Text className='settings__section-title'>通知</Text>
          <View className='settings__item'>
            <Text className='settings__item-label'>接收通知</Text>
            <View
              className={`settings__toggle ${notificationsEnabled ? 'settings__toggle--on' : ''}`}
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            >
              <View className='settings__toggle-dot' />
            </View>
          </View>
        </View>

        <View className='settings__section'>
          <Text className='settings__section-title'>其他</Text>
          <View className='settings__item' onClick={handleAbout}>
            <Text className='settings__item-label'>关于</Text>
            <Text className='settings__item-arrow'>›</Text>
          </View>
        </View>

        <View className='settings__section'>
          <View className='settings__item settings__item--danger' onClick={handleDeleteAccount}>
            <Text className='settings__item-label settings__item-label--danger'>注销账号</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
