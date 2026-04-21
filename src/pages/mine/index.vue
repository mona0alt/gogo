<template>
  <view class="page">
    <!-- 用户信息区 -->
    <view class="user-section">
      <view v-if="showUser" class="user-card" @tap="goToProfile">
        <view class="user-info">
          <view class="avatar-wrap">
            <image class="avatar" :src="localAvatar" mode="aspectFill" @error="localAvatar = '/static/default-avatar.png'" />
            <view v-if="localIsLogin && localMemberLevel" class="member-tag">
              <text class="member-text">{{ localMemberLevel === 'svip' ? 'SVIP' : 'VIP' }}</text>
            </view>
          </view>
          <view class="info">
            <text class="nickname">{{ localNickname }}</text>
            <text v-if="localIsLogin" class="sub-text">{{ localMemberLevel ? '尊贵的会员用户' : '普通用户' }}</text>
            <text v-else class="sub-text">点击登录</text>
          </view>
        </view>
        <text class="arrow">&#x203A;</text>
      </view>
      <view v-else class="user-card">
        <view class="user-info">
          <view class="avatar-wrap">
            <image class="avatar" src="/static/default-avatar.png" mode="aspectFill" />
          </view>
          <view class="info">
            <text class="nickname">加载中...</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 统计区域 -->
    <view v-if="localIsLogin" class="stats-card">
      <view class="stat-item" @tap="goToOrders('all')">
        <text class="num">{{ stats.orderCount }}</text>
        <text class="label">订单</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item" @tap="goToWineStorage">
        <text class="num">{{ stats.wineCount }}</text>
        <text class="label">存酒</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="num gold">¥{{ localBalance }}</text>
        <text class="label">余额</text>
      </view>
    </view>

    <!-- 活动轮播 -->
    <view v-if="banners.length > 0" class="banner-section">
      <swiper class="banner-swiper" :indicator-dots="false" :autoplay="swiperAutoplay" :interval="4000" :duration="500" :circular="true" @change="onBannerChange">
        <swiper-item v-for="(banner, index) in banners" :key="index" @tap="onBannerTap(banner)">
          <view class="banner-item">
            <image class="banner-image" :src="banner.image" mode="aspectFill" />
            <view class="banner-overlay">
              <text class="banner-text">{{ banner.title }}</text>
            </view>
          </view>
        </swiper-item>
      </swiper>
      <view class="banner-dots">
        <view v-for="(banner, index) in banners" :key="index" class="dot" :class="{ active: bannerCurrent === index }"></view>
      </view>
    </view>

    <!-- 菜单区域 -->
    <view class="menu-section">
      <view class="menu-group">
        <view class="menu-item" @tap="goToInvites">
          <view class="item-left">
            <view class="icon-wrap pink">
              <text class="icon-text">&#x1F48C;</text>
            </view>
            <text class="label">邀请我的</text>
            <view v-if="inviteCount > 0" class="badge">
              <text class="badge-text">{{ inviteCount }}</text>
            </view>
          </view>
          <text class="arrow">&#x203A;</text>
        </view>
        <view class="menu-item" @tap="goToOrders('pending_payment')">
          <view class="item-left">
            <view class="icon-wrap gold">
              <text class="icon-text">&#x1F4CB;</text>
            </view>
            <text class="label">我的订单</text>
          </view>
          <text class="arrow">&#x203A;</text>
        </view>
        <view class="menu-item" @tap="goToMember">
          <view class="item-left">
            <view class="icon-wrap blue">
              <text class="icon-text">&#x1F48E;</text>
            </view>
            <text class="label">会员中心</text>
          </view>
          <text class="arrow">&#x203A;</text>
        </view>
        <view class="menu-item" @tap="goToCoupons">
          <view class="item-left">
            <view class="icon-wrap">
              <text class="icon-text">&#x1F3AB;</text>
            </view>
            <text class="label">优惠券</text>
          </view>
          <text class="arrow">&#x203A;</text>
        </view>
      </view>

      <view class="menu-group">
        <view class="menu-item" @tap="goToAddress">
          <view class="item-left">
            <view class="icon-wrap">
              <text class="icon-text">&#x1F4CD;</text>
            </view>
            <text class="label">收货地址</text>
          </view>
          <text class="arrow">&#x203A;</text>
        </view>
        <view class="menu-item" @tap="goToHelp">
          <view class="item-left">
            <view class="icon-wrap">
              <text class="icon-text">&#x2753;</text>
            </view>
            <text class="label">帮助与反馈</text>
          </view>
          <text class="arrow">&#x203A;</text>
        </view>
        <view class="menu-item" @tap="goToAbout">
          <view class="item-left">
            <view class="icon-wrap">
              <text class="icon-text">&#x2139;</text>
            </view>
            <text class="label">关于我们</text>
          </view>
          <text class="arrow">&#x203A;</text>
        </view>
      </view>
    </view>

    <button v-if="localIsLogin" class="logout-btn" @tap="handleLogout">退出登录</button>
  </view>
