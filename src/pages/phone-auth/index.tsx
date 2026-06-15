import { View, Text, Input } from '@tarojs/components'
import { useState, useCallback } from 'react'
import { useAuthStore } from '../../stores'
import { platformService } from '../../platform'
import { validatePhone } from '../../utils/validator'
import './index.scss'

export default function PhoneAuth() {
  const { login, isLoading } = useAuthStore()
  const [phone, setPhone] = useState('')
  const [smsCode, setSmsCode] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [step, setStep] = useState<'phone' | 'code'>('phone')

  const handleSendCode = useCallback(() => {
    const validation = validatePhone(phone)
    if (!validation.valid) {
      platformService.showToast({ title: validation.message!, icon: 'error' })
      return
    }
    setCountdown(60)
    setStep('code')
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    platformService.showToast({ title: '验证码已发送', icon: 'success' })
  }, [phone])

  const handleVerify = useCallback(async () => {
    if (!smsCode || smsCode.length !== 6) {
      platformService.showToast({ title: '请输入6位验证码', icon: 'error' })
      return
    }
    try {
      await login(phone)
      platformService.showToast({ title: '验证成功', icon: 'success' })
      setTimeout(() => {
        platformService.redirectTo('/pages/complete-profile/index')
      }, 1500)
    } catch {
      platformService.showToast({ title: '验证失败', icon: 'error' })
    }
  }, [phone, smsCode, login])

  const handlePhoneChange = useCallback((e: { detail: { value: string } }) => {
    setPhone(e.detail.value)
  }, [])

  const handleSmsCodeChange = useCallback((e: { detail: { value: string } }) => {
    setSmsCode(e.detail.value)
  }, [])

  const handleBack = useCallback(() => {
    if (step === 'code') {
      setStep('phone')
      setSmsCode('')
    } else {
      platformService.navigateBack()
    }
  }, [step])

  return (
    <View className='phone-auth'>
      <View className='phone-auth__header'>
        <View className='phone-auth__back' onClick={handleBack}>
          <Text className='phone-auth__back-text'>返回</Text>
        </View>
        <Text className='phone-auth__title'>手机号验证</Text>
      </View>

      <View className='phone-auth__content'>
        {step === 'phone' ? (
          <View className='phone-auth__section'>
            <Text className='phone-auth__label'>请输入手机号</Text>
            <Text className='phone-auth__desc'>用于登录和找回账号</Text>
            <View className='phone-auth__input-row'>
              <Text className='phone-auth__prefix'>+86</Text>
              <Input
                className='phone-auth__input'
                type='number'
                maxlength={11}
                placeholder='请输入手机号'
                value={phone}
                onInput={handlePhoneChange}
              />
            </View>
            <View
              className={`phone-auth__btn ${!phone || phone.length !== 11 ? 'phone-auth__btn--disabled' : ''}`}
              onClick={phone.length === 11 ? handleSendCode : undefined}
            >
              <Text className='phone-auth__btn-text'>获取验证码</Text>
            </View>
          </View>
        ) : (
          <View className='phone-auth__section'>
            <Text className='phone-auth__label'>请输入验证码</Text>
            <Text className='phone-auth__desc'>已发送到 {phone}</Text>
            <Input
              className='phone-auth__code-input'
              type='number'
              maxlength={6}
              placeholder='6位验证码'
              value={smsCode}
              onInput={handleSmsCodeChange}
            />
            <View
              className={`phone-auth__btn ${smsCode.length !== 6 ? 'phone-auth__btn--disabled' : ''}`}
              onClick={smsCode.length === 6 ? handleVerify : undefined}
            >
              <Text className='phone-auth__btn-text'>
                {isLoading ? '验证中...' : '验证'}
              </Text>
            </View>
            <View
              className={`phone-auth__resend ${countdown > 0 ? 'phone-auth__resend--disabled' : ''}`}
              onClick={countdown > 0 ? undefined : handleSendCode}
            >
              <Text className='phone-auth__resend-text'>
                {countdown > 0 ? `${countdown}s 后重新发送` : '重新发送验证码'}
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  )
}
