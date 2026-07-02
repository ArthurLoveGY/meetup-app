import { View, Text } from '@tarojs/components'
import { useState, useCallback } from 'react'
import { useAuthStore } from '../../stores'
import { platformService } from '../../platform'
// 手机号登录暂时关闭，以下导入暂未使用
// import { authService } from '../../services'
// import { validatePhone } from '../../utils/validator'
// import { Input } from '@tarojs/components'
import './index.scss'

export default function Login() {
  const { login, isLoading } = useAuthStore()
  const [agreed, setAgreed] = useState(false)
  // 手机号登录暂时关闭，以下状态暂未使用
  // const [phone, setPhone] = useState('')
  // const [smsCode, setSmsCode] = useState('')
  // const [countdown, setCountdown] = useState(0)

  const checkAgreement = useCallback((): boolean => {
    if (!agreed) {
      platformService.showToast({ title: '请先阅读并同意《用户协议》和《隐私政策》', icon: 'none' })
      return false
    }
    return true
  }, [agreed])

  const handleToggleAgree = useCallback(() => {
    setAgreed((prev) => !prev)
  }, [])

  const handleViewAgreement = useCallback((type: 'user-agreement' | 'privacy-policy') => {
    platformService.navigateTo(`/pages/agreement/index?type=${type}`)
  }, [])

  const handleWechatLogin = useCallback(async () => {
    if (!checkAgreement()) return
    try {
      await login()
      platformService.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(() => {
        platformService.navigateTo('/pages/index/index')
      }, 1500)
    } catch {
      platformService.showToast({ title: '登录失败', icon: 'error' })
    }
  }, [login, checkAgreement])

  // ===== 手机号登录暂时关闭（短信网关未接入），仅保留微信一键登录 =====
  // const handleSendCode = useCallback(async () => {
  //   if (!checkAgreement()) return
  //   const validation = validatePhone(phone)
  //   if (!validation.valid) {
  //     platformService.showToast({ title: validation.message!, icon: 'error' })
  //     return
  //   }
  //   try {
  //     await authService.sendSmsCode(phone)
  //     setCountdown(60)
  //     const timer = setInterval(() => {
  //       setCountdown((prev) => {
  //         if (prev <= 1) {
  //           clearInterval(timer)
  //           return 0
  //         }
  //         return prev - 1
  //       })
  //     }, 1000)
  //     platformService.showToast({ title: '验证码已发送', icon: 'success' })
  //   } catch {
  //     platformService.showToast({ title: '发送验证码失败', icon: 'error' })
  //   }
  // }, [phone, checkAgreement])
  //
  // const handlePhoneLogin = useCallback(async () => {
  //   if (!checkAgreement()) return
  //   const validation = validatePhone(phone)
  //   if (!validation.valid) {
  //     platformService.showToast({ title: validation.message!, icon: 'error' })
  //     return
  //   }
  //   if (!smsCode || smsCode.length !== 6) {
  //     platformService.showToast({ title: '请输入6位验证码', icon: 'error' })
  //     return
  //   }
  //   try {
  //     await login(phone, smsCode)
  //     platformService.showToast({ title: '登录成功', icon: 'success' })
  //     setTimeout(() => {
  //       platformService.redirectTo('/pages/profile/index')
  //     }, 1500)
  //   } catch {
  //     platformService.showToast({ title: '登录失败', icon: 'error' })
  //   }
  // }, [phone, smsCode, login, checkAgreement])
  //
  // const handlePhoneChange = useCallback((e: { detail: { value: string } }) => {
  //   setPhone(e.detail.value)
  // }, [])
  //
  // const handleSmsCodeChange = useCallback((e: { detail: { value: string } }) => {
  //   setSmsCode(e.detail.value)
  // }, [])

  return (
    <View className='login'>
      <View className='login__header'>
        <Text className='login__logo'>🌟</Text>
        <Text className='login__title'>TripCircle</Text>
        <Text className='login__subtitle'>行程朋友圈</Text>
      </View>

      <View className='login__content'>
        <View className='login__section'>
          <Text className='login__section-title'>微信登录</Text>
          <View
            className={`login__wechat-btn ${isLoading ? 'login__wechat-btn--loading' : ''}`}
            onClick={handleWechatLogin}
          >
            <Text className='login__wechat-icon'>💬</Text>
            <Text className='login__wechat-text'>
              {isLoading ? '登录中...' : '微信一键登录'}
            </Text>
          </View>
        </View>

        {/* ===== 手机号登录暂时关闭（短信网关未接入），仅保留微信一键登录 =====
        <View className='login__divider'>
          <View className='login__divider-line' />
          <Text className='login__divider-text'>或</Text>
          <View className='login__divider-line' />
        </View>

        <View className='login__section'>
          <Text className='login__section-title'>手机号登录</Text>
          <View className='login__phone-input'>
            <Text className='login__phone-prefix'>+86</Text>
            <Input
              className='login__phone-field'
              type='number'
              maxlength={11}
              placeholder='请输入手机号'
              value={phone}
              onInput={handlePhoneChange}
            />
          </View>

          <View className='login__sms-row'>
            <Input
              className='login__sms-input'
              type='number'
              maxlength={6}
              placeholder='请输入验证码'
              value={smsCode}
              onInput={handleSmsCodeChange}
            />
            <View
              className={`login__sms-btn ${countdown > 0 ? 'login__sms-btn--disabled' : ''}`}
              onClick={countdown > 0 ? undefined : handleSendCode}
            >
              <Text className='login__sms-btn-text'>
                {countdown > 0 ? `${countdown}s` : '获取验证码'}
              </Text>
            </View>
          </View>

          <View
            className={`login__phone-submit ${isLoading ? 'login__phone-submit--loading' : ''}`}
            onClick={handlePhoneLogin}
          >
            <Text className='login__phone-submit-text'>
              {isLoading ? '登录中...' : '登录'}
            </Text>
          </View>
        </View>
        ===== */}
      </View>

      <View className='login__footer'>
        <View className='login__agreement' onClick={handleToggleAgree}>
          <View className={`login__checkbox ${agreed ? 'login__checkbox--checked' : ''}`}>
            {agreed && <Text className='login__checkbox-icon'>✓</Text>}
          </View>
          <Text className='login__footer-text'>
            我已阅读并同意
            <Text className='login__link' onClick={(e) => { e.stopPropagation(); handleViewAgreement('user-agreement') }}>《用户协议》</Text>
            和
            <Text className='login__link' onClick={(e) => { e.stopPropagation(); handleViewAgreement('privacy-policy') }}>《隐私政策》</Text>
          </Text>
        </View>
      </View>
    </View>
  )
}