</template>

<script setup lang="ts">
import { showModal, showToast } from '@/utils/feedback'
import { ref, nextTick } from 'vue'
import { onShow, onHide, onReady } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import { useTabBarShowRefresh } from '@/composables/useTabBarShowRefresh'
import { callCloudFunction } from '@/utils/request'
import { ROUTES } from '@/constants/routes'

const userStore = useUserStore()
const stats = { orderCount: 0, wineCount: 0 }

const { ready: showUser, refresh: refreshView } = useTabBarShowRefresh()

const localAvatar = ref('/static/default-avatar.png')
const localNickname = ref('未登录')
const localBalance = ref(0)
const localIsLogin = ref(false)
const localMemberLevel = ref('')
const inviteCount = ref(0)

const banners = ref([
  { image: '/static/default-bar.png', title: '限时特惠活动', url: '' },
  { image: '/static/default-product.png', title: '新品上线', url: '' },
  { image: '/static/default-bar.png', title: '会员专享折扣', url: '' }
])
const bannerCurrent = ref(0)
const swiperAutoplay = ref(false)

const onBannerChange = (e: any) => {
  bannerCurrent.value = e.detail.current
}

const onBannerTap = (banner: any) => {
  if (banner.url) {
    uni.navigateTo({ url: banner.url })
  }
}

const resolveCloudAvatar = async (url: string): Promise<string> => {
  if (!url || !url.startsWith('cloud://')) return url
  try {
    const res = await (wx.cloud as any).getTempFileURL({ fileList: [url] })
    return res.fileList?.[0]?.tempFileURL || url
  } catch {
    return url
  }
}

const doRefresh = async () => {
  const storedUserInfo = uni.getStorageSync('userInfo')
  // eslint-disable-next-line no-console
  console.log('[mine] doRefresh', { storedUserInfo: !!storedUserInfo, userStoreInfo: !!userStore.userInfo })

  if (storedUserInfo && typeof storedUserInfo === 'object') {
    userStore.$patch({
      userInfo: storedUserInfo,
      isLoggedIn: true
    })
    const avatar = typeof storedUserInfo.avatar === 'string' ? storedUserInfo.avatar : ''
    localAvatar.value = (await resolveCloudAvatar(avatar)) || '/static/default-avatar.png'
    localNickname.value = typeof storedUserInfo.nickname === 'string' ? storedUserInfo.nickname : '未登录'
    localBalance.value = typeof storedUserInfo.balance === 'number' ? storedUserInfo.balance : 0
    localIsLogin.value = true
    localMemberLevel.value = typeof storedUserInfo.memberLevel === 'string' ? storedUserInfo.memberLevel : ''

    fetchInviteCount()
  } else {
    const info = userStore.userInfo
    const avatar = info && typeof info.avatar === 'string' ? info.avatar : ''
    localAvatar.value = (await resolveCloudAvatar(avatar)) || '/static/default-avatar.png'
    localNickname.value = info && typeof info.nickname === 'string' ? info.nickname : '未登录'
    localBalance.value = info && typeof info.balance === 'number' ? info.balance : 0
    localIsLogin.value = !!info
    localMemberLevel.value = info && typeof info.memberLevel === 'string' ? info.memberLevel : ''
  }
  // eslint-disable-next-line no-console
  console.log('[mine] doRefresh done', {
    localAvatar: localAvatar.value,
    localNickname: localNickname.value,
    localIsLogin: localIsLogin.value,
    localMemberLevel: localMemberLevel.value
  })
}

