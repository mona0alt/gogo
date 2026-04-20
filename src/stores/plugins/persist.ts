import type { PiniaPluginContext } from 'pinia'

// 不需要持久化的 store（UI 状态应在应用启动时重置）
const EXCLUDED_STORES = new Set(['feedback'])

// 启动时清理已排除 store 的残留持久化数据
EXCLUDED_STORES.forEach((id) => {
  try {
    uni.removeStorageSync(`pinia_${id}`)
  } catch {
    // ignore
  }
})

export function persistPlugin({ store }: PiniaPluginContext) {
  if (EXCLUDED_STORES.has(store.$id)) return

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
