import type { PiniaPluginContext } from 'pinia'

export function persistPlugin({ store }: PiniaPluginContext) {
  const storageKey = `pinia_${store.$id}`

  // 恢复状态
  const stored = uni.getStorageSync(storageKey)
  if (stored) {
    store.$patch(stored)
  }

  // 监听变化
  store.$subscribe((_, state) => {
    uni.setStorageSync(storageKey, state)
  })
}
