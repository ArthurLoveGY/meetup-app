import { View, Text, Input, Textarea } from '@tarojs/components'
import { useState, useCallback } from 'react'
import { useAuthStore } from '../../stores'
import { platformService } from '../../platform'
import { validateRequired, validateMinLength, validateMaxLength } from '../../utils/validator'
import { UserAvatar } from '../../components'
import './index.scss'

const INTEREST_OPTIONS = [
  '徒步', '露营', '摄影', '美食', '旅行', '运动', '游戏', '电影',
  '音乐', '读书', '画画', '手工', '瑜伽', '跑步', '骑行', '游泳',
]

export default function CompleteProfile() {
  const { user, updateProfile } = useAuthStore()
  const [nickname, setNickname] = useState(user?.nickname || '')
  const [bio, setBio] = useState('')
  const [city, setCity] = useState('')
  const [interests, setInterests] = useState<string[]>([])
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

    setIsSaving(true)
    try {
      updateProfile({
        nickname,
        bio: bio || undefined,
        city: city || undefined,
        interests,
      })
      platformService.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => {
        platformService.redirectTo('/pages/index/index')
      }, 1500)
    } catch {
      platformService.showToast({ title: '保存失败', icon: 'error' })
    } finally {
      setIsSaving(false)
    }
  }, [nickname, bio, city, interests, updateProfile])

  const handleSkip = useCallback(() => {
    platformService.redirectTo('/pages/index/index')
  }, [])

  return (
    <View className='complete-profile'>
      <View className='complete-profile__header'>
        <Text className='complete-profile__title'>完善资料</Text>
        <View className='complete-profile__skip' onClick={handleSkip}>
          <Text className='complete-profile__skip-text'>跳过</Text>
        </View>
      </View>

      <View className='complete-profile__content'>
        <View className='complete-profile__avatar-section'>
          <UserAvatar
            userId={user?.id || ''}
            nickname={nickname || '?'}
            avatarUrl={user?.avatarUrl}
            size='large'
          />
          <View className='complete-profile__avatar-btn'>
            <Text className='complete-profile__avatar-btn-text'>设置头像</Text>
          </View>
        </View>

        <View className='complete-profile__field'>
          <Text className='complete-profile__label'>昵称 *</Text>
          <Input
            className='complete-profile__input'
            placeholder='给自己起个名字'
            maxlength={20}
            value={nickname}
            onInput={handleNicknameChange}
          />
        </View>

        <View className='complete-profile__field'>
          <Text className='complete-profile__label'>简介</Text>
          <Textarea
            className='complete-profile__textarea'
            placeholder='介绍一下自己'
            maxlength={200}
            value={bio}
            onInput={handleBioChange}
          />
        </View>

        <View className='complete-profile__field'>
          <Text className='complete-profile__label'>城市</Text>
          <Input
            className='complete-profile__input'
            placeholder='你所在的城市'
            value={city}
            onInput={handleCityChange}
          />
        </View>

        <View className='complete-profile__field'>
          <Text className='complete-profile__label'>兴趣标签</Text>
          <View className='complete-profile__interests'>
            {INTEREST_OPTIONS.map((interest) => (
              <View
                key={interest}
                className={`complete-profile__interest ${interests.includes(interest) ? 'complete-profile__interest--active' : ''}`}
                onClick={() => toggleInterest(interest)}
              >
                <Text className='complete-profile__interest-text'>{interest}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View className='complete-profile__bottom safe-area-bottom'>
        <View
          className={`complete-profile__save ${isSaving ? 'complete-profile__save--loading' : ''}`}
          onClick={handleSave}
        >
          <Text className='complete-profile__save-text'>
            {isSaving ? '保存中...' : '完成'}
          </Text>
        </View>
      </View>
    </View>
  )
}
