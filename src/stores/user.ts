import { defineStore } from 'pinia'
import type { User } from '@/types/domain'
import { authApi } from '@/api'

interface UserState {
  userInfo: User | null
  isLoggedIn: boolean
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    userInfo: null,
    isLoggedIn: false,
  }),

  getters: {
    hasPhone: (state): boolean => !!state.userInfo?.phone,
  },

  actions: {
    async login(): Promise<{ userInfo: User }> {
      const code = await new Promise<string>((resolve, reject) => {
        uni.login({
          provider: 'weixin',
          success: (res) => resolve(res.code as string),
          fail: reject,
        })
      })

      const data = await authApi.wxLogin(code)
      this.userInfo = data.userInfo
      this.isLoggedIn = true
      return data
    },

    async loginWithProfile(
      code: string,
      nickname: string,
      avatar: string
    ): Promise<{ userInfo: User }> {
      const data = await authApi.wxLogin(code, nickname, avatar)
      this.userInfo = data.userInfo
      this.isLoggedIn = true
      return data
    },

    async bindUserPhone(phoneCode: string): Promise<{ phone: string }> {
      const data = await authApi.bindPhone(phoneCode)
      if (this.userInfo) {
        this.userInfo = { ...this.userInfo, phone: data.phone }
      }
      return data
    },

    async fetchUserInfo(): Promise<void> {
      const data = await authApi.getUserInfo()
      this.userInfo = data.userInfo
      this.isLoggedIn = true
    },

    logout(): void {
      this.userInfo = null
      this.isLoggedIn = false
    },
  },
})