let isRefreshing = false
const refreshViewWrapped = async () => {
  if (isRefreshing) return
  isRefreshing = true
  try {
    await refreshView(doRefresh)
  } finally {
    isRefreshing = false
  }
}

const fetchInviteCount = async () => {
  try {
    const res = await callCloudFunction('getMatchInvites', { status: 'pending', page: 1, pageSize: 1 })
    inviteCount.value = res.total || 0
  } catch {
    // ignore
  }
}

onReady(() => {
  nextTick(() => {
    swiperAutoplay.value = true
  })
})

onShow(() => {
  refreshViewWrapped()
})

onHide(() => {
  swiperAutoplay.value = false
})

const goToProfile = () => {
  if (!localIsLogin.value) {
    uni.reLaunch({ url: '/pages/login/index' })
  } else {
    showToast({ title: '个人资料页待创建', icon: 'none' })
  }
}

const goToOrders = (_status?: string) => { uni.navigateTo({ url: '/pages/orders/index' }) }
const goToInvites = () => { uni.navigateTo({ url: '/pages/match-invites/index' }) }
const goToMember = () => { uni.navigateTo({ url: '/pages/member/index' }) }
const goToWineStorage = () => { uni.navigateTo({ url: '/pages/wine-storage/index' }) }
const goToCoupons = () => { uni.navigateTo({ url: ROUTES.COUPONS }) }
const goToAddress = () => { uni.navigateTo({ url: ROUTES.ADDRESS }) }
const goToHelp = () => { uni.navigateTo({ url: ROUTES.HELP }) }
const goToAbout = () => { uni.navigateTo({ url: ROUTES.ABOUT }) }
const handleLogout = async () => {
  // eslint-disable-next-line no-console
  console.log('[mine] handleLogout called')
  try {
    // 3 秒超时兜底：如果自定义弹窗组件卡住，fallback 到 uni.showModal
    const res = await Promise.race([
      showModal({
        title: '确认退出',
        content: '确定要退出登录吗？',
      }),
      new Promise<{ confirm: boolean }>((resolve) => {
        setTimeout(() => {
          // eslint-disable-next-line no-console
          console.warn('[mine] custom showModal timeout, fallback to uni.showModal')
          uni.showModal({
            title: '确认退出',
            content: '确定要退出登录吗？',
            success: (r) => resolve({ confirm: r.confirm }),
            fail: () => resolve({ confirm: false }),
          })
        }, 3000)
      }),
    ])
    // eslint-disable-next-line no-console
    console.log('[mine] showModal result', res)
    if (res.confirm) {
      // eslint-disable-next-line no-console
      console.log('[mine] logout confirmed')
      userStore.logout()
      // eslint-disable-next-line no-console
      console.log('[mine] userStore.logout() called')
      uni.removeStorageSync('userInfo')
      // eslint-disable-next-line no-console
      console.log('[mine] userInfo removed from storage')
      localAvatar.value = '/static/default-avatar.png'
      localNickname.value = '未登录'
      localBalance.value = 0
      localIsLogin.value = false
      localMemberLevel.value = ''
      // eslint-disable-next-line no-console
      console.log('[mine] local refs updated', { localIsLogin: localIsLogin.value })
      showToast({ title: '已退出登录', icon: 'success' })
      // eslint-disable-next-line no-console
      console.log('[mine] logout toast shown')
    } else {
      // eslint-disable-next-line no-console
      console.log('[mine] logout cancelled')
    }
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('[mine] handleLogout error:', err)
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: $bg-primary;
  padding: $spacing-md;
  padding-bottom: $spacing-xl;
}

// 用户卡片
.user-section {
  margin-bottom: $spacing-md;
}

.user-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-xl;
  background-color: $bg-secondary;
  border-radius: $border-radius-xl;
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar-wrap {
  position: relative;
  margin-right: $spacing-lg;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 2px solid rgba($primary, 0.3);
}

.member-tag {
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, $primary 0%, $primary-dark 100%);
  border-radius: $border-radius-full;
  padding: 1px 8px;
}

