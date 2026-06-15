import { View, Text, ScrollView } from '@tarojs/components'
import { useState, useCallback } from 'react'
import { platformService } from '../../platform'
import './index.scss'

export default function PrivacySettings() {
  const [allowSearch, setAllowSearch] = useState(true)
  const [allowTripView, setAllowTripView] = useState(true)
  const [showLocation, setShowLocation] = useState(true)

  const handleToggle = useCallback((setter: React.Dispatch<React.SetStateAction<boolean>>, value: boolean, label: string) => {
    setter(!value)
    platformService.showToast({ title: !value ? `已开启${label}` : `已关闭${label}`, icon: 'success' })
  }, [])

  return (
    <View className='privacy-settings'>
      <View className='privacy-settings__header'>
        <Text className='privacy-settings__title'>隐私设置</Text>
      </View>

      <ScrollView className='privacy-settings__scroll' scrollY>
        <View className='privacy-settings__section'>
          <Text className='privacy-settings__section-title'>发现</Text>
          <View className='privacy-settings__item'>
            <View className='privacy-settings__item-info'>
              <Text className='privacy-settings__item-label'>允许被搜索</Text>
              <Text className='privacy-settings__item-desc'>其他用户可以通过昵称或ID搜索到你</Text>
            </View>
            <View
              className={`privacy-settings__toggle ${allowSearch ? 'privacy-settings__toggle--on' : ''}`}
              onClick={() => handleToggle(setAllowSearch, allowSearch, '被搜索')}
            >
              <View className='privacy-settings__toggle-dot' />
            </View>
          </View>
        </View>

        <View className='privacy-settings__section'>
          <Text className='privacy-settings__section-title'>行程</Text>
          <View className='privacy-settings__item'>
            <View className='privacy-settings__item-info'>
              <Text className='privacy-settings__item-label'>允许好友查看我的行程</Text>
              <Text className='privacy-settings__item-desc'>关闭后，好友需要单独授权才能查看你的行程</Text>
            </View>
            <View
              className={`privacy-settings__toggle ${allowTripView ? 'privacy-settings__toggle--on' : ''}`}
              onClick={() => handleToggle(setAllowTripView, allowTripView, '行程查看')}
            >
              <View className='privacy-settings__toggle-dot' />
            </View>
          </View>
        </View>

        <View className='privacy-settings__section'>
          <Text className='privacy-settings__section-title'>位置</Text>
          <View className='privacy-settings__item'>
            <View className='privacy-settings__item-info'>
              <Text className='privacy-settings__item-label'>显示城市信息</Text>
              <Text className='privacy-settings__item-desc'>在个人主页和行程中显示你的城市</Text>
            </View>
            <View
              className={`privacy-settings__toggle ${showLocation ? 'privacy-settings__toggle--on' : ''}`}
              onClick={() => handleToggle(setShowLocation, showLocation, '城市显示')}
            >
              <View className='privacy-settings__toggle-dot' />
            </View>
          </View>
        </View>

        <View className='privacy-settings__section'>
          <Text className='privacy-settings__section-title'>数据</Text>
          <View className='privacy-settings__item' onClick={() => platformService.showToast({ title: '功能开发中', icon: 'none' })}>
            <View className='privacy-settings__item-info'>
              <Text className='privacy-settings__item-label'>导出我的数据</Text>
              <Text className='privacy-settings__item-desc'>下载你的所有数据副本</Text>
            </View>
            <Text className='privacy-settings__item-arrow'>›</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
