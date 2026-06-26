import { Component, PropsWithChildren } from 'react'
import { useAuthStore } from './stores'
import './app.scss'

class App extends Component<PropsWithChildren> {
  componentDidMount() {
    // 启动时校验本地 token 有效性（调 /auth/me），无效则登出兜底
    useAuthStore.getState().checkAuth()
  }

  componentDidShow() {
    // 前台恢复时若 token 已过期，下一次请求会由 401 兜底处理
  }

  componentDidHide() {}

  render() {
    return this.props.children
  }
}

export default App
