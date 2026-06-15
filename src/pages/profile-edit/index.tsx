import { View, Text, Input, Textarea } from '@tarojs/components'
import { useState, useCallback } from 'react'
import { useAuthStore } from '../../stores'
import { platformService } from '../../platform'
import { validateRequired, validateMinLength, validateMaxLength } from '../../utils/validator'
import { UserAvatar } from '../../components'
import type { UpdateUserDTO } from '../../types'
import './index.scss'

const INTEREST_OPTIONS = [
  '徒步', '露营', '摄影', '美食', '旅行', '运动', '游戏', '电影',
  '音乐', '读书', '画画', '手工', '瑜伽', '跑步', '骑行', '游泳',
]

export default function ProfileEdit() {
  const { user, updateProfile } = useAuthStore()
  const [nickname, setNickname] = useState(user?.nickname || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [city, setCity] = useState(user?.city || '')
  const [interests, setInterests] = useState<string[]>(user?.interests || [])
  const [isSaving, setIsSaving] = useState(false)

  const handleNicknameChange = useCallback((e: { detail: { value: string } }) => {
    setNickname(e.detail.value)
  }, [])

  const handleBioChange = useCallback((e: { detail: { value: string } }) => {
    setBio(e.detail.value)
  }, [])

  const handleCityChange = useCallback((e: { detail: { value: string } }) => {
    setCity(e.detail.value)
  }, [])

  const toggleInterest = useCallback((interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    )
  }, [])

  const handleSave = useCallback(async () => {
    const requiredCheck = validateRequired(nickname, '昵称')
    if (!requiredCheck.valid) {
      platformService.showToast({ title: requiredCheck.message!, icon: 'error' })
      return
    }

    const minCheck = validateMinLength(nickname, 2, '昵称')
    if (!minCheck.valid) {
      platformService.showToast({ title: minCheck.message!, icon: 'error' })
      return
    }

    const maxCheck = validateMaxLength(nickname, 20, '昵称')
    if (!maxCheck.valid) {
      platformService.showToast({ title: maxCheck.message!, icon: 'error' })
      return
    }

    const bioCheck = validateMaxLength(bio, 200, '简介')
    if (!bioCheck.valid) {
      platformService.showToast({ title: bioCheck.message!, icon: 'error' })
      return
    }

    setIsSaving(true)
    try {
      const updates: UpdateUserDTO = {
        nickname,
        bio: bio || undefined,
        city: city || undefined,
        interests,
      }
      updateProfile(updates as Partial<import('../../types').User>)
      platformService.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => {
        platformService.navigateBack()
      }, 1500)
    } catch {
      platformService.showToast({ title: '保存失败', icon: 'error' })
    } finally {
      setIsSaving(false)
    }
  }, [nickname, bio, city, interests, updateProfile])

  return (
    <View className='profile-edit'>
      <View className='profile-edit__header'>
        <Text className='profile-edit__title'>编辑资料</Text>
      </View>

      <View className='profile-edit__content'>
        <View className='profile-edit__avatar-section'>
          <UserAvatar
            userId={user?.id || ''}
            nickname={user?.nickname || ''}
            avatarUrl={user?.avatarUrl}
            size='large'
          />
          <View className='profile-edit__avatar-btn'>
            <Text className='profile-edit__avatar-btn-text'>更换头像</Text>
          </View>
        </View>

        <View className='profile-edit__field'>
          <Text className='profile-edit__label'>昵称 *</Text>
          <Input
            className='profile-edit__input'
            placeholder='请输入昵称'
            maxlength={20}
            value={nickname}
            onInput={handleNicknameChange}
          />
        </View>

        <View className='profile-edit__field'>
          <Text className='profile-edit__label'>简介</Text>
          <Textarea
            className='profile-edit__textarea'
            placeholder='介绍一下自己吧'
            maxlength={200}
            value={bio}
            onInput={handleBioChange}
          />
          <Text className='profile-edit__char-count'>{bio.length}/200</Text>
        </View>

        <View className='profile-edit__field'>
          <Text className='profile-edit__label'>城市</Text>
          <Input
            className='profile-edit__input'
            placeholder='你所在的城市'
            value={city}
            onInput={handleCityChange}
          />
        </View>

        <View className='profile-edit__field'>
          <Text className='profile-edit__label'>兴趣标签</Text>
          <View className='profile-edit__interests'>
            {INTEREST_OPTIONS.map((interest) => (
              <View
                key={interest}
                className={`profile-edit__interest ${interests.includes(interest) ? 'profile-edit__interest--active' : ''}`}
                onClick={() => toggleInterest(interest)}
              >
                <Text className='profile-edit__interest-text'>{interest}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View className='profile-edit__bottom safe-area-bottom'>
        <View
          className={`profile-edit__save ${isSaving ? 'profile-edit__save--loading' : ''}`}
          onClick={handleSave}
        >
          <Text className='profile-edit__save-text'>
            {isSaving ? '保存中...' : '保存'}
          </Text>
        </View>
      </View>
    </View>
  )
}
