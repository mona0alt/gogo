import { defineStore } from 'pinia'
import { wxLogin as getWxCode, bindPhone, getUserInfo } from '../api/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: uni.getStorageSync('token') || '',
    userId: uni.getStorageSync('userId') || '',
    userInfo: uni.getStorageSync('userInfo') || null,
    isLoggedIn: !!uni.getStorageSync('token')
  }),

  getters: {
    hasPhone: (state) => !!state.userInfo?.phone
  },

  actions: {
    // 微信登录
    async login() {
      try {
        // 获取微信 login code
        const code = await new Promise((resolve, reject) => {
          uni.login({
            provider: 'weixin',
            success: (res) => resolve(res.code),
            fail: reject
          })
        })

        // 调用云函数登录
        const data = await getWxCode(code)
        this.token = data.token
        this.userId = data.userInfo.id
        this.userInfo = data.userInfo
        this.isLoggedIn = true

        uni.setStorageSync('token', data.token)
        uni.setStorageSync('userId', data.userInfo.id)
        uni.setStorageSync('userInfo', data.userInfo)

        return data
      } catch (e) {
        console.error('Login failed:', e)
        throw e
      }
    },

    // 绑定手机号
    async bindPhone(phoneCode) {
      try {
        const data = await bindPhone(phoneCode)
        this.userInfo = { ...this.userInfo, phone: data.phone }
        uni.setStorageSync('userInfo', this.userInfo)
        return data
      } catch (e) {
        console.error('Bind phone failed:', e)
        throw e
      }
    },

    // 获取用户信息
    async fetchUserInfo() {
      try {
        const data = await getUserInfo()
        this.userInfo = data
        this.isLoggedIn = true
        uni.setStorageSync('userInfo', data)
      } catch (e) {
        console.error('Fetch user info failed:', e)
      }
    },

    // 退出登录
    logout() {
      this.token = ''
      this.userId = ''
      this.userInfo = null
      this.isLoggedIn = false
      uni.removeStorageSync('token')
      uni.removeStorageSync('userId')
      uni.removeStorageSync('userInfo')
      uni.reLaunch({ url: '/pages/index/index' })
    }
  }
})