<template>
  <view class="status-page">
    <!-- Top Navigation -->
    <view class="top-nav">
      <view class="nav-left">
        <text class="nav-menu">&#9776;</text>
      </view>
      <text class="nav-title">客服消息</text>
      <view class="nav-right">
        <image class="nav-avatar" :src="userStore.userInfo?.avatar || '/static/default-avatar.png'" mode="aspectFill" @error="navAvatarError" />
      </view>
    </view>

    <!-- Messages -->
    <scroll-view class="message-list" scroll-y :scroll-into-view="scrollToId">
      <!-- System Message: Paired -->
      <view v-if="groupStatus === 'paired' || groupStatus === 'paid' || groupStatus === 'confirmed'" class="msg-system">
        <text class="msg-time">{{ formatTime(groupInfo?.updatedAt) }}</text>
        <view class="msg-row">
          <view class="agent-avatar">
            <text class="agent-icon">&#128100;</text>
          </view>
          <view class="msg-bubble glass">
            <text class="msg-text">恭喜您与"{{ partnerInfo?.nickname || '对方' }}"配对成功，请支付订单，支付完成后平台将为您发放桌号</text>
          </view>
        </view>
      </view>

      <!-- Order Card -->
      <view v-if="groupStatus === 'paired' || groupStatus === 'paid' || groupStatus === 'confirmed'" class="msg-order">
        <view class="msg-row with-indent">
          <view class="order-card">
            <view class="order-img-wrap">
              <image class="order-img" src="/static/default-bar.png" mode="aspectFill" />
              <view class="order-tag">Premium</view>
            </view>
            <view class="order-info">
              <text class="order-name">{{ groupInfo?.barName || '酒吧名称' }}</text>
              <text class="order-package">{{ groupInfo?.packageType === '198' ? '畅饮套餐' : '台费入场' }}</text>
              <view class="order-footer">
                <text class="order-price">&#165;{{ groupInfo?.packageType === '198' ? '198.00' : '40.00' }}</text>
                <view v-if="groupStatus === 'paired'" class="pay-btn" @tap="onPay">
                  <text>去支付</text>
                  <text class="pay-arrow">&#8250;</text>
                </view>
                <text v-else class="paid-text">已支付</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- System Message: Paid waiting -->
      <view v-if="groupStatus === 'paid' || groupStatus === 'confirmed'" class="msg-system">
        <view class="msg-row">
          <view class="agent-avatar">
            <text class="agent-icon">&#128100;</text>
          </view>
          <view class="msg-bubble glass">
            <text class="msg-text">支付完成，对方支付完成后，平台会发放桌号，请您耐心等待~</text>
          </view>
        </view>
      </view>

      <!-- Table Number Notification -->
      <view v-if="groupStatus === 'confirmed'" class="msg-system">
        <view class="msg-row">
          <view class="agent-avatar">
            <text class="agent-icon">&#128276;</text>
          </view>
          <view class="msg-bubble glass highlight">
            <text class="msg-text">桌号发放通知：<text class="highlight-text">{{ groupInfo?.barName }}</text>，桌号为【<text class="highlight-text bold">{{ tableNumber || '01' }}</text>】。请在{{ groupInfo?.date }} {{ groupInfo?.startTime }}到达，祝您玩的开心</text>
          </view>
        </view>
      </view>

      <!-- Matching State -->
      <view v-if="groupStatus === 'matching'" class="msg-system">
        <view class="msg-row">
          <view class="agent-avatar">
            <text class="agent-icon">&#128100;</text>
          </view>
          <view class="msg-bubble glass">
            <text class="msg-text">正在为您寻找合适的拼桌伙伴，请耐心等待~ 您可以继续浏览其他推荐用户</text>
          </view>
        </view>
      </view>

      <!-- Empty State -->
      <view v-if="!groupInfo && !loading" class="empty-state">
        <text class="empty-icon">&#128172;</text>
        <text class="empty-title">暂无消息</text>
        <text class="empty-desc">发起拼桌后，配对状态会显示在这里</text>
      </view>

      <!-- Bottom spacer -->
      <view id="bottom" style="height: 40rpx;"></view>
    </scroll-view>

    <!-- Bottom Nav (TabBar replacement for non-tab page) -->
    <view v-if="false" class="bottom-nav">
      <!-- This page is not a tabBar page, so no tabBar here -->
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { callCloudFunction } from '@/utils/request'

const userStore = useUserStore()

const groupId = ref('')

const groupInfo = ref(null)
const partnerInfo = ref(null)
const groupStatus = ref('')
const tableNumber = ref('')
const loading = ref(false)
const scrollToId = ref('bottom')

const navAvatarError = () => {
  if (userStore.userInfo) userStore.userInfo.avatar = '/static/default-avatar.png'
}

