import { ROUTES } from '@/constants/routes'
import { useUserStore } from '@/stores/user'

export function useNavigation() {
  const userStore = useUserStore()

  const navigateTo = (route: string, options?: { requireAuth?: boolean }) => {
    if (options?.requireAuth !== false && !userStore.isLoggedIn) {
      uni.navigateTo({ url: ROUTES.LOGIN })
      return false
    }
    uni.navigateTo({ url: route })
    return true
  }

  const redirectTo = (route: string, options?: { requireAuth?: boolean }) => {
    if (options?.requireAuth !== false && !userStore.isLoggedIn) {
      uni.redirectTo({ url: ROUTES.LOGIN })
      return false
    }
    uni.redirectTo({ url: route })
    return true
  }

  const switchTab = (route: string) => {
    uni.switchTab({ url: route })
  }

  const reLaunch = (route: string) => {
    uni.reLaunch({ url: route })
  }

  return {
    navigateTo,
    redirectTo,
    switchTab,
    reLaunch,
    ROUTES,
  }
}
