<template>
  <view class="page">
    <view class="user-section">
      <!--
        通过 v-if 延迟挂载强制重建 DOM 节点，绕过 uni-app Vue3 在 mp-weixin tabBar 页面
        onShow 中 setData 不刷新的底层时序 bug。
      -->
      <view class="user-info" v-if="showUser" @tap="goToProfile">
        <image class="avatar" :src="localAvatar" mode="aspectFill" />
        <view class="info">
          <text class="nickname">{{ localNickname }}</text>
          <text class="level" v-if="localIsLogin">会员</text>
        </view>
      </view>
      <view class="user-info" v-else>
        <image class="avatar" src="/static/default-avatar.png" mode="aspectFill" />
        <view class="info">
          <text class="nickname">加载中...</text>
        </view>
      </view>
      <text class="arrow">›</text>
    </view>
    <view class="stats-section">
      <view class="stat-item" @tap="goToOrders('all')"><text class="num">{{ stats.orderCount }}</text><text class="label">订单</text></view>
      <view class="stat-item" @tap="goToWineStorage"><text class="num">{{ stats.wineCount }}</text><text class="label">存酒</text></view>
      <view class="stat-item"><text class="num">¥{{ localBalance }}</text><text class="label">余额</text></view>
    </view>
    <view class="menu-section">
      <view class="menu-item" @tap="goToOrders('pending_payment')"><text class="icon">📋</text><text class="label">我的订单</text><text class="arrow">›</text></view>
      <view class="menu-item" @tap="goToCoupons"><text class="icon">🎫</text><text class="label">优惠券</text><text class="arrow">›</text></view>
      <view class="menu-item" @tap="goToAddress"><text class="icon">📍</text><text class="label">收货地址</text><text class="arrow">›</text></view>
      <view class="menu-item" @tap="goToHelp"><text class="icon">❓</text><text class="label">帮助与反馈</text><text class="arrow">›</text></view>
      <view class="menu-item" @tap="goToAbout"><text class="icon">ℹ️</text><text class="label">关于我们</text><text class="arrow">›</text></view>
    </view>
    <button class="logout-btn" v-if="localIsLogin" @tap="handleLogout">退出登录</button>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow, onTabItemTap } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const stats = { orderCount: 0, wineCount: 0 }

const showUser = ref(false)
const localAvatar = ref('/static/default-avatar.png')
const localNickname = ref('未登录')
const localBalance = ref(0)
const localIsLogin = ref(false)

let refreshTimer = null

const refreshView = () => {
  // 防止 onShow + onTabItemTap 同时触发导致重复刷新
  if (refreshTimer) {
    clearTimeout(refreshTimer)
  }

  showUser.value = false

  refreshTimer = setTimeout(() => {
    const storedUserInfo = uni.getStorageSync('userInfo')
    const storedToken = uni.getStorageSync('token')

    if (storedToken && storedUserInfo) {
      userStore.$patch({
        userInfo: storedUserInfo,
        token: storedToken,
        isLoggedIn: true
      })
      localAvatar.value = storedUserInfo.avatar || '/static/default-avatar.png'
      localNickname.value = storedUserInfo.nickname || '未登录'
      localBalance.value = storedUserInfo.balance || 0
      localIsLogin.value = true
    } else {
      const info = userStore.userInfo
      localAvatar.value = info ? (info.avatar || '/static/default-avatar.png') : '/static/default-avatar.png'
      localNickname.value = info ? (info.nickname || '未登录') : '未登录'
      localBalance.value = info ? (info.balance || 0) : 0
      localIsLogin.value = !!info
    }

    showUser.value = true
    refreshTimer = null
  }, 500)
}

onShow(refreshView)
onTabItemTap(refreshView)

const goToProfile = () => {
  if (!localIsLogin.value) {
    uni.reLaunch({ url: '/pages/login/index' })
  } else {
    uni.showToast({ title: '个人资料页待创建', icon: 'none' })
  }
}

const goToOrders = (status) => { uni.switchTab({ url: '/pages/orders/index' }) }
const goToWineStorage = () => { uni.navigateTo({ url: '/pages/wine-storage/index' }) }
const goToCoupons = () => { uni.navigateTo({ url: '/pages/coupons/index' }) }
const goToAddress = () => { uni.navigateTo({ url: '/pages/address/index' }) }
const goToHelp = () => { uni.navigateTo({ url: '/pages/help/index' }) }
const goToAbout = () => { uni.navigateTo({ url: '/pages/about/index' }) }
const handleLogout = () => { uni.showModal({ title: '确认退出', content: '确定要退出登录吗？', success: (res) => { if (res.confirm) { userStore.logout() } } }) }
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background-color: $bg-primary; padding-bottom: $spacing-xl; }
.user-section { display: flex; align-items: center; justify-content: space-between; padding: $spacing-xl $spacing-md; background: $gradient-neon; }
.user-section .user-info { display: flex; align-items: center; }
.user-section .avatar { width: 60px; height: 60px; border-radius: 50%; margin-right: $spacing-md; border: 2px solid rgba(255, 255, 255, 0.3); }
.user-section .info { display: flex; flex-direction: column; }
.user-section .nickname { color: white; font-size: $font-xl; font-weight: bold; }
.user-section .level { color: rgba(255, 255, 255, 0.8); font-size: $font-xs; margin-top: $spacing-xs; }
.user-section .arrow { color: white; font-size: 24px; }
.stats-section { display: flex; background-color: $bg-secondary; padding: $spacing-lg 0; margin-bottom: $spacing-md; }
.stats-section .stat-item { flex: 1; display: flex; flex-direction: column; align-items: center; }
.stats-section .num { color: $text-primary; font-size: $font-xxl; font-weight: bold; }
.stats-section .label { color: $text-secondary; font-size: $font-sm; margin-top: $spacing-xs; }
.menu-section { background-color: $bg-secondary; }
.menu-section .menu-item { display: flex; align-items: center; padding: $spacing-md; border-bottom: 1px solid $border-color; }
.menu-section .menu-item:last-child { border-bottom: none; }
.menu-section .menu-item .icon { font-size: 18px; margin-right: $spacing-md; }
.menu-section .menu-item .label { flex: 1; color: $text-primary; font-size: $font-md; }
.menu-section .menu-item .arrow { color: $text-secondary; font-size: 18px; }
.logout-btn { width: calc(100% - #{$spacing-md * 2}); margin: $spacing-xl $spacing-md 0; height: 44px; background-color: $bg-secondary; color: $status-error; border-radius: $border-radius-md; display: flex; align-items: center; justify-content: center; font-size: $font-md; }
</style>
