import { ref } from 'vue'

export function useTabBarShowRefresh(delay = 500) {
  const ready = ref(false)
  let timer: ReturnType<typeof setTimeout> | null = null

  const refresh = async (fn?: () => void | Promise<void>) => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }

    ready.value = false

    await new Promise<void>((resolve) => {
      timer = setTimeout(() => {
        fn?.()
        ready.value = true
        timer = null
        resolve()
      }, delay)
    })
  }

  return { ready, refresh }
}
