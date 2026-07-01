import { View, Text } from '@tarojs/components'
import { useCallback } from 'react'
import { useAuthStore } from '../../stores'
import './index.scss'

// ────────────────────────────────────────────
// AuthGuard 组件：包裹需要登录才能操作的 UI 区域
// ────────────────────────────────────────────

interface AuthGuardProps {
  /** 未登录时显示的提示文案，默认 "登录后即可使用" */
  promptText?: string
  /** 未登录时是否显示登录按钮，默认 true */
  showLoginButton?: boolean
  children: React.ReactNode
}

export function AuthGuard({
  promptText = '登录后即可使用',
  showLoginButton = true,
  children,
}: AuthGuardProps) {
  const { isLoggedIn, requireLogin } = useAuthStore()

  if (isLoggedIn) {
    return <>{children}</>
  }

  return (
    <View className='auth-guard'>
      <Text className='auth-guard__icon'>🔒</Text>
      <Text className='auth-guard__text'>{promptText}</Text>
      {showLoginButton && (
        <View className='auth-guard__btn' onClick={() => requireLogin()}>
          <Text className='auth-guard__btn-text'>立即登录</Text>
        </View>
      )}
    </View>
  )
}

// ────────────────────────────────────────────
// useRequireAuth hook：包装回调，自动检查登录状态
// ────────────────────────────────────────────

/**
 * 包装一个需要登录才能执行的回调。
 * 未登录时自动弹出提示并跳转登录页，已登录时正常执行。
 *
 * @example
 * const handleCreate = useRequireAuth(() => {
 *   platformService.navigateTo('/pages/trip-create/index')
 * })
 */
export function useRequireAuth<T extends (...args: any[]) => any>(callback: T): T {
  const { requireLogin } = useAuthStore()

  return useCallback(
    ((...args: any[]) => {
      if (!requireLogin()) return
      return callback(...args)
    }) as unknown as T,
    [callback, requireLogin],
  )
}