.member-text {
  color: $on-primary;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.05em;
}

.info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.nickname {
  color: $text-primary;
  font-size: $font-xl;
  font-weight: 700;
}

.sub-text {
  color: $text-secondary;
  font-size: $font-sm;
}

.arrow {
  color: $text-secondary;
  font-size: 24px;
  font-weight: 300;
}

// 统计卡片
.stats-card {
  display: flex;
  align-items: center;
  background-color: $bg-secondary;
  border-radius: $border-radius-xl;
  padding: $spacing-lg 0;
  margin-bottom: $spacing-md;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.stat-divider {
  width: 1px;
  height: 32px;
  background-color: $border-color;
}

.num {
  color: $text-primary;
  font-size: $font-xxl;
  font-weight: 800;
}

.num.gold {
  color: $primary;
}

.label {
  color: $text-secondary;
  font-size: $font-sm;
}

// 菜单区域
.menu-section {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.menu-group {
  background-color: $bg-secondary;
  border-radius: $border-radius-xl;
  overflow: hidden;
  padding: 0 $spacing-md;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-md 0;
}

.menu-item + .menu-item {
  border-top: 1px solid $border-color;
}

.item-left {
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

.icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background-color: rgba($text-secondary, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-wrap.gold {
  background-color: rgba($primary, 0.15);
}

.icon-wrap.blue {
  background-color: rgba($secondary-light, 0.15);
}

.icon-wrap.pink {
  background-color: rgba(255, 107, 157, 0.15);
}

.icon-wrap.pink .icon-text {
  color: #ff6b9d;
}

.badge {
  margin-left: 8rpx;
  min-width: 32rpx;
  height: 32rpx;
  background: #ff4d4f;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 10rpx;
}

.badge-text {
  font-size: 20rpx;
  color: #fff;
  font-weight: bold;
}

.icon-text {
  font-size: 18px;
  line-height: 1;
}

.icon-wrap.gold .icon-text {
  color: $primary;
}

.icon-wrap.blue .icon-text {
  color: $secondary-light;
}

.menu-item .label {
  flex: 1;
  color: $text-primary;
  font-size: $font-md;
}

.menu-item .arrow {
  color: $text-secondary;
  font-size: 20px;
  font-weight: 300;
}

// 活动轮播
.banner-section {
  margin-bottom: $spacing-md;
}

.banner-swiper {
  height: 120px;
  border-radius: $border-radius-xl;
  overflow: hidden;
}

.banner-item {
  width: 100%;
  height: 100%;
  position: relative;
}

.banner-image {
  width: 100%;
  height: 100%;
  opacity: 0.6;
}

.banner-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60%;
  background: linear-gradient(to top, rgba($bg-primary, 0.85), transparent);
  display: flex;
  align-items: flex-end;
  padding: $spacing-md;
}

.banner-text {
  color: $primary;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.banner-dots {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin-top: $spacing-sm;
}

.dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background-color: $outline-variant;
  transition: all 0.3s ease;

  &.active {
    width: 20px;
    border-radius: 3px;
    background-color: $primary;
  }
}

// 退出登录
.logout-btn {
  width: 100%;
  margin-top: $spacing-xl;
  height: 48px;
  background-color: transparent;
  color: $status-error;
  border-radius: $border-radius-full;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-md;
  border: 1px solid rgba($status-error, 0.3);
}

.logout-btn::after {
  border: none;
}

.logout-btn:active {
  background-color: rgba($status-error, 0.1);
}
</style>
