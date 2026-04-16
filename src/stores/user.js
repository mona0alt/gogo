import { defineStore } from 'pinia'
import { wxLogin, bindPhone, getUserInfo } from '../api/auth'
import { logout as authLogout } from '../utils/auth'

// Mock 用户数据
const mockUserInfo = {
  id: 'u1',
  nickname: '酒吧爱好者',
  avatar: '',
  phone: '138****8888',
  level: 'VIP会员',
  balance: 1000,
  points: 500
}

export const useUserStore = defineStore('user', {
  state: () => ({
    token: uni.getStorageSync('token') || '',
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
        const res = await new Promise((resolve, reject) => {
          uni.login({
            provider: 'weixin',
            success: (res) => resolve(res.code),
            fail: reject
          })
        })
        const data = await wxLogin(res)
        this.token = data.token
        this.userInfo = data.userInfo
        this.isLoggedIn = true
        uni.setStorageSync('token', data.token)
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
      this.userInfo = null
      this.isLoggedIn = false
      authLogout()
    }
  }
})