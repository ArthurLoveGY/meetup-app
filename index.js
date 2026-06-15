// Polyfill: @ant-design/react-native v5 Portal uses DeviceEventEmitter.removeListener
// which is not available in RN 0.73+. Add it as an alias for remove().
import { DeviceEventEmitter } from 'react-native'
if (DeviceEventEmitter && !DeviceEventEmitter.removeListener) {
  const originalAddListener = DeviceEventEmitter.addListener.bind(DeviceEventEmitter)
  const subscriptions = new Map()
  DeviceEventEmitter.addListener = function (eventType, listener) {
    const sub = originalAddListener(eventType, listener)
    if (!subscriptions.has(eventType)) {
      subscriptions.set(eventType, new Map())
    }
    subscriptions.get(eventType).set(listener, sub)
    return sub
  }
  DeviceEventEmitter.removeListener = function (eventType, listener) {
    const eventSubs = subscriptions.get(eventType)
    if (eventSubs && eventSubs.has(listener)) {
      eventSubs.get(listener).remove()
      eventSubs.delete(listener)
    }
  }
}

import '@tarojs/rn-supporter/entry-file.js'