const formatTime = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

const fetchGroupStatus = async () => {
  const gid = groupId.value || uni.getStorageSync('currentGroupId')
  if (!gid) return

  loading.value = true
  try {
    const res = await callCloudFunction('getGroupStatus', { groupId: gid })
    groupInfo.value = res.group
    groupStatus.value = res.group?.status || 'matching'
    partnerInfo.value = res.matchInfo?.partnerInfo || null

    // Generate a mock table number for confirmed orders
    if (groupStatus.value === 'confirmed') {
      tableNumber.value = String(Math.floor(Math.random() * 20) + 1).padStart(2, '0')
    }
  } catch (e) {
    console.error('Fetch group status failed:', e)
  } finally {
    loading.value = false
  }
}

const onPay = () => {
  uni.showToast({ title: '支付功能开发中', icon: 'none' })
  // TODO: Implement payment flow
}

onMounted(() => {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/login/index' })
    return
  }
  fetchGroupStatus()
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.status-page {
  min-height: 100vh;
  background-color: $bg-primary;
  display: flex;
  flex-direction: column;
}

/* Top Navigation */
.top-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
  background: rgba($bg-primary, 0.8);
  backdrop-filter: blur(20px);
}

.nav-left {
  width: 80rpx;
}

.nav-menu {
  font-size: 28rpx;
  color: $primary;
}

.nav-title {
  font-size: 24rpx;
  font-weight: bold;
  letter-spacing: 0.15em;
  color: $primary;
  text-transform: uppercase;
}

.nav-right {
  width: 80rpx;
  display: flex;
  justify-content: flex-end;
}

.nav-avatar {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  border: 1rpx solid rgba($outline-variant, 0.3);
}

/* Message List */
.message-list {
  flex: 1;
  padding-top: 88rpx;
  padding-bottom: 40rpx;
}

/* System Message */
.msg-system {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx 20rpx;
  gap: 16rpx;
}

.msg-time {
  font-size: 20rpx;
  color: rgba($text-secondary, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.msg-row {
  display: flex;
  width: 100%;
  align-items: flex-start;
  gap: 16rpx;
}

.msg-row.with-indent {
  padding-left: 76rpx;
}

.agent-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: rgba($primary, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1rpx solid rgba($primary, 0.2);
}

.agent-icon {
  font-size: 32rpx;
}

.msg-bubble {
  padding: 24rpx;
  border-radius: 24rpx;
  border-top-left-radius: 4rpx;
  max-width: 70%;
}

.msg-bubble.glass {
  background: rgba(53, 53, 52, 0.4);
  backdrop-filter: blur(12px);
  border: 1rpx solid rgba(77, 70, 53, 0.1);
}

.msg-bubble.highlight {
  border-left: 4rpx solid $primary;
}

.msg-text {
  font-size: 26rpx;
  color: $text-primary;
  line-height: 1.6;
}

.highlight-text {
  color: $primary;
  font-weight: 600;
}

.highlight-text.bold {
  font-weight: 900;
}

/* Order Card */
.order-card {
  background: $bg-hover;
  border-radius: 24rpx;
  overflow: hidden;
  max-width: 560rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.3);
  border: 1rpx solid rgba($outline-variant, 0.1);
}

.order-img-wrap {
  position: relative;
  height: 240rpx;
  overflow: hidden;
}

.order-img {
  width: 100%;
  height: 100%;
}

.order-tag {
  position: absolute;
  top: 16rpx;
  left: 16rpx;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  padding: 4rpx 16rpx;
  border-radius: $border-radius-full;
  font-size: 18rpx;
  color: $primary;
  font-weight: 900;
  text-transform: uppercase;
}

.order-info {
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.order-name {
  font-size: 30rpx;
  font-weight: bold;
  color: $text-primary;
}

.order-package {
  font-size: 22rpx;
  color: $text-secondary;
}

.order-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16rpx;
}

.order-price {
  font-size: 32rpx;
  font-weight: bold;
  color: $primary;
}

.pay-btn {
  display: flex;
  align-items: center;
  gap: 4rpx;
  font-size: 22rpx;
  color: $primary;
  font-weight: bold;
  letter-spacing: 0.1em;
}

.pay-arrow {
  font-size: 24rpx;
}

.paid-text {
  font-size: 22rpx;
  color: $text-secondary;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 60rpx;
  gap: 16rpx;
}

.empty-icon {
  font-size: 80rpx;
  opacity: 0.5;
}

.empty-title {
  font-size: 32rpx;
  font-weight: bold;
  color: $text-primary;
}

.empty-desc {
  font-size: 24rpx;
  color: $text-secondary;
  text-align: center;
}
</style>
